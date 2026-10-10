const fs = require('fs');
const path = require('path');
const { app, BaseWindow, BrowserWindow, WebContentsView, dialog, ipcMain } = require('electron');

// Evita o Chromium tratar views como "ocultas/oclusas" (afeta captcha e timers do jogo)
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

// Entra pelo link de indicação: o site registra o ?ref= antes de ir para o app
const URL = 'https://pokeidle.io/?ref=Z5TU3TS';
const MAX_ACCOUNTS = 4;
const DEFAULT_ACCOUNTS = 2; // quantas contas abrem por padrão (alterne com Ctrl+Shift+0)
const MAX_COLS = 2;

// Remove "Electron/x" e o nome do app do User-Agent: sites com captcha/anti-bot
// costumam recusar clientes que se identificam como Electron.
app.userAgentFallback = app.userAgentFallback
  .replace(/\s*Electron\/\S+/, '')
  .replace(/\s*multi-pokeidle-io\/\S+/, '');

let logWin = null;
const logBuffer = [];

function sendLog(entry) {
  entry.t = new Date().toLocaleTimeString('pt-BR');
  logBuffer.push(entry);
  if (logBuffer.length > 2000) logBuffer.shift();
  if (logWin && !logWin.isDestroyed()) logWin.webContents.send('log', entry);
}

function toggleLogWindow() {
  if (logWin && !logWin.isDestroyed()) {
    if (logWin.isVisible()) logWin.hide();
    else logWin.show();
    return;
  }
  logWin = new BrowserWindow({
    width: 1100,
    height: 600,
    title: 'Logs - Multi PokeIdle IO',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'logs-preload.js') },
  });
  logWin.loadFile(path.join(__dirname, 'logs.html'));
  logWin.webContents.on('did-finish-load', () => {
    logBuffer.forEach((e) => logWin.webContents.send('log', e));
  });
}

function attachLogging(id, view) {
  const acc = `conta${id}`;
  const wc = view.webContents;

  wc.on('console-message', (_e, level, message, line, sourceId) => {
    const lv = ['verbose', 'info', 'warn', 'error'][level] || 'info';
    sendLog({ acc, kind: 'console', level: lv, text: `${message}  (${sourceId}:${line})` });
  });
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    sendLog({ acc, kind: 'load', level: 'error', text: `falha ao carregar ${isMainFrame ? '(página)' : '(frame)'}: ${desc} (${code}) ${url}` });
  });
  wc.on('render-process-gone', (_e, d) => {
    sendLog({ acc, kind: 'load', level: 'error', text: `renderer encerrou: ${d.reason}` });
  });
  wc.on('did-navigate', (_e, url, code) => {
    sendLog({ acc, kind: 'load', level: 'info', text: `navegou para ${url} [${code}]` });
  });

  const ses = wc.session;
  ses.webRequest.onCompleted((d) => {
    const bad = d.statusCode >= 400;
    sendLog({ acc, kind: 'net', level: bad ? 'error' : 'info', text: `${d.method} ${d.statusCode} [${d.resourceType}] ${d.url}` });
  });
  ses.webRequest.onErrorOccurred((d) => {
    sendLog({ acc, kind: 'net', level: 'error', text: `${d.method} FALHOU: ${d.error} [${d.resourceType}] ${d.url}` });
  });
}

// ---- Ordem das contas na grade (persistida) ----
// Cada conta tem um id fixo (1..N) que define sua sessão/cookies. A posição na grade pode mudar.
const orderFile = () => path.join(app.getPath('userData'), 'order.json');
const configFile = () => path.join(app.getPath('userData'), 'config.json');

function loadAccountCount() {
  try {
    const n = JSON.parse(fs.readFileSync(configFile(), 'utf8')).accounts;
    if (Number.isInteger(n) && n >= 1 && n <= MAX_ACCOUNTS) return n;
  } catch {}
  return DEFAULT_ACCOUNTS;
}

function saveAccountCount(n) {
  try {
    fs.writeFileSync(configFile(), JSON.stringify({ accounts: n }));
  } catch (err) {
    console.error('não foi possível salvar a configuração:', err);
  }
}

// Ids das contas ativas (1..count) na ordem salva; ids sem posição salva vão para o fim.
function loadOrder(count) {
  let saved = [];
  try {
    const raw = JSON.parse(fs.readFileSync(orderFile(), 'utf8'));
    if (Array.isArray(raw)) saved = raw;
  } catch {}
  const ids = saved.filter((id, i) => Number.isInteger(id) && id >= 1 && id <= count && saved.indexOf(id) === i);
  for (let id = 1; id <= count; id++) if (!ids.includes(id)) ids.push(id);
  return ids;
}

