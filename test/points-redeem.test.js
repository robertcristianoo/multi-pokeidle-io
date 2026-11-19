// Resgate automático (src/points/redeem.js, porte do PointsRedeemer da referência): menor duração liberada, parada
// quando os pontos voltam, queda de saldo só no registro, espera de 30 min na recusa, baú, avisos e textos.
const { app, check, finish } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // the texts checked below are the Portuguese ones
const { createRedeemer, claimProblem, keysOf, rewardFor, planRound, kickReadAsync, twitchReadAsync, RETRY_MS, REFUND_WINDOW_MS } = require('../src/points/redeem');

const MIN = 60 * 1000;
const J = JSON.stringify;

// ---- vários bônus por conta: a leitura escolhe o primeiro da lista que o saldo cobre (fetch falso, sem rede) ----
const KICK_REWARDS = [
  { title: 'Bônus de +15% XP 1h PokeIdle', description: 'pokeidle', cost: 300, is_enabled: true, is_paused: false },
  { title: 'Bônus de Captura 1h PokeIdle', description: 'pokeidle', cost: 500, is_enabled: true, is_paused: false },
  { title: 'Bônus Secret Lure 1h PokeIdle', description: 'pokeidle', cost: 1000, is_enabled: true, is_paused: false },
];
const TWITCH_REWARD = (title, cost) => ({ title, prompt: 'PokeIdle', cost, isEnabled: true, isPaused: false, isInStock: true, cooldownExpiresAt: null });
const TWITCH_REWARDS = [TWITCH_REWARD('Bônus de +15% XP 1h PokeIdle', 300), TWITCH_REWARD('Bônus de Captura 1h PokeIdle', 500)];

// Troca o fetch global por respostas fixas: a rota é o trecho da URL que casa
function fakeFetch(routes) {
  global.fetch = async (url) => {
    const hit = Object.entries(routes).find(([k]) => String(url).includes(k));
    if (!hit) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => hit[1] };
  };
}

