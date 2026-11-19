// Discord por conta: cada conta do app tem a própria sessão do Discord web (partição `persist:discord{id}`, separada da do
// jogo e das demais contas). O botão 💬 da conta abre o convite do servidor do jogo nessa sessão; a pessoa entra no
// Discord (login e servidor) e coloca a tag IDLE. O app só LÊ o que o próprio Discord web recebe, como no IdleHub:
//  1. as respostas JSON do próprio site (depurador da janela, só com Network habilitado): o perfil traz `primary_guild`
//     (a tag do servidor), e o convite traz o id do servidor do jogo; o app nunca lê nem usa o token da sessão;
//  2. o endereço da página (/login = deslogado; /channels ou /app = logado).
// Sem nenhuma leitura, a tag fica "não confirmada" (o app não afirma o que não viu). Nada é consultado em segundo plano.
// A tag só vale se for IDLE, estiver ativa (identity_enabled) e, quando o id do servidor é conhecido, for a do servidor do jogo.
const { BrowserWindow, session, shell } = require('electron');
const accountNames = require('./account-names');
const { t } = require('./i18n');
const { DEFAULT_INVITE, readInvite } = require('./convite');

const TAG = 'IDLE';
const TICK_MS = 4000;
const DISCORD_HOSTS = ['discord.com', 'www.discord.com', 'discord.gg', 'canary.discord.com', 'ptb.discord.com', 'discordapp.com', 'cdn.discordapp.com', 'media.discordapp.net'];

const isObj = (x) => !!x && typeof x === 'object';
const parseUrl = (u) => {
  try {
    return new URL(String(u));
  } catch {
    return null;
  }
};
const isDiscordHttps = (x) => !!x && x.protocol === 'https:' && DISCORD_HOSTS.includes(x.hostname);
const isApiUrl = (x) => !!x && x.protocol === 'https:' && /(^|\.)discord\.com$/.test(x.hostname) && /^\/api\/v\d+\//.test(x.pathname);
const SNOWFLAKE = /^\d{5,25}$/;

// Código do convite (o último trecho do link)
function inviteCode(link) {
  const m = /^https:\/\/(?:discord\.gg|discord\.com\/invite)\/([A-Za-z0-9-]{2,32})$/.exec(String(link ?? ''));
  return m ? m[1] : null;
}

// A tag do perfil vale? pg = `primary_guild` do usuário (ou null/ausente = sem tag). serverId = id do servidor do jogo, se conhecido.
function tagStatus(pg, serverId = null) {
  if (!isObj(pg)) return 'no';
  const tag = String(pg.tag ?? '').trim().toUpperCase();
  if (tag !== TAG) return 'no';
  if (pg.identity_enabled === false) return 'no';
  if (serverId && pg.identity_guild_id != null && String(pg.identity_guild_id) !== String(serverId)) return 'no';
  return 'ok';
}

// Interpreta uma resposta JSON da API do Discord que o site recebeu. Devolve o que mudou: { meId, loggedIn, tag, serverId } (só os campos lidos).
// `ctx` = { meId, inviteCode, serverId }.
function readResponse(url, status, json, ctx = {}) {
  const u = parseUrl(url);
  if (!isApiUrl(u)) return null;
  const path = u.pathname.replace(/^\/api\/v\d+/, '').replace(/\/+$/, '');
  if (path === '/users/@me') {
    if (status === 401) return { loggedIn: false };
    if (status >= 200 && status < 300 && isObj(json) && SNOWFLAKE.test(String(json.id ?? ''))) {
      return { loggedIn: true, meId: String(json.id), tag: tagStatus(json.primary_guild, ctx.serverId) };
    }
    return null;
  }
  let m = /^\/users\/(\d+)\/profile$/.exec(path);
  if (m && status >= 200 && status < 300 && isObj(json) && ctx.meId && m[1] === ctx.meId) {
    const user = isObj(json.user) ? json.user : null;
    if (user && 'primary_guild' in user) return { tag: tagStatus(user.primary_guild, ctx.serverId) };
    return null;
  }
  m = /^\/invites\/([A-Za-z0-9-]+)$/.exec(path);
  if (m && status >= 200 && status < 300 && isObj(json) && ctx.inviteCode && m[1] === ctx.inviteCode) {
    const gid = isObj(json.guild) ? String(json.guild.id ?? '') : '';
    if (SNOWFLAKE.test(gid)) return { serverId: gid };
  }
  return null;
}