function saveOrder() {
  try {
    fs.writeFileSync(orderFile(), JSON.stringify(slots.map((s) => s.id)));
  } catch (err) {
    console.error('não foi possível salvar a ordem:', err);
  }
}

// null = grade com todas; 0..N-1 = só a conta dessa posição, em tela cheia
let focused = null;
let mainWin = null;
const slots = []; // [{ id, view }] na ordem da grade

// ---- Ajuda (sobreposição) ----
// View própria, por cima das contas e isolada das páginas do jogo (o site não enxerga nem altera).
let helpView = null;
let helpOpen = false;

function createHelpView() {
  helpView = new WebContentsView({
    webPreferences: { preload: path.join(__dirname, 'help-preload.js') },
  });
  helpView.setBackgroundColor('#00000000');
  helpView.setVisible(false);
  mainWin.contentView.addChildView(helpView);
  helpView.webContents.loadFile(path.join(__dirname, 'help.html'));
  helpView.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.code === 'F1' || input.code === 'Escape')) {
      event.preventDefault();
      toggleHelp(false);
    }
  });
  ipcMain.on('help:close', () => toggleHelp(false));
}

function toggleHelp(show = !helpOpen) {
  helpOpen = show;
  if (show) {
    mainWin.contentView.addChildView(helpView); // re-adicionar move para o topo
    helpView.setVisible(true);
    layout();
    helpView.webContents.focus();
  } else {
    helpView.setVisible(false);
    const target = slots[focused ?? 0];
    if (target) target.view.webContents.focus();
  }
}

function layout() {
  if (!mainWin) return;
  const { width, height } = mainWin.getContentBounds();
  if (helpView) helpView.setBounds({ x: 0, y: 0, width, height });
  const COLS = Math.max(1, Math.min(MAX_COLS, slots.length));
  const ROWS = Math.max(1, Math.ceil(slots.length / COLS));
  const w = Math.floor(width / COLS);
  const h = Math.floor(height / ROWS);
  slots.forEach(({ view }, i) => {
    if (focused !== null) {
      view.setVisible(i === focused);
      if (i === focused) view.setBounds({ x: 0, y: 0, width, height });
      return;
    }
    view.setVisible(true);
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    view.setBounds({
      x: col * w,
      y: row * h,
      // a última coluna/linha absorve o resto dos pixels
      width: col === COLS - 1 ? width - col * w : w,
      height: row === ROWS - 1 ? height - row * h : h,
    });
  });
}

function updateTitle() {
  mainWin.setTitle(
    focused === null ? 'PokeIdle Multi' : `PokeIdle Multi - posição ${focused + 1} (conta ${slots[focused].id})`
  );
}

function setFocus(index) {
  focused = index;
  layout();
  if (index !== null) slots[index].view.webContents.focus();
  updateTitle();
}

// Move a conta da posição `from` para a vizinha (dir = -1 esquerda/antes, +1 direita/depois)
function moveSlot(from, dir) {
  const to = from + dir;
  if (to < 0 || to >= slots.length) return;
  [slots[from], slots[to]] = [slots[to], slots[from]];
  if (focused === from) focused = to;
  else if (focused === to) focused = from;
  saveOrder();
  layout();
  slots[to].view.webContents.focus();
  updateTitle();
}

async function resetAccount(index) {
  const { id, view } = slots[index];
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Cancelar', 'Resetar'],
    defaultId: 0,
    cancelId: 0,
    title: 'Resetar conta',
    message: `Resetar a sessão da conta ${id} (posição ${index + 1})?`,
    detail:
      'Apaga cookies, login e dados locais desse quadrante e recarrega o link de indicação. ' +
      'A conta criada no jogo continua existindo no servidor.',
  });
  if (response !== 1) return;
  const ses = view.webContents.session;
  await ses.clearStorageData();
  await ses.clearCache();
  await ses.clearAuthCache();
  view.webContents.loadURL(URL);
}

// ---- Extensões locais (opcional) ----
// Se existir um `local.js` ao lado deste arquivo (ignorado pelo git), ele é carregado com acesso
// às contas abertas. Contrato: `module.exports = ({ getSlots, sendLog }) => ({ onShortcut?, onSlotRemoved? })`.
let ext = null;
function loadExtension() {
  try {
    ext = require('./local.js')({ getSlots: () => slots, sendLog });
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') console.error('falha ao carregar local.js:', err);
  }
}

