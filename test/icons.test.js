// Ícones do app: arquivos presentes e válidos, ICO com várias resoluções e configs de build apontando para ele.
const { app, check, finish } = require('./helpers');
const fs = require('fs');
const path = require('path');
const { nativeImage } = require('electron');

const root = path.join(__dirname, '..');
const png = (rel) => {
  const buf = fs.readFileSync(path.join(root, rel));
  const ok = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return { ok, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

app.whenReady().then(() => {
  for (const f of ['assets/icons/app.png']) {
    const p = png(f);
    check(p.ok && p.w === 256 && p.h === 256, `${f} é PNG 256x256`);
    check(!nativeImage.createFromPath(path.join(root, f)).isEmpty(), `${f} abre como imagem no Electron`);
  }
  const big = png('assets/icon.png');
  check(big.ok && big.w >= 256 && big.w === big.h, `assets/icon.png é PNG quadrado de ${big.w}px`);

  const ico = fs.readFileSync(path.join(root, 'assets/icon.ico'));
  const n = ico.readUInt16LE(4);
  const tamanhos = [...Array(n).keys()].map((i) => ico[6 + i * 16] || 256);
  check(ico.readUInt16LE(0) === 0 && ico.readUInt16LE(2) === 1, 'assets/icon.ico tem cabeçalho de ícone');
  check([16, 32, 48, 256].every((t) => tamanhos.includes(t)), `ICO com 16, 32, 48 e 256 px (tem: ${tamanhos})`);

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const rel = JSON.parse(fs.readFileSync(path.join(root, 'electron-builder.release.json'), 'utf8'));
  check(pkg.build.win.icon === 'assets/icon.ico' && fs.existsSync(path.join(root, pkg.build.win.icon)), 'npm run dist usa assets/icon.ico (que existe)');
  check(rel.win.icon === 'assets/icon.ico', 'dist:release usa assets/icon.ico');
  finish();
});
