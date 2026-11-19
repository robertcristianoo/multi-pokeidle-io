// Pontos da Twitch/Kick: o painel com o rodapé do chat de cada live (para resgatar à mão), SEMPRE de uma conta (a da barra
// de onde foi aberto), e a janela "Pontos das contas" (uma linha por conta, lado a lado). O resgate automático, a
// configuração e o registro dos resgates são do gerenciador de lives (src/lives); o painel só abre a janela deles.
// main.js só chama `createPoints(...)`, `panelHeight()`, `place()`, `open()`, `toggle()`, `menu()` e `showAccounts()`.
//
// O painel: uma view do host (barra com as lives da conta, Entrar, Sair, Página completa, Config, Registro e Fechar, e a
// borda para mudar a altura) e UMA view da página do canal, na sessão da própria conta do jogo (o login fica salvo nela).
// As views só existem enquanto o painel está aberto.
const path = require('path');
const { BrowserWindow, WebContentsView, ipcMain, shell } = require('electron');
const { SITES, partitionOf, footerScript } = require('./sites');
const { createGoogleLogin, sites: GOOGLE_SITES } = require('../google-login');
const accountNames = require('../account-names');
const googleLogin = createGoogleLogin();

const UI = (f) => path.join(__dirname, '..', 'ui', f);
const PRELOAD = (f) => path.join(__dirname, '..', 'preload', f);
const TOP_H = 40; // faixa de arraste (6 px) + barra de botões do painel
const DEFAULT_H = 360;
const MIN_H = 160;
const MARGIN_BELOW_TOP = 160; // espaço mínimo que sobra para as contas acima do painel
const ACTIONS = ['login', 'logout', 'panel']; // o que a janela "Pontos das contas" pede para uma conta e um site

// Volume baixo (10%) nos vídeos do painel: o player abre em 100% de fábrica. Cada vídeo é ajustado uma vez só.
const QUIET_SCRIPT = `for (const v of document.querySelectorAll('video')) { if (v.dataset.quietSet) continue; v.dataset.quietSet = '1'; v.volume = 0.1; }`;

