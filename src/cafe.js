// "Pague-me um café": janela com o QR e o "copia e cola" do PIX para quem quiser apoiar o projeto. É só uma janela local:
// nada é enviado a lugar nenhum e não há nenhuma cobrança automática.
const path = require('path');
const { BrowserWindow, clipboard, ipcMain } = require('electron');
const { brCode } = require('./pix');
const { t, loadPage } = require('./i18n');

const PIX_KEY = '9ea62c54-f23c-45e3-816b-6bb71d48e803'; // chave PIX aleatória do autor (feita para ser compartilhada)
const PRELOAD = path.join(__dirname, 'preload', 'cafe.js');
const PAGE = path.join(__dirname, 'ui', 'cafe.html');

function createCafe({ mainWin }) {
  let win = null;
  const payload = brCode({ chave: PIX_KEY });

  function show() {
    if (win && !win.isDestroyed()) { win.focus(); return; }
    win = new BrowserWindow({
      width: 420,
      height: 640,
      useContentSize: true,
      resizable: false,
      parent: mainWin,
      modal: true,
      title: t('cafe.title'),
      autoHideMenuBar: true,
      minimizable: false,
      webPreferences: { preload: PRELOAD },
    });
    win.on('closed', () => { win = null; });
    loadPage(win.webContents, PAGE);
  }

  const fromWin = (e) => !!win && !win.isDestroyed() && e.sender === win.webContents;
  ipcMain.handle('cafe:get', (e) => (fromWin(e) ? { chave: PIX_KEY, payload } : null));
  // a página só escolhe QUAL dos dois textos copiar; o conteúdo vem sempre daqui
  ipcMain.handle('cafe:copy', (e, qual) => {
    if (!fromWin(e)) return false;
    if (qual !== 'chave' && qual !== 'payload') return false;
    clipboard.writeText(qual === 'chave' ? PIX_KEY : payload);
    return true;
  });
  ipcMain.on('cafe:close', (e) => { if (fromWin(e)) win.close(); });

  return { show, payload: () => payload };
}

module.exports = { createCafe, PIX_KEY };
