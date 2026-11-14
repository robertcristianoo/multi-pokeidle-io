// Scripts de conferência e resgate (src/points/scripts.js), rodados contra um fetch simulado, e o registro dos
// resgates (src/points/log.js) gravado numa pasta temporária.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, check, finish } = require('./helpers');
const { kickScript, twitchScript } = require('../src/points/scripts');
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
const kickRoutes = (redeemStatus) => (url) => {
  if (url.endsWith('/points')) return { json: { data: { points: 350 } } };
  if (url.endsWith('/rewards')) return { json: { data: [{ id: 'r1', title: 'Bônus +15% XP PokeIdle', cost: 300, is_enabled: true, description: 'PokeIdle' }] } };
  if (url.includes('/redeem')) return { status: redeemStatus, json: {} };
  return { status: 404 };
};

const TW_ARGS = { api: 'https://gql.twitch.tv', channel: 'tw', token: 'tok', device: 'dev', clientId: 'cid', word: 'captur', spend: true, refund: null };
const twitchRoutes = (mutation) => (url, init) => {
  const q = JSON.parse(init.body).query;
  if (q.includes('communityPoints')) {
    return { json: { data: { user: { id: 'u1', channel: {
      self: { communityPoints: { balance: 600 } },
      communityPointsSettings: { customRewards: [{ id: 'c1', title: 'Bônus de +15% Capture Boost PokeIdle', prompt: 'PokeIdle', cost: 500, isEnabled: true, isPaused: false, isInStock: true }] },
    } } } } };
  }
  return { json: mutation };
};

app.whenReady().then(async () => {
  try {
    // ---- Kick ----
    let r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(200));
    check(r.out.points === 350 && r.out.redeemed === true && r.out.cost === 300, 'Kick: resgata o XP com saldo suficiente');
    const red = r.seen.find((s) => s.url.includes('/redeem'));
    check(red && /^[0-9A-Z]{26}$/.test(red.body.transaction_id), 'Kick: transaction_id no formato ULID (26 caracteres)');

    r = await runScript(kickScript({ ...KICK_ARGS }), kickRoutes(422));
    check(r.out.redeemed === false && r.out.status === 422, 'Kick: resgate recusado devolve o status');

    r = await runScript(kickScript({ ...KICK_ARGS, spend: false }), kickRoutes(200));
    check(!r.out.redeemed && !r.seen.some((s) => s.url.includes('/redeem')), 'Kick: sem liberação para gastar, só confere');

    r = await runScript(kickScript({ ...KICK_ARGS, refund: 300 }), kickRoutes(200));
    check(!r.out.redeemed && !r.seen.some((s) => s.url.includes('/redeem')), 'Kick: não resgata acima do limite de devolução');

    r = await runScript(kickScript({ ...KICK_ARGS, word: 'captur' }), kickRoutes(200));
    check(r.out.error === 'canal sem o bônus', 'Kick: canal sem o bônus escolhido');

    // ---- Twitch ----
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes({ data: { redeemCommunityPointsCustomReward: { redemption: { id: 'x' }, error: null } } }));
    check(r.out.redeemed === true && r.out.cost === 500, 'Twitch: resgata a Captura com saldo suficiente');
    const mut = r.seen.find((s) => s.body && /redeemCommunityPointsCustomReward/.test(s.body.query));
    check(mut && /^[0-9a-f]{32}$/.test(mut.body.variables.i.transactionID), 'Twitch: transactionID de 32 hexadecimais');

    // Desafio anti-robô: o script para, não pede token de integridade nem tenta de novo
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes({ extensions: { challenge: 'abc' }, errors: [] }));
    check(!r.out.redeemed && /anti-robô/.test(r.out.refused || ''), 'Twitch: desafio anti-robô faz o resgate parar e ser registrado');
    check(!r.seen.some((s) => /integrity/i.test(s.url)), 'Twitch: nunca pede token de integridade');

    // Recusa do site
    r = await runScript(twitchScript({ ...TW_ARGS }), twitchRoutes({ data: { redeemCommunityPointsCustomReward: { redemption: null, error: { code: 'PROPERTIES_MISMATCH' } } } }));
    check(r.out.refused === 'PROPERTIES_MISMATCH', 'Twitch: recusa do site vem com o código do erro');

    // Nenhum script toca no baú de bônus (claimCommunityPoints)
    const fontes = kickScript({ ...KICK_ARGS }) + twitchScript({ ...TW_ARGS });
    check(!/claimCommunityPoints|claimID|availableClaim|\/integrity|Client-Integrity/i.test(fontes), 'os scripts não têm baú nem pedido de token de integridade');

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
