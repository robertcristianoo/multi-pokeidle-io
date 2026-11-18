// Scripts de conferência e resgate (src/points/scripts.js), rodados contra um fetch simulado, as leituras sem a página
// (src/points/redeem.js) e o registro dos resgates (src/points/log.js) gravado numa pasta temporária.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, check, finish } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // os textos conferidos abaixo são os em português
const { kickScript, twitchScript, twitchRaidScript, twitchMomentScript } = require('../src/points/scripts');
const { twitchReadAsync, kickReadAsync } = require('../src/points/redeem');
const { createRedeemLog, KEEP } = require('../src/points/log');

// Roda a expressão do script (como o executeJavaScript faz) com um fetch falso que responde por rota
async function runScript(expr, routes) {
  const seen = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    seen.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null, headers: init.headers || {} });
    const resp = routes(String(url), init);
    return { ok: resp.status ? resp.status < 400 : true, status: resp.status ?? 200, json: async () => resp.json ?? {} };
  };
  try {
    const out = await eval(expr);
    return { out: JSON.parse(out), seen };
  } finally {
    globalThis.fetch = realFetch;
  }
}

const KICK_ARGS = { api: 'https://kick.com', channel: 'canal', token: 'tok', word: '\\bxp\\b', spend: true, refund: null };
const KICK_REWARDS = [
  { id: 'r3', title: 'Bônus +15% XP PokeIdle 3h', cost: 900, is_enabled: true, description: 'PokeIdle' },
  { id: 'r1', title: 'Bônus +15% XP PokeIdle', cost: 300, is_enabled: true, description: 'PokeIdle' },
];
const kickRoutes = (redeemStatus, rewards = KICK_REWARDS, points = 1000) => (url) => {
  if (url.endsWith('/points')) return { json: { data: { points } } };
  if (url.endsWith('/rewards')) return { json: { data: rewards } };
  if (url.includes('/redeem')) return { status: redeemStatus, json: {} };
  return { status: 404 };
};

const TW_ARGS = { api: 'https://gql.twitch.tv', channel: 'tw', token: 'tok', device: 'dev', clientId: 'cid', word: 'captur', spend: true, refund: null, claim: false };
const TW_REWARDS = [
  { id: 'c3', title: 'Bônus de +15% Capture Boost PokeIdle 3h', prompt: 'PokeIdle', cost: 1500, isEnabled: true, isPaused: false, isInStock: true },
  { id: 'c1', title: 'Bônus de +15% Capture Boost PokeIdle', prompt: 'PokeIdle', cost: 500, isEnabled: true, isPaused: false, isInStock: true },
];
const twitchRoutes = (mutation, { rewards = TW_REWARDS, claim = null, challenge = false } = {}) => (url, init) => {
  if (url.endsWith('/integrity')) return { json: { token: 'tok-integridade' } };
  const q = (init.body && JSON.parse(init.body).query) || '';
  if (q.includes('communityPoints{balance')) {
    return { json: { data: { currentUser: { id: 'me1' }, user: { id: 'u1', channel: {
      self: { communityPoints: { balance: 1600, availableClaim: claim ? { id: claim } : null } },
      communityPointsSettings: { customRewards: rewards },
    } } } } };
  }
  if (challenge && !(init.headers || {})['Client-Integrity']) return { json: { extensions: { challenge: { type: 'integrity' } } } };
  return { json: mutation };
};
const isMutation = (s, nome) => s.body && new RegExp(`${nome}\\(`).test(s.body.query || '');