// Atalhos locais (só valem com o app em foco). Usa input.code para independer do layout/Shift.
//   Ctrl+1..4          foca a conta da posição
//   Ctrl+0             volta à grade
//   Ctrl+L             mostra/esconde logs
//   Ctrl+Shift+1..4    reseta a sessão da conta da posição (com confirmação)
//   Ctrl+Alt+←/→       move a conta atual na grade (a em foco, ou a que tem o teclado)
//   Ctrl+Shift+0 ou Ctrl+Alt+Shift+0   alterna entre 2 e 4 contas na janela
function makeShortcutHandler(id) {
  return (event, input) => {
    if (input.type === 'keyDown' && input.code === 'F1') {
      event.preventDefault();
      toggleHelp();
      return;
    }
    if (input.type === 'keyDown' && input.code === 'F11') {
      event.preventDefault();
      mainWin.setFullScreen(!mainWin.isFullScreen());
      return;
    }
    if (input.type !== 'keyDown' || !input.control) return;
    if (ext?.onShortcut?.(event, input)) return;
    const digit = /^Digit([0-9])$/.exec(input.code);
    const n = digit ? Number(digit[1]) : null;
    const pos = slots.findIndex((s) => s.id === id);
    const total = slots.length;

    // Ctrl+Shift+0 pode ser capturado pelo Windows (troca de idioma); Ctrl+Alt+Shift+0 é o reserva
    if (input.shift && n === 0) {
      event.preventDefault();
      setAccountCount(total >= MAX_ACCOUNTS ? 2 : MAX_ACCOUNTS);
    } else if (input.alt && !input.shift && (input.code === 'ArrowLeft' || input.code === 'ArrowRight')) {
      event.preventDefault();
      moveSlot(pos, input.code === 'ArrowLeft' ? -1 : 1);
    } else if (!input.alt && input.shift && n >= 1 && n <= total) {
      event.preventDefault();
      resetAccount(n - 1);
    } else if (!input.alt && !input.shift && n >= 1 && n <= total) {
      event.preventDefault();
      // mesmo atalho de novo (já em foco nessa conta) volta à grade
      setFocus(focused === n - 1 ? null : n - 1);
    } else if (!input.alt && !input.shift && n === 0) {
      event.preventDefault();
      setFocus(null);
    } else if (!input.alt && !input.shift && input.code === 'KeyL') {
      event.preventDefault();
      toggleLogWindow();
    }
  };
}

function createSlot(id) {
  // "persist:" mantém cookies/localStorage em disco, separados por conta
  const view = new WebContentsView({
    webPreferences: {
      partition: `persist:conta${id}`,
      backgroundThrottling: false, // idle game: não pausar views sem foco
    },
  });
  view.webContents.setWindowOpenHandler(({ url }) => {
    view.webContents.loadURL(url);
    return { action: 'deny' };
  });
  attachLogging(id, view);
  view.webContents.on('before-input-event', makeShortcutHandler(id));
  mainWin.contentView.addChildView(view);
  view.webContents.loadURL(URL);
  slots.push({ id, view });
}

// Ajusta quantas contas ficam abertas (1..MAX). Remover uma conta só fecha o quadrante:
// a sessão (cookies/login) fica salva e volta ao reabrir.
function setAccountCount(count) {
  count = Math.max(1, Math.min(MAX_ACCOUNTS, count));
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].id > count) {
      const { id, view } = slots[i];
      ext?.onSlotRemoved?.(id);
      mainWin.contentView.removeChildView(view);
      view.webContents.close();
      slots.splice(i, 1);
    }
  }
  for (let id = 1; id <= count; id++) {
    if (!slots.some((s) => s.id === id)) createSlot(id);
  }
  if (focused !== null && focused >= slots.length) focused = null;
  saveAccountCount(count);
  saveOrder();
  if (helpOpen) mainWin.contentView.addChildView(helpView); // mantém a ajuda por cima
  layout();
  updateTitle();
}

function createWindow() {
  mainWin = new BaseWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    title: 'PokeIdle Multi',
    fullscreen: true, // abre em tela cheia; F11 alterna
  });
  const win = mainWin;

  for (const id of loadOrder(loadAccountCount())) createSlot(id);
  createHelpView();

  layout();
  ['resize', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'].forEach((ev) =>
    win.on(ev, layout)
  );
}

app.whenReady().then(() => {
  createWindow();
  loadExtension();
  app.on('activate', () => {
    if (BaseWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());
