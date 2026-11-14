// Roda antes de compilar (`npm test`, e automaticamente em `npm run dist` / `dist:release`):
//  1. confere a sintaxe de todos os .js de src/, tools/, test/ (e de local/, se existir);
//  2. roda cada teste do Electron (test/*.test.js, e local/test/*.test.js das extensões locais, se existirem)
//     num processo à parte, com a pasta de dados isolada: nunca toca nas sessões/contas reais.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const electron = require('electron');
let failed = 0;

const walk = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []))
  : []);
const jsFiles = ['src', 'tools', 'test', 'local'].flatMap((d) => walk(path.join(root, d)));
for (const f of jsFiles) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.error(`FALHOU sintaxe: ${path.relative(root, f)}\n${r.stderr}`);
  }
}
console.log(`sintaxe: ${jsFiles.length - failed}/${jsFiles.length} arquivos ok`);

const testDirs = [__dirname, path.join(root, 'local', 'test')].filter((d) => fs.existsSync(d));
const tests = testDirs.flatMap((d) => fs.readdirSync(d).filter((f) => f.endsWith('.test.js')).sort().map((f) => path.join(d, f)));
for (const t of tests) {
  console.log(`\n== ${path.relative(root, t)}`);
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-test-'));
  const env = { ...process.env, PKMULTI_TEST: '1', PKMULTI_TEST_DATA: userData };
  delete env.ELECTRON_RUN_AS_NODE;
  let r = spawnSync(electron, [t], { stdio: 'inherit', env, timeout: 120000 });
  // 0xC0000005 (violação de acesso do Windows) no encerramento do Electron é intermitente e não é falha de checagem
  // (o teste imprime as checagens antes). Reexecuta até 2 vezes só nesse código; qualquer outra falha reprova direto.
  for (let tentativa = 1; r.status === 3221225477 && tentativa <= 2; tentativa++) {
    console.error(`aviso: ${path.relative(root, t)} fechou com falha do Electron (0xC0000005); reexecutando (${tentativa}/2)`);
    r = spawnSync(electron, [t], { stdio: 'inherit', env, timeout: 120000 });
  }
  fs.rmSync(userData, { recursive: true, force: true });
  if (r.status !== 0) {
    failed++;
    console.error(`FALHOU: ${path.relative(root, t)} (código ${r.status ?? r.signal})`);
  }
}

if (failed) {
  console.error(`\n${failed} falha(s) — compilação bloqueada.`);
  process.exit(1);
}
console.log(`\ntudo certo (${tests.length} teste(s) do Electron).`);
