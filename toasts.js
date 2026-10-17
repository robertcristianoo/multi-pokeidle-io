// Avisos (pop-ups) pequenos no canto superior direito da janela: usados pelas extensões (`notify`) e pelo app.
// Numa view própria, isolada das páginas do jogo; só ocupa espaço enquanto há aviso. Duram no máximo 5 s e
// são poucos de cada vez (os mais antigos saem), para não cobrir os dados do jogo.
//   show({ kind: 'ok' | 'fail' | 'info', title, text, openPath?: print que abre ao clicar, ms?: duração (máx. 5000) })
const path = require('path');
const { WebContentsView, ipcMain, shell } = require('electron');

const WIDTH = 260;
const MARGIN = 6;

function createToasts({ mainWin, getTop }) {
  const view = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'toasts-preload.js') } });
  view.setBackgroundColor('#00000000');
  view.setVisible(false);
  mainWin.contentView.addChildView(view);
  view.webContents.loadFile(path.join(__dirname, 'toasts.html'));

  let height = 0;
  let winWidth = 0;
  let winHeight = 0;
  let allowedPath = new Set(); // só abre arquivos que o próprio app mandou mostrar

  function place(width = winWidth, fullHeight = winHeight) {
    winWidth = width;
    winHeight = fullHeight;
    const h = Math.min(height, Math.max(0, fullHeight - getTop() - MARGIN));
    view.setVisible(h > 0);
    view.setBounds({ x: Math.max(0, width - WIDTH - MARGIN), y: getTop() + 6, width: WIDTH, height: h });
  }

  const mine = (e) => e.sender === view.webContents;
  ipcMain.on('toast:size', (e, h) => {
    if (!mine(e)) return;
    height = Math.max(0, Math.min(2000, Math.ceil(Number(h) || 0)));
    place();
  });
  ipcMain.on('toast:open', (e, p) => {
    if (mine(e) && allowedPath.has(p)) shell.openPath(p);
  });

  return {
    place,
    raise: () => mainWin.contentView.addChildView(view),
    show(t) {
      if (view.webContents.isDestroyed()) return;
      if (t.openPath) allowedPath.add(t.openPath);
      if (allowedPath.size > 200) allowedPath = new Set([...allowedPath].slice(-100));
      const send = () => view.webContents.send('toast:add', {
        kind: t.kind ?? 'info',
        title: String(t.title ?? ''),
        text: String(t.text ?? ''),
        openPath: t.openPath ?? null,
        ms: Math.min(5000, Math.max(1000, Number(t.ms) || 5000)),
      });
      if (view.webContents.isLoading()) view.webContents.once('did-finish-load', send);
      else send();
      mainWin.contentView.addChildView(view); // sempre por cima
    },
  };
}

module.exports = { createToasts };
