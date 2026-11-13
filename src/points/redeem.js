// Resgate automático (opcional, desligado por padrão) dos bônus do PokeIdle com os pontos de cada canal ao vivo.
// Módulo puro: não usa Electron. Quem executa a conferência de verdade é `check` (ver points/panel.js), o que deixa
// esta lógica testável com relógio e conferência falsos.
//
// Regras:
//  - por conta e por site, só com o bônus escolhido (config.auto[conta][site]);
//  - cada canal é conferido a cada `intervalMs` do site (Kick 5 min, Twitch 2 min); no máximo 1 resgate por canal;
//  - resgate recusado: espera 30 min para tentar de novo naquele canal;
//  - se os pontos voltarem logo depois de um resgate (site não vinculado no jogo), ou se zerarem sem resgate, para
//    o resgate daquela conta e site e avisa; `restart()` (ao salvar a configuração) volta a resgatar.

const { BONUSES, SITES } = require('./sites');

const RETRY_MS = 30 * 60 * 1000;
const REFUND_WINDOW_MS = 30 * 60 * 1000;
const TICK_MS = 30 * 1000;

function createRedeemer({
  getAuto, // () => { [conta]: { kick?: 'xp'|'captura'|'shiny'|'', twitch?: ... } }
  getLives, // () => [{ acc, site, channel, nome }] dos canais ao vivo agora
  check, // async ({ acc, site, channel, word, spend, refund }) => resultado do script (ver scripts.js)
  log = () => {}, // (entrada) => registra no log de resgates
  notify = () => {}, // ({ kind, title, text }) => aviso na tela
  now = () => Date.now(),
}) {
  const chans = new Map(); // `${acc}|${site}|${canal}` -> estado do canal
  const stopped = new Map(); // `${acc}|${site}` -> motivo da parada
  let timer = null;
  let busy = false;

  const accKey = (acc, site) => `${acc}|${site}`;

  function stop(acc, site, channel, reason) {
    stopped.set(accKey(acc, site), reason);
    log({ acc, site, channel, evento: 'parou', detalhe: reason });
    notify({ kind: 'fail', title: `Resgate parado: conta ${acc} (${SITES[site].label})`, text: reason });
  }

  async function checkOne(entry, bonusKey, c) {
    const { acc, site, channel } = entry;
    const B = BONUSES[bonusKey];
    const t = now();
    const spend = !(c.retryAt && t < c.retryAt);
    const refund = c.redeemedAt && t - c.redeemedAt < REFUND_WINDOW_MS ? c.pointsAfter + Math.floor(c.lastCost / 2) : null;

    let res;
    try {
      res = (await check({ acc, site, channel, word: B.word, spend, refund })) || {};
    } catch (err) {
      res = { error: String((err && err.message) || err) };
    }

    if (res.error) {
      if (res.error !== c.lastError) log({ acc, site, channel, evento: 'erro', detalhe: res.error });
      c.lastError = res.error;
      c.text = res.error;
      if (typeof res.points !== 'number') return;
    }
    if (!res.error) c.lastError = null;

    const balance = res.points;
    if (typeof balance !== 'number') return;

    if (refund !== null && balance >= refund && !res.redeemed) {
      c.text = `${balance} pontos`;
      stop(acc, site, channel, `os pontos voltaram (saldo ${balance}); vincule ${SITES[site].label} no jogo e salve a configuração de novo`);
      return;
    }
    if (balance === 0 && c.points > 0 && !res.redeemed) {
      stop(acc, site, channel, 'os pontos zeraram sem resgate; conferir a conta. Salve a configuração para voltar a resgatar');
      return;
    }

    c.points = balance;
    if (typeof res.cost === 'number') c.cost = res.cost;
    if (res.redeemed) {
      c.lastCost = res.cost;
      c.redeemedAt = t;
      c.pointsAfter = balance - res.cost;
      c.points = c.pointsAfter;
      log({ acc, site, channel, evento: 'resgatou', detalhe: `${res.title} (${res.cost} pontos; sobraram ${c.pointsAfter})` });
      notify({ kind: 'ok', title: `Conta ${acc}: resgatou ${B.label} em ${channel}`, text: `${res.cost} pontos (${SITES[site].label})` });
    } else if (res.refused || (typeof res.status === 'number' && res.status >= 400)) {
      const motivo = res.refused ?? `erro ${res.status}`;
      c.retryAt = t + RETRY_MS;
      log({ acc, site, channel, evento: 'recusado', detalhe: `${res.title ?? B.label} recusado (${motivo}; saldo ${balance}); tento de novo em 30 min` });
    }
    c.text = `${c.points}${c.cost ? `/${c.cost}` : ''} pontos${c.redeemedAt ? `, resgatou ${new Date(c.redeemedAt).toLocaleTimeString('pt-BR')}` : ''}`;
  }

  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const auto = getAuto() || {};
      for (const entry of getLives() || []) {
        const bonusKey = auto[entry.acc]?.[entry.site];
        if (!bonusKey || !BONUSES[bonusKey] || !SITES[entry.site]) continue;
        if (stopped.has(accKey(entry.acc, entry.site))) continue;
        const key = `${accKey(entry.acc, entry.site)}|${entry.channel}`;
        const c = chans.get(key) ?? {};
        chans.set(key, c);
        if (c.nextDue && now() < c.nextDue) continue;
        c.nextDue = now() + SITES[entry.site].intervalMs;
        await checkOne(entry, bonusKey, c);
      }
    } finally {
      busy = false;
    }
  }

  return {
    tick,
    start() {
      if (!timer) timer = setInterval(() => { tick().catch(() => {}); }, TICK_MS);
      tick().catch(() => {});
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
    // Volta a resgatar do zero (ao salvar a configuração)
    restart() {
      stopped.clear();
      chans.clear();
    },
    stoppedReason: (acc, site) => stopped.get(accKey(acc, site)) ?? null,
    // Texto do saldo/último resgate de um canal (para o painel)
    text: (acc, site, channel) => chans.get(`${accKey(acc, site)}|${channel}`)?.text ?? '',
  };
}

module.exports = { createRedeemer, RETRY_MS, REFUND_WINDOW_MS, TICK_MS };