// Opções: `getAccounts()` -> [{ acc, twitch: [{ id, nome }], kick: [...] }] (as lives abertas de cada conta);
// `getStatus(acc, site, channel)` -> { text, stopped } do resgate automático; `getRows()` -> linhas da janela de contas;
// `onAccount(acc, site, 'login' | 'logout')` entra/sai da Twitch/Kick daquela conta; `onConfig`/`onLog` abrem as janelas das lives.
function createPoints({
  mainWin, getAccounts, config, raise = () => {}, relayout = () => {}, getStatus = () => ({}), getRows = async () => [],
  onAccount = () => {}, onConfig = () => {}, onLog = () => {}, maxAccounts = 4,
}) {
  const isAccount = (acc) => Number.isInteger(acc) && acc >= 1 && acc <= maxAccounts;
  const configOf = () => config.get() ?? {};

  let panel = null; // { site, acc, items, index, full, notice, host, view }
  let accountsWin = null;
  let lastW = 0;
  let lastFull = 0;

  // As lives abertas de UMA conta neste site (só as dela: o painel nunca troca de conta sozinho)
  const itemsFor = (site, acc) => {
    const a = getAccounts().find((x) => x.acc === acc);
    if (!a) return [];
    return (site === 'twitch' ? a.twitch : a.kick).map((l) => ({ acc, site, channel: l.id, nome: l.nome }));
  };

  const clampH = (h, fullH = lastFull) => Math.max(MIN_H, Math.min(Math.max(MIN_H, fullH - MARGIN_BELOW_TOP), h));

  function panelHeight(fullH = lastFull) {
    if (!panel) return 0;
    return clampH(Number(configOf().height) || DEFAULT_H, fullH);
  }

  // O título sempre diz de qual conta é o painel; a linha menor, a live que está na página
  function pushState() {
    if (!panel || panel.host.webContents.isDestroyed()) return;
    const it = panel.items[panel.index];
    const st = it ? getStatus(it.acc, it.site, it.channel) : {};
    panel.host.webContents.send('pts:state', {
      site: panel.site,
      label: SITES[panel.site].label,
      acc: panel.acc,
      account: accountNames.label(panel.acc),
      total: panel.items.length,
      index: panel.index,
      live: it ? `${it.nome || it.channel} (${panel.index + 1}/${panel.items.length})` : '',
      text: it ? (st.text ?? '') : '',
      stopped: it ? (st.stopped ?? null) : null,
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
    // a sessão é a da conta do painel (partitionOf): a página mostra o login e os pontos dela, e de mais nenhuma
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
        const aviso = !panel.full && r === 'nao-achou' ? 'Não achei o botão dos pontos: use "Página completa".' : '';
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

  // Abre o painel de um site para UMA conta (fecha o que estiver aberto antes)
  function open(site, acc) {
    if (!SITES[site] || !isAccount(acc)) return;
    if (panel) close();
    const host = new WebContentsView({ webPreferences: { preload: PRELOAD('points.js') } });
    host.setBackgroundColor('#1b1220');
    mainWin.contentView.addChildView(host);
    host.webContents.loadFile(UI('points.html'), { query: { site } });
    host.webContents.on('did-finish-load', () => pushState());
    panel = { site, acc, items: itemsFor(site, acc), index: 0, full: false, notice: '', host, view: null };
    raise();
    if (!panel.items.length) {
      panel.notice = `Nenhuma live de ${SITES[site].label} nesta conta agora. Entrar e Sair seguem valendo.`;
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

  // Liga/desliga o painel deste site nesta conta (outra conta ou site: troca o painel)
  function toggle(site, acc) {
    if (panel && panel.site === site && panel.acc === acc) close();
    else open(site, acc);
  }

  // Próxima live DESTA conta (com as lives dela no ar)
  function next() {
    if (!panel) return;
    panel.items = itemsFor(panel.site, panel.acc);
    if (!panel.items.length) {
      dropChannelView();
      panel.notice = `Nenhuma live de ${SITES[panel.site].label} nesta conta agora.`;
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

  // Menu da barra de uma conta: Twitch e Kick (marcado = painel desta conta aberto) e a janela de todas as contas
  function menu(acc) {
    const on = (site) => !!panel && panel.site === site && panel.acc === acc;
    return [
      { label: 'Twitch', type: 'checkbox', checked: on('twitch'), click: () => toggle('twitch', acc) },
      { label: 'Kick', type: 'checkbox', checked: on('kick'), click: () => toggle('kick', acc) },
      { type: 'separator' },
      { label: 'Todas as contas', click: () => showAccounts(acc) },
    ];
  }

  // A janela "Pontos das contas": uma linha por conta, com o login, o saldo, o bônus e o último resgate de cada uma.
  // `focus` (número da conta, ou null) é a linha que já aparece em destaque quando a janela é aberta pela barra de uma conta.
  function showAccounts(focus = null) {
    if (accountsWin && !accountsWin.isDestroyed()) {
      accountsWin.webContents.send('pc:focus', focus);
      return accountsWin.focus();
    }
    accountsWin = new BrowserWindow({
      width: 820, height: 520, title: 'Pontos das contas - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('pontos-contas.js') },
    });
    accountsWin.loadFile(UI('pontos-contas.html'), { query: focus ? { acc: String(focus) } : {} });
    accountsWin.on('closed', () => { accountsWin = null; });
  }

  ipcMain.on('pts:cmd', (_e, name) => {
    if (name === 'next') next();
    else if (name === 'full') toggleFull();
    else if (name === 'close') close();
    else if (name === 'login' || name === 'logout') { if (panel) onAccount(panel.acc, panel.site, name); }
    else if (name === 'config') onConfig();
    else if (name === 'log') onLog();
  });
  ipcMain.on('pts:resize', (_e, dy) => resize(Number(dy) || 0));
  // Ações da janela de contas: sempre levam o número da conta da linha (nunca uma conta "atual")
  ipcMain.on('pts:act', (_e, acc, site, action) => {
    if (!SITES[site] || !ACTIONS.includes(action) || !isAccount(acc)) return;
    if (action === 'panel') toggle(site, acc);
    else onAccount(acc, site, action);
  });
  ipcMain.removeHandler('pts:overview');
  ipcMain.handle('pts:overview', () => getRows());

  return {
    open,
    close,
    toggle,
    next,
    menu,
    showAccounts,
    panelHeight,
    place,
    state: () => ({ open: panel?.site ?? null, acc: panel?.acc ?? null }),
  };
}

module.exports = { createPoints, DEFAULT_H, MIN_H };
