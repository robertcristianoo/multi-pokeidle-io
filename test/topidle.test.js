// Voto no TopIdle: funções puras, controlador (com fetch, cookies e janelas de mentira, sem rede) e o botão 🗳
// na barra da conta. Nada aqui sai para a internet nem abre a página de voto de verdade.
const { app, check, finish, waitFor } = require('./helpers');
const path = require('path');
const { BrowserWindow } = require('electron');
const T = require('../src/topidle');

const MIN = 60 * 1000;
const GAME = 'pokeidle-io-5f9969';
const BASE = 'https://topidle.com';
let agora = Date.UTC(2026, 10, 13, 12, 0, 0);
const now = () => agora;

function testesPuros() {
  check(T.parseNick('"fulano"') === 'fulano', 'nick salvo em JSON vira texto');
  check(T.parseNick('"\\"ciclano\\""') === 'ciclano', 'nick codificado duas vezes também');
  check(T.parseNick(' fulano_1 ') === 'fulano_1', 'nick puro, com espaços em volta, é aceito');
  check(T.parseNick('nick com espaço') === null && T.parseNick('') === null && T.parseNick(null) === null, 'nick inválido, vazio ou ausente: nulo');
  check(T.parseNick('"x"; <script>') === null && T.parseNick('a'.repeat(65)) === null, 'texto estranho ou longo demais: nulo');

  check(T.voteUrl(GAME, 'fulano') === `${BASE}/jogo/${GAME}?votar=1&playerIdentifier=fulano`, 'link de voto leva o nick do personagem');
  check(T.voteUrl(GAME, 'nick com espaço') === `${BASE}/jogo/${GAME}?votar=1`, 'nick inválido não entra na URL');
  check(T.voteUrl(GAME, 'a&b=c') === `${BASE}/jogo/${GAME}?votar=1`, 'nada além do nick vai na URL');

  check(T.isVoteRegistered('POST', `${BASE}/api/games/${GAME}/vote`, 200, GAME), 'POST com 200 no voto do jogo: voto registrado');
  check(T.isVoteRegistered('POST', `https://www.topidle.com/api/games/${GAME}/vote`, 201, GAME), 'aceita www e 201');
  check(!T.isVoteRegistered('POST', `${BASE}/api/games/${GAME}/vote`, 429, GAME), '429 (limite) não é voto');
  check(!T.isVoteRegistered('GET', `${BASE}/api/games/${GAME}/vote`, 200, GAME), 'GET não é voto');
  check(!T.isVoteRegistered('POST', `${BASE}/api/games/outro/vote`, 200, GAME), 'voto em outro jogo não conta');
  check(!T.isVoteRegistered('POST', `https://outro.com/api/games/${GAME}/vote`, 200, GAME), 'outro site não conta');
  check(!T.isVoteRegistered('POST', `${BASE}/api/games/${GAME}/vote`, 200, null), 'sem id do jogo: nunca conta');

  check(T.isLoginChange(`${BASE}/api/auth/callback/discord`) && T.isLoginChange(`${BASE}/api/logout`), 'entrar/sair do TopIdle pede nova conferência');
  check(!T.isLoginChange(`${BASE}/api/me`) && !T.isLoginChange('https://evil.com/api/auth/x'), 'outras rotas e outros sites não contam');

  check(T.isTopIdleLink(`${BASE}/jogo/${GAME}?votar=1`), 'link https do TopIdle é aceito');
  check(!T.isTopIdleLink('http://topidle.com/') && !T.isTopIdleLink('https://topidle.com.evil.com/') && !T.isTopIdleLink('lixo'), 'http, domínio parecido e lixo são recusados');

  check(T.findGameId([{ id: 'a', domain: 'pokeidle.io' }]) === 'a', 'acha o jogo pelo domínio');
  check(T.findGameId({ games: [{ id: 'b', url: 'https://www.pokeidle.io/x' }] }) === 'b', 'acha pelo link quando não há domínio, e aceita {games: []}');
  check(T.findGameId([{ id: 'c', domain: 'outro.com' }]) === null, 'jogo não listado: nulo');

  check(T.toMs(1700000000) === 1700000000000 && T.toMs(1700000000000) === 1700000000000, 'segundos e milissegundos viram ms');
  check(T.toMs('1700000000') === 1700000000000 && T.toMs('2026-11-13T12:00:00Z') === Date.parse('2026-11-13T12:00:00Z'), 'texto numérico e data ISO');
  check(T.toMs(0) === null && T.toMs(null) === null && T.toMs('lixo') === null, 'zero, vazio e ilegível: desconhecido');

  check(T.formatLeft(0) === '1 min' && T.formatLeft(59 * MIN) === '59 min', 'minutos, arredondados para cima');
  check(T.formatLeft(60 * MIN) === '1 h 00 min' && T.formatLeft(125 * MIN) === '2 h 05 min', 'horas e minutos');

  const estado = (o) => ({ loggedIn: true, canVote: true, nextVoteAt: null, user: 'x', ...o });
  check(!T.isReady({ loggedIn: false, canVote: true }, agora) && T.isReady(estado({}), agora), 'pronto: logado e pode votar');
  check(!T.isReady(estado({ canVote: false, nextVoteAt: agora + MIN }), agora) && T.isReady(estado({ canVote: false, nextVoteAt: agora - 1 }), agora), 'pronto também quando o horário já passou');

  check(T.nextRefreshAt({ loggedIn: false }, agora) === agora + 30 * MIN, 'sem login: confere em 30 min');
  check(T.nextRefreshAt(estado({ canVote: false, nextVoteAt: null }), agora) === agora + 2 * MIN, 'já votou e sem horário: em 2 min');
  check(T.nextRefreshAt(estado({ canVote: false, nextVoteAt: agora + 10 * MIN }), agora) === agora + 10 * MIN + 3000, 'perto da liberação: 3 s depois dela');
  check(T.nextRefreshAt(estado({ canVote: false, nextVoteAt: agora + 5 * 60 * MIN }), agora) === agora + 30 * MIN, 'liberação longe: 30 min');
  check(T.nextRefreshAt(estado({ canVote: false, nextVoteAt: agora - MIN }), agora) === agora + MIN, 'liberação já passou: em 1 min');

  const v = T.voteStateFrom([{ id: GAME, canVote: false, nextVoteAt: Math.floor(agora / 1000) + 7200 }], GAME, 'Fulano');
  check(!v.canVote && v.nextVoteAt === agora + 7200000 && v.user === 'Fulano' && v.loggedIn, 'estado do jogo: segundos viram ms, nome do usuário');
  check(T.voteStateFrom([], GAME, null).canVote === true, 'jogo não listado: assume que pode votar');

  check(T.voteInfo(null, agora).kind === 'checking', 'sem estado ainda: conferindo');
  check(T.voteInfo({ loggedIn: false }, agora).kind === 'login', 'sem login: votar (entra no TopIdle)');
  check(T.voteInfo(estado({}), agora).label === '🗳 Votar' && T.voteInfo(estado({}), agora).kind === 'ready', 'pronto: "🗳 Votar" verde');
  const espera = T.voteInfo(estado({ canVote: false, nextVoteAt: agora + 125 * MIN }), agora);
  check(espera.kind === 'wait' && espera.label === '🗳 2 h 05 min', `aguardando: mostra quanto falta (${espera.label})`);
  check(T.voteInfo(estado({ canVote: false, nextVoteAt: null }), agora).label === '🗳 ✓ Votou', 'votou e sem horário: "✓ Votou"');
}

