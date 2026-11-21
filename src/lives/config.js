// Configuração das lives (janela Config das lives): canais da Twitch e da Kick em ordem de prioridade, quantas lives abrir por
// conta, quais contas mantêm lives, o bônus que cada conta resgata sozinha em cada site, o baú da Twitch e a guarda do
// bônus. Módulo puro: só normaliza e valida o que vem do config.json (ou da janela de configuração).
const { BONUSES } = require('../points/sites');

const MAX_SLOTS = 10; // teto de lives abertas por conta e site
const MAX_HOURS = 720; // teto do limite de horas acumuladas do bônus (30 dias)
const DEFAULT_SLOTS = 2; // a Twitch e a Kick só contam 2 lives ao mesmo tempo

// Os streamers oficiais do painel de bônus do jogo, na ordem de prioridade (a primeira da lista tem prioridade).
const DEFAULT_TWITCH = [
  'tftoddy', 'clovaobengala', 'axtlol', 'patopapao', 'matta', 'guaxilol1', 'rodil',
  'cogu', 'luccatv', 'faasii', 'biscoitao', 'techzz', 'dersin2k', 'denissnidertv',
];
const DEFAULT_KICK = ['biscoitao', 'yetz', 'surskity'];

// Aceita um canal por linha (ou separado por vírgula/espaço) e também o endereço colado inteiro (https://kick.com/yetz → yetz).
function parseChannels(input) {
  const raw = Array.isArray(input) ? input.join('\n') : String(input ?? '');
  const out = [];
  for (const part of raw.split(/[\r\n, ]+/)) {
    let c = part.trim().replace(/\/+$/, '');
    c = c.slice(c.lastIndexOf('/') + 1).replace(/^@/, '').toLowerCase();
    if (/^[a-z0-9_]{1,40}$/.test(c) && !out.includes(c)) out.push(c);
  }
  return out;
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const int = (v, fallback) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.round(Number(v)) : fallback);

// Mapa { conta: valor } com só as contas 1..max; `pick` valida/normaliza cada valor (undefined descarta).
function perAccount(raw, max, pick) {
  const out = {};
  for (const [k, v] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
    const id = Number(k);
    if (!Number.isInteger(id) || id < 1 || id > max) continue;
    const val = pick(v);
    if (val !== undefined) out[id] = val;
  }
  return out;
}

const rewardKey = (v) => (typeof v === 'string' && BONUSES[v] ? v : undefined);

// Os bônus escolhidos de uma conta num site, na ordem de prioridade (o primeiro que o saldo cobrir é o resgatado). Aceita a
// lista nova, um bônus só (texto, como era salvo antes) ou nada; chave inválida e repetida caem fora.
const rewardList = (v) => {
  const arr = Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
  const out = [];
  for (const k of arr) if (rewardKey(k) && !out.includes(k)) out.push(k);
  return out;
};
const rewardsPick = (v) => { const list = rewardList(v); return list.length ? list : undefined; };

// O que o botão da conta fechou em cada site: quantas vagas (null = o limite geral) e os canais fechados.
function limit(raw, max) {
  const closed = parseChannels(raw?.closed);
  let slots = raw && raw.slots !== null && raw.slots !== undefined ? int(raw.slots, null) : null;
  if (slots !== null) slots = slots >= max ? null : Math.max(0, slots);
  return { slots, closed };
}

