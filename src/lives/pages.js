// As páginas das lives que só abrem quando uma ação precisa delas (o baú, o resgate, a raid, o momento: a checagem
// anti-robô da Twitch só sai de dentro de uma página dela). Na Twitch e na Kick leves ninguém toca vídeo: quem assiste é o
// gerenciador (twitch-watcher.js e kick-watcher.js). Cada página é uma view escondida, muda, na sessão da conta (onde ficam
// os logins da Twitch e da Kick), e volta a fechar depois de IDLE_CLOSE_MS sem uso (parada à toa ela gastava ~200 MB).
const { WebContentsView } = require('electron');
const { partitionOf } = require('../points/sites');

const IDLE_CLOSE_MS = 60 * 1000; // quanto a página fica aberta depois da última ação
const WAKE_SETTLE_MS = 5 * 1000; // espera depois de abrir, antes da ação: o script anti-robô da Twitch começa depois da página
const LOAD_TIMEOUT_MS = 30 * 1000;
const SCRIPT_TIMEOUT_MS = 30 * 1000;
const ONCE_SCRIPT_TIMEOUT_MS = 45 * 1000;

const STILL = 'autoplay=false'; // o player abre parado, sem vídeo

// O player da live parado (o "player em janela" do site) e, na Kick, o player dela. Ambos abrem mesmo com o canal offline.
const URLS = {
  twitch: (ch) => `https://player.twitch.tv/?channel=${encodeURIComponent(ch)}&parent=twitch.tv&player=popout&${STILL}`,
  kick: (ch) => `https://player.kick.com/${encodeURIComponent(ch)}?${STILL}`,
};

const withTimeout = (p, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('timeout')), ms);
  p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
});

function createPages({
  urlFor = (site, channel) => URLS[site](channel),
  idleCloseMs = IDLE_CLOSE_MS,
  settleMs = WAKE_SETTLE_MS,
  partition = partitionOf,
} = {}) {
  const pages = new Map(); // `${conta}|${site}|${canal}` -> { view, ready, cadeia, timer }
  let wakes = 0;
  let wakeFailures = 0;

  const keyOf = (acc, site, channel) => `${acc}|${site}|${channel}`;

  function drop(key) {
    const p = pages.get(key);
    if (!p) return;
    pages.delete(key);
    clearTimeout(p.timer);
    try { if (!p.view.webContents.isDestroyed()) p.view.webContents.close(); } catch {}
  }

  // Abre a página escondida e espera carregar (e o tempo de assentar). Falso: não carregou.
  function openView(acc, site, channel, key) {
    const view = new WebContentsView({ webPreferences: { partition: partition(site, acc), backgroundThrottling: false } });
    const wc = view.webContents;
    wc.setAudioMuted(true);
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    const entry = { view, cadeia: Promise.resolve(), timer: null, ready: null, busy: 0, usedAt: Date.now() };
    wakes++;
    entry.ready = new Promise((resolve) => {
      let done = false;
      const finish = (ok) => { if (!done) { done = true; clearTimeout(t); resolve(ok); } };
      const t = setTimeout(() => finish(false), LOAD_TIMEOUT_MS);
      wc.once('did-fail-load', (_e, _code, _desc, _url, isMainFrame) => { if (isMainFrame) finish(false); });
      wc.once('render-process-gone', () => finish(false));
      wc.once('did-finish-load', () => {
        if (settleMs > 0) setTimeout(() => finish(!wc.isDestroyed()), settleMs);
        else finish(true);
      });
      wc.loadURL(urlFor(site, channel)).catch(() => finish(false));
    }).then((ok) => {
      if (!ok) { wakeFailures++; if (pages.get(key) === entry) drop(key); }
      return ok;
    });
    wc.once('destroyed', () => { if (pages.get(key) === entry) pages.delete(key); });
    pages.set(key, entry);
    return entry;
  }

  function scheduleClose(key, entry) {
    clearTimeout(entry.timer);
    entry.timer = setTimeout(() => { if (pages.get(key) === entry && entry.busy === 0) drop(key); }, idleCloseMs);
  }

  // Roda o script (uma promessa que acaba num texto JSON) na página do canal, abrindo-a se precisar, e devolve o texto
  // ("" quando a página não abriu ou não respondeu). Os pedidos do mesmo canal rodam um depois do outro.
  async function run(acc, site, channel, script) {
    const key = keyOf(acc, site, channel);
    let entry = pages.get(key);
    if (!entry || entry.view.webContents.isDestroyed()) entry = openView(acc, site, channel, key);
    entry.busy++;
    clearTimeout(entry.timer);
    const job = entry.cadeia.then(async () => {
      if (!(await entry.ready) || entry.view.webContents.isDestroyed()) return '';
      try {
        const out = await withTimeout(entry.view.webContents.executeJavaScript(script, true), SCRIPT_TIMEOUT_MS);
        return typeof out === 'string' ? out : '';
      } catch {
        return ''; // a página recarregou ou fechou no meio: fica para a próxima conferência
      }
    });
    entry.cadeia = job.catch(() => {});
    try {
      return await job;
    } finally {
      entry.busy--;
      entry.usedAt = Date.now();
      if (pages.get(key) === entry) scheduleClose(key, entry);
    }
  }

  // Roda o script num canal que não está aberto na conta: a página dele escondida só pelo tempo do script.
  async function runOnce(acc, site, channel, script) {
    const view = new WebContentsView({ webPreferences: { partition: partition(site, acc), backgroundThrottling: false } });
    const wc = view.webContents;
    wc.setAudioMuted(true);
    try {
      await withTimeout(new Promise((resolve, reject) => {
        wc.once('did-fail-load', (_e, _c, desc, _u, isMainFrame) => { if (isMainFrame) reject(new Error(desc)); });
        wc.once('did-finish-load', resolve);
        wc.loadURL(urlFor(site, channel)).catch(reject);
      }), LOAD_TIMEOUT_MS);
      if (settleMs > 0) await new Promise((r) => setTimeout(r, settleMs));
      const out = await withTimeout(wc.executeJavaScript(script, true), ONCE_SCRIPT_TIMEOUT_MS);
      return typeof out === 'string' ? out : '';
    } catch {
      return '';
    } finally {
      try { if (!wc.isDestroyed()) wc.close(); } catch {}
    }
  }

  return {
    run,
    runOnce,
    // Fecha as páginas de uma conta (ou todas)
    closeAccount(acc) {
      for (const key of [...pages.keys()]) if (acc === undefined || key.startsWith(`${acc}|`)) drop(key);
    },
    // Páginas abertas agora e quantas vezes abriram / não abriram (Detalhes)
    stats: () => ({ open: pages.size, wakes, wakeFailures }),
    openFor: (acc, site) => [...pages.keys()].filter((k) => k.startsWith(`${acc}|${site}|`)).map((k) => k.split('|')[2]),
  };
}

module.exports = { createPages, URLS, STILL };
