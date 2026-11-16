// Resgate automático do bônus do PokeIdle com os pontos de cada canal de um site (Kick ou Twitch), numa conta. Porte do
// PointsRedeemer da referência. Módulo puro (sem Electron): quem executa as conferências de verdade é o orquestrador,
// que roda os scripts (kickScript/twitchScript) na página do canal e devolve o JSON para `apply`.
//
// Regras:
//  - a cada conferência, no máximo 1 resgate por canal (Kick a cada 5 min, Twitch a cada 2 min: ver KICK_INTERVAL_MS);
//  - resgate (ou baú) recusado: espera 30 min para tentar de novo naquele canal;
//  - sem o site vinculado no jogo o PokeIdle devolve os pontos: o saldo que sobe logo depois de um resgate para o
//    resgate desta conta (`stopped`); `restart()` (ao salvar a configuração) volta a resgatar;
//  - saldo que cai sem resgate nosso (mais de 100 pontos) só vai para o registro: não para o resgate;
//  - na Twitch também pega o baú de bônus (+50 a cada ~15 min), que só vem para quem clica.

const { BONUSES, SITES } = require('./sites');
const { kickScript, twitchScript, twitchRaidScript, twitchMomentScript, TWITCH_CLIENT_ID } = require('./scripts');

const MIN = 60 * 1000;
const KICK_INTERVAL_MS = 5 * MIN; // assistindo, a Kick dá 10 pontos a cada 5 min
const TWITCH_INTERVAL_MS = 2 * MIN; // o baú aparece a cada ~15 min e espera o clique
const RETRY_MS = 30 * MIN; // resgate (ou baú) recusado: espera antes de tentar de novo naquele canal
const REFUND_WINDOW_MS = 30 * MIN; // saldo que sobe até esse tempo depois de um resgate é o bônus devolvido
const DROP_LIMIT = 100; // saldo que cai mais que isso sem resgate nosso foi gasto em outro lugar com a conta
const SPENDING_MS = 2 * MIN; // o script que pode resgatar ainda está rodando (depois disso, sumiu)
const UNANSWERED_MS = 10 * MIN;
const GAINS_MS = 60 * MIN;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const READ_TIMEOUT_MS = 20 * 1000;

const hhmm = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const isInt = (v) => Number.isInteger(v);

// A palavra do bônus no título dele em cada canal: "Bônus +15% XP PokeIdle", "Bônus de +15% Capture Boost", "… Secret Lure".
const rewardWord = (key) => BONUSES[key]?.word ?? BONUSES.xp.word;

// Os nomes dos motivos dos pontos nos avisos da Twitch.
const reasonName = (code) => ({
  WATCH_STREAK: 'da sequência de lives', RAID: 'da raid', CLAIM: 'do baú', WATCH: 'assistindo',
}[code] ?? `(${code})`);

/**
 * O que deu errado com o baú no que o script de uma live devolveu (null: pegou, ou o erro do baú já foi para o
 * registro).
 */
function claimProblem(result) {
  if (!result) return 'o player não respondeu em 30 s';
  let root;
  try { root = JSON.parse(result); } catch { return 'resposta estranha do player'; }
  if (root && typeof root === 'object' && ('claimed' in root || 'claimError' in root)) return null;
  return root?.error ?? 'a página não viu o baú';
}

const failed = (why) => JSON.stringify({ failed: why, error: 'saldo: ' + why });

// Cada bônus vem em 4 durações, fora de ordem: vale o mais barato liberado; sem nenhum liberado, o mais barato.
function pickBonus(matching, shut) {
  matching.sort((x, y) => x.cost - y.cost);
  return { bonus: matching.find((m) => !shut(m.r)) ?? matching[0], cheapest: matching[0].cost };
}

/**
 * Na Twitch leve, a leitura sem a página: a mesma consulta do twitchScript (consultas não passam pela checagem
 * anti-robô). Devolve o mesmo JSON que o script devolveria sem agir (com "claimId" quando o baú está esperando), ou
 * { failed } quando o pedido não passou (aí se usa a página).
 */
