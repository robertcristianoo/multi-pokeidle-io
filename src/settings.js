// Janela modal de Configurações: reúne as opções que antes ficavam soltas na barra do app
// (animações, vigia de captura, Auto-bola sem VIP e o resgate automático de pontos).
// Cada opção é um liga/desliga; o estado vem do main (`getState`) e a ação é a mesma que o botão da barra executava.
const path = require('path');
const { BrowserWindow, ipcMain, screen } = require('electron');

const PRELOAD = path.join(__dirname, 'preload', 'settings.js');
const PAGE = path.join(__dirname, 'ui', 'settings.html');

// toggles: { nome: () => void } alterna a opção; open: { nome: () => void } abre uma janela auxiliar;
// extensions: { set(ext, conta, ligada) } liga/desliga uma extensão do Chromium em uma conta (o estado vem em getState)
function createSettings({ mainWin, getState, toggles, open, extensions }) {
  let win = null;

  function show() {
    if (win && !win.isDestroyed()) { win.focus(); return; }
    win = new BrowserWindow({
      width: 520,
      height: Math.min(780, screen.getPrimaryDisplay().workAreaSize.height - 80), // cabe em telas baixas (a página rola)
      useContentSize: true,
      resizable: false,
      parent: mainWin,
      modal: true,
      title: 'Configurações - Multi PokeIdle IO',
      autoHideMenuBar: true,
      minimizable: false,
      webPreferences: { preload: PRELOAD },
    });
    win.on('closed', () => { win = null; });
    win.loadFile(PAGE);
  }

  // só aceita nomes conhecidos: a página nunca escolhe o que executar
  const fromWin = (e) => !!win && !win.isDestroyed() && e.sender === win.webContents;
  ipcMain.handle('cfg:get', (e) => (fromWin(e) ? getState() : null));
  ipcMain.handle('cfg:toggle', (e, name) => {
    if (fromWin(e) && Object.hasOwn(toggles, name)) toggles[name]();
    return fromWin(e) ? getState() : null;
  });
  ipcMain.handle('cfg:ext', async (e, ext, acc, on) => {
    if (fromWin(e) && typeof ext === 'string' && Number.isInteger(acc) && typeof on === 'boolean') await extensions.set(ext, acc, on);
    return fromWin(e) ? getState() : null;
  });
  ipcMain.on('cfg:open', (e, name) => {
    if (!fromWin(e) || !Object.hasOwn(open, name)) return;
    win.close(); // o modal sai da frente: a janela auxiliar abre livre, sem ficar presa atrás dele
    open[name]();
  });

  return { show, isOpen: () => !!win && !win.isDestroyed() };
}

module.exports = { createSettings };
