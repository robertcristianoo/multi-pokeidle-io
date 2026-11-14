// Voto no TopIdle (topidle.com, ranking de jogos idle). O pokeidle dá recompensa por voto para o personagem
// informado. Quem vota é a pessoa, na página do TopIdle, numa janela própria do app: o captcha e o voto são
// concluídos lá, nunca pelo app. O app só LÊ o estado (se já pode votar e quando libera) e percebe o voto
// registrado (POST /api/games/{id}/vote com sucesso) para reiniciar o contador.
//
// Login do TopIdle: fica numa partição própria por conta (`persist:topidle{id}`), separada da sessão do jogo.
// Assim, a janela de voto e a leitura de estado usam os mesmos cookies, e o `webRequest` dessa partição não
// disputa o listener de logs das contas (o Electron aceita só um por evento e sessão).
const { app, BrowserWindow, dialog, session, shell } = require('electron');

const BASE = 'https://topidle.com';
const TOPIDLE_HOSTS = ['topidle.com', 'www.topidle.com'];
const GAME_DOMAIN = 'pokeidle.io';
const PLAYER_RE = /^[A-Za-z0-9_-]{1,64}$/; // o mesmo formato que o TopIdle aceita como nome do personagem
const MIN = 60 * 1000;
const TICK_MS = 5 * 1000;
const FETCH_TIMEOUT_MS = 15 * 1000;

const isObj = (x) => !!x && typeof x === 'object';
const text = (o, k) => (isObj(o) && typeof o[k] === 'string' ? o[k] : null);
const parseUrl = (u) => {
  try {
    return new URL(String(u));
  } catch {
    return null;
  }
};
const isTopIdleHttps = (x) => !!x && x.protocol === 'https:' && TOPIDLE_HOSTS.includes(x.hostname);

// Nick que o jogo guarda no localStorage ("nick"). Pode vir JSON-codificado (até duas vezes).
function parseNick(raw) {
  if (typeof raw !== 'string') return null;
  let v = raw.trim();
  for (let i = 0; i < 2 && v.startsWith('"'); i++) {
    try {
      const d = JSON.parse(v);
      if (typeof d !== 'string') return null;
      v = d.trim();
    } catch {
      return null;
    }
  }
  return PLAYER_RE.test(v) ? v : null;
}

// Página de voto do jogo, já com o personagem. O nick só entra se for um formato válido; nada mais vai na URL.
function voteUrl(gameId, nick) {
  const who = PLAYER_RE.test(nick ?? '') ? `&playerIdentifier=${encodeURIComponent(nick)}` : '';
  return `${BASE}/jogo/${encodeURIComponent(gameId)}?votar=1${who}`;
}

// O TopIdle registrou o voto: POST com sucesso em /api/games/{id}/vote.
function isVoteRegistered(method, url, status, gameId) {
  const x = parseUrl(url);
  return !!gameId && method === 'POST' && status >= 200 && status < 300 && isTopIdleHttps(x)
    && x.pathname === `/api/games/${encodeURIComponent(gameId)}/vote`;
}

// Entrou ou saiu do TopIdle: vale conferir o voto de novo.
function isLoginChange(url) {
  const x = parseUrl(url);
  return isTopIdleHttps(x) && (x.pathname.startsWith('/api/auth/') || x.pathname === '/api/logout');
}

// Link do TopIdle que o próprio jogo tenta abrir (o "votar" de dentro do jogo).
const isTopIdleLink = (url) => isTopIdleHttps(parseUrl(url));

const parseGames = (json) => (Array.isArray(json) ? json : Array.isArray(json?.games) ? json.games : []).filter(isObj);

// Id do jogo no TopIdle pelo domínio (pokeidle.io -> pokeidle-io-5f9969).
function findGameId(json, domain = GAME_DOMAIN) {
  for (const g of parseGames(json)) {
    const host = text(g, 'domain') ?? (parseUrl(text(g, 'url'))?.hostname ?? '');
    if (host.replace(/^www\./, '').toLowerCase() === domain) return text(g, 'id');
  }
  return null;
}

