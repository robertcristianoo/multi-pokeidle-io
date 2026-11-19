// Licença por máquina, com verificação offline (sem rede e sem telemetria).
//
// Identificador da máquina: deriva do MachineGuid do Windows (HKLM\SOFTWARE\Microsoft\Cryptography), com SHA-256 e um
// sal fixo do app; é exibido como XXXX-XXXX-XXXX-XXXX (16 hex). Sem o GUID, usa um fallback fraco (nome do computador,
// usuário e plataforma), marcado internamente como "fraco".
//
// Chave: `corpo.assinatura`, ambos em base64url. `corpo` é o JSON do payload
//   { v: 1, m: <id da máquina>, f: [códigos numéricos], e: <expiração em ms, 0 = sem prazo>, i: <emitida em> }
// e `assinatura` é a Ed25519 sobre o texto de `corpo`. A chave PÚBLICA fica aqui; a PRIVADA não vai ao repositório.
// Os códigos são números opacos: este arquivo não sabe o que cada um libera.
//
//   createLicense({ dataDir, storage }) -> { prepare, machineId, activate, status, has, deactivate }
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { t } = require('./i18n');

// Chave pública de verificação (o par foi gerado pelo dono; a privada fica fora do repositório).
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAMvRlyZVhg2GTS+y9HQv1HfL4ZOvRsMhp0ts+JoPfr5w=
-----END PUBLIC KEY-----
`;

const SAL = 'multi-pokeidle-io/maquina/v1';
const ARQUIVO = 'license.json';
const MAX_CHAVE = 2048;
const RE_B64U = /^[A-Za-z0-9_-]+$/;
// Messages shown to the user, translated when read (the language can change while the app runs)
const MSG = {
  get ok() { return t('license.ok'); },
  get invalida() { return t('license.invalid'); },
  get outra() { return t('license.otherMachine'); },
  get expirada() { return t('license.expired'); },
  get vazia() { return t('license.empty'); },
  get semLicenca() { return t('license.none'); },
  get naoSalvou() { return t('license.saveFail'); },
};

const sha256 = (texto) => crypto.createHash('sha256').update(texto).digest('hex');

// 16 hex -> XXXX-XXXX-XXXX-XXXX
function formatarId(hex16) {
  return hex16.slice(0, 16).toUpperCase().match(/.{4}/g).join('-');
}

// Id da máquina a partir do MachineGuid (texto cru do GUID)
function idDeGuid(guid) {
  return formatarId(sha256(`${SAL}|${guid}`));
}

// Id fraco: nome do computador, usuário e plataforma (só quando não há o GUID)
function idFraco() {
  let usuario = '';
  try { usuario = os.userInfo().username; } catch {}
  return formatarId(sha256(`${SAL}|fraco|${os.hostname()}|${usuario}|${process.platform}`));
}

// Extrai o GUID da saída de `reg query` (linha "MachineGuid    REG_SZ    <guid>")
function parseMachineGuid(saida) {
  const m = /MachineGuid\s+REG_\w+\s+(\S+)/i.exec(String(saida ?? ''));
  return m ? m[1] : null;
}

// Assina um payload. Só a ferramenta de emissão (com a chave privada) usa isto; o app nunca recebe a privada.
function assinarChave(payload, privadaPem) {
  const corpo = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const assinatura = crypto.sign(null, Buffer.from(corpo, 'utf8'), crypto.createPrivateKey(privadaPem));
  return `${corpo}.${assinatura.toString('base64url')}`;
}

function createLicense({
  dataDir,
  storage = null, // safeStorage do Electron (DPAPI no Windows); null = guarda sem criptografia
  publicKeyPem = PUBLIC_KEY_PEM,
  now = () => Date.now(),
  platform = process.platform,
  execFileFn = execFile,
  idMaquina = null, // testes: fixa o id da máquina
  arquivo = ARQUIVO,
} = {}) {
  const pub = crypto.createPublicKey(publicKeyPem);
  let maquina = idMaquina ? { id: idMaquina, fraca: false } : null;

  // Lê o GUID da máquina (uma vez, com timeout, sem shell). Deve ser aguardado antes de usar a licença.
  function prepare() {
    if (maquina) return Promise.resolve(maquina);
    return new Promise((resolve) => {
      const fallback = () => {
        maquina = { id: idFraco(), fraca: true };
        resolve(maquina);
      };
      if (platform !== 'win32') return fallback();
      try {
        execFileFn('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], { timeout: 4000, windowsHide: true }, (err, saida) => {
          const guid = err ? null : parseMachineGuid(saida);
          if (!guid) return fallback();
          maquina = { id: idDeGuid(guid), fraca: false };
          resolve(maquina);
        });
      } catch {
        fallback();
      }
    });
  }

  const machineId = () => maquina ?? { id: idFraco(), fraca: true };
  const caminho = () => path.join(dataDir, arquivo);

  function lerGuardada() {
    let d;
    try {
      d = JSON.parse(fs.readFileSync(caminho(), 'utf8'));
    } catch {
      return null;
    }
    if (!d || typeof d.dado !== 'string') return null;
    try {
      const bruto = Buffer.from(d.dado, 'base64');
      if (d.guarda === 'dpapi') return storage?.isEncryptionAvailable?.() ? storage.decryptString(bruto) : null;
      return bruto.toString('utf8');
    } catch {
      return null;
    }
  }

  function gravar(chave) {
    let dado;
    let guarda;
    if (storage?.isEncryptionAvailable?.()) {
      dado = storage.encryptString(chave).toString('base64');
      guarda = 'dpapi';
    } else {
      dado = Buffer.from(chave, 'utf8').toString('base64');
      guarda = 'texto';
    }
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(caminho(), JSON.stringify({ v: 1, guarda, dado }));
  }

  // Confere a chave inteira: formato, tamanho, assinatura, máquina e validade. Nunca devolve a chave.
  function verificar(chave) {
    const falha = (motivo) => ({ ok: false, motivo, expiraEm: null, recursos: [] });
    if (typeof chave !== 'string' || !chave.trim()) return falha(MSG.vazia);
    const s = chave.trim();
    if (s.length > MAX_CHAVE) return falha(MSG.invalida);
    const partes = s.split('.');
    if (partes.length !== 2 || !partes.every((p) => RE_B64U.test(p))) return falha(MSG.invalida);
    const [corpo, assin] = partes;
    let assinou = false;
    try {
      assinou = crypto.verify(null, Buffer.from(corpo, 'utf8'), pub, Buffer.from(assin, 'base64url'));
    } catch {}
    if (!assinou) return falha(MSG.invalida);
    let p;
    try {
      p = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
    } catch {
      return falha(MSG.invalida);
    }
    if (!p || typeof p !== 'object' || p.v !== 1 || typeof p.m !== 'string') return falha(MSG.invalida);
    if (p.m !== machineId().id) return falha(MSG.outra);
    const expiraEm = Number(p.e) > 0 ? Number(p.e) : null;
    if (expiraEm && expiraEm < now()) return falha(MSG.expirada);
    const recursos = Array.isArray(p.f)
      ? [...new Set(p.f.map(Number).filter((n) => Number.isInteger(n) && n > 0 && n < 100000))].slice(0, 500)
      : [];
    return { ok: true, motivo: MSG.ok, expiraEm, recursos };
  }

  function activate(chave) {
    const r = verificar(chave);
    if (!r.ok) return { ok: false, motivo: r.motivo };
    try {
      gravar(chave.trim());
    } catch {
      return { ok: false, motivo: MSG.naoSalvou };
    }
    return { ok: true, motivo: MSG.ok, expiraEm: r.expiraEm, recursos: r.recursos };
  }

  function status() {
    const chave = lerGuardada();
    if (!chave) return { ativa: false, motivo: MSG.semLicenca, expiraEm: null, recursos: [] };
    const r = verificar(chave);
    return { ativa: r.ok, motivo: r.motivo, expiraEm: r.expiraEm, recursos: r.recursos };
  }

  function has(codigo) {
    const s = status();
    return s.ativa && s.recursos.includes(Number(codigo));
  }

  function deactivate() {
    try {
      fs.rmSync(caminho(), { force: true });
    } catch {}
    return status();
  }

  return { prepare, machineId, activate, status, has, deactivate };
}

module.exports = { createLicense, assinarChave, PUBLIC_KEY_PEM, formatarId, idDeGuid, parseMachineGuid, MSG };
