// Resgate automático (src/points/redeem.js): desligado por padrão, cadência por site, um resgate por canal,
// recusa com espera de 30 min, parada quando os pontos voltam ou zeram, e religar ao salvar a configuração.
const { app, check, finish } = require('./helpers');
const { createRedeemer, RETRY_MS } = require('../src/points/redeem');

const MIN = 60 * 1000;
app.whenReady().then(() => {
  try {
    let t = 1_000_000;
    const now = () => t;
    const calls = [];
    const logs = [];
    const notes = [];
    let results = [];
    let auto = {};
    let lives = [];
    const r = createRedeemer({
      getAuto: () => auto,
      getLives: () => lives,
      check: async (args) => { calls.push(args); return results.shift() ?? { points: 0 }; },
      log: (e) => logs.push(e),
      notify: (n) => notes.push(n),
      now,
    });
    const kickLive = [{ acc: 1, site: 'kick', channel: 'canal', nome: 'Canal' }];

    // desligado por padrão: sem configuração, nada é conferido
    lives = kickLive;
    r.tick().then(async () => {
      check(calls.length === 0, 'sem configuração, nenhuma conferência (desligado de fábrica)');

      // liga Kick/XP na conta 1: confere, resgata e registra
      auto = { 1: { kick: 'xp' } };
      results = [{ points: 350, cost: 300, title: 'Bônus +15% XP PokeIdle', redeemed: true, status: 200 }];
      await r.tick();
      check(calls.length === 1 && calls[0].word === '\\bxp\\b' && calls[0].spend === true, 'confere com a palavra do XP e pode gastar');
      check(logs.some((e) => e.evento === 'resgatou' && /sobraram 50/.test(e.detalhe)), 'registra o resgate com o saldo que sobrou');
      check(notes.some((n) => n.kind === 'ok'), 'avisa o resgate na tela');

      // dentro dos 5 min da Kick: não confere de novo
      t += 4 * MIN;
      results = [{ points: 60 }];
      await r.tick();
      check(calls.length === 1, 'Kick: não confere antes de 5 min');

      // depois de 5 min, o saldo voltou ao nível de antes do resgate: os pontos foram devolvidos -> para e avisa
      t += 1 * MIN + 1;
      const antes = calls.length;
      results = [{ points: 210 }];
      await r.tick();
      check(calls.length === antes + 1 && calls.at(-1).refund === 200, 'confere com o limite de devolução (saldo + metade do custo)');
      check(logs.some((e) => e.evento === 'parou' && /voltaram/.test(e.detalhe)), 'parou porque os pontos voltaram, e registrou');
      check(r.stoppedReason(1, 'kick') !== null, 'a conta/site fica parada');
      t += 10 * MIN;
      await r.tick();
      check(calls.length === antes + 1, 'parada: não confere mais nesta conta/site');

      // salvar a configuração de novo religa
      r.restart();
      results = [{ points: 100 }];
      await r.tick();
      check(r.stoppedReason(1, 'kick') === null && calls.length === antes + 2, 'restart() religa a conta');

      // recusa: espera 30 min para tentar de novo naquele canal
      r.restart();
      t += 10 * MIN;
      results = [{ points: 400, cost: 300, title: 'Bônus +15% XP PokeIdle', refused: 'erro 422' }];
      await r.tick();
      check(logs.some((e) => e.evento === 'recusado' && /erro 422/.test(e.detalhe)), 'registra a recusa');
      t += 5 * MIN + 1;
      results = [{ points: 400, cost: 300 }];
      await r.tick();
      check(calls.at(-1).spend === false, 'recusado: não gasta nos 30 min seguintes');
      t += RETRY_MS;
      results = [{ points: 400, cost: 300 }];
      await r.tick();
      check(calls.at(-1).spend === true, 'depois de 30 min volta a tentar');

      // pontos zerados sem resgate: para e avisa
      r.restart();
      t += 10 * MIN;
      results = [{ points: 150 }];
      await r.tick();
      t += 6 * MIN;
      results = [{ points: 0 }];
      await r.tick();
      check(logs.some((e) => e.evento === 'parou' && /zeraram/.test(e.detalhe)), 'pontos zeraram sem resgate: para e registra');

      // Twitch confere a cada 2 min
      r.restart();
      t += 10 * MIN;
      auto = { 1: { twitch: 'captura' } };
      lives = [{ acc: 1, site: 'twitch', channel: 'tw', nome: 'TW' }];
      results = [{ points: 10 }];
      await r.tick();
      const n0 = calls.length;
      t += 2 * MIN - 1;
      await r.tick();
      check(calls.length === n0, 'Twitch: ainda não passaram 2 min');
      t += 2;
      results = [{ points: 10 }];
      await r.tick();
      check(calls.length === n0 + 1 && calls.at(-1).word === 'captur', 'Twitch: confere depois de 2 min, com a palavra da Captura');

      // erro de conferência: registra uma vez, não repete o registro a cada volta
      r.restart();
      auto = { 1: { kick: 'shiny' } };
      lives = kickLive;
      t += 10 * MIN;
      const erros0 = logs.filter((e) => e.evento === 'erro').length;
      const boom = async () => { throw new Error('sem internet'); };
      const r2 = createRedeemer({ getAuto: () => auto, getLives: () => lives, check: boom, log: (e) => logs.push(e), now });
      await r2.tick();
      t += 10 * MIN;
      await r2.tick();
      check(logs.filter((e) => e.evento === 'erro').length === erros0 + 1, 'erro repetido é registrado uma vez só');

      // Sem bônus escolhido (ou com bônus inválido) a conta não é conferida
      r.restart();
      const antesSemBonus = calls.length;
      auto = { 1: { kick: 'bogus' } };
      t += 10 * MIN;
      await r.tick();
      check(calls.length === antesSemBonus, 'bônus inválido na configuração é ignorado');

      finish();
    }).catch((err) => {
      check(false, `erro inesperado: ${err.stack || err}`);
      finish();
    });
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
    finish();
  }
});
