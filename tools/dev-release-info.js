// Build local (`npm run dist`): o package.json fica em 1.0.0 (a versão real só é gravada pelo workflow de Release),
// o que faria o app avisar "Atualizar" para sempre. Grava um release-info.json temporário com a maior tag do git
// (removido no postdist) para o app local se comparar com o Release mais recente. `--remove` apaga o arquivo.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = path.join(__dirname, '..', 'release-info.json');
if (process.argv.includes('--remove')) {
  fs.rmSync(file, { force: true });
} else {
  try {
    const out = execSync('git tag --list "v*" --sort=-v:refname', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const tag = out.split('\n')[0].trim();
    if (!tag) throw new Error('sem tag');
    fs.writeFileSync(file, JSON.stringify({ version: tag.replace(/^v/, ''), tag, local: true }, null, 2));
    console.log(`release-info.json (build local): ${tag}`);
  } catch {
    console.log('sem tag no git: o app usa a versão do package.json');
  }
}
