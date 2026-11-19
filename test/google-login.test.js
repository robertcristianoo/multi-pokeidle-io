// Login com Google em qualquer janela (src/google-login.js): detecção, oferta, fluxo pelo navegador e leitura do
// localStorage. Janela, diálogo e navegador são de mentira: nada abre o Chrome nem a rede.
const { check, finish } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // os textos conferidos aqui estão em português
const { EventEmitter } = require('events');
const G = require('../src/google-login');
const B = require('../src/browser-login');

check(G.isGoogleLogin('https://accounts.google.com/o/oauth2/v2/auth?x=1') && G.isGoogleLogin('https://accounts.google.com'), 'reconhece o login do Google');
check(!G.isGoogleLogin('https://kick.com/') && !G.isGoogleLogin('https://accounts.google.com.evil.io/') && !G.isGoogleLogin('http://accounts.google.com/'), 'outros endereços não');

function fakeWc() {
  const wc = new EventEmitter();
  wc.session = {};
  wc.reloaded = 0; wc.loaded = []; wc.scripts = [];
  wc.isDestroyed = () => false;
  wc.reload = () => { wc.reloaded++; };
  wc.loadURL = async (u) => { wc.loaded.push(u); };
  wc.executeJavaScript = async (s) => { wc.scripts.push(s); };
  return wc;
}
const site = { label: 'Kick', url: 'https://kick.com/', domains: ['kick.com'], origins: ['https://kick.com'] };

(async () => {
  // navegação ao Google é barrada e oferece o login; aceitar chama o navegador e recarrega
  const calls = [];
  const gl = G.createGoogleLogin({
    enabled: () => true,
    showBox: async (_p, o) => { calls.push(o.title); return { response: 0 }; },
    login: async (o) => { calls.push(o); return { ok: true, count: 2, storage: { 'https://kick.com': { tok: 'abc' } } }; },
  });
  const wc = fakeWc();
  const g = gl.attach(wc, site);
  let prevented = false;
  wc.emit('will-navigate', { preventDefault: () => { prevented = true; } }, 'https://accounts.google.com/x');
  await new Promise((r) => setTimeout(r, 20));
  check(prevented, 'navegação ao Google é barrada');
  const lg = calls.find((c) => c && c.url);
  check(lg && lg.url === 'https://kick.com/' && lg.domains[0] === 'kick.com' && lg.session === wc.session, 'abre o navegador no site, só com os domínios dele');
  check(wc.reloaded === 1 && wc.loaded[0] === 'https://kick.com/' && /tok/.test(wc.scripts[0]), 'restaura o localStorage e recarrega');
  check(g.intercept('https://accounts.google.com/y') === true && g.intercept('https://kick.com/z') === false, 'intercept só trata o Google');

  // navegação normal passa
  let p2 = false;
  wc.emit('will-redirect', { preventDefault: () => { p2 = true; } }, 'https://kick.com/login');
  check(!p2, 'navegação normal não é barrada');

  // popup que vai ao Google é fechado
  const popup = { webContents: new EventEmitter(), closed: false, isDestroyed: () => false, close() { this.closed = true; } };
  wc.emit('did-create-window', popup);
  popup.webContents.emit('will-redirect', { preventDefault() {} }, 'https://accounts.google.com/z');
  check(popup.closed, 'popup do Google é fechado');

  // cancelar não chama o navegador; falha avisa
  let called = false;
  const gl2 = G.createGoogleLogin({ enabled: () => true, showBox: async () => ({ response: 1 }), login: async () => { called = true; return { ok: true }; } });
  check((await gl2.offer(fakeWc(), site)) === null && !called, 'cancelar não abre o navegador');
  const titles = [];
  const gl3 = G.createGoogleLogin({ enabled: () => true, showBox: async (_p, o) => { titles.push(o.type); return { response: 0 }; }, login: async () => ({ ok: false, reason: 'x' }) });
  const w3 = fakeWc();
  await gl3.offer(w3, site);
  check(titles.includes('warning') && w3.reloaded === 0, 'falha avisa e não recarrega');
  check((await G.createGoogleLogin().offer(fakeWc(), site)) === null, 'em teste (PKMULTI_TEST) não abre diálogo');

  // leitura do localStorage pelo protocolo de depuração
  const sent = [];
  const cdp = { send: async (m, params, sid) => {
    sent.push(m);
    if (m === 'Target.getTargets') return { targetInfos: [
      { type: 'page', url: 'https://kick.com/a', targetId: 'T1' },
      { type: 'page', url: 'https://accounts.google.com/', targetId: 'T2' },
      { type: 'iframe', url: 'https://kick.com/', targetId: 'T3' }] };
    if (m === 'Target.attachToTarget') return { sessionId: 'S-' + params.targetId };
    if (m === 'Runtime.evaluate') return { result: { value: JSON.stringify({ k: 'v' }) } };
    return {};
  } };
  const st = await B.readStorage(cdp, ['https://kick.com']);
  check(JSON.stringify(st) === JSON.stringify({ 'https://kick.com': { k: 'v' } }), 'lê localStorage só da aba do site');
  check(sent.filter((m) => m === 'Target.attachToTarget').length === 1, 'não anexa a outras abas');
  finish();
})();