async function multiRewards() {
  const realFetch = global.fetch;
  try {
    const kick = async (points, keys, rewards = KICK_REWARDS) => {
      fakeFetch({ '/points': { data: { points } }, '/rewards': { data: rewards } });
      return JSON.parse(await kickReadAsync('https://kick.com', 'canal', 'tok', keys));
    };
    let o = await kick(350, ['captura', 'xp']);
    check(o.key === 'xp' && o.cost === 300 && o.points === 350, 'vários bônus: com 350 pontos, o primeiro que cobre é o XP (o Captura, de 500, ainda não dá)');
    o = await kick(600, ['captura', 'xp']);
    check(o.key === 'captura' && o.cost === 500, 'vários bônus: com 600 pontos, a ordem da lista manda (Captura antes do XP)');
    o = await kick(600, ['xp', 'captura']);
    check(o.key === 'xp' && o.cost === 300, 'vários bônus: trocar a ordem troca o escolhido');
    o = await kick(200, ['shiny', 'captura']);
    check(o.key === 'shiny' && o.cost === 1000 && o.points === 200, 'vários bônus: sem saldo para nenhum, mostra o primeiro da lista (sem resgatar)');
    o = await kick(900, 'xp');
    check(o.key === 'xp' && o.cost === 300, 'bônus só (texto de antes): lido como lista de um item');
    o = await kick(900, []);
    check(o.key === undefined && o.cost === undefined && o.points === 900, 'sem bônus escolhido: só o saldo');
    o = await kick(900, ['xp', 'xp', 'nada']);
    check(o.key === 'xp', 'lista com repetido ou inválido: conta uma vez');
    o = await kick(900, ['captura'], [KICK_REWARDS[0]]);
    check(o.error === 'canal sem o bônus' && o.points === 900, 'canal sem o bônus escolhido: aviso e só o saldo');
    const r = createRedeemer({ site: 'kick' });
    check(r.needsPage('canal', JSON.stringify(await kick(350, ['captura', 'xp'])), false) === true, 'com saldo para o XP da lista, a página abre para resgatar');

    const twitch = async (balance, keys, rewards = TWITCH_REWARDS) => {
      fakeFetch({ '/gql': { data: { currentUser: { id: '1' }, user: { id: '9', channel: {
        self: { communityPoints: { balance, availableClaim: null } },
        communityPointsSettings: { customRewards: rewards },
      } } } } });
      return JSON.parse(await twitchReadAsync('https://gql.twitch.tv', 'canal', 'tok', 'dev', keys));
    };
    o = await twitch(350, ['captura', 'xp']);
    check(o.key === 'xp' && o.cost === 300 && o.me === '1' && o.channelId === '9', 'Twitch: a mesma escolha pela ordem, com o id da conta e do canal');
    o = await twitch(600, ['captura', 'xp']);
    check(o.key === 'captura' && o.cost === 500, 'Twitch: com saldo para o primeiro da lista, ele');
    o = await twitch(600, []);
    check(o.key === undefined && o.points === 600, 'Twitch: sem bônus escolhido, só o saldo');

    check(rewardFor(J({ key: 'xp' }), ['captura']) === 'xp', 'rewardFor: usa a chave que a leitura escolheu');
    check(rewardFor('lixo', ['captura', 'xp']) === 'captura' && rewardFor(null, 'xp') === 'xp' && rewardFor(null, []) === null, 'rewardFor: sem leitura útil, o primeiro da lista');
    check(J(keysOf(['xp', 'shiny', 'xp', 'zzz'])) === '["xp","shiny"]' && keysOf(undefined).length === 0, 'keysOf: sem repetir nem chave inválida');
    o = await kick(600, ['captura', 'xp']);
    check(J(o.options.map((x) => x.key)) === '["captura","xp"]', 'leitura: traz as opções de cada bônus da lista, na ordem');

    // ---- rodada do combo (planRound): um de cada bônus, em canais que somam o saldo ----
    const opt = (key, cost, extra = {}) => ({ key, cost, title: key, paused: false, ...extra });
    const canal = (channel, points, ...options) => ({ channel, points, options });
    const names = (r) => (r ? r.map((a) => `${a.key}@${a.channel}`).join(' ') : 'nenhum');
    check(names(planRound(['xp', 'captura'], [canal('a', 700, opt('xp', 300), opt('captura', 500))])) === 'nenhum', 'combo: saldo que não cobre os dois (700 < 800) não resgata nada');
    check(names(planRound(['xp', 'captura'], [canal('a', 800, opt('xp', 300), opt('captura', 500))])) === 'xp@a captura@a', 'combo: saldo que cobre os dois resgata um de cada, na ordem da lista');
    check(names(planRound(['captura', 'xp'], [canal('a', 800, opt('xp', 300), opt('captura', 500))])) === 'captura@a xp@a', 'combo: a ordem da lista é a ordem do resgate');
    check(names(planRound(['xp', 'captura'], [canal('a', 350, opt('xp', 300)), canal('b', 600, opt('captura', 500))])) === 'xp@a captura@b', 'combo dividido: cada bônus no canal que o oferece e cobre');
    check(names(planRound(['xp', 'captura'], [canal('a', 350, opt('xp', 300), opt('captura', 500)), canal('b', 100, opt('xp', 300))])) === 'nenhum', 'combo: sem canal que cubra o Captura e sem o XP sobrando não resgata');
    check(names(planRound(['xp', 'captura'], [canal('a', 600, opt('xp', 300), opt('captura', 500)), canal('b', 300, opt('xp', 300))])) === 'xp@b captura@a', 'combo: se o primeiro canal não deixa caber, volta atrás e acha outra divisão');
    check(names(planRound(['xp', 'captura'], [canal('a', 800, opt('xp', 300, { paused: true }), opt('captura', 500))])) === 'nenhum', 'combo: bônus pausado no canal não entra');
    check(names(planRound(['xp', 'captura', 'shiny'], [canal('a', 1800, opt('xp', 300), opt('captura', 500), opt('shiny', 1000))])) === 'xp@a captura@a shiny@a', 'combo de três: soma 1800 no mesmo canal');
    check(names(planRound(['xp', 'captura', 'shiny'], [canal('a', 1700, opt('xp', 300), opt('captura', 500), opt('shiny', 1000))])) === 'nenhum', 'combo de três: 1700 não cobre 1800');
    check(names(planRound(['xp'], [canal('a', 350, opt('xp', 300)), canal('b', 200, opt('xp', 300)), canal('c', 900, opt('xp', 300))])) === 'xp@a xp@c', 'um bônus só: cada canal que cobre resgata o seu (como antes)');
    check(planRound([], [canal('a', 900, opt('xp', 300))]) === null && names(planRound(['xp'], [canal('a', 900, opt('xp', 300, { paused: true }))])) === 'nenhum', 'sem bônus, ou só pausado: nada');
  } catch (err) {
    check(false, `vários bônus: erro inesperado: ${err.stack || err}`);
  } finally {
    global.fetch = realFetch;
  }
}