// Estado guardado (config.json, só local): { serverId, accounts: { id: { loggedIn, tag, at } } }. Valores inválidos são descartados.
function lerEstado(raw) {
  const out = { serverId: null, accounts: new Map() };
  if (!isObj(raw)) return out;
  if (SNOWFLAKE.test(String(raw.serverId ?? ''))) out.serverId = String(raw.serverId);
  for (const [k, v] of Object.entries(isObj(raw.accounts) ? raw.accounts : {})) {
    const id = Number(k);
    if (!Number.isInteger(id) || id < 1 || !isObj(v)) continue;
    out.accounts.set(id, {
      loggedIn: v.loggedIn === true ? true : v.loggedIn === false ? false : null,
      tag: v.tag === 'ok' || v.tag === 'no' ? v.tag : 'unknown',
      at: Number.isFinite(v.at) ? v.at : 0,
    });
  }
  return out;
}

// O que o botão 💬 da conta mostra. s = { loggedIn, tag } ou null. kind = unknown | out | notag | ok
function statusInfo(s) {
  const info = (kind, key) => ({ kind, label: t(`discord.${key}.label`), hint: t(`discord.${key}.hint`) });
  if (!s || (s.loggedIn == null && s.tag === 'unknown')) return info('unknown', 'unknown');
  if (s.loggedIn === false) return info('out', 'out');
  if (s.tag === 'ok') return info('ok', 'ok');
  if (s.tag === 'no') return info('notag', 'notag');
  return info('unknown', 'loggedIn');
}

// Leitura só do endereço da página (não altera nada): login, cadastro ou o app do Discord
const LER_TELA = `(() => ({ path: location.pathname, host: location.hostname, login: !!document.querySelector('input[name="email"], input[name="password"]') }))()`;

// Janela do Discord da conta: partição própria; só links do Discord abrem aqui, o resto vai para o navegador
function defaultWindow(id, destino) {
  const win = new BrowserWindow({
    width: 1100,
    height: 780,
    autoHideMenuBar: true,
    title: t('discord.window.title', { name: accountNames.label(id) }),
    webPreferences: { partition: `persist:discord${id}` },
  });
  win.on('page-title-updated', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isDiscordHttps(parseUrl(url))) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { partition: `persist:discord${id}` } } };
    if (/^https:/i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  const guard = (e, url) => {
    const p = parseUrl(url);
    if (p && !isDiscordHttps(p)) { e.preventDefault(); if (p.protocol === 'https:') shell.openExternal(url).catch(() => {}); }
  };
  win.webContents.on('will-navigate', guard);
  return win;
}

