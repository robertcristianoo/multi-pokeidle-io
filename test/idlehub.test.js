// Voto no IdleHub: funções puras, controlador (janelas, depurador e tela de mentira, sem rede) e o botão 🗳 na barra.
// Nada aqui sai para a internet nem abre a página de voto de verdade.
const { app, check, finish, waitFor } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // the texts checked here are in Portuguese
const path = require('path');
const { EventEmitter } = require('events');
const { BrowserWindow } = require('electron');
const I = require('../src/idlehub');

const MIN = 60 * 1000;
const DIA = 24 * 60 * MIN;
const BASE = 'https://idlehub.io';
const VOTO = `${BASE}/votar/pokeidle-io`;
let agora = Date.UTC(2026, 10, 13, 12, 0, 0);
const now = () => agora;

function testesPuros() {
  check(I.parseNick('"fulano"') === 'fulano', 'nick salvo em JSON vira texto');
  check(I.parseNick('"\\"ciclano\\""') === 'ciclano', 'nick codificado duas vezes também');
  check(I.parseNick('nick com espaço') === null && I.parseNick('') === null && I.parseNick(null) === null, 'nick inválido, vazio ou ausente: nulo');
  check(I.parseNick('"x"; <script>') === null && I.parseNick('a'.repeat(65)) === null, 'texto estranho ou longo demais: nulo');

  check(I.voteUrl('fulano') === `${VOTO}?jogador=fulano`, 'link de voto leva o nick do personagem');
  check(I.voteUrl('nick com espaço') === VOTO && I.voteUrl(null) === VOTO, 'nick inválido ou ausente: sem nick na URL');
  check(I.voteUrl('a&b=c') === VOTO, 'nada além do nick vai na URL');

  check(I.isIdleHubLink(VOTO) && I.isIdleHubLink(`https://www.idlehub.io/jogo/pokeidle-io#votar`), 'link https do IdleHub (com e sem www) é aceito');
  check(!I.isIdleHubLink('http://idlehub.io/') && !I.isIdleHubLink('https://topidle.com/jogo/pokeidle-io?votar=1'), 'http e o domínio antigo (topidle.com) são recusados');
  check(!I.isIdleHubLink('https://idlehub.io.evil.com/') && !I.isIdleHubLink('https://evil-idlehub.io/') && !I.isIdleHubLink('https://idlehub.com/'), 'domínios parecidos são recusados');
  check(!I.isIdleHubLink('lixo') && !I.isIdleHubLink(''), 'lixo e vazio são recusados');

  check(I.toMsEpoch(1700000000000) === 1700000000000 && I.toMsEpoch('1700000000000') === 1700000000000, 'ms (número ou texto) são aceitos');
  check(I.toMsEpoch(1700000000) === null && I.toMsEpoch(0) === null && I.toMsEpoch(null) === null && I.toMsEpoch('lixo') === null, 'segundos, zero, vazio e ilegível: desconhecido');

  const ok = I.parseVoteResponse({ ok: true, proximoEm: agora + 2 * 60 * MIN }, agora);
  check(ok && ok.proximoEm === agora + 2 * 60 * MIN, 'resposta de voto ok: lê o horário exato (proximoEm)');
  check(I.parseVoteResponse({ ok: false, erro: 'x', codigo: 'recarga' }, agora) === null, 'resposta de erro não é voto');
  check(I.parseVoteResponse({ ok: 'true', proximoEm: agora + MIN }, agora) === null && I.parseVoteResponse(null, agora) === null, 'ok que não é true, ou corpo vazio: não é voto');
  check(I.parseVoteResponse({ ok: true, proximoEm: agora - MIN }, agora).proximoEm === null, 'horário no passado é descartado (o app estima)');
  check(I.parseVoteResponse({ ok: true, proximoEm: agora + 49 * 60 * MIN }, agora).proximoEm === null, 'horário além de 48 h é descartado');
  check(I.parseVoteResponse({ ok: true }, agora).proximoEm === null, 'voto ok sem horário: conta como voto, horário estimado');

  check(I.parseDuracao('Próximo voto em 3 h 20 min.') === 200 * MIN, 'duração da tela em português: horas e minutos');
  check(I.parseDuracao('Próximo voto em 45 min.') === 45 * MIN && I.parseDuracao('Próximo voto em 1 h.') === 60 * MIN, 'só minutos; só horas');
  check(I.parseDuracao('Próximo voto em 2 dias.') === 2 * DIA && I.parseDuracao('Next vote in 2 days.') === 2 * DIA, 'dias (português e inglês)');
  check(I.parseDuracao('Next vote in 3 h 20 min.') === 200 * MIN && I.parseDuracao('Próximo voto en 2 días.') === 2 * DIA, 'inglês e espanhol');
  check(I.parseDuracao('agora') === 0 && I.parseDuracao('now') === 0, '"agora"/"now": zero');
  check(I.parseDuracao('lixo') === null && I.parseDuracao(null) === null, 'texto sem duração: nulo');

  check(I.formatLeft(0) === '1 min' && I.formatLeft(59 * MIN) === '59 min', 'minutos, arredondados para cima');
  check(I.formatLeft(60 * MIN) === '1 h 00 min' && I.formatLeft(125 * MIN) === '2 h 05 min', 'horas e minutos');

  check(I.voteInfo(null, agora).kind === 'unknown' && I.voteInfo(null, agora).label === '🗳 Votar', 'sem voto feito pelo app: desconhecido, "🗳 Votar"');
  check(I.voteInfo({ proximoEm: null, fonte: 'rede' }, agora).kind === 'unknown', 'sem horário: desconhecido');
  check(I.voteInfo({ proximoEm: agora - 1, fonte: 'rede' }, agora).kind === 'ready', 'horário passado: liberado');
  const espera = I.voteInfo({ proximoEm: agora + 125 * MIN, fonte: 'rede' }, agora);
  check(espera.kind === 'wait' && espera.label === '🗳 ✓ Votou · 2 h 05 min', `aguardando: "✓ Votou" com a contagem (${espera.label})`);
  const estimado = I.voteInfo({ proximoEm: agora + DIA, fonte: 'estimado' }, agora);
  check(estimado.hint.includes('estimado'), 'horário estimado diz que é estimado');

  const v = I.lerVotos({
    1: { proximoEm: agora + MIN, fonte: 'rede' },
    2: { proximoEm: 'lixo' },
    3: { proximoEm: agora - 1, fonte: 'quem sabe' },
    x: { proximoEm: agora + MIN },
  }, agora);
  check(v.size === 2 && v.get(1).fonte === 'rede' && v.get(1).avisado === false, 'carrega só os válidos; liberação de ids inválidos fica de fora');
  check(v.get(3).fonte === 'estimado' && v.get(3).avisado === true, 'fonte desconhecida vira estimado; liberação já passada não avisa de novo');
  check(I.lerVotos(null, agora).size === 0 && I.lerVotos('x', agora).size === 0, 'configuração ausente ou inválida: nada carregado');
}