// Momento em ms. O TopIdle manda segundos (número); aceita milissegundos, texto numérico ou data ISO.
// Zero, vazio ou ilegível = desconhecido (null).
function toMs(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? (v > 1e12 ? v : v * 1000) : null;
  if (typeof v === 'string' && v.trim()) {
    const t = v.trim();
    if (/^\d+(\.\d+)?$/.test(t)) return toMs(Number(t));
    const d = Date.parse(t);
    return Number.isNaN(d) ? null : d;
  }
  return null;
}

// Estado do voto de uma conta, a partir de /api/games (com login). Jogo não listado: assume que pode votar.
function voteStateFrom(gamesJson, gameId, name) {
  const game = parseGames(gamesJson).find((g) => text(g, 'id') === gameId);
  if (!game) return { loggedIn: true, canVote: true, nextVoteAt: null, user: name };
  return { loggedIn: true, canVote: game.canVote !== false, nextVoteAt: toMs(game.nextVoteAt), user: name };
}

const isReady = (s, now) => !!s && s.loggedIn && (s.canVote || (s.nextVoteAt != null && s.nextVoteAt <= now));

// Quando conferir de novo: 30 min por padrão; perto da liberação, logo depois dela (como a referência).
function nextRefreshAt(s, now) {
  const later = now + 30 * MIN;
  if (!s?.loggedIn || s.canVote) return later;
  if (s.nextVoteAt == null) return now + 2 * MIN;
  if (s.nextVoteAt > now) return Math.min(s.nextVoteAt + 3000, later);
  return now + MIN;
}

// "2 h 05 min" ou "12 min" (nunca 0 min: arredonda para cima)
function formatLeft(ms) {
  const min = ms / MIN;
  if (min >= 60) return `${Math.floor(min / 60)} h ${String(Math.floor(min % 60)).padStart(2, '0')} min`;
  return `${Math.max(1, Math.ceil(min))} min`;
}

function formatWhen(at, now) {
  const hm = new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const day = (ms) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const dias = Math.round((day(at) - day(now)) / (24 * 60 * MIN));
  if (dias === 0) return `hoje às ${hm}`;
  if (dias === 1) return `amanhã às ${hm}`;
  return `em ${new Date(at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hm}`;
}

// O que o botão 🗳 da conta mostra: kind = checking | login | ready | wait | voted
function voteInfo(s, now) {
  if (!s) return { kind: 'checking', label: '🗳 …', hint: 'Conferindo o voto desta conta no TopIdle…' };
  if (!s.loggedIn) {
    return { kind: 'login', label: '🗳 Votar', hint: 'Votar no pokeidle pelo TopIdle (o jogo dá recompensa por voto). Na primeira vez, entre no TopIdle na janela que abre: o login fica salvo nesta conta.' };
  }
  if (isReady(s, now)) {
    return { kind: 'ready', label: '🗳 Votar', hint: `Voto liberado${s.user ? ` (${s.user})` : ''}. Clique para votar: quem vota é você, na página do TopIdle.` };
  }
  if (s.nextVoteAt != null) {
    return { kind: 'wait', label: `🗳 ${formatLeft(s.nextVoteAt - now)}`, hint: `Esta conta já votou. O próximo voto libera ${formatWhen(s.nextVoteAt, now)}.` };
  }
  return { kind: 'voted', label: '🗳 ✓ Votou', hint: 'Esta conta já votou. Conferindo no TopIdle quando libera o próximo voto…' };
}

// O login do Google não funciona em janelas de apps como este; o TopIdle também aceita Discord e e-mail.
const isGoogleLogin = (url) => /^https:\/\/accounts\.google\.com(\/|$)/i.test(url);
function warnGoogleLogin(win) {
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'Login com Google indisponível',
    message: 'O Google não permite login dentro deste app.',
    detail: 'Entre no TopIdle com Discord ou com e-mail e senha. O login fica salvo para esta conta.',
    buttons: ['Entendi'],
  }).catch(() => {});
}

