// Configuração das lives (Lives → Config…): canais da Twitch e da Kick em ordem de prioridade, quantas lives abrir por
// conta, quais contas mantêm lives, o bônus que cada conta resgata sozinha em cada site, o baú da Twitch e a guarda do
// bônus. Módulo puro: só normaliza e valida o que vem do config.json (ou da janela de configuração).
const { BONUSES } = require('../points/sites');

const MAX_SLOTS = 10; // teto de lives abertas por conta e site
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
  const legacy = (site) => perAccount(legacyAuto, maxAccounts, (v) => rewardKey(v?.[site]));
  const twitchLives = clamp(int(r.twitchLives, DEFAULT_SLOTS), 0, MAX_SLOTS);
  const kickLives = clamp(int(r.kickLives, DEFAULT_SLOTS), 0, MAX_SLOTS);
  const accounts = Array.isArray(r.accounts)
    ? [...new Set(r.accounts.map(Number).filter((a) => Number.isInteger(a) && a >= 1 && a <= maxAccounts))].sort((a, b) => a - b)
    : [1];
  const guardRaw = perAccount(r.guard, maxAccounts, (v) => (typeof v === 'boolean' ? v : undefined));
  const guard = {};
  for (let a = 1; a <= maxAccounts; a++) guard[a] = guardRaw[a] ?? true; // de fábrica ligada em todas
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
    redeemTwitch: r.redeemTwitch === undefined ? legacy('twitch') : perAccount(r.redeemTwitch, maxAccounts, rewardKey),
    redeemKick: r.redeemKick === undefined ? legacy('kick') : perAccount(r.redeemKick, maxAccounts, rewardKey),
    claimTwitch: r.claimTwitch !== false, // o baú de bônus da Twitch (+50 a cada ~15 min): de fábrica ligado
    guard,
    twitch: lim('twitch', twitchLives),
    kick: lim('kick', kickLives),
  };
}

const slotsOf = (lim, max) => clamp(lim.slots ?? max, 0, max);

module.exports = { normalize, parseChannels, slotsOf, MAX_SLOTS, DEFAULT_SLOTS, DEFAULT_TWITCH, DEFAULT_KICK };