// Controlador: contas 1 (com nick) e 2 (sem nick salvo). Janelas e depurador são de mentira.
function depuradorDeMentira() {
  const d = new EventEmitter();
  d.attached = false;
  d.enviados = [];
  d.corpos = {};
  d.attach = () => { d.attached = true; };
  d.isAttached = () => d.attached;
  d.detach = () => { d.attached = false; };
  d.sendCommand = async (metodo, params) => {
    d.enviados.push(metodo);
    if (metodo === 'Network.getResponseBody') return { body: d.corpos[params.requestId], base64Encoded: false };
    return {};
  };
  return d;
}

async function testeControlador() {
  const nicks = { 1: '"fulano"', 2: null };
  const telas = {};
  let armazenado = {};
  const salvos = [];
  const store = { get: () => armazenado, set: (v) => { armazenado = JSON.parse(JSON.stringify(v)); salvos.push(armazenado); } };
  const slots = [1, 2].map((id) => ({
    id,
    view: { webContents: { isDestroyed: () => false, isLoading: () => false, executeJavaScript: async (code) => (code.includes('nick') ? nicks[id] : null) } },
  }));
  const janelas = [];
  const makeWindow = (id, destino) => {
    const ev = new EventEmitter();
    const dbg = depuradorDeMentira();
    const w = {
      id,
      destino,
      title: '',
      focos: 0,
      carregou: [],
      fechada: false,
      webContents: {
        debugger: dbg,
        executeJavaScript: async (code) => (code.includes('voto-feito') ? (telas[id] ?? null) : null),
      },
      loadURL(u) { this.carregou.push(u); },
      focus() { this.focos++; },
      setTitle(t) { this.title = t; },
      isDestroyed() { return this.fechada; },
      on(evt, fn) { ev.on(evt, fn); },
      fechar() { this.fechada = true; ev.emit('closed'); },
    };
    janelas.push(w);
    return w;
  };
  const avisos = [];
  const ctl = I.createIdleHub({ getSlots: () => slots, notify: (n) => avisos.push(n), store, makeWindow, now, timers: false });
  const emite = (w, metodo, p) => w.webContents.debugger.emit('message', {}, metodo, p);
  const post = (w, requestId, corpo, url = VOTO) => {
    emite(w, 'Network.requestWillBeSent', { requestId, request: { method: 'POST', url } });
    emite(w, 'Network.responseReceived', { requestId, response: { status: 200, mimeType: 'application/json' } });
    w.webContents.debugger.corpos[requestId] = JSON.stringify(corpo);
    emite(w, 'Network.loadingFinished', { requestId });
  };

  check(ctl.info(1).kind === 'unknown', 'antes de votar pelo app: desconhecido (não consulta nada)');
  await ctl.open(1);
  check(janelas.length === 1 && janelas[0].destino === `${VOTO}?jogador=fulano`, `abre a votação com o nick da conta (${janelas[0]?.destino})`);
  check(janelas[0].carregou.join() === janelas[0].destino, 'carrega exatamente a URL montada');
  check(janelas[0].webContents.debugger.attached && janelas[0].webContents.debugger.enviados.join() === 'Network.enable', 'depurador só desta janela, só com Network');

  // GET não é voto; o POST com resposta ok traz o horário exato
  emite(janelas[0], 'Network.requestWillBeSent', { requestId: 'g0', request: { method: 'GET', url: VOTO } });
  emite(janelas[0], 'Network.responseReceived', { requestId: 'g0', response: { status: 200, mimeType: 'text/html' } });
  emite(janelas[0], 'Network.loadingFinished', { requestId: 'g0' });
  await new Promise((r) => setTimeout(r, 50));
  check(ctl.info(1).kind === 'unknown', 'GET na página de voto não conta como voto');

  post(janelas[0], 'p0', { ok: true, proximoEm: agora + DIA - 5 * MIN }, 'https://topidle.com/api/x');
  await new Promise((r) => setTimeout(r, 50));
  check(ctl.info(1).kind === 'unknown', 'POST para outro site não conta');

  post(janelas[0], 'p1', { ok: true, proximoEm: agora + DIA - 5 * MIN, votosMes: 908 });
  check(await waitFor(() => ctl.info(1).kind === 'wait', 2000), 'POST ok no IdleHub: vira "✓ Votou"');
  check(ctl.info(1).label === '🗳 ✓ Votou · 23 h 55 min', `contagem vem do horário exato do site (${ctl.info(1).label})`);
  check(janelas[0].title.startsWith('✓ Voto registrado'), 'título da janela avisa que o voto entrou');
  check(ctl.summary().text === '🗳 Próximo voto em 23 h 55 min' && ctl.summary().ready.length === 0, `barra do app: próximo voto (${ctl.summary().text})`);
  check(salvos.length > 0 && salvos[salvos.length - 1]['1']?.fonte === 'rede', 'o horário fica salvo por conta (só local)');

  // Conta 2 (sem nick): ok sem horário vira estimado; ok:false não conta
  await ctl.open(2);
  check(janelas[1].destino === VOTO, 'conta sem nick salvo abre a votação sem nick na URL');
  post(janelas[1], 'q0', { ok: false, erro: 'Aguarde', codigo: 'recarga' });
  await new Promise((r) => setTimeout(r, 50));
  check(ctl.info(2).kind === 'unknown', 'erro do site (ok:false) não é registrado como voto');
  post(janelas[1], 'q1', { ok: true });
  check(await waitFor(() => ctl.info(2).kind === 'wait', 2000) && ctl.info(2).label === '🗳 ✓ Votou · 24 h 00 min', `voto ok sem horário: estimado em 24 h (${ctl.info(2).label})`);
  check(ctl.info(2).hint.includes('estimado'), 'a dica diz que o horário é estimado');

  // Tela de "voto registrado": só vale se a resposta não foi lida; depois, a resposta exata prevalece
  telas[2] = null;
  await ctl.open(1); // reaproveita a janela da conta 1: não abre outra
  check(janelas.length === 2 && janelas[0].focos === 1, 'a mesma conta reaproveita a janela de voto (foca a existente)');
  await ctl.open(2); // a conta 2 já tem janela, mas com um estado estimado a tela não sobrepõe o exato
  check(janelas.length === 2 && janelas[1].focos === 1, 'segunda abertura da conta 2 só foca');

  // Precedência: tela (2) não sobrepõe a resposta exata (1); a resposta exata sobrepõe a tela
  post(janelas[1], 'q2', { ok: true, proximoEm: agora + DIA - MIN });
  check(await waitFor(() => ctl.info(2).label === '🗳 ✓ Votou · 23 h 59 min', 2000), `resposta exata sobrepõe o estimado (${ctl.info(2).label})`);
  post(janelas[1], 'q3', { ok: true });
  await new Promise((r) => setTimeout(r, 50));
  check(ctl.info(2).label === '🗳 ✓ Votou · 23 h 59 min', 'resposta sem horário não derruba o horário exato');

  // Persistência: outra instância lê o que foi salvo
  const ctl2 = I.createIdleHub({ getSlots: () => slots, store, makeWindow, now, timers: false });
  check(ctl2.info(1).kind === 'wait' && ctl2.info(1).label === '🗳 ✓ Votou · 23 h 55 min', 'reabrir o app mantém a contagem de cada conta');
  armazenado = { 1: { proximoEm: 'lixo' }, 9: { proximoEm: agora + MIN } };
  const ctl3 = I.createIdleHub({ getSlots: () => slots, store, makeWindow, now, timers: false });
  check(ctl3.info(1).kind === 'unknown' && ctl3.summary().text === null, 'configuração inválida é descartada sem quebrar');

  // Liberação: avisa uma vez por conta aberta, e a barra mostra quem pode votar
  agora += DIA + 10 * MIN;
  await ctl.tick();
  await ctl.tick();
  const liberados = avisos.filter((n) => n.title.includes('voto liberado'));
  check(liberados.length === 2, `um aviso de liberação por conta, sem repetir (${liberados.length})`);
  check(ctl.info(1).kind === 'ready' && ctl.info(2).kind === 'ready', 'depois da liberação, os dois botões voltam a "🗳 Votar"');
  check(JSON.stringify(ctl.summary().ready) === '[1,2]' && ctl.summary().text.startsWith('🗳 Voto liberado'), `barra do app: quem pode votar (${ctl.summary().text})`);

  // Leitura da tela (sem resposta lida): conta 2 em outra janela, com "Próximo voto em 3 h 20 min."
  await ctl.open(2);
  check(janelas.length === 2, 'a conta 2 continua com a mesma janela aberta');
  janelas[1].fechar();
  check(janelas[1].webContents.debugger.attached === false, 'fechar a janela desliga o depurador');
  await ctl.open(2);
  check(janelas.length === 3 && janelas[2].destino === VOTO, 'depois de fechar, abrir de novo cria outra janela');
  telas[2] = { voto: true, texto: 'Próximo voto em 3 h 20 min.' };
  await ctl.tick();
  check(ctl.info(2).label === '🗳 ✓ Votou · 3 h 20 min', `a tela de voto registrado conta quando a resposta não foi lida (${ctl.info(2).label})`);

  // O "votar" de dentro do jogo: o link do IdleHub abre a janela com a URL montada, nunca a do jogo
  janelas[2].fechar();
  check(ctl.handleLink(2, 'https://idlehub.io/jogo/pokeidle-io?votar=1#votar') === true, 'link do IdleHub dentro do jogo é tratado pelo app');
  check(await waitFor(() => janelas.length === 4, 2000) && janelas[3].destino === VOTO, 'o link do jogo abre a janela de voto da conta com a URL montada');
  check(ctl.handleLink(2, 'https://topidle.com/jogo/pokeidle-io?votar=1') === false && ctl.handleLink(2, 'http://idlehub.io/') === false, 'outros sites e http não são tratados');

  // Falha dentro do depurador ou da tela não derruba o controlador
  telas[2] = null;
  janelas[3].webContents.executeJavaScript = async () => { throw new Error('página não carregou'); };
  await ctl.tick();
  check(true, 'leitura da tela com erro não derruba a conferência');
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
  check(await run('[...document.querySelectorAll("button")].find(b => b.textContent === "🗳 Votar").className') === 'vote-ready', 'botão liberado fica verde');
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
