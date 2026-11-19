// "Pague-me um café": BR Code do PIX (CRC e estrutura) e a janela (QR desenhado, cópia só dos dois textos permitidos).
const { app, check, finish, waitFor } = require('./helpers');
const { BrowserWindow, clipboard } = require('electron');
const { brCode, crc16 } = require('../src/pix');
const { createCafe, PIX_KEY } = require('../src/cafe');

app.whenReady().then(async () => {
  try {
    check(crc16('123456789') === '29B1', 'CRC16-CCITT confere com o vetor padrão (123456789 = 29B1)');
    const p = brCode({ chave: PIX_KEY });
    check(p.startsWith('000201') && p.includes('0014br.gov.bcb.pix') && p.includes(`0136${PIX_KEY}`) && p.includes('5303986') && p.includes('5802BR'), 'payload com formato, chave PIX, moeda BRL e país');
    check(p.slice(-8, -4) === '6304' && crc16(p.slice(0, -4)) === p.slice(-4), 'CRC no fim do payload confere');
    check(brCode({ chave: 'a@b.com', nome: 'José Ñandú Açaí com nome muito longo demais', cidade: 'São Paulo do Leste Grande' }).includes('59') && !/[^\x20-\x7e]/.test(brCode({ chave: 'a@b.com', nome: 'José Ñandú' })), 'textos livres saem em ASCII e dentro dos limites');
    let erro = false;
    try { brCode({ chave: '' }); } catch { erro = true; }
    check(erro, 'chave vazia é recusada');

    const pai = new BrowserWindow({ show: false });
    const cafe = createCafe({ mainWin: pai });
    check(cafe.payload() === p, 'a janela usa o mesmo payload');
    cafe.show();
    const win = BrowserWindow.getAllWindows().find((w) => w !== pai);
    await new Promise((r) => (win.webContents.isLoading() ? win.webContents.once('did-finish-load', r) : r()));
    check(await waitFor(() => win.webContents.executeJavaScript('document.getElementById("qr").src.startsWith("data:image")'), 4000), 'o QR é desenhado na janela (imagem data URL)');
    check(await win.webContents.executeJavaScript('document.getElementById("chave").textContent') === PIX_KEY, 'a chave aparece na janela');
    clipboard.writeText('x');
    await win.webContents.executeJavaScript('window.cafe.copy("chave")');
    check((await clipboard.readText()) === PIX_KEY, 'copiar chave coloca a chave na área de transferência');
    await win.webContents.executeJavaScript('window.cafe.copy("payload")');
    check((await clipboard.readText()) === p, 'copiar "copia e cola" coloca o payload');
    clipboard.writeText('x');
    const r = await win.webContents.executeJavaScript('window.cafe.copy("qualquer coisa")');
    check(r === false && (await clipboard.readText()) === 'x', 'a página não consegue copiar texto arbitrário');
  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});