app.whenReady().then(async () => {
  try {
    let t = Date.parse('2026-11-16T14:00:00');
    const now = () => t;
    const logs = [];
    const mk = (site) => createRedeemer({ site, log: (s) => logs.push(s), now });

    // ---- resgate e Text ----
    let r = mk('kick');
    let note = r.apply('canal', J({ points: 350, cost: 300, title: 'Bônus +15% XP PokeIdle', redeemed: true, status: 200, cheapest: 300 }));
    check(note === 'Kick: resgatei Bônus +15% XP PokeIdle em canal', 'resgate devolve o aviso');
    check(logs.some((l) => /canal: resgatou Bônus \+15% XP PokeIdle \(300 pontos; sobraram 50\)/.test(l)), 'registra o resgate com o saldo que sobrou');
    check(/^50\/300 pontos, resgatou \d{2}:\d{2}$/.test(r.text('canal')), `Text depois do resgate (${r.text('canal')})`);
    check(r.balance('canal') === '50/300', 'Balance mostra saldo/custo');

    // ---- plano: um resgate recusado espera 30 min; o script já sai sem gastar ----
    r = mk('kick');
    r.apply('c', J({ points: 400, cost: 300, title: 'XP', status: 422, cheapest: 300 }));
    check(/resgate recusado \(422\)/.test(r.text('c')), 'recusa aparece no Text');
    check(logs.some((l) => /foi recusado \(erro 422; saldo 400\); tento de novo em 30 min/.test(l)), 'registra a recusa');
    let s = r.kickScript('https://kick.com', 'c', 'tok', 'xp');
    check(/"spend":false/.test(s), 'depois da recusa o script não gasta (espera 30 min)');
    t += RETRY_MS + 1000;
    s = r.kickScript('https://kick.com', 'c', 'tok', 'xp');
    check(/"spend":true/.test(s) && /"word":"\\\\bxp\\\\b"/.test(s), 'passados 30 min volta a gastar, com a palavra do XP');
    r.apply('c', J({ points: 10, cost: 300, title: 'XP', cheapest: 300 })); // fecha o gasto pendente

    // ---- pontos voltaram: para de resgatar ----
    r = mk('twitch');
    r.apply('tw', J({ points: 600, cost: 500, title: 'Captura', redeemed: true, cheapest: 500, me: '77', channelId: '9' }));
    check(r.userId === '77' && r.idOf('tw') === '9' && r.channelOf('9') === 'tw', 'guarda o id da conta e do canal');
    t += 5 * MIN;
    note = r.apply('tw', J({ points: 400, cost: 500, title: 'Captura', cheapest: 500 })); // 100 + 250 = 350 <= 400
    check(r.stopped && /os pontos voltaram \(vincule a Twitch/.test(r.stopped), 'saldo que volta para o resgate da conta');
    check(/parei de resgatar nesta conta/.test(note), 'avisa que parou');
    check(/"spend":false/.test(r.twitchScript('https://gql.twitch.tv', 'tw', 'tok', 'dev', 'captura', false)), 'parado: o script não gasta');
    r.restart();
    check(r.stopped === null && r.text('tw') === '', 'restart volta a resgatar do zero');

    // ---- saldo que cai (> 100) só vai para o registro; zerar não para ----
    r = mk('kick');
    logs.length = 0;
    r.apply('k', J({ points: 250, cost: 300, title: 'XP', cheapest: 300 }));
    note = r.apply('k', J({ points: 100, cost: 300, title: 'XP', cheapest: 300 }));
    check(/gastos fora do deck/.test(note || '') && r.stopped === null, 'queda grande avisa e não para');
    check(logs.some((l) => /o saldo caiu de 250 para 100 sem resgate do deck \(150 pontos/.test(l)), 'queda registrada');
    r.apply('k', J({ points: 0, cost: 300, title: 'XP', cheapest: 300 }));
    check(r.stopped === null, 'saldo zerado sem resgate não para o resgate');
    logs.length = 0;
    r.apply('k', J({ points: 0, cost: 300, title: 'XP', cheapest: 300 }));
    r.apply('k', J({ points: 60, cost: 300, title: 'XP', cheapest: 300 }));
    check(!logs.some((l) => /caiu/.test(l)), 'queda de até 100 não é registrada');

    // ---- menor duração liberada / pausada ----
    r = mk('kick');
    logs.length = 0;
    r.apply('p', J({ points: 200, cost: 900, title: 'XP 3h', paused: false, cheapest: 300 }));
    check(/o de 300 pontos está pausado no canal \(vai o de 900\)/.test(r.text('p')), 'mostra qual duração está pausada');
    check(logs.some((l) => /200 pontos, mas/.test(l)) === false, 'sem saldo para nenhuma, nada segurando');
    r.apply('p', J({ points: 400, cost: 900, title: 'XP 3h', paused: false, cheapest: 300 }));
    check(logs.some((l) => /400 pontos, mas o de 300 pontos está pausado no canal e o mais barato liberado custa 900/.test(l)), 'registra por que segura (uma vez)');
    const n1 = logs.length;
    r.apply('p', J({ points: 410, cost: 900, title: 'XP 3h', paused: false, cheapest: 300 }));
    check(logs.length === n1, 'o mesmo motivo não repete no registro');
    r.apply('p', J({ points: 500, cost: 300, title: 'XP', paused: true, cheapest: 300 }));
    check(/bônus pausado no canal/.test(r.text('p')) && r.balance('p') === '500/300 pausado', 'bônus todo pausado');

    // ---- canal sem bônus / sem resposta ----
    r = mk('kick');
    r.apply('z', J({ points: 20, error: 'canal sem o bônus' }));
    check(r.text('z') === '20 pontos, canal sem o bônus', 'canal sem o bônus mostra só o saldo');
    check(r.apply('z', 'lixo') === null && r.text('z') === 'a live não respondeu', 'resposta estranha');

    // ---- resgate sem resposta (UnansweredAt) ----
    r = mk('kick');
    r.apply('u', J({ points: 400, cost: 300, title: 'XP', cheapest: 300 }));
    r.kickScript('https://kick.com', 'u', 'tok', 'xp'); // sai o script que pode gastar
    r.apply('u', 'sem json'); // não voltou
    logs.length = 0;
    r.apply('u', J({ points: 100, cost: 300, title: 'XP', cheapest: 300 }));
    check(logs.some((l) => /passou, mas o player não tinha respondido \(saldo 400 → 100\)/.test(l)), 'saldo que cai depois de script sem resposta foi o resgate');

    // ---- baú ----
    r = mk('twitch');
    logs.length = 0;
    r.apply('b', J({ points: 100, claimed: true, me: '1', channelId: '2' }));
    check(logs.some((l) => /b: pegou o baú \(\+50, saldo 100\)/.test(l)) && r.text('b') === '100 pontos, baú ' + r.text('b').slice(-5), `baú pego (${r.text('b')})`);
    r.apply('b', J({ points: 100, claimError: 'NOT_FOUND' }));
    check(logs.some((l) => /o baú já tinha sido pego/.test(l)), 'NOT_FOUND não espera');
    r.apply('b', J({ points: 100, claimError: 'RATE' }));
    check(/o baú não passou \(RATE\); tento de novo em 30 min/.test(logs.join('\n')) && /baú: RATE/.test(r.text('b')), 'erro do baú espera 30 min');
    check(/"claim":false/.test(r.twitchScript('a', 'b', 't', null, null, true)), 'baú em espera: o script não tenta');
    check(/"claim":true/.test(r.twitchScript('a', 'b', 't', null, null, true, false, 'id-do-aviso')), 'baú do aviso vai mesmo na espera');

    // ---- needsPage ----
    r = mk('twitch');
    check(r.needsPage('x', J({ failed: 'erro 500' }), false) === true, 'needsPage: leitura que falhou');
    check(r.needsPage('x', 'lixo', false) === true, 'needsPage: resposta estranha');
    check(r.needsPage('x', J({ points: 10, cost: 300 }), false) === false, 'needsPage: sem saldo, não');
    check(r.needsPage('x', J({ points: 400, cost: 300 }), false) === true, 'needsPage: dá para resgatar');
    check(r.needsPage('x', J({ points: 400, cost: 300, paused: true }), false) === false, 'needsPage: pausado, não');
    check(r.needsPage('x', J({ points: 5, claimId: 'a' }), true) === true && r.needsPage('x', J({ points: 5, claimId: 'a' }), false) === false, 'needsPage: baú esperando só com o baú ligado');

    // ---- earned / texto / quiet ----
    r = mk('twitch');
    r.listeningSince = t;
    logs.length = 0;
    check(r.earned('e', 'WATCH', 10, 110) === null, 'Earned: assistir não vai para o cabeçalho');
    check(r.earned('e', 'WATCH_STREAK', 300, 410) === 'Twitch: +300 da sequência de lives em e' && logs.some((l) => /ganhou \+300 da sequência de lives \(saldo 410\)/.test(l)), 'Earned: sequência vai ao registro');
    check(/\+310\/h/.test(r.text('e')), `Text soma a última hora (${r.text('e')})`);
    r.apply('e', J({ points: 410, cost: 300, title: 'XP', cheapest: 300, channelId: '5' })); // abre a live
    r.earned('e', 'WATCH', 10, 420);
    t += 21 * MIN;
    check(JSON.stringify(r.newQuiet(['e'])) === '["e"]' && /sem pontos de assistir há 21 min/.test(r.text('e')), 'live aberta sem pontos de assistir é avisada');
    check(r.newQuiet(['e']).length === 0, 'avisa uma vez');
    r.forget('e');
    check(r.balance('e') === '', 'Forget esquece o saldo');

    // ---- claimProblem ----
    check(claimProblem('') === 'o player não respondeu em 30 s' && claimProblem('x') === 'resposta estranha do player', 'claimProblem: sem resposta e estranha');
    check(claimProblem(J({ claimed: true })) === null && claimProblem(J({ claimError: 'x' })) === null, 'claimProblem: pegou ou erro já registrado');
    check(claimProblem(J({ error: 'canal x' })) === 'canal x' && claimProblem(J({})) === 'a página não viu o baú', 'claimProblem: erro ou sem baú');
    check(REFUND_WINDOW_MS === 30 * MIN, 'janela de devolução de 30 min');
    await multiRewards();
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
