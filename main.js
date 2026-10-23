const fs = require('fs');
const path = require('path');
const { createLives } = require('./lives');
const { createToolbars } = require('./toolbar');
const { createToasts } = require('./toasts');
const { createUpdater } = require('./updates');
const { app, BaseWindow, BrowserWindow, WebContentsView, dialog, ipcMain, nativeImage, screen, shell } = require('electron');

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

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile(), 'utf8')) || {};
  } catch {
    return {};
  }
}

function saveConfig(patch) {
  try {
    fs.writeFileSync(configFile(), JSON.stringify({ ...loadConfig(), ...patch }, null, 2));
  } catch (err) {
    console.error('não foi possível salvar a configuração:', err);
  }
}

function loadAccountCount() {
  const n = loadConfig().accounts;
  return Number.isInteger(n) && n >= 1 && n <= MAX_ACCOUNTS ? n : DEFAULT_ACCOUNTS;
}

function saveAccountCount(n) {
  saveConfig({ accounts: n });
}

// Zoom e som por conta (persistidos): { [id]: { zooms: { [modo]: fator }, muted } }.
// O zoom vale por modo de exibição: em foco volta a 100%; na grade de 4 contas o padrão é 60%.
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;
const ZOOM_DEFAULTS = { focus: 1, grid4: 0.6, grid: 1 };
const viewMode = () => (focused !== null ? 'focus' : slots.length >= MAX_ACCOUNTS ? 'grid4' : 'grid');
const slotPrefs = (id) => ({ muted: false, ...(loadConfig().view?.[id] ?? {}) });
const slotZoom = (id) => slotPrefs(id).zooms?.[viewMode()] ?? ZOOM_DEFAULTS[viewMode()];
function saveSlotPrefs(id, patch) {
  const view = loadConfig().view ?? {};
  saveConfig({ view: { ...view, [id]: { ...slotPrefs(id), ...patch } } });
}
function setSlotZoom(id, factor) {
  const slot = slots.find((s) => s.id === id);
  if (!slot) return;
  const z = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, factor)) * 100) / 100;
  slot.view.webContents.setZoomFactor(z);
  saveSlotPrefs(id, { zooms: { ...slotPrefs(id).zooms, [viewMode()]: z } });
}
function applyZooms() {
  for (const { id, view } of slots) if (!view.webContents.isDestroyed()) view.webContents.setZoomFactor(slotZoom(id));
}
function setSlotMuted(id, muted) {
  const slot = slots.find((s) => s.id === id);
  if (!slot) return;
  slot.view.webContents.setAudioMuted(muted);
  saveSlotPrefs(id, { muted });
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
let livesCtl = null;
let toastsCtl = null; // avisos no canto superior direito
let updater = null; // aviso de versão nova (só em pacote de Release)

// Versão do Release que gerou este pacote (o workflow grava release-info.json); nula em desenvolvimento/build local
// Pacote sem release-info.json (build local de `npm run dist`) usa a versão do package.json, para o aviso também funcionar nele.
function releaseVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'release-info.json'), 'utf8')).version ?? null;
  } catch {
    return app.isPackaged && !process.env.PKMULTI_TEST ? app.getVersion() : null;
  }
}
let tbs = null; // barras de botões (uma por conta + a do app)
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

let lastMode = null;
function layout() {
  if (!mainWin) return;
  if (lastMode !== viewMode()) {
    lastMode = viewMode();
    applyZooms();
  }
  const { width, height: fullH } = mainWin.getContentBounds();
  const top = tbs ? tbs.appBarH : 0;
  const height = fullH - top;
  if (helpView) helpView.setBounds({ x: 0, y: 0, width, height: fullH });
  tbs?.placeApp(width);
  toastsCtl?.place(width, fullH);
  const barH = tbs ? tbs.slotBarH : 0;
  // cada conta ganha uma barra de botões no topo do quadrante; a página do jogo ocupa o resto
  const put = ({ id, view }, x, y, w, h, visible) => {
    view.setVisible(visible);
    tbs?.placeSlot(id, { x, y, width: w }, visible);
    if (visible) view.setBounds({ x, y: y + barH, width: w, height: Math.max(0, h - barH) });
  };
  const COLS = Math.max(1, Math.min(MAX_COLS, slots.length));
  const ROWS = Math.max(1, Math.ceil(slots.length / COLS));
  const w = Math.floor(width / COLS);
  const h = Math.floor(height / ROWS);
  slots.forEach((slot, i) => {
    if (focused !== null) {
      put(slot, 0, top, width, height, i === focused);
      return;
    }
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    // a última coluna/linha absorve o resto dos pixels
    put(slot, col * w, top + row * h, col === COLS - 1 ? width - col * w : w, row === ROWS - 1 ? height - row * h : h, true);
  });
}