// `legacyAuto`: o resgate de antes ({ conta: { kick, twitch } }), lido uma vez enquanto não há escolha nova.
function normalize(raw, { maxAccounts = 4, legacyAuto = null } = {}) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const legacy = (site) => perAccount(legacyAuto, maxAccounts, (v) => rewardsPick(v?.[site]));
  const twitchLives = clamp(int(r.twitchLives, DEFAULT_SLOTS), 0, MAX_SLOTS);
  const kickLives = clamp(int(r.kickLives, DEFAULT_SLOTS), 0, MAX_SLOTS);
  const accounts = Array.isArray(r.accounts)
    ? [...new Set(r.accounts.map(Number).filter((a) => Number.isInteger(a) && a >= 1 && a <= maxAccounts))].sort((a, b) => a - b)
    : [1];
  const guardRaw = perAccount(r.guard, maxAccounts, (v) => (typeof v === 'boolean' ? v : undefined));
  const guard = {};
  for (let a = 1; a <= maxAccounts; a++) guard[a] = guardRaw[a] ?? true; // de fábrica ligada em todas
  // Combo por conta: marcado, os bônus escolhidos só resgatam juntos (tudo ou nada); desmarcado, resgata o que o saldo cobrir.
  const comboRaw = perAccount(r.comboAll, maxAccounts, (v) => (typeof v === 'boolean' ? v : undefined));
  // Limite de horas de bônus acumuladas por conta (0 = sem limite): com o bônus do jogo nesse tempo ou mais, não resgata mais.
  const hoursRaw = perAccount(r.maxHours, maxAccounts, (v) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? clamp(Math.round(Number(v)), 0, MAX_HOURS) : undefined));
  const comboAll = {};
  const maxHours = {};
  for (let a = 1; a <= maxAccounts; a++) {
    comboAll[a] = comboRaw[a] ?? false;
    maxHours[a] = hoursRaw[a] ?? 0;
  }
  const lim = (site, max) => {
    const o = perAccount(r[site], maxAccounts, (v) => limit(v, max));
    const full = {};
    for (let a = 1; a <= maxAccounts; a++) full[a] = o[a] ?? { slots: null, closed: [] };
    return full;
  };
  return {
    accounts,
    twitchChannels: r.twitchChannels === undefined ? [...DEFAULT_TWITCH] : parseChannels(r.twitchChannels),
    kickChannels: r.kickChannels === undefined ? [...DEFAULT_KICK] : parseChannels(r.kickChannels),
    twitchLives,
    kickLives,
    redeemTwitch: r.redeemTwitch === undefined ? legacy('twitch') : perAccount(r.redeemTwitch, maxAccounts, rewardsPick),
    redeemKick: r.redeemKick === undefined ? legacy('kick') : perAccount(r.redeemKick, maxAccounts, rewardsPick),
    autoSort: r.autoSort === true, // mantém a lista ordenada por status (no ar primeiro): de fábrica desligado
    claimTwitch: r.claimTwitch !== false, // o baú de bônus da Twitch (+50 a cada ~15 min): de fábrica ligado
    guard,
    comboAll,
    maxHours,
    twitch: lim('twitch', twitchLives),
    kick: lim('kick', kickLives),
  };
}

// Junta à lista do usuário os canais oficiais que faltam, no fim (a ordem escolhida não muda). `official` = [{ login, live }]
// como o jogo informa (no ar e offline). Devolve a lista nova e os canais acrescentados.
function mergeOfficial(current, official) {
  const list = parseChannels(current);
  const added = [];
  for (const o of Array.isArray(official) ? official : []) {
    const [c] = parseChannels(o?.login);
    if (c && !list.includes(c)) { list.push(c); added.push(c); }
  }
  return { list, added };
}

// Move o canal `from` para a posição `to` (arrastar e soltar); índices fora da lista não mudam nada.
function move(list, from, to) {
  const out = [...list];
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from >= out.length || to < 0 || to >= out.length) return out;
  out.splice(to, 0, out.splice(from, 1)[0]);
  return out;
}

// Ordena por status sem mexer na prioridade dentro de cada grupo: os no ar primeiro, os offline depois. `live` = { canal: true |
// false | null } (agora) e `was` = o mesmo da conferência anterior. Quem acabou de ficar no ar vai para o fim dos no ar (não tira
// o lugar de quem já está aberto) e quem acabou de cair vai para o começo dos offline (logo abaixo dos no ar). Canal sem resposta
// (null) conta como estava antes; sem histórico, como offline.
function sortByStatus(list, live, was = {}) {
  const state = (c) => (typeof live?.[c] === 'boolean' ? live[c] : typeof was?.[c] === 'boolean' ? was[c] : false);
  const on = list.filter((c) => state(c));
  const off = list.filter((c) => !state(c));
  const stay = (c, wasOn) => wasOn === undefined || wasOn === null || wasOn === state(c);
  const isNew = (c) => !stay(c, was?.[c]);
  return [...on.filter((c) => !isNew(c)), ...on.filter(isNew), ...off.filter(isNew), ...off.filter((c) => !isNew(c))];
}

const slotsOf = (lim, max) => clamp(lim.slots ?? max, 0, max);

module.exports = { normalize, parseChannels, rewardList, mergeOfficial, move, sortByStatus, slotsOf, MAX_SLOTS, DEFAULT_SLOTS, DEFAULT_TWITCH, DEFAULT_KICK };
