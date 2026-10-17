// Roda antes de compilar (`npm test`, e automaticamente em `npm run dist` / `dist:release`):
//  1. confere a sintaxe de todos os .js da raiz e de test/;
//  2. roda cada teste do Electron (test/*.test.js, inclusive os `local-*.test.js` das extensões locais)
//     num processo à parte, com a pasta de dados isolada: nunca toca nas sessões/contas reais.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const electron = require('electron');
let failed = 0;

const jsFiles = [root, __dirname].flatMap((dir) =>
  fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => path.join(dir, f)));
for (const f of jsFiles) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.error(`FALHOU sintaxe: ${path.relative(root, f)}\n${r.stderr}`);
  }
}
console.log(`sintaxe: ${jsFiles.length - failed}/${jsFiles.length} arquivos ok`);

const tests = fs.readdirSync(__dirname).filter((f) => f.endsWith('.test.js')).sort();
for (const t of tests) {
  console.log(`\n== ${t}`);
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-test-'));
  const env = { ...process.env, PKMULTI_TEST: '1', PKMULTI_TEST_DATA: userData };
  delete env.ELECTRON_RUN_AS_NODE;
  const r = spawnSync(electron, [path.join(__dirname, t)], { stdio: 'inherit', env, timeout: 120000 });
  fs.rmSync(userData, { recursive: true, force: true });
  if (r.status !== 0) {
    failed++;
    console.error(`FALHOU: ${t} (código ${r.status ?? r.signal})`);
  }
}

if (failed) {
  console.error(`\n${failed} falha(s) — compilação bloqueada.`);
  process.exit(1);
}
console.log(`\ntudo certo (${tests.length} teste(s) do Electron).`);