// Ícone da janela (barra de tarefas): o Charizard shiny ocioso, em pixel art. O executável e o instalador usam o
// mesmo desenho (assets/icon.ico).
const appIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icons', 'app.png'));

function updateTitle() {
  mainWin.setTitle(
    focused === null ? 'PokeIdle Multi' : `PokeIdle Multi - posição ${focused + 1} (conta ${slots[focused].id})`
  );
}

function setFocus(index) {
  focused = index;
  saveConfig({ focusedId: index === null ? null : slots[index].id });
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
// Se existirem `local.js` / `local-*.js` ao lado deste arquivo (ignorados pelo git), são carregados com
// acesso às contas abertas. Contrato:
//   `module.exports = ({ getSlots, sendLog, notify }) => ({ onShortcut?, onSlotCreated?, onSlotRemoved?, features? })`
// `features()` devolve [{ id, label, title, isOn(contaId), set(contaId, on), settings?() }]: viram botões
// liga/desliga na barra de cada conta (ver toolbar.js).
// `onSlotCreated(id, view)` roda antes de a conta carregar a página (dá para registrar preloads).
const LOCAL_EXTENSIONS = ['./local.js', './local-sniper.js', './local-autocatch.js'];
const exts = [];
function loadExtensions() {
  for (const file of LOCAL_EXTENSIONS) {
    try {
      exts.push(require(file)({ getSlots: () => slots, sendLog, notify: (n) => toastsCtl?.show(n) }));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' || !String(err.message).includes(file.slice(2))) console.error(`falha ao carregar ${file}:`, err);
    }
  }
}

// Atalhos locais (só valem com o app em foco). Usa input.code para independer do layout/Shift.
//   Ctrl+1..4          foca a conta da posição
//   Ctrl+0             volta à grade
//   Ctrl+L             mostra/esconde logs
//   Ctrl+T             abre as lives (Twitch/Kick) no navegador; o mesmo do botão no canto
//   F5 / Ctrl+F5 / Ctrl+Shift+F5   recarrega / ignora o cache / todas as contas
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
    if (input.type === 'keyDown' && input.code === 'F5') {
      // F5 não recarrega sozinho (não há menu). F5 = recarrega a conta com o teclado;
      // Ctrl+F5 = ignora o cache; Ctrl+Shift+F5 = todas as contas, ignorando o cache.
      event.preventDefault();
      const targets = input.control && input.shift ? slots.map((s) => s.view) : [slots.find((s) => s.id === id).view];
      for (const v of targets) {
        if (input.control) v.webContents.session.clearCache().then(() => v.webContents.reloadIgnoringCache());
        else v.webContents.reload();
      }
      return;
    }
    if (input.type !== 'keyDown' || !input.control) return;
    if (exts.some((x) => x.onShortcut?.(event, input))) return;
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
    } else if (!input.alt && !input.shift && input.code === 'KeyT') {
      event.preventDefault();
      livesCtl?.open();
    }
  };
}

