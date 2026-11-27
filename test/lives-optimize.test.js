// Redeem price optimizer (src/lives/optimize.js): channels that charge the standard price or less come first (cheapest first),
// unread channels stay in the middle, channels that raised the price go next and channels without the cheap bonus go last.
const { app, check, finish } = require('./helpers');
const { rank, pricesOf, scoreOf, TIER } = require('../src/lives/optimize');

const J = JSON.stringify;
const opt = (key, cheapest) => ({ key, cost: cheapest, cheapest, title: key, paused: false });
const read = (options, points = 100) => J({ points, options });

app.whenReady().then(() => {
  try {
    const all = ['xp', 'captura', 'shiny'];

    // ---- pricesOf ----
    const p = pricesOf(read([opt('xp', 150), opt('captura', 500)]), all);
    check(p.xp.cost === 150 && p.xp.ratio === 0.5, 'pricesOf: the ratio is the price over the standard one');
    check(p.shiny === null, 'pricesOf: a bonus the channel does not offer is null');
    check(pricesOf('not json', all) === null && pricesOf(J({ failed: 'x' }), all) === null && pricesOf(J({ error: 'x' }), all) === null, 'pricesOf: an unusable read gives null');
    const paused = pricesOf(J({ points: 1, options: [{ key: 'xp', cost: 900, cheapest: 300, paused: true }] }), ['xp']);
    check(paused.xp.cost === 300, 'pricesOf: uses the cheapest enabled price even when it is paused right now');

    // Kick's standard XP price is 200: 200 is standard there, but 300 is raised
    const k200 = rank(['a', 'b'], { a: read([opt('xp', 300)]), b: read([opt('xp', 200)]) }, ['xp'], 'kick');
    check(k200.order.join() === 'b,a' && k200.rows[0].tier === TIER.cheap && k200.rows[1].tier === TIER.raised, 'rank: Kick standard XP price is 200');
    check(rank(['a'], { a: read([opt('xp', 300)]) }, ['xp'], 'twitch').rows[0].tier === TIER.cheap, 'rank: Twitch standard XP price is 300');

    // ---- scoreOf ----
    check(scoreOf(null, all).tier === TIER.unknown, 'scoreOf: no prices is unknown');
    check(scoreOf({ xp: { ratio: 1 } }, ['xp']).tier === TIER.cheap, 'scoreOf: the standard price counts as cheap');
    check(scoreOf({ xp: { ratio: 1.5 } }, ['xp']).tier === TIER.raised, 'scoreOf: above the standard price is raised');
    check(scoreOf({ xp: null }, ['xp']).tier === TIER.missing, 'scoreOf: a missing bonus is the lowest tier');

    // ---- rank ----
    const channels = ['pricey', 'plain', 'removed', 'cheap', 'unread', 'second'];
    const reads = {
      pricey: read([opt('xp', 600)]),
      plain: read([opt('xp', 300)]),
      removed: read([opt('captura', 500)]), // the XP bonus is gone
      cheap: read([opt('xp', 100)]),
      unread: J({ failed: 'sem resposta' }),
      second: read([opt('xp', 150)]),
    };
    const r = rank(channels, reads, ['xp']);
    check(r.order.join() === 'cheap,second,plain,unread,pricey,removed', `rank: cheapest first, unread, raised, then removed (${r.order.join()})`);
    check(r.rows[0].rank === 1 && r.rows[5].channel === 'removed' && r.rows[5].tier === TIER.missing, 'rank: rows carry the position and the tier');

    // a channel that kept the old order when prices tie
    const tie = rank(['b', 'a', 'c'], { a: read([opt('xp', 300)]), b: read([opt('xp', 300)]), c: read([opt('xp', 300)]) }, ['xp']);
    check(tie.order.join() === 'b,a,c', 'rank: ties keep the current priority');

    // only the chosen bonuses count: the channel without captura is fine when only XP is chosen
    check(rank(['x'], { x: read([opt('xp', 300)]) }, ['xp']).rows[0].tier === TIER.cheap, 'rank: only the chosen bonuses count');
    check(rank(['x'], { x: read([opt('xp', 300)]) }, ['xp', 'captura']).rows[0].tier === TIER.missing, 'rank: a chosen bonus the channel lacks sends it last');
    // no chosen bonus: every bonus counts
    check(rank(['x'], { x: read([opt('xp', 300)]) }, []).keys.join() === 'xp,captura,shiny', 'rank: without a choice, all the bonuses are considered');
    check(rank(['a'], { a: null }, ['xp']).rows[0].tier === TIER.unknown && rank([], {}, []).order.length === 0, 'rank: null reads and empty lists are handled');
  } catch (err) {
    check(false, `unexpected error: ${err.stack || err}`);
  }
  finish();
});