async function twitchReadAsync(api, channel, token, device, rewardKey) {
  try {
    const headers = { 'User-Agent': USER_AGENT, 'Client-Id': TWITCH_CLIENT_ID, Authorization: 'OAuth ' + token, 'Content-Type': 'text/plain' };
    if (device) headers['X-Device-Id'] = device;
    const query = 'query($login:String!){currentUser{id} user(login:$login){id channel{self{communityPoints{balance availableClaim{id}}}' +
      ' communityPointsSettings{customRewards{id title prompt cost isEnabled isPaused isInStock cooldownExpiresAt}}}}}';
    const res = await fetch(api + '/gql', {
      method: 'POST', headers, body: JSON.stringify({ query, variables: { login: channel } }), signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return failed(`erro ${res.status}`);
    const root = await res.json();
    if (root?.extensions?.challenge) return failed('checagem anti-robô da Twitch');
    const data = root?.data;
    if (!data || typeof data !== 'object') return failed('sem resposta');
    const me = data.currentUser?.id ?? null;
    const user = data.user;
    const ch = user?.channel;
    if (!user || typeof user !== 'object' || !ch || typeof ch !== 'object') return JSON.stringify({ error: 'canal não encontrado' });
    const channelId = user.id ?? null;
    const cp = ch.self?.communityPoints;
    if (!cp || typeof cp.balance !== 'number') {
      return JSON.stringify({ me, channelId, error: 'saldo: sem os pontos na resposta (login da Twitch?)' });
    }
    const points = cp.balance;
    const claimId = cp.availableClaim?.id ?? null;
    if (!rewardKey) return JSON.stringify({ points, me, channelId, claimId });
    const word = new RegExp(rewardWord(rewardKey), 'i');
    const matching = (ch.communityPointsSettings?.customRewards ?? [])
      .filter((r) => r.isEnabled === true && word.test(r.title ?? '') && /pokeidle/i.test(`${r.title ?? ''} ${r.prompt ?? ''}`) && isInt(r.cost))
      .map((r) => ({ cost: r.cost, r }));
    if (!matching.length) return JSON.stringify({ points, me, channelId, claimId, error: 'canal sem o bônus' });
    const shut = (r) => r.isPaused === true || r.isInStock === false || typeof r.cooldownExpiresAt === 'string';
    const { bonus, cheapest } = pickBonus(matching, shut);
    return JSON.stringify({ points, me, channelId, claimId, cost: bonus.cost, title: bonus.r.title, paused: shut(bonus.r), cheapest });
  } catch {
    return failed('sem resposta da Twitch');
  }
}

/**
 * Na Kick leve, a leitura sem a página: o saldo e o bônus escolhido (o mais barato que casa), pela API com o login da
 * conta. Devolve o mesmo JSON que o kickScript devolveria sem resgatar, ou { failed } quando o pedido não passou.
 */
async function kickReadAsync(api, channel, token, rewardKey) {
  const get = async (path) => {
    const res = await fetch(`${api}/api/v2/channels/${encodeURIComponent(channel)}${path}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', 'x-app-platform': 'web', Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    return res.ok ? { status: 200, json: await res.json() } : { status: res.status, json: null };
  };
  try {
    const pts = await get('/points');
    if (!pts.json) return failed(`erro ${pts.status}`);
    const points = pts.json?.data?.points;
    if (!isInt(points)) return failed('sem os pontos na resposta');
    const rw = await get('/rewards');
    if (!rw.json) return JSON.stringify({ points, error: `bônus: erro ${rw.status}` });
    const word = new RegExp(rewardWord(rewardKey), 'i');
    const list = Array.isArray(rw.json?.data) ? rw.json.data : [];
    const matching = list
      .filter((r) => r.is_enabled === true && word.test(r.title ?? '') && /pokeidle/i.test(`${r.title ?? ''} ${r.description ?? ''}`) && isInt(r.cost))
      .map((r) => ({ cost: r.cost, r }));
    if (!matching.length) return JSON.stringify({ points, error: 'canal sem o bônus' });
    const { bonus, cheapest } = pickBonus(matching, (r) => r.is_paused === true);
    return JSON.stringify({ points, cost: bonus.cost, title: bonus.r.title, paused: bonus.r.is_paused === true, cheapest });
  } catch {
    return failed('sem resposta da Kick');
  }
}

function createRedeemer({ site, log = () => {}, now = () => Date.now() }) {
  const label = SITES[site]?.label ?? site;
  const isKick = site === 'kick';
  const channels = new Map(); // canal -> estado
  let stopped = null; // por que parou de resgatar nesta conta (null: resgatando)
  let noLogin = false; // sem o login do site no perfil da conta
  let userId = null; // o id da conta na Twitch (a conferência lê; os avisos da conta usam)
  let listeningSince = null; // desde quando os avisos da Twitch chegam (null: desconectados)
  let quietLimit = 20 * MIN; // live aberta esse tempo sem nenhum ponto de assistir não está rendendo

  const touch = (ch) => {
    let c = channels.get(ch);
    if (!c) {
      c = { gains: [], retryAt: 0, claimRetryAt: 0, text: '' };
      channels.set(ch, c);
    }
    return c;
  };

  // O script que pode resgatar ainda está rodando
  const spending = (c) => c.spendingSince != null && now() - c.spendingSince < SPENDING_MS;

  // A partir desse saldo os pontos do último resgate voltaram (metade do custo: assistir dá 10 a cada 5 min, e o baú da Twitch, 50)
  const refundAt = (c) => (c.points != null && c.cost != null && c.redeemedAt != null && now() - c.redeemedAt < REFUND_WINDOW_MS
    ? c.points + Math.floor(c.cost / 2) : null);

  // Se este canal pode gastar agora, e a partir de que saldo é devolução (não resgata em cima dela)
  function plan(ch) {
    const c = channels.get(ch);
    return { spend: stopped === null && (!c || now() >= c.retryAt), refund: c ? refundAt(c) : null };
  }

  /**
   * O saldo caiu sem resgate nosso: o resgate que ficou sem resposta do player (passou mesmo), ou pontos gastos em outro
   * lugar com esta conta. Vai para o registro; devolve o aviso para o cabeçalho no segundo caso. `gained`: o que entrou
   * junto com este saldo (o baú, um aviso de pontos).
   */
  function dropped(ch, c, balance, gained) {
    if (c.points == null || balance >= c.points + gained - DROP_LIMIT) return null;
    const before = c.points;
    const spent = before + gained - balance;
    if (c.unansweredAt != null && now() - c.unansweredAt < UNANSWERED_MS) {
      const at = c.unansweredAt;
      c.unansweredAt = null;
      c.redeemedAt = at;
      log(`${ch}: o resgate das ${hhmm(at)} passou, mas o player não tinha respondido (saldo ${before} → ${balance})`);
      return null;
    }
    log(`${ch}: o saldo caiu de ${before} para ${balance} sem resgate do deck (${spent} pontos gastos em outro lugar com esta conta?)`);
    return `${label}: ${spent} pontos de ${ch} gastos fora do deck`;
  }

  // Anota por que o saldo não resgata (reason; null: liberou). Vai para o registro uma vez, quando muda.
  function block(ch, c, balance, reason) {
    if (reason === (c.blocked ?? null)) return;
    c.blocked = reason;
    if (reason !== null) log(`${ch}: ${balance} pontos, mas ${reason}`);
  }

  // Desde quando a live está sem ponto de assistir: o último que veio, ou a live aberta com os avisos chegando (o mais novo dos três)
  function quietFrom(c) {
    if (listeningSince == null || c.openSince == null) return null;
    const from = Math.max(listeningSince, c.openSince);
    return c.watchedAt != null && c.watchedAt > from ? c.watchedAt : from;
  }
  const quiet = (c, t) => { const f = quietFrom(c); return f != null && t - f >= quietLimit; };

  return {
    // Esquece o saldo do canal (o resgate em lote gastou por fora): a próxima conferência começa dela
    forget(ch) {
      const c = channels.get(ch);
      if (c) c.points = null;
    },

    // Um aviso de pontos que entraram: conta para o rendimento e atualiza o saldo. A sequência de lives, a raid e o que
    // não for assistir nem baú vão para o registro; devolve o aviso para o cabeçalho nesses.
    earned(ch, reason, points, balance) {
      const c = touch(ch);
      const t = now();
      c.gains.push({ at: t, points });
      c.gains = c.gains.filter((g) => t - g.at <= GAINS_MS);
      if (reason === 'WATCH') {
        c.watchedAt = t;
        c.quietNoted = false;
      }
      let spent = null;
      if (typeof balance === 'number') {
        // Com um resgate no ar, o saldo do aviso já pode ter o resgate: quem confere é a resposta dele.
        if (!spending(c)) spent = dropped(ch, c, balance, points);
        c.points = balance;
      }
      if (reason === 'WATCH' || reason === 'CLAIM') return spent;
      log(`${ch}: ganhou +${points} ${reasonName(reason)}` + (typeof balance === 'number' ? ` (saldo ${balance})` : ''));
      return spent ?? `${label}: +${points} ${reasonName(reason)} em ${ch}`;
    },

    // As lives abertas que acabaram de parar de render (uma vez por vez que param)
    newQuiet(open) {
      const t = now();
      const out = [];
      for (const ch of open) {
        const c = channels.get(ch);
        if (c && !c.quietNoted && quiet(c, t)) {
          c.quietNoted = true;
          out.push(ch);
          log(`${ch}: a live está aberta há ${Math.round(quietLimit / MIN)} min sem os pontos de assistir`);
        }
      }
      return out;
    },

    // Volta a resgatar do zero (ao salvar a configuração, depois de vincular o site no jogo)
    restart() {
      stopped = null;
      noLogin = false;
      channels.clear();
    },

    // O saldo do canal e o último resgate ("230/300 pontos, resgatou 14:05"), com o que entrou na última hora pelos
    // avisos ("+320/h") e se a live parou de render
    text(ch) {
      const c = channels.get(ch);
      if (!c) return '';
      const t = now();
      const hour = c.gains.filter((g) => t - g.at <= GAINS_MS).reduce((s, g) => s + g.points, 0);
      const parts = [];
      if (c.text.length) parts.push(c.text);
      if (hour > 0) parts.push(`+${hour}/h`);
      const from = quietFrom(c);
      if (from != null && t - from >= quietLimit) parts.push(`sem pontos de assistir há ${Math.round((t - from) / MIN)} min`);
      return parts.join(', ');
    },

    // Só o saldo do canal, com o custo do bônus ("230/300"; "" antes da primeira leitura)
    balance(ch) {
      const c = channels.get(ch);
      if (!c || c.points == null) return '';
      return c.cost != null ? `${c.points}/${c.cost}` + (c.paused ? ' pausado' : '') : `${c.points}`;
    },

    // Na Twitch leve, se a leitura de fora da página pede a página: o baú esperando, um resgate que dá agora, ou a leitura que não passou
    needsPage(ch, json, claim) {
      let root;
      try { root = JSON.parse(json); } catch { return true; }
      if (!root || typeof root !== 'object') return true;
      if ('failed' in root) return true;
      const c = channels.get(ch);
      if (claim && typeof root.claimId === 'string' && (!c || now() >= c.claimRetryAt)) return true;
      if (isInt(root.points) && isInt(root.cost) && root.paused !== true) {
        const { spend, refund } = plan(ch);
        return spend && root.points >= root.cost && !(refund != null && root.points >= refund);
      }
      return false;
    },

    // O script que roda na live de `channel` da Kick: lê o saldo e o bônus escolhido e, se der, resgata 1
    kickScript(api, channel, token, rewardKey) {
      const { spend, refund } = plan(channel);
      if (spend) touch(channel).spendingSince = now();
      return kickScript({ api, channel, token, word: rewardWord(rewardKey), spend, refund });
    },

    // O script da Twitch (API do site, com o login da conta): lê o saldo, pega o baú se tiver (`claim`) e, com
    // `rewardKey`, resgata 1 bônus se der. `spend` falso só lê e pega o baú. `claimId` é o id do baú que veio no aviso.
    twitchScript(api, channel, token, device, rewardKey, claim, spend = true, claimId = null) {
      const p = plan(channel);
      spend = spend && p.spend;
      if (spend && rewardKey) touch(channel).spendingSince = now();
      const c = channels.get(channel);
      // O baú do aviso é um baú novo (outro id): vai mesmo com a espera de 30 min de um erro antes.
      claim = !!claim && (claimId != null || !c || now() >= c.claimRetryAt);
      return twitchScript({
        api, channel, token, device: device ?? null, clientId: TWITCH_CLIENT_ID, word: rewardKey ? rewardWord(rewardKey) : null,
        spend, refund: p.refund, claim, claimId,
      });
    },

    // Anota o que o script de um canal devolveu. Devolve o aviso para o cabeçalho quando resgatou, quando o site recusou
    // ou quando parou por causa dos pontos que voltaram.
    apply(ch, json) {
      const c = touch(ch);
      const t = now();
      // Conferida de novo depois de um tempo sem: a live abriu (de novo) agora.
      if (c.checkedAt == null || t - c.checkedAt > 5 * MIN) c.openSince = t;
      c.checkedAt = t;
      let points = null, cost = null, status = null, cheapest = null;
      let error = null, title = null, refused = null, claimError = null;
      let redeemed = false, paused = false, claimed = false;
      // A resposta do script que podia resgatar chegou (ou não vai chegar): os avisos voltam a conferir o saldo.
      const wasSpending = c.spendingSince != null;
      c.spendingSince = null;
      try {
        const root = JSON.parse(json);
        if (!root || typeof root !== 'object') throw new Error('json');
        const int = (v) => (isInt(v) ? v : null);
        const str = (v) => (typeof v === 'string' ? v : null);
        points = int(root.points);
        cost = int(root.cost);
        cheapest = int(root.cheapest);
        status = int(root.status);
        error = str(root.error);
        title = str(root.title);
        refused = str(root.refused);
        claimError = str(root.claimError);
        redeemed = root.redeemed === true;
        paused = root.paused === true;
        claimed = root.claimed === true;
        if (typeof root.me === 'string') userId = root.me;
        if (typeof root.channelId === 'string') c.id = root.channelId;
      } catch {
        error = 'a live não respondeu';
        // O script que podia resgatar, com saldo para isso, sumiu: o resgate pode ter passado sem a resposta chegar.
        if (wasSpending && c.points != null && c.cost != null && c.points >= c.cost) c.unansweredAt = t;
      }

      // O baú (só na Twitch): pegou, ou deu errado e espera 30 min para tentar de novo naquele canal. NOT_FOUND é o baú
      // que alguém já pegou (a conta aberta em outro lugar): o próximo vem com outro id, então não espera.
      if (claimed) {
        c.claimedAt = t;
        c.claimError = null;
        log(`${ch}: pegou o baú (+50` + (points != null ? `, saldo ${points})` : ')'));
      } else if (claimError === 'NOT_FOUND') {
        log(`${ch}: o baú já tinha sido pego (a conta está aberta em outro lugar?)`);
      } else if (claimError !== null) {
        c.claimError = claimError;
        c.claimRetryAt = t + RETRY_MS;
        log(`${ch}: o baú não passou (${claimError}); tento de novo em 30 min`);
      }
      const bonus = c.claimError ? `, baú: ${c.claimError}` : c.claimedAt != null ? `, baú ${hhmm(c.claimedAt)}` : '';

      if (points === null) {
        c.text = error ?? 'a live não respondeu';
        return null;
      }
      // Antes de anotar o saldo novo: caiu sem resgate do deck?
      let note = dropped(ch, c, points, claimed ? 50 : 0);
      if (cost === null) {
        // Sem bônus escolhido (só o baú) ou o canal sem o bônus: só o saldo.
        c.points = points;
        c.paused = false;
        c.text = `${points} pontos${bonus}` + (error !== null ? `, ${error}` : '');
        block(ch, c, points, error === 'canal sem o bônus' ? 'o canal está sem o bônus escolhido' : null);
        return note;
      }

      const limit = refundAt(c);
      if (limit != null && points >= limit && stopped === null) {
        stopped = isKick
          ? 'os pontos voltaram (vincule a Kick no jogo, em Bônus na Kick, e salve Lives → Config… de novo)'
          : 'os pontos voltaram (vincule a Twitch no jogo, em Bônus Twitch, e salve Lives → Config… de novo)';
        note = `${label}: os pontos do resgate voltaram (${label} não vinculada no jogo?); parei de resgatar nesta conta`;
        log(`${ch}: os pontos do último resgate voltaram (saldo ${points}; ${label} não vinculada no jogo?); parei de resgatar nesta conta`);
      }
      c.cost = cost;
      c.points = points;
      c.paused = paused;
      c.unansweredAt = null;
      // O de 1 h pausado no canal: está no mais barato liberado (3, 5 ou 10 h).
      const skipped = cheapest !== null && cheapest < cost ? `o de ${cheapest} pontos está pausado no canal` : '';
      const refusal = status !== null ? String(status) : refused;
      if (redeemed) {
        c.points = points - cost;
        c.redeemedAt = t;
        note = `${label}: resgatei ${title} em ${ch}`;
        log(`${ch}: resgatou ${title} (${cost} pontos; sobraram ${points - cost}` + (skipped ? `; ${skipped}` : '') + ')');
      } else if (refusal !== null) {
        c.retryAt = t + RETRY_MS;
        note = `${label}: o resgate em ${ch} foi recusado (erro ${refusal}); tento de novo em 30 min`;
        log(`${ch}: o resgate de ${title} foi recusado (erro ${refusal}; saldo ${points}); tento de novo em 30 min`);
      }
      // O saldo daria para o bônus de 1 h, mas não resgatou: o porquê vai para o registro (uma vez, quando muda).
      let held = null;
      if (!redeemed && refusal === null && stopped === null && points >= (cheapest ?? cost)) {
        held = paused ? 'o bônus está pausado no canal (todas as durações); resgato quando liberar'
          : points < cost ? `${skipped} e o mais barato liberado custa ${cost}; resgato quando o saldo chegar`
            : null;
      }
      block(ch, c, points, held);
      c.text = `${c.points}/${cost} pontos`
        + (c.redeemedAt != null ? `, resgatou ${hhmm(c.redeemedAt)}` : '')
        + (refusal !== null && !redeemed ? `, resgate recusado (${refusal})` : '')
        + (paused ? ', bônus pausado no canal' : skipped ? `, ${skipped} (vai o de ${cost})` : '')
        + bonus;
      return note;
    },

    idOf: (ch) => channels.get(ch)?.id ?? null,
    channelOf(id) {
      for (const [ch, c] of channels) if (c.id === id) return ch;
      return null;
    },

    get userId() { return userId; },
    get listeningSince() { return listeningSince; },
    set listeningSince(v) { listeningSince = v; },
    get quietLimit() { return quietLimit; },
    set quietLimit(v) { quietLimit = v; },
    get stopped() { return stopped; },
    get noLogin() { return noLogin; },
    set noLogin(v) { noLogin = !!v; },
  };
}

module.exports = {
  createRedeemer, claimProblem, rewardWord, twitchReadAsync, kickReadAsync, twitchRaidScript, twitchMomentScript,
  TWITCH_CLIENT_ID, KICK_INTERVAL_MS, TWITCH_INTERVAL_MS, RETRY_MS, REFUND_WINDOW_MS,
};
