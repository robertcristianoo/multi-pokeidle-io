// Registro de compras da auto-reposição, guardado na pasta de dados do app (restock-log-<conta>.log): sobrevive ao
// fechar o app e à instalação de uma nova versão. Uma linha por entrada: ISO\ttexto (o texto já vem com a hora da
// página). Guarda só as últimas `KEEP` linhas de cada conta.
const fs = require('fs');
const path = require('path');

const KEEP = 500;
const clean = (v) => String(v ?? '').replace(/[\t\r\n]+/g, ' ').slice(0, 400);

function createRestockLog(dir, { now = () => new Date() } = {}) {
  const file = (id) => path.join(dir, `restock-log-${Number(id) || 0}.log`);
  const counts = new Map();

  const lines = (id) => {
    try {
      return fs.existsSync(file(id)) ? fs.readFileSync(file(id), 'utf8').split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  function trim(id) {
    try {
      const l = lines(id);
      fs.writeFileSync(file(id), l.slice(-KEEP).join('\n') + '\n');
      counts.set(id, Math.min(l.length, KEEP));
    } catch { /* o registro é só um histórico: não pode derrubar a reposição */ }
  }

  function append(id, textos) {
    const novos = (Array.isArray(textos) ? textos : [textos]).map(clean).filter(Boolean);
    if (!novos.length) return;
    const t = now().toISOString();
    try {
      fs.appendFileSync(file(id), novos.map((x) => `${t}\t${x}`).join('\n') + '\n');
      const n = (counts.has(id) ? counts.get(id) : lines(id).length - novos.length) + novos.length;
      counts.set(id, n);
      if (n > KEEP * 1.5) trim(id);
    } catch (err) {
      console.error('não foi possível gravar o registro da reposição:', err);
    }
  }

  // Mais antigas primeiro (ordem de leitura do registro). Linhas estragadas são ignoradas.
  function read(id, limit = KEEP) {
    const out = [];
    for (const l of lines(id).slice(-limit)) {
      const i = l.indexOf('\t');
      if (i < 0) continue;
      const t = l.slice(0, i);
      if (Number.isNaN(Date.parse(t))) continue;
      out.push({ t, texto: l.slice(i + 1) });
    }
    return out;
  }

  return { append, read, file };
}

module.exports = { createRestockLog, KEEP };
