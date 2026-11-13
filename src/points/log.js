// Registro dos resgates (resgates.log, na pasta de dados do app): uma linha por evento, com a hora, a conta, o site,
// o canal, o evento (resgatou, recusado, parou, erro) e o detalhe. Guarda só as últimas `KEEP` linhas.
// Formato da linha: ISO\tconta\tsite\tcanal\tevento\tdetalhe (tabs e quebras de linha no texto viram espaço).
const fs = require('fs');

const KEEP = 2000;
const clean = (v) => String(v ?? '').replace(/[\t\r\n]+/g, ' ');

function createRedeemLog(file, { now = () => new Date() } = {}) {
  let count = 0;
  try {
    if (fs.existsSync(file)) count = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).length;
  } catch {}

  function append({ acc, site, channel, evento, detalhe }) {
    const line = [now().toISOString(), acc, site, channel, evento, detalhe].map(clean).join('\t') + '\n';
    try {
      fs.appendFileSync(file, line);
      count++;
      if (count > KEEP * 1.5) trim();
    } catch (err) {
      console.error('não foi possível gravar o registro dos resgates:', err);
    }
  }

  function trim() {
    try {
      const linhas = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
      fs.writeFileSync(file, linhas.slice(-KEEP).join('\n') + '\n');
      count = Math.min(linhas.length, KEEP);
    } catch {}
  }

  // Mais recentes primeiro. Linhas estragadas são ignoradas.
  function read(limit = KEEP) {
    let linhas = [];
    try {
      if (fs.existsSync(file)) linhas = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    } catch {}
    const out = [];
    for (let i = linhas.length - 1; i >= 0 && out.length < limit; i--) {
      const [t, acc, site, channel, evento, ...resto] = linhas[i].split('\t');
      if (!t || !evento) continue;
      out.push({ t, acc, site, channel, evento, detalhe: resto.join('\t') });
    }
    return out;
  }

  return { append, read, file };
}

module.exports = { createRedeemLog, KEEP };
