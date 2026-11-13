// Pontos da Twitch/Kick: o painel com o rodapé do chat de cada live (para resgatar à mão), o resgate automático
// opcional e o registro dos resgates. main.js só chama `createPoints(...)`, `panelHeight()`, `place()` e `open()`.
//
// O painel: uma view do host (barra com Próxima conta, Página completa, Config e Fechar, e a borda para mudar a
// altura) e UMA view da página do canal, na sessão da conta (partição própria por site e conta, o login fica salvo).
// As views só existem enquanto o painel está aberto.
const path = require('path');
const { BrowserWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const { BONUSES, SITES, partitionOf, footerScript } = require('./sites');
const { SCRIPTS, TWITCH_CLIENT_ID } = require('./scripts');
const { createRedeemer } = require('./redeem');
const { createRedeemLog } = require('./log');

const UI = (f) => path.join(__dirname, '..', 'ui', f);
const PRELOAD = (f) => path.join(__dirname, '..', 'preload', f);
const TOP_H = 40; // faixa de arraste (6 px) + barra de botões do painel
const DEFAULT_H = 360;
const MIN_H = 160;
const MARGIN_BELOW_TOP = 160; // espaço mínimo que sobra para as contas acima do painel
const LOAD_TIMEOUT_MS = 30 * 1000;

const withTimeout = (p, ms) => Promise.race([p, new Promise((_r, rej) => setTimeout(() => rej(new Error('a página demorou demais')), ms))]);

// Lista plana das lives (de todas as contas) no formato que o resgate usa
const flatLives = (accounts) => accounts.flatMap((a) => [
  ...a.twitch.map((l) => ({ acc: a.acc, site: 'twitch', channel: l.id, nome: l.nome })),
  ...a.kick.map((l) => ({ acc: a.acc, site: 'kick', channel: l.id, nome: l.nome })),
]);

function createPoints({ mainWin, getAccounts, config, userDataDir, notify = () => {}, raise = () => {}, relayout = () => {}, maxAccounts = 4 }) {
  const rlog = createRedeemLog(path.join(userDataDir, 'resgates.log'));
  const configOf = () => config.get() ?? {};

  // Conferência real de um canal: abre a página do canal (escondida, muda, na sessão da conta), roda o script e fecha.
  async function runCheck({ acc, site, channel, word, spend, refund }) {
    const S = SITES[site];
    const ses = session.fromPartition(partitionOf(site, acc));
    const login = (await ses.cookies.get({ url: S.loginCookie.url, name: S.loginCookie.name }))[0]?.value;
    if (!login) return { error: `sem login ${S.label} nesta conta (entre pelo painel de pontos)` };
    const device = S.deviceCookie ? (await ses.cookies.get({ url: S.deviceCookie.url, name: S.deviceCookie.name }))[0]?.value : undefined;
    const args = {
      api: site === 'kick' ? 'https://kick.com' : 'https://gql.twitch.tv',
      channel, token: login, device, clientId: TWITCH_CLIENT_ID, word, spend, refund,
    };
    const wv = new WebContentsView({ webPreferences: { partition: partitionOf(site, acc), backgroundThrottling: false } });
    wv.webContents.setAudioMuted(true);
    try {
      await withTimeout(wv.webContents.loadURL(S.chatUrl(channel)), LOAD_TIMEOUT_MS);
      const out = await wv.webContents.executeJavaScript(SCRIPTS[site](args), true);
      return JSON.parse(out);
    } catch (err) {
      return { error: `falha na conferência: ${err.message}` };
    } finally {
      wv.webContents.close();
    }
  }

  const redeemer = createRedeemer({
    getAuto: () => configOf().auto ?? {},
    getLives: () => flatLives(getAccounts()),
    check: runCheck,
    log: (e) => rlog.append(e),
    notify,
  });
  redeemer.start();

  let panel = null; // { site, items, index, full, notice, host, view }
  let lastW = 0;
  let lastFull = 0;

  const itemsFor = (site) => flatLives(getAccounts()).filter((x) => x.site === site);
  const itemLabel = (it) => `Conta ${it.acc} · ${it.nome || it.channel}`;

  const clampH = (h, fullH = lastFull) => Math.max(MIN_H, Math.min(Math.max(MIN_H, fullH - MARGIN_BELOW_TOP), h));

  function panelHeight(fullH = lastFull) {
    if (!panel) return 0;
    return clampH(Number(configOf().height) || DEFAULT_H, fullH);
  }

  function pushState() {
    if (!panel || panel.host.webContents.isDestroyed()) return;
    const it = panel.items[panel.index];
    panel.host.webContents.send('pts:state', {
      site: panel.site,
      label: SITES[panel.site].label,
      total: panel.items.length,
      index: panel.index,
      title: it ? itemLabel(it) : '',
      text: it ? redeemer.text(it.acc, it.site, it.channel) : '',
      stopped: it ? redeemer.stoppedReason(it.acc, it.site) : null,
      full: panel.full,
      notice: panel.notice,
    });
  }

  function dropChannelView() {
    if (!panel?.view) return;
    try { mainWin.contentView.removeChildView(panel.view); } catch {}
    if (!panel.view.webContents.isDestroyed()) panel.view.webContents.close();
    panel.view = null;
  }

  function showChannel() {
    dropChannelView();
    const it = panel.items[panel.index];
    panel.notice = '';
    if (!it) return pushState();
    const S = SITES[it.site];
    const view = new WebContentsView({ webPreferences: { partition: partitionOf(it.site, it.acc), backgroundThrottling: false } });
    view.setBackgroundColor('#0b0b0f');
    view.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:/i.test(url)) shell.openExternal(url).catch(() => {});
      return { action: 'deny' };
    });
    mainWin.contentView.addChildView(view);
    panel.view = view;
    const apply = () => {
      if (view.webContents.isDestroyed() || panel?.view !== view) return;
      const mode = panel.full ? 'full' : 'footer';
      view.webContents.executeJavaScript(footerScript(mode)).then((r) => {
        if (panel?.view !== view) return;
        const aviso = !panel.full && r === 'nao-achou' ? 'Não achei o botão dos pontos nesta página: use "Página completa".' : '';
        if (aviso !== panel.notice) { panel.notice = aviso; pushState(); }
      }).catch(() => {});
    };
    view.webContents.on('did-finish-load', apply);
    view.webContents.loadURL(panel.full ? S.pageUrl(it.channel) : S.chatUrl(it.channel)).catch(() => {});
    relayout();
    pushState();
  }

  function open(site) {
    if (!SITES[site]) return;
    if (panel) close();
    const host = new WebContentsView({ webPreferences: { preload: PRELOAD('points.js') } });
    host.setBackgroundColor('#1b1220');
    mainWin.contentView.addChildView(host);
    host.webContents.loadFile(UI('points.html'), { query: { site } });
    host.webContents.on('did-finish-load', () => pushState());
    panel = { site, items: itemsFor(site), index: 0, full: false, notice: '', host, view: null };
    raise();
    if (!panel.items.length) {
      panel.notice = `Nenhuma live de ${SITES[site].label} com as contas abertas agora.`;
      relayout();
      pushState();
      return;
    }
    showChannel();
  }

  function close() {
    if (!panel) return;
    dropChannelView();
    try { mainWin.contentView.removeChildView(panel.host); } catch {}
    if (!panel.host.webContents.isDestroyed()) panel.host.webContents.close();
    panel = null;
    relayout();
  }

  function next() {
    if (!panel) return;
    panel.items = itemsFor(panel.site);
    if (!panel.items.length) {
      dropChannelView();
      panel.notice = `Nenhuma live de ${SITES[panel.site].label} com as contas abertas agora.`;
      relayout();
      return pushState();
    }
    panel.index = (panel.index + 1) % panel.items.length;
    showChannel();
  }

  function toggleFull() {
    if (!panel) return;
    panel.full = !panel.full;
    if (panel.items.length) showChannel();
    else pushState();
  }

  // A borda de cima do painel: arrastar para cima aumenta (dy negativo), e a altura fica salva
  function resize(dy) {
    if (!panel) return;
    config.set({ height: Math.round(clampH(panelHeight() - dy)) });
    relayout();
  }

  // Chamado pelo layout da janela: posiciona o host (embaixo) e a página do canal dentro dele
  function place(width, fullH) {
    lastW = width;
    lastFull = fullH;
    if (!panel) return;
    const H = panelHeight(fullH);
    const y0 = fullH - H;
    panel.host.setBounds({ x: 0, y: y0, width, height: H });
    if (panel.view) panel.view.setBounds({ x: 0, y: y0 + TOP_H, width, height: Math.max(0, H - TOP_H) });
  }

  // ---- Janela de configuração do resgate automático (por conta e por site) ----
  let cfgWin = null;
  function showConfig() {
    if (cfgWin && !cfgWin.isDestroyed()) return cfgWin.focus();
    cfgWin = new BrowserWindow({
      width: 560, height: 360, title: 'Resgate automático - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('points-config.js') },
    });
    cfgWin.loadFile(UI('points-config.html'));
  }

  // ---- Janela do registro dos resgates ----
  let logW = null;
  function showLog() {
    if (logW && !logW.isDestroyed()) return logW.focus();
    logW = new BrowserWindow({
      width: 1000, height: 560, title: 'Log de resgates - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('redeem-log.js') },
    });
    logW.loadFile(UI('redeem-log.html'));
  }

  ipcMain.on('pts:cmd', (_e, name) => {
    if (name === 'next') next();
    else if (name === 'full') toggleFull();
    else if (name === 'close') close();
    else if (name === 'config') showConfig();
    else if (name === 'log') showLog();
  });
  ipcMain.on('pts:resize', (_e, dy) => resize(Number(dy) || 0));
  ipcMain.handle('pts:log', () => ({ file: rlog.file, rows: rlog.read() }));
  ipcMain.handle('pts:config-get', () => ({ auto: configOf().auto ?? {}, accounts: Array.from({ length: maxAccounts }, (_v, i) => i + 1), bonuses: BONUSES }));
  ipcMain.handle('pts:config-save', (_e, auto) => {
    const limpo = {};
    for (const [acc, v] of Object.entries(auto ?? {})) {
      const id = Number(acc);
      if (!Number.isInteger(id) || id < 1 || id > maxAccounts || !v || typeof v !== 'object') continue;
      const linha = {};
      for (const site of Object.keys(SITES)) if (BONUSES[v[site]]) linha[site] = v[site];
      if (Object.keys(linha).length) limpo[id] = linha;
    }
    config.set({ auto: limpo });
    redeemer.restart();
    setTimeout(() => redeemer.tick().catch(() => {}), 500);
    return true;
  });

  return {
    open,
    close,
    toggle: (site) => (panel?.site === site ? close() : open(site)),
    next,
    panelHeight,
    place,
    showLog,
    showConfig,
    redeemer,
    state: () => ({ open: panel?.site ?? null }),
  };
}

module.exports = { createPoints, flatLives, DEFAULT_H, MIN_H };