// Controlador: contas 1 (já votou, libera em 2h05), 2 (pronta), 3 (sem login no TopIdle)
async function testeControlador() {
  const contas = {
    1: { me: { user: { name: 'Fulano', email: 'nao-mostrar@example.com' } }, game: { canVote: false, nextVoteAt: Math.floor(agora / 1000) + 125 * 60 } },
    2: { me: { user: { name: 'Ciclano' } }, game: { canVote: true } },
  };
  const cookiesDe = { 1: [{ name: 'sid', value: '1' }], 2: [{ name: 'sid', value: '2' }], 3: [] };
  const nicks = { 1: '"fulano"', 2: null, 3: null };
  const listeners = {};
  let falhaConta = null;
  const pedidos = [];

  const fetchImpl = async (url, opts) => {
    const u = new URL(url);
    const cookie = opts.headers.Cookie;
    pedidos.push({ path: u.pathname, cookie: !!cookie });
    if (u.pathname === '/api/games' && !cookie) {
      return { ok: true, json: async () => [{ id: GAME, domain: 'pokeidle.io' }, { id: 'outro', domain: 'outro.com' }] };
    }
    const id = Number(String(cookie).replace('sid=', ''));
    if (falhaConta === id) throw new Error('sem internet');
    if (u.pathname === '/api/me') return { ok: true, json: async () => ({ user: contas[id]?.me?.user ? contas[id].me.user : null }) };
    if (u.pathname === '/api/games') return { ok: true, json: async () => [{ id: GAME, ...contas[id].game }] };
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const sessao = (id) => ({
    cookies: { get: async () => cookiesDe[id] },
    webRequest: { onCompleted: (fn) => { listeners[id] = fn; } },
  });
  const slot = (id) => ({
    id,
    view: {
      webContents: {
        isDestroyed: () => false,
        isLoading: () => false,
        executeJavaScript: async (code) => (code.includes('nick') ? nicks[id] : null),
      },
    },
  });
  const slots = [slot(1), slot(2), slot(3)];
  const janelas = [];
  const avisos = [];
  const makeWindow = (id) => {
    const w = { id, url: null, title: '', loadURL(u) { this.url = u; }, focus() {}, setTitle(t) { this.title = t; }, isDestroyed: () => false, on() {} };
    janelas.push(w);
    return w;
  };
  const ctl = T.createTopIdle({ getSlots: () => slots, notify: (n) => avisos.push(n), fetchImpl, getSession: sessao, makeWindow, now, timers: false });

  check(ctl.info(1).kind === 'checking', 'antes da primeira conferência: "conferindo"');
  await waitFor(async () => {
    ctl.tick();
    return ctl.gameId() === GAME && ['wait', 'ready', 'login'].includes(ctl.info(1).kind) && ctl.info(2).kind === 'ready' && ctl.info(3).kind === 'login';
  }, 8000);
  check(ctl.gameId() === GAME, 'acha o id do pokeidle no TopIdle');
  check(ctl.info(1).kind === 'wait' && ctl.info(1).label === '🗳 2 h 05 min', `conta 1 aguarda o próximo voto (${ctl.info(1).label})`);
  check(ctl.info(2).kind === 'ready' && ctl.info(3).kind === 'login', 'conta 2 pode votar e conta 3 precisa entrar no TopIdle');
  check(!pedidos.some((p) => p.path === '/api/me' && !p.cookie), 'sem cookie não consulta /api/me (conta 3 não manda nada)');
  const resumo = ctl.summary();
  check(JSON.stringify(resumo.ready) === '[2]' && resumo.text === '🗳 Voto liberado: Conta 2', `barra do app: quem pode votar (${resumo.text})`);

  await ctl.open(1);
  check(janelas.length === 1 && janelas[0].url === `${BASE}/jogo/${GAME}?votar=1&playerIdentifier=fulano`, `abre a votação com o nick da conta (${janelas[0]?.url})`);
  await ctl.open(3);
  check(janelas[1]?.url === `${BASE}/jogo/${GAME}?votar=1`, 'sem nick salvo, abre a votação sem o personagem');
  check(ctl.handleLink(2, `${BASE}/jogo/${GAME}?votar=1`) === true && ctl.handleLink(2, 'https://outro.com/') === false, 'link do votar dentro do jogo abre a janela de voto; outros sites não');
  await waitFor(() => janelas.length === 3, 2000);
  check(janelas.length === 3 && janelas[2].url.includes('/jogo/' + GAME), 'o link do jogo foi para a janela de voto da conta 2');
  janelas.length = 1;
  await ctl.open(1); // reaproveita a janela aberta da conta 1 (sem criar outra)
  check(janelas.length === 1, 'a mesma conta reaproveita a janela de voto');

  // GET não é voto; o POST com sucesso é: o botão vira "votou" e o contador reinicia
  listeners[1]({ method: 'GET', url: `${BASE}/api/games/${GAME}/vote`, statusCode: 200 });
  check(ctl.info(1).kind === 'wait', 'GET no voto não muda o botão');
  listeners[1]({ method: 'POST', url: `${BASE}/api/games/${GAME}/vote`, statusCode: 200 });
  check(ctl.info(1).kind === 'voted', 'POST 200 no voto: botão vira "✓ Votou"');
  check(janelas[0].title.startsWith('✓ Voto registrado'), 'título da janela avisa que o voto entrou');
  agora += 3000;
  contas[1].game = { canVote: false, nextVoteAt: Math.floor(agora / 1000) + 8 * 3600 }; // o TopIdle agora diz que libera em 8 h
  await waitFor(async () => { ctl.tick(); return ctl.info(1).label === '🗳 8 h 00 min'; }, 4000);
  check(ctl.info(1).label === '🗳 8 h 00 min', `conferiu de novo e reiniciou o contador (${ctl.info(1).label})`);

  // falha de rede: mantém o último estado conhecido
  falhaConta = 2;
  await ctl.refresh(2);
  check(ctl.info(2).kind === 'ready', 'sem internet na conferência: mantém o último estado');
  falhaConta = null;

  check(!avisos.length, 'nenhum aviso desnecessário no caminho feliz');
  check(!pedidos.some((p) => JSON.stringify(p).includes('nao-mostrar')), 'o e-mail do usuário nunca vai para a tela nem para pedidos');
}

// Barra da conta: o botão 🗳 aparece e pede a ação "vote"; a barra do app mostra quem pode votar
async function testeBarra() {
  const win = new BrowserWindow({ show: false, width: 900, height: 60, webPreferences: { preload: path.join(__dirname, 'tb-stub-preload.js') } });
  const snap = {
    kind: 'slot', id: 2, pos: 1, zoom: 1, muted: false, features: [],
    vote: { kind: 'ready', label: '🗳 Votar', hint: 'Voto liberado.' },
  };
  process.env.PKMULTI_TB_SNAP = JSON.stringify(snap);
  await win.loadFile(path.join(__dirname, '..', 'src', 'ui', 'toolbar.html'), { query: { kind: 'slot', id: '2' } });
  const run = (code) => win.webContents.executeJavaScript(code);
  check(await waitFor(() => run('[...document.querySelectorAll("button")].some(b => b.textContent === "🗳 Votar")'), 4000), 'barra da conta mostra o botão 🗳');
  check(await run('[...document.querySelectorAll("button")].find(b => b.textContent === "🗳 Votar").className') === 'vote-ready', 'botão pronto fica verde');
  await run('[...document.querySelectorAll("button")].find(b => b.textContent === "🗳 Votar").click()');
  check((await run('tb.acts()')).includes('vote'), 'clicar no 🗳 pede a ação "vote"');

  const win2 = new BrowserWindow({ show: false, width: 900, height: 60, webPreferences: { preload: path.join(__dirname, 'tb-stub-preload.js') } });
  process.env.PKMULTI_TB_SNAP = JSON.stringify({ kind: 'app', accounts: { count: 2, max: 4, focused: null, lives: { kind: 'none', text: '' }, version: null, update: null, votes: { ready: [1, 2], text: '🗳 Voto liberado: Conta 1, Conta 2' } } });
  await win2.loadFile(path.join(__dirname, '..', 'src', 'ui', 'toolbar.html'), { query: { kind: 'app' } });
  const run2 = (code) => win2.webContents.executeJavaScript(code);
  check(await waitFor(() => run2('document.body.textContent.includes("Voto liberado: Conta 1, Conta 2")'), 4000), 'barra do app diz quais contas podem votar');
}

app.whenReady().then(async () => {
  try {
    testesPuros();
    await testeControlador();
    await testeBarra();
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
