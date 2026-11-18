// Pontos da Twitch/Kick: o painel com o rodapé do chat de cada live (para resgatar à mão). O resgate automático, a
// configuração e o registro dos resgates são do gerenciador de lives (src/lives); o painel só abre a janela deles.
// main.js só chama `createPoints(...)`, `panelHeight()`, `place()` e `open()`.
//
// O painel: uma view do host (barra com Próxima conta, Página completa, Config e Fechar, e a borda para mudar a
// altura) e UMA view da página do canal, na sessão da própria conta do jogo (o login da Twitch/Kick fica salvo nela).
// As views só existem enquanto o painel está aberto.
const path = require('path');
const { WebContentsView, ipcMain, shell } = require('electron');
const { SITES, partitionOf, footerScript } = require('./sites');
const { createGoogleLogin, sites: GOOGLE_SITES } = require('../google-login');
const { t, loadPage } = require('../i18n');
const googleLogin = createGoogleLogin();

const UI = (f) => path.join(__dirname, '..', 'ui', f);
const PRELOAD = (f) => path.join(__dirname, '..', 'preload', f);
const TOP_H = 40; // faixa de arraste (6 px) + barra de botões do painel
const DEFAULT_H = 360;
const MIN_H = 160;
const MARGIN_BELOW_TOP = 160; // espaço mínimo que sobra para as contas acima do painel

// Lista plana das lives (de todas as contas): { acc, site, channel, nome }
const flatLives = (accounts) => accounts.flatMap((a) => [
  ...a.twitch.map((l) => ({ acc: a.acc, site: 'twitch', channel: l.id, nome: l.nome })),
  ...a.kick.map((l) => ({ acc: a.acc, site: 'kick', channel: l.id, nome: l.nome })),
]);

// `getStatus(acc, site, channel)` -> { text, stopped } do resgate automático (do gerenciador de lives); `onConfig`/`onLog` abrem as janelas dele.
// Volume baixo (10%) nos vídeos do painel: o player abre em 100% de fábrica. Cada vídeo é ajustado uma vez só.
const QUIET_SCRIPT = `for (const v of document.querySelectorAll('video')) { if (v.dataset.quietSet) continue; v.dataset.quietSet = '1'; v.volume = 0.1; }`;

function createPoints({ mainWin, getAccounts, config, raise = () => {}, relayout = () => {}, getStatus = () => ({}), onConfig = () => {}, onLog = () => {} }) {
  const configOf = () => config.get() ?? {};

  let panel = null; // { site, items, index, full, notice, host, view }
  let lastW = 0;
  let lastFull = 0;

  const itemsFor = (site) => flatLives(getAccounts()).filter((x) => x.site === site);
  const itemLabel = (it) => t('lives.points.itemLabel', { account: t('common.account', { id: it.acc }), name: it.nome || it.channel });

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
      text: it ? (getStatus(it.acc, it.site, it.channel).text ?? '') : '',
      stopped: it ? (getStatus(it.acc, it.site, it.channel).stopped ?? null) : null,
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
    const google = googleLogin.attach(view.webContents, GOOGLE_SITES[it.site]);
    view.webContents.setWindowOpenHandler(({ url }) => {
      if (google.intercept(url)) return { action: 'deny' };
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
        const aviso = !panel.full && r === 'nao-achou' ? t('lives.points.noButton') : '';
        if (aviso !== panel.notice) { panel.notice = aviso; pushState(); }
      }).catch(() => {});
    };
    view.webContents.on('did-finish-load', apply);
    // O player carrega depois da página: põe o volume em 10% uma vez em cada vídeo que aparece (mexer depois vale).
    const quiet = setInterval(() => {
      if (view.webContents.isDestroyed()) return clearInterval(quiet);
      view.webContents.executeJavaScript(QUIET_SCRIPT).catch(() => {});
    }, 2000);
    view.webContents.once('destroyed', () => clearInterval(quiet));
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
    loadPage(host.webContents, UI('points.html'), { site });
    host.webContents.on('did-finish-load', () => pushState());
    panel = { site, items: itemsFor(site), index: 0, full: false, notice: '', host, view: null };
    raise();
    if (!panel.items.length) {
      panel.notice = t('lives.points.noLives', { site: SITES[site].label });
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
      panel.notice = t('lives.points.noLives', { site: SITES[panel.site].label });
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

  ipcMain.on('pts:cmd', (_e, name) => {
    if (name === 'next') next();
    else if (name === 'full') toggleFull();
    else if (name === 'close') close();
    else if (name === 'config') onConfig();
    else if (name === 'log') onLog();
  });
  ipcMain.on('pts:resize', (_e, dy) => resize(Number(dy) || 0));
  return {
    open,
    close,
    toggle: (site) => (panel?.site === site ? close() : open(site)),
    next,
    panelHeight,
    place,
    state: () => ({ open: panel?.site ?? null }),
  };
}

module.exports = { createPoints, flatLives, DEFAULT_H, MIN_H };
