// Login por um navegador de verdade (Chrome ou Edge instalado), para sites que recusam login dentro de janelas de app
// (o Google, por exemplo, responde "Esse navegador ou app pode não ser seguro").
//
// Como funciona: o app abre o Chrome/Edge com um perfil temporário e só dele, você entra normalmente (Google, Discord…) e
// fecha a janela. Enquanto o navegador está aberto, o app lê (pelo protocolo de depuração, só em 127.0.0.1) os cookies
// do site que você pediu e, ao fechar, grava esses cookies na sessão da conta. Nenhum outro site é copiado (o Google
// e os demais cookies do navegador ficam de fora), e o perfil temporário é apagado ao final.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const POLL_MS = 2000;
const START_TIMEOUT_MS = 20000;
const SESSION_COOKIE_DAYS = 30; // cookies de sessão do navegador viram cookies de 30 dias na sessão da conta

// Caminhos usuais do Chrome e do Edge no Windows (o Edge vem com o sistema, então quase sempre existe um).
function findBrowser(env = process.env, exists = fs.existsSync) {
  const roots = [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA].filter(Boolean);
  const rel = [
    ['Google', 'Chrome', 'Application', 'chrome.exe'],
    ['Microsoft', 'Edge', 'Application', 'msedge.exe'],
  ];
  for (const r of rel) {
    for (const root of roots) {
      const p = path.join(root, ...r);
      if (exists(p)) return p;
    }
  }
  return null;
}

const hostOf = (domain) => String(domain).replace(/^\./, '').toLowerCase();

// Só passam os cookies do site pedido (e dos subdomínios dele).
function wantedCookie(c, domains) {
  const h = hostOf(c.domain ?? '');
  return domains.some((d) => h === d || h.endsWith(`.${d}`));
}

const SAME_SITE = { Strict: 'strict', Lax: 'lax', None: 'no_restriction' };

// Cookie do protocolo de depuração -> detalhes aceitos por session.cookies.set.
function toElectronCookie(c, now = Date.now()) {
  const host = hostOf(c.domain);
  const out = {
    url: `${c.secure ? 'https' : 'http'}://${host}${c.path || '/'}`,
    name: c.name,
    value: c.value,
    path: c.path || '/',
    secure: !!c.secure,
    httpOnly: !!c.httpOnly,
    expirationDate: c.expires && c.expires > 0 ? c.expires : Math.floor(now / 1000) + SESSION_COOKIE_DAYS * 86400,
  };
  if (!c.name.startsWith('__Host-')) out.domain = c.domain; // __Host- exige cookie sem Domain
  if (SAME_SITE[c.sameSite]) out.sameSite = SAME_SITE[c.sameSite];
  return out;
}

// Cliente mínimo do protocolo de depuração do navegador (um WebSocket, mensagens {id, method}).
function connectCdp(wsUrl, WS = WebSocket) {
  return new Promise((resolve, reject) => {
    const ws = new WS(wsUrl);
    let next = 1;
    const pending = new Map();
    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data)); } catch { return; }
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result);
    };
    ws.onerror = () => reject(new Error('sem conexão com o navegador'));
    ws.onclose = () => { for (const p of pending.values()) p.reject(new Error('navegador fechado')); pending.clear(); };
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((res, rej) => {
        const id = next++;
        pending.set(id, { resolve: res, reject: rej });
        ws.send(JSON.stringify({ id, method, params }));
      }),
      close: () => { try { ws.close(); } catch { /* já fechado */ } },
    });
  });
}

async function waitForWsUrl(port, fetchImpl, sleep, timeoutMs) {
  const t0 = Date.now();
  for (;;) {
    try {
      const r = await fetchImpl(`http://127.0.0.1:${port}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch { /* o navegador ainda está abrindo */ }
    if (Date.now() - t0 > timeoutMs) throw new Error('o navegador não respondeu a tempo');
    await sleep(300);
  }
}

// Abre `url` no navegador, espera você fechar e grava na sessão os cookies de `domains`.
// Devolve { ok, count, reason }. Tudo que toca o sistema é injetável (os testes usam versões de mentira).
async function loginViaBrowser({
  url,
  domains,
  session,
  browserPath = findBrowser(),
  spawnImpl = spawn,
  fetchImpl = (...a) => fetch(...a),
  connect = connectCdp,
  pickPort = () => 40000 + Math.floor(Math.random() * 20000),
  mkTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-login-')),
  rmTmp = (d) => fs.rmSync(d, { recursive: true, force: true }),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  pollMs = POLL_MS,
}) {
  if (!browserPath) return { ok: false, count: 0, reason: 'Chrome ou Edge não encontrados' };
  const wanted = domains.map(hostOf);
  const port = pickPort();
  const profile = mkTmp();
  const child = spawnImpl(browserPath, [
    `--remote-debugging-port=${port}`,
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--new-window',
    url,
  ], { stdio: 'ignore' });
  let exited = false;
  child.on('exit', () => { exited = true; });
  child.on('error', () => { exited = true; });

  let cdp = null;
  let snapshot = [];
  try {
    const wsUrl = await waitForWsUrl(port, fetchImpl, sleep, START_TIMEOUT_MS);
    cdp = await connect(wsUrl);
    // Guarda o último conjunto de cookies visto: quando a janela fecha já não dá para perguntar ao navegador.
    while (!exited) {
      try {
        const r = await cdp.send('Storage.getCookies');
        snapshot = (r.cookies ?? []).filter((c) => wantedCookie(c, wanted));
      } catch { break; } // conexão caiu: o navegador fechou
      await sleep(pollMs);
    }
  } catch (e) {
    try { child.kill(); } catch { /* já saiu */ }
    try { rmTmp(profile); } catch { /* ignora */ }
    return { ok: false, count: 0, reason: e.message };
  } finally {
    cdp?.close();
  }

  try { rmTmp(profile); } catch { /* o navegador pode demorar a soltar a pasta; é temporária */ }
  if (!snapshot.length) return { ok: false, count: 0, reason: 'nenhum login encontrado' };
  let count = 0;
  for (const c of snapshot) {
    try { await session.cookies.set(toElectronCookie(c)); count++; } catch { /* cookie recusado: segue com os demais */ }
  }
  return { ok: count > 0, count, reason: count > 0 ? '' : 'a sessão recusou os cookies' };
}

module.exports = { loginViaBrowser, findBrowser, wantedCookie, toElectronCookie };
