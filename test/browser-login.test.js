// Login por navegador instalado (src/browser-login.js): escolha do navegador, filtro de cookies, conversão e o fluxo
// completo com navegador, protocolo de depuração e sessão de mentira. Nada abre o Chrome nem toca a rede.
const { check, finish } = require('./helpers');
const { EventEmitter } = require('events');
const B = require('../src/browser-login');

// --- escolha do navegador
const env = { PROGRAMFILES: 'C:\\PF', 'PROGRAMFILES(X86)': 'C:\\PF86', LOCALAPPDATA: 'C:\\LA' };
check(B.findBrowser(env, (p) => p.endsWith('chrome.exe') && p.startsWith('C:\\PF\\')) === 'C:\\PF\\Google\\Chrome\\Application\\chrome.exe', 'prefere o Chrome');
check(B.findBrowser(env, (p) => p.endsWith('msedge.exe') && p.startsWith('C:\\PF86')) === 'C:\\PF86\\Microsoft\\Edge\\Application\\msedge.exe', 'sem Chrome, usa o Edge');
check(B.findBrowser(env, () => false) === null, 'nenhum navegador: nulo');

// --- só os cookies do site pedido
const dom = ['topidle.com', 'www.topidle.com'];
check(B.wantedCookie({ domain: '.topidle.com' }, dom) && B.wantedCookie({ domain: 'topidle.com' }, dom) && B.wantedCookie({ domain: 'api.topidle.com' }, dom), 'cookies do TopIdle e subdomínios passam');
check(!B.wantedCookie({ domain: '.google.com' }, dom) && !B.wantedCookie({ domain: 'evil-topidle.com' }, dom) && !B.wantedCookie({ domain: 'topidle.com.evil.io' }, dom), 'Google e domínios parecidos ficam de fora');

// --- conversão
const c1 = B.toElectronCookie({ name: 'sid', value: 'v', domain: '.topidle.com', path: '/', secure: true, httpOnly: true, expires: 2000000000, sameSite: 'Lax' }, 1700000000000);
check(c1.url === 'https://topidle.com/' && c1.domain === '.topidle.com' && c1.expirationDate === 2000000000 && c1.sameSite === 'lax' && c1.httpOnly && c1.secure, 'cookie com validade converte');
const c2 = B.toElectronCookie({ name: 's', value: 'v', domain: 'topidle.com', path: '/a', secure: false, expires: -1, sameSite: 'None' }, 1700000000000);
check(c2.expirationDate === 1700000000 + 30 * 86400 && c2.sameSite === 'no_restriction' && c2.url === 'http://topidle.com/a', 'cookie de sessão ganha 30 dias');
const c3 = B.toElectronCookie({ name: '__Host-x', value: 'v', domain: 'topidle.com', path: '/', secure: true, expires: -1 }, 1);
check(!('domain' in c3), '__Host- vai sem domain');

// --- porta de depuração escolhida pelo navegador
check(B.readActivePort('P', () => '51234\n/devtools/browser/abc-123\n') === 'ws://127.0.0.1:51234/devtools/browser/abc-123', 'lê porta e caminho do DevToolsActivePort');
check(B.readActivePort('P', () => '') === null && B.readActivePort('P', () => 'x\n/y') === null && B.readActivePort('P', () => { throw new Error('ENOENT'); }) === null, 'arquivo vazio, inválido ou ausente: nulo');

// --- fluxo completo com navegador de mentira
function fakeSpawn(log, closeAfterPolls) {
  return (exe, args) => {
    const child = new EventEmitter();
    child.kill = () => child.emit('exit');
    child.args = args;
    log.spawn = { exe, args };
    log.child = child;
    return child;
  };
}

async function fluxo({ cookies, browserPath = 'C:\\x\\chrome.exe', fail = false }) {
  const log = { cookiesSet: [], removed: [], polls: 0, closed: false };
  const session = { cookies: { set: async (c) => { if (c.name === 'ruim') throw new Error('x'); log.cookiesSet.push(c); } } };
  const r = await B.loginViaBrowser({
    url: 'https://topidle.com/',
    domains: dom,
    session,
    browserPath,
    spawnImpl: fakeSpawn(log),
    readPort: () => 'ws://127.0.0.1:1/x',
    pickPort: async () => 41234,
    connect: async () => ({
      send: async (m) => {
        check(m === 'Storage.getCookies', 'pergunta só os cookies');
        log.polls++;
        if (log.polls === 3) setImmediate(() => log.child.emit('exit')); // o usuário fecha a janela depois do 3º polling
        if (fail && log.polls === 1) throw new Error('caiu');
        return { cookies };
      },
      close: () => { log.closed = true; },
    }),
    mkTmp: () => 'C:\\tmp\\perfil',
    rmTmp: (d) => log.removed.push(d),
    sleep: () => new Promise((res) => setImmediate(res)),
    pollMs: 1,
  });
  return { r, log };
}

(async () => {
  const cookies = [
    { name: 'sid', value: 'a', domain: '.topidle.com', path: '/', secure: true, httpOnly: true, expires: 2000000000, sameSite: 'Lax' },
    { name: 'SID', value: 'g', domain: '.google.com', path: '/', secure: true, expires: -1 },
    { name: 'ruim', value: 'z', domain: 'topidle.com', path: '/', secure: true, expires: -1 },
  ];
  let { r, log } = await fluxo({ cookies });
  check(r.ok && r.count === 1, `grava só o cookie válido do TopIdle (${r.count})`);
  check(log.cookiesSet.length === 1 && log.cookiesSet[0].name === 'sid', 'o cookie do Google não é copiado');
  check(log.spawn.args.includes('--remote-debugging-port=41234') && log.spawn.args.includes('--user-data-dir=C:\\tmp\\perfil') && log.spawn.args.includes('--remote-debugging-address=127.0.0.1') && log.spawn.args.at(-1) === 'https://topidle.com/', 'navegador abre com perfil próprio, depuração só em 127.0.0.1 e a página do site');
  check(log.removed.length === 1 && log.removed[0] === 'C:\\tmp\\perfil' && log.closed, 'perfil temporário apagado e conexão fechada');

  ({ r } = await fluxo({ cookies: [{ name: 'g', value: '1', domain: '.google.com', path: '/' }] }));
  check(!r.ok && r.reason === 'nenhum login encontrado', 'sem cookie do site: avisa que nada foi encontrado');

  ({ r } = await fluxo({ cookies, browserPath: null }));
  check(!r.ok && /Chrome ou Edge/.test(r.reason), 'sem navegador instalado: avisa');

  // o navegador fecha antes de abrir a depuração: falha rápido, com a razão
  const log2 = {};
  const r2 = await B.loginViaBrowser({
    url: 'https://topidle.com/', domains: dom, session: { cookies: { set: async () => {} } }, browserPath: '/x/chrome.exe',
    spawnImpl: (exe, args) => { const c = new EventEmitter(); c.kill = () => {}; setImmediate(() => c.emit('exit', 1)); log2.c = c; return c; },
    readPort: () => null, mkTmp: () => '/tmp/p2', rmTmp: () => {}, sleep: () => new Promise((res) => setImmediate(res)),
  });
  check(!r2.ok && /fechou antes de iniciar/.test(r2.reason), `navegador que fecha cedo: ${r2.reason}`);

  finish();
})();
