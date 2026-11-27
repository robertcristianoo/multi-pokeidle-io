// Redeem price optimizer for the live channel lists. Some channels raise the price of the cheap bonus or remove it on purpose,
// which forces an account to watch more hours for fewer redeemed bonuses. This module maps what each channel charges and ranks the
// channels so the cheapest ones come first and the ones with the cheap bonus disabled or more expensive come last.
// Pure module (no Electron, no network): the manager does the reads and hands the raw JSON here.
const { BONUSES, baseCost } = require('../points/sites');

// Rank tiers, best first: a channel at or below the standard price, a channel that could not be read (neutral), a channel that
// charges more than the standard price, and a channel without the bonus at all (minimum priority).
const TIER = { cheap: 0, unknown: 1, raised: 2, missing: 3 };

const isInt = (v) => Number.isInteger(v);

/**
 * Maps one channel read (the JSON of kickReadAsync/twitchReadAsync, made with every bonus key) to the price of each bonus in
 * `keys`: { key: { cost, baseline, ratio } | null } (null: the channel has no enabled bonus of that kind). Returns null when the
 * read has no usable answer (failed, no points, bad JSON), so the channel stays neutral.
 */
function pricesOf(read, keys, site = 'twitch') {
  let root;
  try { root = JSON.parse(read); } catch { return null; }
  if (!root || typeof root !== 'object' || 'failed' in root || !isInt(root.points)) return null;
  const options = Array.isArray(root.options) ? root.options : [];
  const out = {};
  for (const key of keys) {
    const o = options.find((x) => x.key === key);
    // `cheapest` is the lowest enabled price among the durations, even when it is paused right now (a pause is temporary)
    const cost = o ? (isInt(o.cheapest) ? o.cheapest : o.cost) : null;
    out[key] = isInt(cost) ? { cost, baseline: baseCost(key, site), ratio: cost / baseCost(key, site) } : null;
  }
  return out;
}

/** The tier and score of a channel from its prices (null prices: unknown). Lower score is better inside a tier. */
function scoreOf(prices, keys) {
  if (!prices || !keys.length) return { tier: TIER.unknown, score: 0, missing: 0 };
  const missing = keys.filter((k) => !prices[k]).length;
  if (missing) return { tier: TIER.missing, score: missing, missing };
  const score = keys.reduce((s, k) => s + prices[k].ratio, 0) / keys.length;
  return { tier: score > 1 ? TIER.raised : TIER.cheap, score, missing: 0 };
}

/**
 * Ranks `channels` (current priority order) by price: cheapest first, then unknown, then raised, then the ones without the bonus.
 * `reads` = { channel: raw read JSON | null }; `keys` = the bonus keys that matter (empty: all of them).
 * Returns { order, rows } where each row = { channel, tier, score, prices, rank } in the new order.
 */
function rank(channels, reads, keys = [], site = 'twitch') {
  const wanted = keys.filter((k, i) => BONUSES[k] && keys.indexOf(k) === i);
  const use = wanted.length ? wanted : Object.keys(BONUSES);
  const rows = channels.map((channel, index) => {
    const prices = reads?.[channel] == null ? null : pricesOf(reads[channel], use, site);
    return { channel, index, prices, ...scoreOf(prices, use) };
  });
  // Array.prototype.sort is stable, but the index tiebreak keeps the old priority explicit
  rows.sort((a, b) => a.tier - b.tier || a.score - b.score || a.index - b.index);
  return { order: rows.map((r) => r.channel), rows: rows.map(({ index: _i, ...r }, i) => ({ ...r, rank: i + 1 })), keys: use };
}

module.exports = { rank, pricesOf, scoreOf, TIER };