function createSlot(id) {
  // "persist:" mantém cookies/localStorage em disco, separados por conta
  const view = new WebContentsView({
    webPreferences: {
      partition: `persist:conta${id}`,
      preload: path.join(__dirname, 'lives-preload.js'), // só lê as lives que o jogo já informa
      backgroundThrottling: false, // idle game: não pausar views sem foco
    },
  });
  view.webContents.setWindowOpenHandler(({ url }) => {
    // links/popups abrem no navegador padrão do sistema (nova aba)
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  attachLogging(id, view);
  // o zoom é reaplicado a cada carga (a navegação pode zerá-lo)
  view.webContents.setAudioMuted(slotPrefs(id).muted);
  view.webContents.on('did-finish-load', () => view.webContents.setZoomFactor(slotZoom(id)));
  view.webContents.on('before-input-event', makeShortcutHandler(id));
  exts.forEach((x) => x.onSlotCreated?.(id, view));
  mainWin.contentView.addChildView(view);
  tbs?.addSlot(id);
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
      exts.forEach((x) => x.onSlotRemoved?.(id));
      tbs?.removeSlot(id);
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
  toastsCtl?.raise(); // contas novas entram por cima: os avisos voltam ao topo
  if (helpOpen) mainWin.contentView.addChildView(helpView); // mantém a ajuda por cima
  layout();
  updateTitle();
}

// ---- Estado da janela (persistido) ----
// Abre do jeito que foi deixado: tela cheia, maximizada ou normal (com posição e tamanho). Sem estado salvo, abre maximizada.
function loadWindowState() {
  const w = loadConfig().window ?? {};
  const b = w.bounds;
  const ok = b && [b.x, b.y, b.width, b.height].every(Number.isFinite) && b.width >= 400 && b.height >= 300 &&
    screen.getAllDisplays().some((d) => { // a janela precisa cair em alguma tela atual (monitor pode ter sido removido)
      const a = d.workArea;
      return b.x < a.x + a.width - 50 && b.x + b.width > a.x + 50 && b.y < a.y + a.height - 50 && b.y + b.height > a.y + 50;
    });
  return { bounds: ok ? b : null, maximized: w.maximized ?? true, fullscreen: !!w.fullscreen };
}

let saveWindowTimer = null;
function saveWindowState() {
  if (process.env.PKMULTI_TEST || !mainWin || mainWin.isDestroyed()) return;
  const prev = loadConfig().window ?? {};
  const fullscreen = mainWin.isFullScreen();
  saveConfig({ window: {
    fullscreen,
    maximized: fullscreen ? prev.maximized ?? true : mainWin.isMaximized(), // em tela cheia mantém o estado de antes
    bounds: fullscreen ? prev.bounds ?? mainWin.getNormalBounds() : mainWin.getNormalBounds(),
  } });
}
const scheduleSaveWindow = () => {
  clearTimeout(saveWindowTimer);
  saveWindowTimer = setTimeout(saveWindowState, 400);
};

function createWindow() {
  const st = loadWindowState();
  mainWin = new BaseWindow({
    width: 1600,
    height: 900,
    ...(st.bounds ?? {}),
    autoHideMenuBar: true,
    title: 'PokeIdle Multi',
    icon: appIcon,
    fullscreen: st.fullscreen && !process.env.PKMULTI_TEST,
    show: !process.env.PKMULTI_TEST, // os testes (test/) rodam com a janela escondida
  });
  const win = mainWin;
  if (st.maximized && !process.env.PKMULTI_TEST) win.maximize();

  tbs = createToolbars({
    mainWin,
    getSlots: () => slots,
    getFeatures: () => exts.flatMap((x) => x.features?.() ?? []),
    getAccountInfo: () => ({ count: slots.length, max: MAX_ACCOUNTS, focused, lives: livesCtl?.state() ?? { kind: 'none', text: '' },
      version: releaseVersion(), update: updater?.state() ?? null }),
    getSlotState: (id) => ({ zoom: slotZoom(id), muted: slotPrefs(id).muted }),
    actions: {
      accounts: () => setAccountCount(slots.length >= MAX_ACCOUNTS ? 2 : MAX_ACCOUNTS),
      grid: () => setFocus(null),
      focus: (id) => {
        const pos = slots.findIndex((s) => s.id === id);
        if (pos >= 0) setFocus(focused === pos ? null : pos);
      },
      logs: toggleLogWindow,
      lives: () => livesCtl?.open(),
      update: () => {
        const u = updater?.state();
        if (u?.kind === 'available') shell.openExternal(u.url); // página do Release: de lá se baixa o instalador
      },
      help: () => toggleHelp(),
      zoomIn: (id) => setSlotZoom(id, slotZoom(id) + ZOOM_STEP),
      zoomOut: (id) => setSlotZoom(id, slotZoom(id) - ZOOM_STEP),
      zoomReset: (id) => setSlotZoom(id, ZOOM_DEFAULTS[viewMode()]),
      mute: (id) => setSlotMuted(id, !slotPrefs(id).muted),
      reload: (id) => slots.find((s) => s.id === id)?.view.webContents.reload(),
      refocus: (id) => slots.find((s) => s.id === id)?.view.webContents.focus(),
    },
  });
  for (const id of loadOrder(loadAccountCount())) createSlot(id);
  const lastFocus = slots.findIndex((x) => x.id === loadConfig().focusedId); // volta ao quadrante que estava em foco
  if (lastFocus >= 0) focused = lastFocus;
  livesCtl = createLives({ mainWin, getSlots: () => slots });
  toastsCtl = createToasts({ mainWin, getTop: () => tbs.appBarH });
  updater = createUpdater({
    currentVersion: releaseVersion(),
    onAvailable: (u) => toastsCtl?.show({ kind: 'info', title: `Versão nova: v${u.latest}`, text: 'Use o botão Atualizar na barra para baixar', ms: 10000 }),
  });
  createHelpView();

  layout();
  ['resize', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'].forEach((ev) =>
    win.on(ev, layout)
  );
  ['resize', 'move', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'].forEach((ev) => win.on(ev, scheduleSaveWindow));
  win.on('close', saveWindowState);
  updateTitle();
}

app.whenReady().then(() => {
  loadExtensions();
  createWindow();
  app.on('activate', () => {
    if (BaseWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());