const defaultSession = (id) => session.fromPartition(`persist:topidle${id}`);

function defaultWindow(id) {
  const partition = `persist:topidle${id}`;
  const win = new BrowserWindow({
    width: 1100,
    height: 820,
    autoHideMenuBar: true,
    title: `Votar com a conta ${id} · quem vota é você, nesta página do TopIdle`,
    webPreferences: { partition },
  });
  // O site pode manter o título; o aviso de quem vota fica no título da janela
  win.on('page-title-updated', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(({ url }) => {
    // O Google recusa login dentro de apps embutidos ("Esse navegador ou app pode não ser seguro"): avisa em vez de mostrar o erro
    if (isGoogleLogin(url)) { warnGoogleLogin(win); return { action: 'deny' }; }
    // Login (Discord/Google) abre popup: fica na mesma partição, senão o login cairia no navegador do sistema
    if (/^https:/i.test(url)) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { partition } } };
    if (/^mailto:/i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (isGoogleLogin(url)) { e.preventDefault(); warnGoogleLogin(win); }
  });
  return win;
}

// Controlador do voto. `getSlots()` devolve [{ id, view }] (as contas abertas); `notify` mostra um aviso.
// Fora do app, injete `fetchImpl`, `getSession`, `makeWindow`, `now` e `timers: false` (os testes fazem isso).
function createTopIdle({
  getSlots,
  notify = () => {},
  fetchImpl = (...a) => fetch(...a),
  getSession = defaultSession,
  makeWindow = defaultWindow,
  now = () => Date.now(),
  timers = true,
}) {
  let gameId = null;
  let lookupAt = 0;
  let looking = false;
  const recs = new Map(); // id -> { state, refreshAt, busy }
  const wins = new Map(); // id -> BrowserWindow da janela de voto
  const watched = new Set();

  const rec = (id) => {
    if (!recs.has(id)) recs.set(id, { state: null, refreshAt: 0, busy: false });
    return recs.get(id);
  };

  async function getJson(path, cookie) {
    const headers = { Accept: 'application/json' };
    if (app.userAgentFallback) headers['User-Agent'] = app.userAgentFallback;
    if (cookie) headers.Cookie = cookie;
    const res = await fetchImpl(BASE + path, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`TopIdle ${path} respondeu ${res.status}`);
    return res.json();
  }

  async function lookupGame() {
    if (looking) return;
    looking = true;
    lookupAt = now() + 10 * MIN; // sem internet ou jogo não listado: tenta de novo em 10 min
    try {
      gameId = findGameId(await getJson('/api/games')) ?? gameId;
    } catch {
      /* sem internet: silêncio */
    } finally {
      looking = false;
    }
  }

  // Um listener por partição: só registra votos e mudanças de login dessa conta
  function watch(id) {
    if (watched.has(id)) return;
    watched.add(id);
    getSession(id).webRequest.onCompleted((d) => {
      if (isVoteRegistered(d.method, d.url, d.statusCode, gameId)) markVoted(id);
      else if (isLoginChange(d.url)) rec(id).refreshAt = now() + 2000;
    });
  }

  function markVoted(id) {
    const r = rec(id);
    r.state = { loggedIn: true, canVote: false, nextVoteAt: null, user: r.state?.user ?? null };
    r.refreshAt = now() + 2000; // o TopIdle ainda pode demorar a dizer quando libera o próximo
    const w = wins.get(id);
    if (w && !w.isDestroyed()) w.setTitle(`✓ Voto registrado com a conta ${id}! Pode fechar esta janela`);
  }

  async function refresh(id) {
    const r = rec(id);
    if (r.busy || !gameId) return;
    r.busy = true;
    watch(id);
    try {
      const list = await getSession(id).cookies.get({ url: BASE });
      const cookie = list.map((c) => `${c.name}=${c.value}`).join('; ');
      let state = { loggedIn: false, canVote: true, nextVoteAt: null, user: null };
      if (cookie) {
        const me = await getJson('/api/me', cookie);
        const user = isObj(me) && isObj(me.user) ? me.user : null;
        if (user) state = voteStateFrom(await getJson('/api/games', cookie), gameId, text(user, 'name'));
      }
      r.state = state;
      r.refreshAt = nextRefreshAt(state, now());
    } catch {
      r.refreshAt = now() + 5 * MIN; // mantém o último estado conhecido
    } finally {
      r.busy = false;
    }
  }

  // Confere quem precisa; chamado a cada TICK_MS pelo timer (e direto pelos testes)
  function tick() {
    const t = now();
    if (!gameId) {
      if (t >= lookupAt) lookupGame();
      return;
    }
    for (const { id } of getSlots()) if (t >= rec(id).refreshAt) refresh(id);
  }

  async function readNick(slot) {
    const wc = slot.view?.webContents;
    if (!wc || wc.isDestroyed() || wc.isLoading()) return null;
    try {
      return parseNick(await wc.executeJavaScript("localStorage.getItem('nick')"));
    } catch {
      return null;
    }
  }

  // Abre (ou reaproveita) a janela de voto da conta. `url` vem do jogo (já validado como TopIdle) ou é montado aqui.
  async function open(id, url) {
    const slot = getSlots().find((s) => s.id === id);
    if (!slot) return;
    const existing = wins.get(id);
    if (existing && !existing.isDestroyed()) {
      if (url) existing.loadURL(url);
      existing.focus();
      return;
    }
    if (!gameId) await lookupGame();
    if (!gameId) {
      notify({ kind: 'fail', title: 'TopIdle indisponível', text: 'Confira a internet e tente de novo', ms: 5000 });
      return;
    }
    const target = url ?? voteUrl(gameId, await readNick(slot));
    watch(id);
    const win = makeWindow(id);
    wins.set(id, win);
    win.on('closed', () => {
      wins.delete(id);
      rec(id).refreshAt = Math.min(rec(id).refreshAt, now() + 1000); // conferiu logo ao fechar
    });
    win.loadURL(target);
  }

  if (timers) setInterval(tick, TICK_MS).unref?.();

  return {
    open: (id) => open(id),
    // O "votar" de dentro do jogo: abre a janela de voto em vez do navegador. true = tratado aqui.
    handleLink(id, url) {
      if (!isTopIdleLink(url)) return false;
      open(id, url);
      return true;
    },
    // Texto de um botão 🗳 da conta (o toolbar.js/toolbar.html desenha)
    info(id) {
      if (!gameId) return { kind: 'checking', label: '🗳 …', hint: 'Procurando o jogo no TopIdle…' };
      return voteInfo(recs.get(id)?.state, now());
    },
    // Resumo para a barra do app: quem pode votar agora e quanto falta para o próximo voto
    summary() {
      if (!gameId) return null;
      const t = now();
      const ids = getSlots().map((s) => s.id);
      const ready = ids.filter((id) => isReady(recs.get(id)?.state, t));
      const proximos = ids.map((id) => recs.get(id)?.state).filter((s) => s?.loggedIn && s.nextVoteAt != null && !isReady(s, t)).map((s) => s.nextVoteAt);
      const falta = proximos.length ? Math.min(...proximos) - t : null;
      const texto = ready.length
        ? `🗳 Voto liberado: ${ready.map((id) => `Conta ${id}`).join(', ')}`
        : falta != null ? `🗳 Próximo voto em ${formatLeft(falta)}` : null;
      return { ready, text: texto };
    },
    tick,
    refresh,
    gameId: () => gameId,
  };
}

module.exports = {
  createTopIdle,
  parseNick,
  voteUrl,
  isVoteRegistered,
  isLoginChange,
  isTopIdleLink,
  findGameId,
  parseGames,
  toMs,
  voteStateFrom,
  isReady,
  nextRefreshAt,
  formatLeft,
  voteInfo,
};