// `getSlots()` = [{ id }] (as contas abertas); `notify` mostra um aviso; `store` ({ get(), set(obj) }) guarda o estado só neste computador.
// Fora do app, injete `makeWindow(id, destino)`, `now`, `invite` e `timers: false` (os testes fazem isso).
function createDiscord({
  getSlots,
  notify = () => {},
  store = null,
  makeWindow = defaultWindow,
  now = () => Date.now(),
  invite = () => readInvite() ?? DEFAULT_INVITE,
  timers = true,
}) {
  const estado = (() => {
    let raw = null;
    try { raw = store ? store.get() : null; } catch { raw = null; }
    return lerEstado(raw);
  })();
  const wins = new Map(); // id -> { win, meId, parar }

  function persistir() {
    try {
      store?.set({ serverId: estado.serverId, accounts: Object.fromEntries([...estado.accounts].map(([id, v]) => [id, v])) });
    } catch (err) {
      console.error('could not save the Discord state:', err);
    }
  }

  // Aplica uma leitura à conta. Avisa uma vez quando a tag passa a valer.
  function aplicar(id, reg, r) {
    if (!r) return;
    if (r.meId && reg) reg.meId = r.meId;
    let mudou = false;
    if (r.serverId && r.serverId !== estado.serverId) { estado.serverId = r.serverId; mudou = true; }
    const atual = estado.accounts.get(id) ?? { loggedIn: null, tag: 'unknown', at: 0 };
    const novo = { ...atual };
    if (r.loggedIn != null && r.loggedIn !== atual.loggedIn) novo.loggedIn = r.loggedIn;
    if (r.loggedIn === false) novo.tag = 'unknown'; // deslogou: não dá para afirmar a tag
    else if (r.tag && r.tag !== atual.tag) novo.tag = r.tag;
    if (novo.loggedIn !== atual.loggedIn || novo.tag !== atual.tag) {
      novo.at = now();
      estado.accounts.set(id, novo);
      mudou = true;
      if (novo.tag === 'ok' && atual.tag !== 'ok') {
        notify({ kind: 'ok', title: t('discord.tagOk.title', { name: accountNames.label(id) }), text: t('discord.tagOk.text'), ms: 8000 });
      }
    }
    if (mudou) persistir();
  }

  // Ouve o depurador só desta janela (Network): as respostas JSON da API do Discord. Nunca Runtime/Page e nunca o token.
  function observar(id, reg) {
    const wc = reg.win.webContents;
    const pedidos = new Map(); // requestId -> { url, status }
    const onMessage = async (_e, metodo, p) => {
      try {
        if (metodo === 'Network.responseReceived') {
          const mime = String(p.response?.mimeType ?? '');
          if (isApiUrl(parseUrl(p.response?.url)) && /json/.test(mime)) pedidos.set(p.requestId, { url: p.response.url, status: p.response.status });
          else if (isApiUrl(parseUrl(p.response?.url)) && p.response.status === 401) aplicar(id, reg, readResponse(p.response.url, 401, null, {}));
        } else if (metodo === 'Network.loadingFinished' && pedidos.has(p.requestId)) {
          const { url, status } = pedidos.get(p.requestId);
          pedidos.delete(p.requestId);
          if (!/\/(users\/(@me|\d+\/profile)|invites\/[A-Za-z0-9-]+)(\?|$)/.test(url)) return; // só os três endereços que interessam
          const r = await wc.debugger.sendCommand('Network.getResponseBody', { requestId: p.requestId });
          const corpo = r.base64Encoded ? Buffer.from(r.body, 'base64').toString('utf8') : r.body;
          aplicar(id, reg, readResponse(url, status, JSON.parse(corpo), { meId: reg.meId, inviteCode: inviteCode(invite()), serverId: estado.serverId }));
        }
      } catch {
        /* resposta que não é JSON do perfil: ignora */
      }
    };
    try {
      wc.debugger.attach('1.3');
      wc.debugger.on('message', onMessage);
      wc.debugger.sendCommand('Network.enable').catch(() => {});
      reg.parar = () => {
        try {
          wc.debugger.off('message', onMessage);
          if (wc.debugger.isAttached()) wc.debugger.detach();
        } catch { /* a janela pode já ter sido fechada */ }
      };
    } catch {
      reg.parar = () => {};
    }
  }

  // Abre (ou reaproveita) a janela do Discord da conta. Sem a tag ainda, abre o convite; com ela, o Discord normal.
  function abrir(id) {
    if (!getSlots().some((s) => s.id === id)) return;
    const existente = wins.get(id);
    if (existente && !existente.win.isDestroyed()) {
      existente.win.focus();
      return;
    }
    const tagOk = estado.accounts.get(id)?.tag === 'ok';
    const destino = tagOk ? 'https://discord.com/channels/@me' : invite();
    const win = makeWindow(id, destino);
    const reg = { win, meId: null, parar: () => {} };
    wins.set(id, reg);
    win.on('closed', () => {
      reg.parar();
      if (wins.get(id) === reg) wins.delete(id);
    });
    observar(id, reg);
    try {
      win.webContents.on('did-finish-load', () => { tick().catch(() => {}); });
    } catch { /* janela de teste sem webContents completo */ }
    win.loadURL(destino);
  }

  // Lê o endereço das janelas abertas: /login = deslogado; /channels ou /app com o app carregado = logado
  async function tick() {
    for (const [id, reg] of wins) {
      if (reg.win.isDestroyed()) continue;
      try {
        const t = await reg.win.webContents.executeJavaScript(LER_TELA);
        if (!isObj(t) || !/(^|\.)discord\.com$/.test(String(t.host))) continue;
        if (/^\/(login|register)(\/|$)/.test(t.path)) aplicar(id, reg, { loggedIn: false });
        else if (/^\/(channels|app)(\/|$)/.test(t.path) && !t.login) aplicar(id, reg, { loggedIn: true });
      } catch {
        /* a página ainda não carregou: tenta no próximo tick */
      }
    }
  }

  if (timers) setInterval(() => { tick(); }, TICK_MS).unref?.();

  return {
    open: abrir,
    info: (id) => statusInfo(estado.accounts.get(id) ?? null),
    state: (id) => estado.accounts.get(id) ?? null,
    serverId: () => estado.serverId,
    tick,
    // os testes injetam leituras sem janela
    _aplicar: (id, r) => aplicar(id, wins.get(id) ?? null, r),
  };
}

module.exports = { createDiscord, inviteCode, tagStatus, readResponse, lerEstado, statusInfo, isApiUrl, LER_TELA, TAG };
