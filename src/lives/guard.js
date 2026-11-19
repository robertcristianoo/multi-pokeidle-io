// A guarda do bônus (Config das lives, por conta): o resgate automático só usa os pontos das lives abertas, e quando os
// streamers delas saem do ar o bônus vence com pontos parados em outros canais. Com o bônus escolhido da conta num site
// vencendo em menos de THRESHOLD_MS (ou vencido), a guarda lê o saldo dos canais da lista e dos oficiais do jogo que não
// estão abertos na conta, escolhe um com os pontos (offline primeiro: os pontos dele estão parados; depois o de mais
// pontos), e o gerenciador resgata 1 ali. Depois confere no jogo se o tempo do bônus subiu. Aqui fica só o estado e a
// escolha; o resgate (numa página escondida do canal) é do gerenciador. Módulo puro.
const { BONUSES } = require('../points/sites');
const { t: tl } = require('../i18n');

const THRESHOLD_MS = 30 * 60 * 1000; // a partir de quanto falta para vencer a guarda age
const READ_FOR_MS = 30 * 60 * 1000; // quanto vale a leitura do saldo de um canal
const CONFIRM_WITHIN_MS = 5 * 60 * 1000; // depois do resgate, até quando o jogo tem para mostrar o tempo a mais

// O nome do bônus no jogo ("xp", "captura", "shiny") é a própria chave do resgate.
const kind = (rewardKey) => rewardKey;
const kindName = (rewardKey) => (['xp', 'captura', 'shiny'].includes(rewardKey) ? tl(`lives.kind.${rewardKey}`) : BONUSES[rewardKey]?.label ?? rewardKey);

// "35 min", "2 h 10 min"
function time(secs) {
  return secs >= 3600 ? `${Math.floor(secs / 3600)} h ${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')} min` : `${Math.max(1, Math.floor(secs / 60))} min`;
}

function createGuard({ now = () => Date.now() } = {}) {
  const slots = new Map(); // `${conta}|${site}` -> estado

  // O estado da guarda numa conta, num site e num bônus (cada bônus vence no seu tempo, então cada um tem o seu estado).
  function slotOf(acc, site, reward = '') {
    const key = `${acc}|${site}|${reward}`;
    if (!slots.has(key)) {
      slots.set(key, {
        busy: false,
        holdUntil: 0,
        redeemedAt: null, // o último resgate da guarda, ainda sem o jogo mostrar o tempo a mais
        leftBefore: 0, // quanto faltava antes dele
        noneNoted: false, // já disse no registro que nenhum canal tinha os pontos (volta quando o bônus sobe)
        reads: new Map(), // canal (minúsculo) -> { at, points, cost, paused }
      });
    }
    return slots.get(key);
  }

  // Os canais onde a guarda pode resgatar: os da lista e os oficiais do jogo, sem os abertos agora na conta (neles quem
  // resgata é o resgate automático).
  function candidates(configured, site, open) {
    const skip = new Set([...open].map((c) => c.toLowerCase()));
    const all = [...configured, ...(site.channels ?? []).map((c) => c.login)].map((c) => String(c).toLowerCase());
    return [...new Set(all)].filter((c) => c.length > 0 && !skip.has(c));
  }

  // Precisa ler o canal de novo (sem leitura, ou mais velha que READ_FOR_MS).
  const stale = (slot, channel) => {
    const read = slot.reads.get(channel.toLowerCase());
    return !read || now() - read.at > READ_FOR_MS;
  };

  // Guarda a leitura de um canal (o JSON das leituras sem a página: points, cost, paused).
  function remember(slot, channel, json) {
    let points = null;
    let cost = null;
    let paused = false;
    try {
      const o = JSON.parse(json);
      points = Number.isInteger(o.points) ? o.points : null;
      cost = Number.isInteger(o.cost) ? o.cost : null;
      paused = o.paused === true;
    } catch {
      // fica sem saldo: não entra na escolha
    }
    slot.reads.set(channel.toLowerCase(), { at: now(), points, cost, paused });
  }

  // O canal para resgatar: com saldo para o bônus (o mais barato liberado) e o bônus não pausado; offline antes (os
  // pontos dele estão parados), depois o de mais pontos. null: nenhum tem.
  function pick(slot, cands, site) {
    const live = new Set((site.channels ?? []).filter((c) => c.live).map((c) => String(c.login).toLowerCase()));
    return cands
      .map((c) => ({ channel: c, read: slot.reads.get(c.toLowerCase()) }))
      .filter(({ read }) => read && Number.isInteger(read.points) && Number.isInteger(read.cost) && !read.paused && read.points >= read.cost)
      .map(({ channel, read }) => ({ channel, points: read.points, cost: read.cost, live: live.has(channel.toLowerCase()) }))
      .sort((a, b) => Number(a.live) - Number(b.live) || b.points - a.points)[0] ?? null;
  }

  return {
    slotOf,
    candidates,
    stale,
    remember,
    pick,
    restart: () => slots.clear(), // recomeça do zero (ao salvar a configuração)
    THRESHOLD_MS,
    CONFIRM_WITHIN_MS,
  };
}

module.exports = { createGuard, kind, kindName, time, THRESHOLD_MS, READ_FOR_MS, CONFIRM_WITHIN_MS };
