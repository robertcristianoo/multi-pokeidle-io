// Login com Google em qualquer janela do app. O Google recusa login dentro de apps embutidos ("Esse navegador ou app pode
// não ser seguro"), então, quando uma página tenta ir para accounts.google.com, o app oferece entrar pelo Chrome/Edge
// instalado (src/browser-login.js) e traz de volta só o login do site daquela janela (cookies e, se houver, localStorage).
const { BrowserWindow, dialog } = require('electron');
const { loginViaBrowser } = require('./browser-login');
const { t } = require('./i18n');

const isGoogleLogin = (url) => /^https:\/\/accounts\.google\.com(\/|$)/i.test(String(url));

// Grava no localStorage do site (a janela precisa estar nele) e recarrega.
async function restoreStorage(wc, storage) {
  for (const [origin, items] of Object.entries(storage ?? {})) {
    await wc.loadURL(`${origin}/`);
    await wc.executeJavaScript(`(() => { const d = ${JSON.stringify(items)}; for (const k in d) localStorage.setItem(k, d[k]); })()`);
  }
}

// `site`: { label, url, domains }. Um login por sessão de cada vez.
function createGoogleLogin({ login = loginViaBrowser, showBox = (p, o) => dialog.showMessageBox(p, o), enabled = () => !process.env.PKMULTI_TEST } = {}) {
  const running = new Set();

  async function offer(wc, site, popup) {
    if (!enabled() || wc.isDestroyed()) return null;
    const ses = wc.session;
    let parent;
    try { parent = BrowserWindow.fromWebContents(wc) ?? undefined; } catch { /* view sem janela própria: diálogo sem pai */ }
    if (running.has(ses)) {
      showBox(parent, { type: 'info', title: t('login.browser.title'), message: t('login.busy.message'), detail: t('login.busy.detail'), buttons: [t('login.gotIt')] }).catch(() => {});
      return null;
    }
    const { response } = await showBox(parent, {
      type: 'info',
      title: t('login.google.title'),
      message: t('login.google.message'),
      detail: t('login.google.detail', { site: site.label }),
      buttons: [t('login.google.go'), t('common.cancel')],
      defaultId: 0,
      cancelId: 1,
    });
    if (response !== 0) return null;
    running.add(ses);
    let r;
    try {
      r = await login({ url: site.url, domains: site.domains, origins: site.origins ?? [], session: ses });
    } finally {
      running.delete(ses);
    }
    if (!r.ok) {
      showBox(parent, { type: 'warning', title: t('login.browser.title'), message: t('login.fail.message'), detail: t('login.fail.detail', { reason: r.reason || t('login.fail.retry') }), buttons: [t('login.gotIt')] }).catch(() => {});
      return r;
    }
    if (!wc.isDestroyed()) {
      try { await restoreStorage(wc, r.storage); } catch { /* sem storage: os cookies bastam */ }
      if (!wc.isDestroyed()) wc.reload();
    }
    return r;
  }

  // Vigia navegações e popups de `wc`: ir ao Google vira a oferta. Devolve { intercept(url) } para o
  // setWindowOpenHandler de quem já tem o seu (true = tratado, negue o popup).
  function attach(wc, site) {
    const intercept = (url) => {
      if (!isGoogleLogin(url)) return false;
      offer(wc, site).catch(() => {});
      return true;
    };
    const guard = (e, url) => { if (intercept(url)) e.preventDefault(); };
    wc.on('will-navigate', guard);
    wc.on('will-redirect', guard);
    wc.on('did-create-window', (popup) => {
      const g = (e, url) => { if (intercept(url)) { e.preventDefault(); if (!popup.isDestroyed()) popup.close(); } };
      popup.webContents.on('will-navigate', g);
      popup.webContents.on('will-redirect', g);
    });
    return { intercept };
  }

  return { attach, offer, isGoogleLogin };
}

const sites = {
  game: { label: 'PokeIdle', url: 'https://pokeidle.io/', domains: ['pokeidle.io'], origins: ['https://pokeidle.io'] },
  twitch: { label: 'Twitch', url: 'https://www.twitch.tv/login', domains: ['twitch.tv'], origins: [] },
  kick: { label: 'Kick', url: 'https://kick.com/', domains: ['kick.com'], origins: ['https://kick.com'] },
};

module.exports = { createGoogleLogin, isGoogleLogin, restoreStorage, sites };