app.whenReady().then(async () => {
  try {
    // ---- Kick ----
    let r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(200));
    check(r.out.points === 1000 && r.out.redeemed === true && r.out.cost === 300 && r.out.cheapest === 300, 'Kick: resgata a duração mais barata (1 h)');
    const red = r.seen.find((s) => s.url.includes('/redeem'));
    check(red && red.url.includes('/rewards/r1/') && /^[0-9A-Z]{26}$/.test(red.body.transaction_id), 'Kick: transaction_id ULID (26 caracteres) e id do bônus mais barato');

    r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(200, [{ ...KICK_REWARDS[0] }, { ...KICK_REWARDS[1], is_paused: true }]));
    check(r.out.cost === 900 && r.out.cheapest === 300 && r.out.redeemed === true, 'Kick: o de 1 h pausado, vai o de 3 h (devolve cheapest)');

    r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(200, KICK_REWARDS.map((x) => ({ ...x, is_paused: true }))));
    check(r.out.paused === true && r.out.cost === 300 && !r.out.redeemed, 'Kick: tudo pausado, devolve o mais barato sem resgatar');

    r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(422));
    check(r.out.redeemed === false && r.out.status === 422, 'Kick: resgate recusado devolve o status');

    r = await runScript(kickScript({ ...KICK_ARGS, spend: false }), kickRoutes(200));
    check(!r.out.redeemed && !r.seen.some((s) => s.url.includes('/redeem')), 'Kick: sem liberação para gastar, só confere');

    r = await runScript(kickScript({ ...KICK_ARGS, refund: 300 }), kickRoutes(200));
    check(!r.out.redeemed && !r.seen.some((s) => s.url.includes('/redeem')), 'Kick: não resgata acima do limite de devolução');

    r = await runScript(kickScript({ ...KICK_ARGS, word: 'captur' }), kickRoutes(200));
    check(r.out.error === 'canal sem o bônus', 'Kick: canal sem o bônus escolhido');

    // ---- Twitch ----
    const ok = { data: { redeemCommunityPointsCustomReward: { redemption: { id: 'x' }, error: null } } };
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes(ok));
    check(r.out.redeemed === true && r.out.cost === 500 && r.out.cheapest === 500 && r.out.me === 'me1' && r.out.channelId === 'u1', 'Twitch: resgata a Captura mais barata e devolve os ids');
    const mut = r.seen.find((s) => isMutation(s, 'redeemCommunityPointsCustomReward'));
    check(mut && /^[0-9a-f]{32}$/.test(mut.body.variables.i.transactionID) && mut.body.variables.i.rewardID === 'c1', 'Twitch: transactionID de 32 hexadecimais');

    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes(ok, { rewards: [{ ...TW_REWARDS[0] }, { ...TW_REWARDS[1], cooldownExpiresAt: '2026-11-16T15:00:00Z' }] }));
    check(r.out.cost === 1500 && r.out.cheapest === 500 && r.out.redeemed === true, 'Twitch: o de 1 h em espera, vai o de 3 h');
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes(ok, { rewards: TW_REWARDS.map((x) => ({ ...x, isInStock: false })) }));
    check(r.out.paused === true && !r.out.redeemed, 'Twitch: tudo esgotado, não resgata');

    // Desafio anti-robô: pede o token de integridade e manda de novo
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes(ok, { challenge: true }));
    check(r.out.redeemed === true && r.seen.some((s) => /\/integrity$/.test(s.url)), 'Twitch: desafio anti-robô pede o token em /integrity e reenvia');
    check(r.seen.filter((s) => isMutation(s, 'redeemCommunityPointsCustomReward')).pop().headers['Client-Integrity'] === 'tok-integridade', 'Twitch: o reenvio leva o Client-Integrity');
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes({ extensions: { challenge: 'abc' }, errors: [] }));
    check(!r.out.redeemed && /anti-robô/.test(r.out.refused || ''), 'Twitch: desafio que persiste faz o resgate parar e ser registrado');

    // Recusa do site
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes({ data: { redeemCommunityPointsCustomReward: { redemption: null, error: { code: 'PROPERTIES_MISMATCH' } } } }));
    check(r.out.refused === 'PROPERTIES_MISMATCH', 'Twitch: recusa do site vem com o código do erro');

    // Baú de bônus
    const claimOk = { data: { claimCommunityPoints: { claim: { id: 'cl' }, currentPoints: 1650, error: null } } };
    r = await runScript(twitchScript({ ...TW_ARGS, word: null, claim: true }), twitchRoutes(claimOk, { claim: 'cl' }));
    check(r.out.claimed === true && r.out.points === 1650 && !r.out.redeemed, 'Twitch: pega o baú (sem bônus escolhido, só o baú)');
    r = await runScript(twitchScript({ ...TW_ARGS, word: null, claim: true, claimId: 'do-aviso' }), twitchRoutes(claimOk));
    const claimReq = r.seen.find((s) => isMutation(s, 'claimCommunityPoints'));
    check(claimReq && claimReq.body.variables.i.claimID === 'do-aviso', 'Twitch: baú do aviso vai com o id do aviso');
    r = await runScript(twitchScript({ ...TW_ARGS, word: null, claim: true }),
      twitchRoutes({ data: { claimCommunityPoints: { claim: null, currentPoints: null, error: { code: 'NOT_FOUND' } } } }, { claim: 'cl' }));
    check(r.out.claimError === 'NOT_FOUND' && !r.out.claimed, 'Twitch: baú recusado devolve o código');
    r = await runScript(twitchScript({ ...TW_ARGS, word: null, claim: false }), twitchRoutes(claimOk, { claim: 'cl' }));
    check(!r.out.claimed && !r.seen.some((s) => isMutation(s, 'claimCommunityPoints')), 'Twitch: com o baú desligado não pega');

    // Raid e momento
    r = await runScript(twitchRaidScript('https://gql.twitch.tv', 'tok', 'dev', 'raid1'), () => ({ json: { data: {} } }));
    check(r.out.joined === true && r.seen[0].body.operationName === 'JoinRaid' && r.seen[0].body.variables.input.raidID === 'raid1', 'Twitch: entra na raid');
    r = await runScript(twitchMomentScript('https://gql.twitch.tv', 'tok', 'dev', 'm1'), () => ({ json: { data: { claimCommunityMoment: { moment: { id: 'm1' } } } } }));
    check(r.out.claimed === true && r.seen[0].body.variables.i.momentID === 'm1', 'Twitch: pega o momento');

    // ---- Leituras sem a página (fetch simulado) ----
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init = {}) => {
      const resp = (String(url).includes('/gql') ? twitchRoutes({}, { claim: 'cl' }) : kickRoutes(200))(String(url), init);
      return { ok: (resp.status ?? 200) < 400, status: resp.status ?? 200, json: async () => resp.json ?? {} };
    };
    try {
      const tw = JSON.parse(await twitchReadAsync('https://gql.twitch.tv', 'tw', 'tok', 'dev', 'captura'));
      check(tw.points === 1600 && tw.cost === 500 && tw.cheapest === 500 && tw.claimId === 'cl' && tw.me === 'me1' && tw.channelId === 'u1',
        'leitura da Twitch sem a página: saldo, bônus mais barato, baú e ids');
      const kk = JSON.parse(await kickReadAsync('https://kick.com', 'canal', 'tok', 'xp'));
      check(kk.points === 1000 && kk.cost === 300 && kk.cheapest === 300 && kk.paused === false, 'leitura da Kick sem a página: saldo e bônus mais barato');
      globalThis.fetch = async () => { throw new Error('sem rede'); };
      check(JSON.parse(await kickReadAsync('https://kick.com', 'canal', 'tok', 'xp')).failed === 'sem resposta da Kick', 'leitura que falha devolve { failed }');
    } finally {
      globalThis.fetch = realFetch;
    }

    // ---- Registro em arquivo ----
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-log-'));
    const file = path.join(dir, 'resgates.log');
    const log = createRedeemLog(file);
    log.append({ acc: 1, site: 'kick', channel: 'canal', evento: 'resgatou', detalhe: 'XP\tcom tab' });
    log.append({ acc: 2, site: 'twitch', channel: 'tw', evento: 'recusado', detalhe: 'erro 422' });
    const lidos = log.read();
    check(lidos.length === 2 && lidos[0].evento === 'recusado' && lidos[1].evento === 'resgatou', 'registro: mais recentes primeiro');
    check(lidos[1].detalhe === 'XP com tab' && lidos[1].acc === '1' && lidos[1].site === 'kick', 'registro: tab no texto vira espaço, campos separados');
    check(/^\d{4}-\d{2}-\d{2}T/.test(lidos[0].t), 'registro: hora em ISO');
    for (let i = 0; i < KEEP * 1.5 + 10; i++) log.append({ acc: 1, site: 'kick', channel: 'c', evento: 'erro', detalhe: `n${i}` });
    const todos = log.read(100000);
    check(todos.length <= KEEP + Math.ceil(KEEP / 2) && todos.length >= KEEP, `registro: limitado às últimas linhas (${todos.length})`);
    check(todos[0].detalhe === `n${KEEP * 1.5 + 9}`, 'registro: a linha mais nova continua no topo depois de aparar');
    const novo = createRedeemLog(file);
    check(novo.read(1)[0].detalhe === todos[0].detalhe, 'registro: relê o arquivo ao reabrir o app');
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
