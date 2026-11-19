// Guarda uma cópia dos instaladores gerados em dist/ numa pasta `dist-backup/<data-hora>/`, para poder voltar à última versão
// válida se uma compilação nova quebrar. Mantém só as últimas `KEEP` cópias.
//   node tools/backup-dist.js            copia dist/*.exe para dist-backup/ (rode depois de VALIDAR a versão)
//   node tools/backup-dist.js --listar   lista as cópias guardadas (a mais nova primeiro)
const fs = require('fs');
const path = require('path');

const KEEP = 3;
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const dir = path.join(root, 'dist-backup');

const pad = (n) => String(n).padStart(2, '0');
const stamp = (d = new Date()) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
const sizeMb = (f) => (fs.statSync(f).size / 1048576).toFixed(0);

function list() {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort().reverse();
}

if (process.argv.includes('--listar')) {
  const all = list();
  if (!all.length) console.log('Nenhuma cópia guardada em dist-backup/.');
  for (const n of all) {
    const files = fs.readdirSync(path.join(dir, n)).filter((f) => f.endsWith('.exe'));
    console.log(`${n}  ${files.map((f) => `${f} (${sizeMb(path.join(dir, n, f))} MB)`).join(' | ')}`);
  }
  process.exit(0);
}

const exes = fs.existsSync(dist) ? fs.readdirSync(dist).filter((f) => f.endsWith('.exe') && !/\.old\.exe$/i.test(f)) : [];
if (!exes.length) {
  console.error('Nada para guardar: não há instaladores em dist/. Rode `npm run dist` primeiro.');
  process.exit(1);
}
const dest = path.join(dir, stamp());
fs.mkdirSync(dest, { recursive: true });
for (const f of exes) fs.copyFileSync(path.join(dist, f), path.join(dest, f));
console.log(`Guardado em dist-backup/${path.basename(dest)}: ${exes.join(', ')}`);
for (const velho of list().slice(KEEP)) {
  fs.rmSync(path.join(dir, velho), { recursive: true, force: true });
  console.log(`Removida a cópia antiga ${velho}`);
}
