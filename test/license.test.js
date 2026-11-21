// Licença por máquina (src/license.js): verificação offline com um par de chaves de TESTE gerado aqui (a chave pública
// real do app não é usada). Cobre: válida, outra máquina, expirada, sem prazo, adulterada, assinada por outra chave,
// formato inválido, persistência, desativação, o id da máquina (GUID do Windows e fallback) e o guardado com safeStorage.
const { app, check, finish } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // the texts checked here are in Portuguese
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createLicense, assinarChave, idDeGuid, parseMachineGuid, formatarId } = require('../src/license');

const par = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const outro = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const AGORA = Date.UTC(2026, 10, 18);
const MAQ = 'AAAA-BBBB-CCCC-DDDD';
const DIA = 24 * 60 * 60 * 1000;

const emitir = (payload, priv = par.privateKey) => assinarChave({ v: 1, m: MAQ, f: [1, 3], e: AGORA + 365 * DIA, i: AGORA, ...payload }, priv);
const novo = (dataDir, extra = {}) => createLicense({ dataDir, publicKeyPem: par.publicKey, now: () => AGORA, idMaquina: MAQ, ...extra });

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-licenca-'));
(async () => {
try {
  // 1) chave válida: ativa, recursos conferidos
  let lic = novo(pasta);
  let r = lic.activate(emitir({}));
  check(r.ok === true && r.motivo === 'Licença válida.', 'chave válida nesta máquina é aceita');
  check(lic.has(1) === true && lic.has(3) === true && lic.has(2) === false, 'has(código) confere só os recursos da chave');
  check(lic.status().ativa === true && lic.status().expiraEm === AGORA + 365 * DIA, 'status: ativa, com a data de expiração');

  // 2) persistência: outra instância no mesmo diretório enxerga a licença
  check(novo(pasta).has(1) === true, 'a licença fica guardada e vale ao reabrir o app');

  // 3) outra máquina é recusada
  r = novo(pasta).activate(emitir({ m: 'EEEE-FFFF-0000-1111' }));
  check(!r.ok && r.motivo === 'Chave inválida para esta máquina.', 'chave de outra máquina é recusada');

  // 4) expirada é recusada; sem prazo (e = 0) é aceita
  r = novo(os.tmpdir()).activate(emitir({ e: AGORA - 1 }));
  check(!r.ok && r.motivo === 'Licença expirada.', 'chave expirada é recusada');
  const semPrazo = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-licenca-np-'));
  r = novo(semPrazo).activate(emitir({ e: 0 }));
  check(r.ok && r.expiraEm === null && novo(semPrazo).status().ativa, 'chave sem prazo é aceita e continua valendo');

  // 5) adulterada: texto do payload alterado, assinatura trocada ou assinada por outra chave
  const chave = emitir({});
  const [corpo, assin] = chave.split('.');
  const trocado = corpo.slice(0, -1) + (corpo.endsWith('A') ? 'B' : 'A');
  check(!novo(os.tmpdir()).activate(`${trocado}.${assin}`).ok, 'chave com o payload adulterado é recusada');
  const outraAssin = emitir({}).split('.')[1];
  // the replacement must differ from the real tail, otherwise the signature stays valid (flaky 1 in 4096 runs)
  const fim = outraAssin.endsWith('AA') ? 'BB' : 'AA';
  check(!novo(os.tmpdir()).activate(`${corpo}.${outraAssin.slice(0, -2)}${fim}`).ok, 'chave com a assinatura adulterada é recusada');
  check(!novo(os.tmpdir()).activate(emitir({}, outro.privateKey)).ok, 'chave assinada por outra chave privada é recusada');

  // 6) formato: vazia, sem ponto, partes inválidas, grande demais
  const invalidas = ['', '   ', 'abc', 'a.b.c', 'a!.b', 'x'.repeat(2100)];
  check(invalidas.every((c) => !novo(os.tmpdir()).activate(c).ok), 'formatos inválidos (vazio, sem ponto, caracteres, tamanho acima de 2 KB) são recusados');

  // 7) desativar remove a licença
  const d = novo(pasta);
  d.deactivate();
  check(!d.status().ativa && !d.has(1) && !novo(pasta).status().ativa, 'desativar remove a licença guardada');

  // 8) id da máquina: formato, GUID do Windows, fallback fraco
  check(/^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/.test(idDeGuid('1234-guid')) && formatarId('abcdef0123456789xyz') === 'ABCD-EF01-2345-6789', 'id da máquina: XXXX-XXXX-XXXX-XXXX (16 hex)');
  check(parseMachineGuid('\r\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography\r\n    MachineGuid    REG_SZ    abc-123-def\r\n') === 'abc-123-def', 'lê o MachineGuid da saída de reg query');
  const fake = (saida, erro = null) => (_cmd, args, opts, cb) => {
    check(_cmd === 'reg' && args.includes('MachineGuid') && opts.timeout > 0, 'o GUID é lido com reg query (sem shell, com timeout)');
    cb(erro, saida);
  };
  const comGuid = createLicense({ dataDir: pasta, platform: 'win32', execFileFn: fake('    MachineGuid    REG_SZ    guid-real\r\n') });
  await comGuid.prepare();
  check(comGuid.machineId().id === idDeGuid('guid-real') && comGuid.machineId().fraca === false, 'com o GUID do Windows, o id é derivado dele (não fraco)');
  const semGuid = createLicense({ dataDir: pasta, platform: 'win32', execFileFn: fake('', new Error('falhou')) });
  await semGuid.prepare();
  check(semGuid.machineId().fraca === true && /^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/.test(semGuid.machineId().id), 'sem o GUID, o fallback é usado e marcado como fraco');

  // 9) guardado com safeStorage (criptografado quando disponível)
  const storage = { isEncryptionAvailable: () => true, encryptString: (s) => Buffer.from(`enc:${s}`), decryptString: (b) => b.toString().slice(4) };
  const comCripto = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-licenca-cr-'));
  check(novo(comCripto, { storage }).activate(emitir({})).ok, 'com safeStorage, a chave é aceita');
  const bruto = fs.readFileSync(path.join(comCripto, 'license.json'), 'utf8');
  check(!bruto.includes(corpo) && novo(comCripto, { storage }).has(1), 'com safeStorage, a chave não fica em texto no arquivo e volta ao ler');
} catch (err) {
  console.error(err);
  check(false, `erro inesperado: ${err.message}`);
}
app.quit();
finish();
})();
