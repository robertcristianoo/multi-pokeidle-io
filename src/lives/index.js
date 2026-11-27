// Gerenciador de lives (porte do gerenciador do PokeIdle Deck para o Electron). Cada conta marcada na configuração das lives (Config das lives)
// (normalmente a main, vinculada à Twitch/Kick no jogo) mantém abertas as lives dos canais da lista que estiverem no ar, até
// o limite por site, e resgata sozinha o bônus escolhido com os pontos de cada canal. As lives são "leves": ninguém toca
// vídeo; o gerenciador assiste como um player (twitch-watcher.js, kick-watcher.js) e os avisos da Twitch chegam pelo
// websocket (twitch-pubsub.js). Uma página escondida do canal só abre na hora de uma ação (pages.js).
//
// Ciclos: quem está no ar, a cada 2 min; saldo e resgate, Kick a cada 5 min e Twitch a cada 2; bônus no jogo (guarda do
// bônus), a cada 30 s. main.js só chama `createLives(...)`, `state()`, `stateOf(acc)`, `accountMenu(acc)`, `pointsRows()`,
// `accounts()`, `showConfig()` e `showLog()`.
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const cfgLib = require('./config');
const optimize = require('./optimize');
const { createPages } = require('./pages');
const { createGuard, kind: bonusKind, kindName, time: bonusTime } = require('./guard');
const twitchLive = require('./twitch-live');
const kickLive = require('./kick-live');
const { TwitchWatcher, TWITCH_ENDPOINTS } = require('./twitch-watcher');
const { KickWatcher, KICK_ENDPOINTS } = require('./kick-watcher');
const { TwitchPubSub, TWITCH_PUBSUB_URL } = require('./twitch-pubsub');
const R = require('../points/redeem');
const { createGoogleLogin, sites: GOOGLE_SITES } = require('../google-login');
const googleLogin = createGoogleLogin();
const { BONUSES, SITES, partitionOf } = require('../points/sites');
const { createRedeemLog } = require('../points/log');
const { t, getLang, loadPage } = require('../i18n');
const accountNames = require('../account-names');

const UI = (f) => path.join(__dirname, '..', 'ui', f);
const PRELOAD = (f) => path.join(__dirname, '..', 'preload', f);

const TWITCH_API = 'https://gql.twitch.tv';
const KICK_API = 'https://kick.com';
const LIVE_CHECK_MS = 60 * 1000; // quem está no ar: quando uma live aberta cai, a próxima online ocupa a vaga na conferência seguinte
const FIRST_REDEEM_MS = 60 * 1000; // o saldo, 1 min depois de abrir (as lives já assentaram)
const PROBLEM_EVERY_MS = 10 * 60 * 1000;
const SITE_ORDER = ['twitch', 'kick'];

const sleepless = (p) => p.catch(() => {});

// Nota (texto curto do resgate) -> tipo do aviso na tela
// (as palavras que decidem vêm do dicionário do idioma: as mensagens já saem traduzidas)
const matches = (key, text) => new RegExp(t(key), 'i').test(text);
const noteKind = (text) => (matches('lives.re.note.fail', text) ? 'fail' : matches('lives.re.note.ok', text) ? 'ok' : 'info');

// Classifica a linha de registro ("canal: o que houve") no evento do registro dos resgates
function classify(detalhe) {
  if (matches('lives.re.log.ok', detalhe)) return 'resgatou';
  if (matches('lives.re.log.stopped', detalhe)) return 'parou';
  if (matches('lives.re.log.refused', detalhe)) return 'recusado';
  if (matches('lives.re.log.error', detalhe)) return 'erro';
  return 'info';
}

function createLives({
  mainWin,
  getSlots, // () => [{ id, view }] das contas ligadas (com o jogo carregado)
  config, // { get, set } do bloco `lives` do config.json
  getLegacyAuto = () => null, // o resgate automático da versão anterior (migração única)
  userDataDir,
  notify = () => {},
  maxAccounts = 4,
  timers = true,
  deps = {},
}) {
  const D = {
    twitchLive, kickLive, pages: createPages(), TwitchWatcher, KickWatcher, TwitchPubSub,
    twitchApi: TWITCH_API, kickApi: KICK_API, twitchReadApi: TWITCH_API, kickReadApi: KICK_API,
    twitchEndpoints: TWITCH_ENDPOINTS, kickEndpoints: KICK_ENDPOINTS, pubsubUrl: TWITCH_PUBSUB_URL,
    ...deps,
  };
  const rlog = createRedeemLog(path.join(userDataDir, 'resgates.log'));
  const guard = createGuard();
  const cfg = () => cfgLib.normalize(config.get(), { maxAccounts, legacyAuto: getLegacyAuto() });
  const accountIds = () => Array.from({ length: maxAccounts }, (_v, i) => i + 1);

  // ---- estado por conta ----
  const redeemers = { twitch: new Map(), kick: new Map() };
  const open = { twitch: new Map(), kick: new Map() }; // conta -> [canal] abertos (no ar, até o limite)
  const liveNow = { twitch: {}, kick: {} }; // canal -> true | false | null (última conferência)
  const twitchLogin = new Map(); // conta -> true | false | undefined (ainda não leu)
  const watchers = new Map(); // conta -> TwitchWatcher
  const kickWatchers = new Map(); // conta -> KickWatcher
  const pubsubs = new Map(); // conta -> TwitchPubSub
  const taken = new Map(); // conta -> Set de raids e momentos que já pegou
  const bonusInfo = new Map(); // conta -> linha de dica do bônus no jogo
  const bonusSummary = new Map(); // conta -> última leitura do bônus no jogo (tempo que falta, canais oficiais no ar/offline)
  const bonusBusy = new Set();
  const active = new Set(); // contas com lives abertas por este gerenciador
  const problemAt = new Map();
  let liveCheckAt = 0;
  let liveChecking = false;
  let kickRedeemAt = 0;
  let kickRedeeming = false;
  let twitchPointsAt = 0;
  let twitchPointsBusy = false;
  let seconds = 0;
  let timer = null;

  const running = () => {
    const on = new Set(getSlots().map((s) => s.id));
    return cfg().accounts.filter((a) => on.has(a));
  };
  const openOf = (site, acc) => open[site].get(acc) ?? [];
  // O nome do jogador de cada conta (módulo account-names.js): é como as contas aparecem nos menus e janelas das lives.
  const tag = (acc) => accountNames.label(acc);
  const slotOf = (acc) => getSlots().find((s) => s.id === acc);

  // ---- registro e avisos ----
  function logLine(acc, site, text) {
    const m = /^([a-z0-9_]{1,40}): (.*)$/is.exec(text);
    const detalhe = m ? m[2] : text;
    rlog.append({ acc, site, channel: m ? m[1] : '', evento: classify(detalhe), detalhe });
  }
  const logFor = (acc, site) => (text) => logLine(acc, site, text);

  function note(acc, text) {
    if (!text) return;
    try { notify({ kind: noteKind(text), title: `${tag(acc)}`, text, ms: 5000 }); } catch {}
  }

  function redeemerOf(site, acc) {
    const map = redeemers[site];
    if (!map.has(acc)) map.set(acc, R.createRedeemer({ site, log: logFor(acc, site) }));
    return map.get(acc);
  }

  // O problema da Twitch (ou da Kick) leve no registro: no máximo um igual a cada 10 min por canal (para ver por que os baús
  // ou os resgates param).
  function logTwitchProblem(acc, channel, text, site = 'twitch') {
    const key = `${acc} ${site} ${channel} ${text.slice(0, 24)}`;
    if (Date.now() - (problemAt.get(key) ?? 0) < PROBLEM_EVERY_MS) return;
    problemAt.set(key, Date.now());
    logLine(acc, site, `${channel}: ${text}`);
  }

  // ---- logins (cookies da conta) ----
  async function cookie(acc, site, url, name) {
    try {
      return (await session.fromPartition(partitionOf(site, acc)).cookies.get({ url, name }))[0]?.value || null;
    } catch {
      return null;
    }
  }
  const readTwitchLogin = async (acc) => {
    const token = await cookie(acc, 'twitch', 'https://www.twitch.tv', 'auth-token');
    const device = token ? await cookie(acc, 'twitch', 'https://www.twitch.tv', 'unique_id') : null;
    return { token, device };
  };
  const readKickToken = async (acc) => {
    const raw = await cookie(acc, 'kick', 'https://kick.com', 'session_token');
    try { return raw ? decodeURIComponent(raw) : null; } catch { return raw; }
  };

  // ---- quem está no ar e quais lives abrir em cada conta ----
  async function checkLives() {
    liveChecking = true;
    liveCheckAt = Date.now() + LIVE_CHECK_MS;
    try {
      const c = cfg();
      const kick = c.kickLives > 0 ? c.kickChannels : [];
      const twitch = c.twitchLives > 0 ? c.twitchChannels : [];
      const [kickNow, twitchNow] = await Promise.all([
        Promise.all(kick.map((ch) => D.kickLive.isLiveAsync(ch, { fetchFn: sessionFetch([...active][0]) }))),
        D.twitchLive.liveAsync(twitch),
      ]);
      kick.forEach((ch, i) => { liveNow.kick[ch] = kickNow[i]; });
      // A Kick não respondeu (bloqueio do site, por exemplo): usa o que o próprio jogo informa dos canais oficiais.
      if (kick.some((ch) => liveNow.kick[ch] === null || liveNow.kick[ch] === undefined)) {
        const game = new Map(((await officialChannels()).kick ?? []).map((o) => [String(o?.login ?? '').toLowerCase(), o?.live]));
        for (const ch of kick) if (!(typeof liveNow.kick[ch] === 'boolean') && typeof game.get(ch) === 'boolean') liveNow.kick[ch] = game.get(ch);
      }
      for (const [ch, live] of Object.entries(twitchNow ?? {})) liveNow.twitch[ch] = live;
      autoSortLists(c);
      for (const acc of active) {
        if (twitchLogin.get(acc) === false && (await readTwitchLogin(acc)).token) twitchLogin.set(acc, true);
      }
    } catch {
      // sem internet: fica com o que já sabia
    } finally {
      liveChecking = false;
    }
    applyLives();
  }

  // Com a opção ligada, reordena as listas por status (no ar primeiro) a cada conferência e guarda a ordem nova no config.
  const lastLive = { twitch: {}, kick: {} };
  function autoSortLists(c) {
    const next = {};
    for (const [site, key] of [['twitch', 'twitchChannels'], ['kick', 'kickChannels']]) {
      const sorted = cfgLib.sortByStatus(c[key], liveNow[site], lastLive[site]);
      if (c.autoSort && sorted.some((ch, i) => ch !== c[key][i])) next[key] = sorted;
      for (const ch of c[key]) if (typeof liveNow[site][ch] === 'boolean') lastLive[site][ch] = liveNow[site][ch];
    }
    if (Object.keys(next).length) config.set({ ...config.get(), ...next });
  }

  // Deixa abertas, em cada conta, só as lives da Twitch e da Kick que estão no ar (até o limite da conta), na ordem da lista.
  // Roda a cada conferência de quem está no ar: a live aberta que caiu sai e o próximo canal online ainda fechado entra no lugar.
  function applyLives() {
    const c = cfg();
    for (const acc of active) {
      // Antes da primeira resposta de cada site não abre nada: a live pode estar offline. Na Twitch, sem o login da conta
      // também não: o player sem login não rende pontos.
      if (Object.keys(liveNow.twitch).length > 0 || twitchLogin.get(acc) === false) {
        const lim = c.twitch[acc];
        const wanted = c.twitchChannels.filter((ch) => !lim.closed.includes(ch));
        const now = twitchLogin.get(acc) === false ? [] : kickLive.pick(wanted, liveNow.twitch, cfgLib.slotsOf(lim, c.twitchLives), openOf('twitch', acc));
        swapNotice(acc, 'twitch', openOf('twitch', acc), now);
        open.twitch.set(acc, now);
      }
      if (Object.keys(liveNow.kick).length > 0) {
        const lim = c.kick[acc];
        const wanted = c.kickChannels.filter((ch) => !lim.closed.includes(ch));
        const now = kickLive.pick(wanted, liveNow.kick, cfgLib.slotsOf(lim, c.kickLives), openOf('kick', acc));
        swapNotice(acc, 'kick', openOf('kick', acc), now);
        open.kick.set(acc, now);
      }
    }
  }

  // Avisa e registra quando uma live aberta caiu e outra entrou no lugar dela
  function swapNotice(acc, site, before, now) {
    const gone = before.filter((ch) => !now.includes(ch) && liveNow[site][ch] === false);
    const added = now.filter((ch) => !before.includes(ch));
    if (!gone.length || !added.length) return;
    logLine(acc, site, t('lives.swap.log', { gone: gone.join(', '), added: added.join(', ') }));
    note(acc, t('lives.swap.note', { site: SITES[site].label, gone: gone.join(', '), added: added.join(', ') }));
  }

  // Os canais oficiais que o jogo informa (no ar e offline), lidos da primeira conta ligada que tenha a lista:
  // { twitch: [{ login, live }], kick: [...], acc } (acc = null se nenhuma conta trouxe a lista)
  async function officialChannels() {
    const out = { twitch: [], kick: [], acc: null };
    for (const slot of getSlots()) {
      const summary = await readBonus(slot.id);
      const tw = summary?.twitch?.channels ?? [];
      const kk = summary?.kick?.channels ?? [];
      if (!tw.length && !kk.length) continue;
      out.twitch = tw;
      out.kick = kk;
      out.acc = slot.id;
      break;
    }
    return out;
  }

  // Antes, o login da Twitch/Kick ficava numa sessão própria do painel de pontos (persist:pontos-<site>-conta<N>); agora fica
  // na da conta. Uma vez por execução, traz de lá os cookies do login que a sessão da conta ainda não tem.
  const migrated = new Set();
  async function migrateLogins(acc) {
    if (migrated.has(acc)) return;
    migrated.add(acc);
    const dest = session.fromPartition(`persist:conta${acc}`);
    const logins = [['twitch', 'https://www.twitch.tv', ['auth-token', 'unique_id']], ['kick', 'https://kick.com', ['session_token']]];
    for (const [site, url, names] of logins) {
      const old = `pontos-${site}-conta${acc}`;
      try {
        if (!fs.existsSync(path.join(app.getPath('userData'), 'Partitions', old))) continue; // nunca existiu: não cria à toa
        const src = session.fromPartition(`persist:${old}`);
        for (const name of names) {
          if ((await dest.cookies.get({ url, name })).length) continue;
          const c = (await src.cookies.get({ url, name }))[0];
          if (!c) continue;
          await dest.cookies.set({
            url, name: c.name, value: c.value, domain: c.domain, path: c.path, secure: c.secure, httpOnly: c.httpOnly,
            expirationDate: c.expirationDate, sameSite: c.sameSite,
          });
        }
      } catch {
        // fica sem migrar: é só entrar de novo em Lives › Entrar (botão Lives da conta)
      }
    }
  }

  // Ligar uma conta não mexe nas outras: a conferência de quem está no ar roda logo (só abre as lives dela, as demais ficam
  // como estão) e os ciclos de resgate das contas que já estavam ligadas não são adiados. Só a primeira conta ligada espera
  // as lives assentarem antes do primeiro resgate.
  async function activate(acc) {
    const first = active.size === 0;
    active.add(acc);
    await migrateLogins(acc);
    twitchLogin.set(acc, !!(await readTwitchLogin(acc)).token);
    liveCheckAt = 0;
    if (first) kickRedeemAt = twitchPointsAt = Date.now() + FIRST_REDEEM_MS;
  }

  function deactivate(acc) {
    active.delete(acc);
    stopPubSub(acc);
    stopWatcher(acc);
    stopKickWatcher(acc);
    twitchLogin.delete(acc);
    open.twitch.delete(acc);
    open.kick.delete(acc);
    D.pages.closeAccount(acc);
  }

  // Contas ligadas no jogo e marcadas para ter lives: abre as que faltam e fecha as que saíram
  async function syncAccounts() {
    const want = new Set(running());
    for (const acc of [...active]) if (!want.has(acc)) deactivate(acc);
    for (const acc of want) if (!active.has(acc)) await activate(acc);
  }

  // Os bônus escolhidos da conta num site, na ordem de prioridade (vazio: não resgata nesse site)
  const rewardsOf = (c, site, acc) => R.keysOf((site === 'kick' ? c.redeemKick : c.redeemTwitch)[acc]);

  // ---- combo dos bônus: uma rodada por conferência (Kick a cada 5 min, Twitch a cada 2) ----
  // Com um bônus só, cada canal que cobre o seu resgata o seu (como antes). Com vários, a rodada é 1 resgate de cada bônus, na
  // ordem da lista, e só acontece se o saldo dos canais cobrir o combo inteiro (R.planRound: os custos que caem no mesmo canal
  // somam). Se não couber, não resgata nada e espera acumulando. `reads` = [{ channel, read }] das leituras sem a página, na
  // ordem dos canais; `scriptOf(channel, key)` monta o script do resgate. Num combo, se um resgate da rodada não passar, o
  // restante fica para a próxima conferência.
  const comboNoted = new Map(); // conta|site -> último aviso de espera (não repete no registro)
  const waitText = (keys, eligible) => {
    const label = (k) => BONUSES[k]?.label ?? k;
    const missing = keys.filter((k) => !eligible.some((e) => e.options.some((o) => o.key === k && !o.paused)));
    if (missing.length) return t('lives.combo.noChannel', { combo: keys.map(label).join(' + '), missing: missing.map(label).join(', ') });
    if (!eligible.length) return t('lives.combo.noPoints', { combo: keys.map(label).join(' + ') });
    const saldos = eligible.map((e) => `${e.channel} ${e.points}`).join(', ');
    return t('lives.combo.noSplit', { combo: keys.map(label).join(' + '), balances: saldos });
  };
  // Os canais fora das lives abertas (offline primeiro: os pontos deles estão parados) onde ainda dá para resgatar quando as lives
  // abertas não cobrem. Lê o saldo sem a página (cache de OFFLINE_READ_MS por canal) e devolve [{ channel, read }].
  const OFFLINE_READ_MS = 5 * 60 * 1000;
  const offlineCache = new Map(); // conta|site|canal -> { at, read }
  // Memória dos pontos de cada canal (das lives abertas e das leituras de fora): sabe onde há saldo quando precisar resgatar
  const pointsMemory = new Map(); // conta|site|canal -> { points, at }
  const memorize = (acc, site, channel, read) => {
    try {
      const p = JSON.parse(read)?.points;
      if (Number.isInteger(p)) pointsMemory.set(`${acc}|${site}|${channel}`, { points: p, at: Date.now() });
    } catch {}
  };
  async function readOffline(acc, site, rewards, token, device) {
    const c = cfg();
    const info = bonusSummary.get(acc)?.[site] ?? {};
    const live = new Set((info.channels ?? []).filter((ch) => ch.live).map((ch) => String(ch.login).toLowerCase()));
    const cands = guard.candidates(c[site === 'kick' ? 'kickChannels' : 'twitchChannels'], info, openOf(site, acc));
    // Offline primeiro; dentro de cada grupo, o de mais pontos conhecidos (memória das leituras anteriores) vem antes
    const known = (ch) => pointsMemory.get(`${acc}|${site}|${ch}`)?.points ?? -1;
    const byPoints = (list) => [...list].sort((x, y) => known(y) - known(x));
    const ordered = [...byPoints(cands.filter((ch) => !live.has(ch))), ...byPoints(cands.filter((ch) => live.has(ch)))];
    const out = [];
    for (const channel of ordered) {
      const key = `${acc}|${site}|${channel}`;
      let hit = offlineCache.get(key);
      if (!hit || Date.now() - hit.at > OFFLINE_READ_MS) {
        const read = site === 'kick'
          ? await R.kickReadAsync(D.kickReadApi, channel, token, rewards, sessionFetch(acc))
          : await R.twitchReadAsync(D.twitchReadApi, channel, token, device, rewards);
        hit = { at: Date.now(), read };
        offlineCache.set(key, hit);
        memorize(acc, site, channel, read);
      }
      if (site === 'kick' ? kickReadProblem(hit.read) : failedRead(hit.read)) continue;
      out.push({ channel, read: hit.read });
    }
    return out;
  }

  // Bônus que já chegou no limite de horas da conta (0 = sem limite): o tempo do jogo vem da última leitura do bônus
  const capNoted = new Set();
  function capped(acc, site, key) {
    const hours = cfg().maxHours[acc] ?? 0;
    const left = bonusSummary.get(acc)?.[site]?.left?.[bonusKind(key)];
    const id = `${acc}|${site}|${key}`;
    const hit = hours > 0 && typeof left === 'number' && left >= hours * 3600;
    if (!hit) { capNoted.delete(id); return false; }
    if (!capNoted.has(id)) {
      capNoted.add(id);
      logLine(acc, site, t('lives.cap.reached', { kind: kindName(key), time: bonusTime(left), hours }));
    }
    return true;
  }

  // `readExtra()`: lê os canais fora das lives abertas (readOffline); só roda quando as abertas não cobrem. Esses resgates vão
  // numa página escondida do canal (D.pages.runOnce), não na página das lives abertas.
  async function comboCheck(acc, site, redeemer, rewards, reads, scriptOf, readExtra = null) {
    const combo = cfg().comboAll[acc] === true;
    const limited = (cfg().maxHours[acc] ?? 0) > 0;
    const keys = R.keysOf(rewards).filter((k) => !capped(acc, site, k));
    const parse = (list) => list.map(({ channel, read }) => {
      let info = null;
      try { info = JSON.parse(read); } catch { info = null; }
      return { channel, read, info };
    });
    const eligibleOf = (parsed) => parsed
      .filter((p) => p.info && Number.isInteger(p.info.points) && redeemer.spendable(p.channel, p.info.points))
      .map((p) => ({ channel: p.channel, points: p.info.points, options: p.info.options ?? [] }));
    const parsed = parse(reads);
    for (const p of parsed) memorize(acc, site, p.channel, p.read);
    const eligible = eligibleOf(parsed);
    const slotKey = `${acc}|${site}`;
    const ran = new Set();
    const offSet = new Set();
    let extra = null; // leituras dos canais fora das lives abertas (lidas uma vez, só se precisar)
    const extraEligible = async () => {
      if (extra === null) {
        extra = [];
        try { if (readExtra) extra = eligibleOf(parse(await readExtra())); } catch { extra = []; }
      }
      return extra;
    };

    // O plano: lista de { channel, key } a resgatar nesta conferência
    let plan = [];
    if (keys.length) {
      if (combo && keys.length > 1) {
        let round = R.planRound(keys, eligible);
        let all = eligible;
        if (!round) {
          all = [...eligible, ...(await extraEligible())];
          round = R.planRound(keys, all);
        }
        if (round) {
          comboNoted.delete(slotKey);
          plan = round;
        } else {
          const text = waitText(keys, all);
          if (comboNoted.get(slotKey) !== text) {
            comboNoted.set(slotKey, text);
            logLine(acc, site, text);
          }
        }
      } else {
        // Cada bônus por si: o que o saldo cobrir é resgatado, nas lives abertas e, se elas não cobrem, nas de fora
        const left = new Map([...eligible].map((e) => [e.channel, e.points]));
        const pool = (list) => list.map((e) => ({ ...e, points: left.get(e.channel) ?? e.points }));
        for (const key of keys) {
          let pay = R.planRound([key], pool(eligible)) ?? [];
          if (!pay.length) {
            const more = await extraEligible();
            for (const e of more) if (!left.has(e.channel)) left.set(e.channel, e.points);
            pay = R.planRound([key], pool(more)) ?? [];
          }
          if (limited) pay = pay.slice(0, 1); // com limite de horas, 1 resgate por bônus a cada conferência
          for (const p of pay) {
            left.set(p.channel, left.get(p.channel) - p.cost);
            plan.push(p);
          }
        }
      }
    }

    const offOf = new Set((extra ?? []).map((e) => e.channel));
    for (const a of plan) {
      const off = offOf.has(a.channel) && !eligible.some((e) => e.channel === a.channel);
      ran.add(a.channel);
      if (off) offSet.add(a.channel);
      const result = off
        ? await D.pages.runOnce(acc, site, a.channel, scriptOf(a.channel, a.key))
        : await D.pages.run(acc, site, a.channel, scriptOf(a.channel, a.key));
      if (off) {
        offlineCache.delete(`${acc}|${site}|${a.channel}`);
        pointsMemory.delete(`${acc}|${site}|${a.channel}`);
        logLine(acc, site, t('lives.offline.redeemHere', { ch: a.channel }));
      }
      note(acc, redeemer.apply(a.channel, result));
      if (combo && keys.length > 1 && !result.includes('"redeemed":true')) break;
    }
    // Os canais abertos que não resgataram nesta conferência só anotam a leitura (o saldo deles não mudou)
    for (const p of parsed) if (!ran.has(p.channel)) note(acc, redeemer.apply(p.channel, p.read));
  }

  // O motivo de a leitura da Kick sem a página não ter passado (saldo não lido), ou null se leu os pontos
  const kickReadProblem = (read) => {
    let root = null;
    try { root = JSON.parse(read); } catch { root = null; }
    if (root?.failed) return root.failed;
    return Number.isInteger(root?.points) ? null : t('lives.kick.weirdAnswer');
  };

  // ---- Kick: saldo e resgate (a cada 5 min) ----
  async function redeemKick() {
    kickRedeeming = true;
    kickRedeemAt = Date.now() + R.KICK_INTERVAL_MS;
    try {
      const c = cfg();
      for (const acc of active) {
        const rewards = rewardsOf(c, 'kick', acc);
        const channels = openOf('kick', acc);
        if (!rewards.length || !channels.length) continue;
        const redeemer = redeemerOf('kick', acc);
        try {
          const token = await readKickToken(acc);
          redeemer.noLogin = token === null;
          if (token === null) continue;
          // Kick leve: lê o saldo de cada live sem a página; a página só abre para ler (e resgatar) quando a leitura não passa.
          const reads = [];
          for (const channel of [...channels]) {
            const read = await R.kickReadAsync(D.kickReadApi, channel, token, rewards, sessionFetch(acc));
            const problem = kickReadProblem(read);
            if (problem) {
              // Como antes do combo: a página lê e, com um bônus só, resgata; com vários, só lê (o combo resgata pela leitura da API)
              logTwitchProblem(acc, channel, t('lives.tw.readFail', { failed: problem }), 'kick');
              const result = await D.pages.run(acc, 'kick', channel, redeemer.kickScript(D.kickApi, channel, token, rewards[0], rewards.length === 1));
              if (!result) logTwitchProblem(acc, channel, t('lives.tw.playerNoOpen'), 'kick');
              note(acc, redeemer.apply(channel, result));
              continue;
            }
            reads.push({ channel, read });
          }
          await comboCheck(acc, 'kick', redeemer, rewards, reads, (channel, key) => redeemer.kickScript(D.kickApi, channel, token, key), () => readOffline(acc, 'kick', rewards, token, null));
        } catch (e) {
          // Um erro aqui não pode parar o resgate da Kick em silêncio: vai para o registro e a próxima conferência tenta de novo
          logLine(acc, 'kick', t('lives.kick.crashed', { err: (e && e.message) || e }));
        }
      }
    } finally {
      kickRedeeming = false;
    }
  }

  // ---- Twitch: saldo, baú e resgate (a cada 2 min) ----
  const failedRead = (read) => { try { return JSON.parse(read).failed ?? null; } catch { return null; } };

  async function twitchPoints() {
    twitchPointsBusy = true;
    twitchPointsAt = Date.now() + R.TWITCH_INTERVAL_MS;
    try {
      const c = cfg();
      for (const acc of active) {
        const rewards = rewardsOf(c, 'twitch', acc);
        const claim = c.claimTwitch;
        const channels = openOf('twitch', acc);
        // Na Twitch leve a conferência roda mesmo sem baú nem resgate: ela dá o id da conta para assistir.
        if (!channels.length) {
          stopPubSub(acc);
          stopWatcher(acc);
          continue;
        }
        const redeemer = redeemerOf('twitch', acc);
        const { token, device } = await readTwitchLogin(acc);
        redeemer.noLogin = token === null;
        if (token === null) {
          stopPubSub(acc);
          stopWatcher(acc);
          continue;
        }
        const reads = [];
        for (const channel of [...channels]) {
          const read = await R.twitchReadAsync(D.twitchReadApi, channel, token, device, rewards);
          const failed = failedRead(read);
          const chestWaiting = read.includes('"claimId":"');
          // Leitura sem a página que falhou, ou baú esperando: a página abre só para ler o saldo e pegar o baú (sem resgatar).
          if (failed || redeemer.claimDue(channel, read, claim)) {
            if (failed) logTwitchProblem(acc, channel, t('lives.tw.readFail', { failed: R.errText(failed) }));
            const result = await D.pages.run(acc, 'twitch', channel, redeemer.twitchScript(D.twitchApi, channel, token, device, null, claim));
            if (!result) logTwitchProblem(acc, channel, t(chestWaiting ? 'lives.tw.playerNoOpenChest' : 'lives.tw.playerNoOpen'));
            if (chestWaiting && R.claimProblem(result)) logTwitchProblem(acc, channel, t('lives.tw.chestWaiting', { problem: R.claimProblem(result) }));
            note(acc, redeemer.apply(channel, result));
            continue;
          }
          reads.push({ channel, read });
        }
        await comboCheck(acc, 'twitch', redeemer, rewards, reads, (channel, key) => redeemer.twitchScript(D.twitchApi, channel, token, device, key, false), () => readOffline(acc, 'twitch', rewards, token, device));
        updatePubSub(acc, token);
        updateWatcher(acc, token, device);
        for (const quiet of redeemer.newQuiet(openOf('twitch', acc))) {
          note(acc, t('lives.tw.quietNote', { ch: quiet, min: Math.round(redeemer.quietLimit / 60000) }));
        }
      }
    } finally {
      twitchPointsBusy = false;
    }
  }

  // ---- avisos da Twitch (websocket), quem assiste (Twitch e Kick leves) ----
  function updatePubSub(acc, token) {
    const redeemer = redeemerOf('twitch', acc);
    const channels = openOf('twitch', acc);
    const me = redeemer.userId;
    if (!me || !channels.length) return stopPubSub(acc);
    const current = pubsubs.get(acc);
    if (current && (current.token !== token || current.userId !== me)) stopPubSub(acc);
    if (!pubsubs.has(acc)) pubsubs.set(acc, new D.TwitchPubSub(D.pubsubUrl, token, me, (n) => { sleepless(onTwitchNotice(acc, n)); }));
    const pubsub = pubsubs.get(acc);
    pubsub.setChannels(channels.map((ch) => redeemer.idOf(ch)).filter(Boolean));
    redeemer.listeningSince = pubsub.connected ? pubsub.connectedAt : null;
  }

  function stopPubSub(acc) {
    pubsubs.get(acc)?.dispose();
    pubsubs.delete(acc);
    redeemerOf('twitch', acc).listeningSince = null;
  }

  function updateWatcher(acc, token, device) {
    const channels = openOf('twitch', acc);
    const me = redeemerOf('twitch', acc).userId;
    if (!me || !channels.length) return stopWatcher(acc);
    const current = watchers.get(acc);
    if (current && (current.token !== token || current.userId !== me)) stopWatcher(acc);
    if (!watchers.has(acc)) watchers.set(acc, new D.TwitchWatcher(D.twitchEndpoints, me, token, device));
    watchers.get(acc).setChannels(channels);
  }

  function stopWatcher(acc) {
    watchers.get(acc)?.dispose();
    watchers.delete(acc);
  }

  // Pede à Kick pela sessão do Chromium da conta (mesmos cookies e identidade do painel "Pontos da Kick"): o fetch do Node
  // recebe 403 do site. Sem sessão (testes), cai no fetch comum.
  function sessionFetch(acc) {
    if (!acc || deps.kickLive || !session?.fromPartition) return undefined;
    const ses = session.fromPartition(`persist:conta${acc}`);
    return (url, init) => ses.fetch(url, init);
  }

  async function updateKickWatchers() {
    for (const acc of active) {
      const channels = openOf('kick', acc);
      const token = channels.length ? await readKickToken(acc) : null;
      if (!channels.length || token === null) {
        stopKickWatcher(acc);
        continue;
      }
      const current = kickWatchers.get(acc);
      if (current && current.token !== token) stopKickWatcher(acc);
      if (!kickWatchers.has(acc)) kickWatchers.set(acc, new D.KickWatcher(D.kickEndpoints, token, sessionFetch(acc)));
      kickWatchers.get(acc).setChannels(channels);
    }
  }

  function stopKickWatcher(acc) {
    kickWatchers.get(acc)?.dispose();
    kickWatchers.delete(acc);
  }

  // O erro do script de uma ação da Twitch (raid, momento), ou null se deu certo (`ok` veio true)
  function actionError(json, ok) {
    try {
      const o = JSON.parse(json);
      return o[ok] === true ? null : R.errText(o.error ?? 'sem resposta');
    } catch {
      return R.errText('a live não respondeu');
    }
  }

  // Um aviso da Twitch na conta: o baú apareceu (pega na hora), pontos entraram (rendimento e saldo), o canal aberto fez raid
  // (entra nela) ou abriu um momento (pega).
  async function onTwitchNotice(acc, notice) {
    try {
      const redeemer = redeemerOf('twitch', acc);
      const ps = pubsubs.get(acc);
      redeemer.listeningSince = ps?.connected ? ps.connectedAt : null;
      const channel = notice.channelId ? redeemer.channelOf(notice.channelId) : null;
      if (!channel || !openOf('twitch', acc).includes(channel)) return;
      const message = notice.message;
      const c = cfg();
      if (notice.topic === 'community-points-user-v1' && notice.type === 'points-earned') {
        const data = message.data;
        const gain = data.point_gain;
        const balance = Number.isInteger(data.balance?.balance) ? data.balance.balance : null;
        note(acc, redeemer.earned(channel, gain.reason_code ?? '', gain.total_points, balance));
      } else if (notice.topic === 'community-points-user-v1' && notice.type === 'claim-available' && c.claimTwitch) {
        const { token, device } = await readTwitchLogin(acc);
        if (!token) return;
        const claimId = message.data?.claim?.id ?? null;
        // O id do baú vem no aviso: a consulta de dentro da página nem sempre mostra o baú.
        const result = await D.pages.run(acc, 'twitch', channel,
          redeemer.twitchScript(D.twitchApi, channel, token, device, rewardsOf(c, 'twitch', acc)[0] ?? null, true, false, claimId));
        if (!result) logTwitchProblem(acc, channel, t('lives.tw.chestAppearedNoOpen'));
        const problem = R.claimProblem(result);
        if (problem) logTwitchProblem(acc, channel, t('lives.tw.chestAppeared', { problem }));
        note(acc, redeemer.apply(channel, result));
      } else if (notice.topic === 'raid' && notice.type === 'raid_update_v2') {
        const raid = message.raid;
        const set = taken.get(acc) ?? taken.set(acc, new Set()).get(acc);
        if (set.has(`raid ${raid.id}`)) return; // a Twitch repete o aviso enquanto a raid não sai: entra uma vez só
        set.add(`raid ${raid.id}`);
        const { token, device } = await readTwitchLogin(acc);
        if (!token) return;
        const result = await D.pages.run(acc, 'twitch', channel, R.twitchRaidScript(D.twitchApi, token, device, raid.id));
        const error = actionError(result, 'joined');
        const target = raid.target_login ?? '?';
        logLine(acc, 'twitch', error === null
          ? t('lives.tw.raidJoined', { ch: channel, target })
          : t('lives.tw.raidFail', { ch: channel, target, error }));
        if (error === null) note(acc, t('lives.tw.raidNote', { ch: channel }));
      } else if (notice.topic === 'community-moments-channel-v1' && notice.type === 'active') {
        const momentId = message.data?.moment_id ?? '';
        const set = taken.get(acc) ?? taken.set(acc, new Set()).get(acc);
        if (set.has(`momento ${momentId}`)) return;
        set.add(`momento ${momentId}`);
        const { token, device } = await readTwitchLogin(acc);
        if (!token) return;
        const result = await D.pages.run(acc, 'twitch', channel, R.twitchMomentScript(D.twitchApi, token, device, momentId));
        const error = actionError(result, 'claimed');
        logLine(acc, 'twitch', error === null ? t('lives.tw.momentOk', { ch: channel }) : t('lives.tw.momentFail', { ch: channel, error }));
      }
    } catch {
      // aviso fora do formato, ou a conta fechou no meio: ignora esse
    }
  }

  // ---- bônus das lives no jogo e guarda do bônus ----
  async function readBonus(acc) {
    const slot = slotOf(acc);
    const wc = slot?.view.webContents;
    if (!wc || wc.isDestroyed() || wc.isLoading()) return null;
    try {
      const raw = await wc.executeJavaScript('window.__lives && window.__lives.summary ? JSON.stringify(window.__lives.summary()) : null');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // O tempo que falta do bônus escolhido em cada site, para o menu e os Detalhes (null sem bônus escolhido)
  function bonusLine(acc, summary) {
    const c = cfg();
    const parts = [];
    for (const site of SITE_ORDER) {
      const info = summary[site];
      if (!info) continue;
      for (const r of rewardsOf(c, site, acc)) {
        const left = info.left?.[bonusKind(r)] ?? 0;
        parts.push(`${SITES[site].label} ${kindName(r)}: ${!info.linked ? t('lives.bonus.unlinked') : left > 0 ? bonusTime(left) : t('lives.bonus.expired')}`);
      }
    }
    return parts.length ? t('lives.bonus.line', { parts: parts.join(' · '), guard: c.guard[acc] ? t('lives.bonus.guardOn') : '' }) : null;
  }

  async function refreshBonus(acc) {
    if (bonusBusy.has(acc)) return;
    bonusBusy.add(acc);
    try {
      const summary = await readBonus(acc);
      if (!summary) { bonusInfo.delete(acc); bonusSummary.delete(acc); return; }
      bonusSummary.set(acc, summary);
      const line = bonusLine(acc, summary);
      if (line) bonusInfo.set(acc, line); else bonusInfo.delete(acc);
      await guardBonus(acc, summary);
    } finally {
      bonusBusy.delete(acc);
    }
  }

  // A guarda do bônus da conta, a cada leitura do bônus: em cada site com bônus escolhido, vinculado no jogo e vencendo em
  // menos de 30 min, lê o saldo dos canais fora das lives abertas e resgata 1 no escolhido, pelo mesmo script do resgate
  // automático, numa página escondida do canal. Depois confere no jogo se o tempo do bônus subiu; se não subir, para a guarda
  // naquele site por 1 h e diz no registro.
  async function guardBonus(acc, summary) {
    const c = cfg();
    if (!c.guard[acc] || !summary.connected) return;
    for (const site of SITE_ORDER) {
      const info = summary[site];
      const redeemer = redeemerOf(site, acc);
      if (!info?.linked || redeemer.stopped) continue;
      for (const reward of rewardsOf(c, site, acc)) {
        const slot = guard.slotOf(acc, site, reward);
        if (slot.busy || Date.now() < slot.holdUntil) continue;
        const kind = kindName(reward);
        const left = info.left?.[bonusKind(reward)] ?? 0;
        const log = (text) => logLine(acc, site, text);
        // O último resgate da guarda: o jogo tem de mostrar o tempo a mais (1 h ou mais).
        if (slot.redeemedAt) {
          const since = (Date.now() - slot.redeemedAt) / 1000;
          if (left > slot.leftBefore - since + 1800) slot.redeemedAt = null;
          else if (Date.now() - slot.redeemedAt > guard.CONFIRM_WITHIN_MS) {
            const at = new Date(slot.redeemedAt).toLocaleTimeString(getLang(), { hour: '2-digit', minute: '2-digit' });
            slot.redeemedAt = null;
            slot.holdUntil = Date.now() + 60 * 60 * 1000;
            log(t('lives.guard.notAdded', { at, kind, site: SITES[site].label }));
            continue;
          } else continue;
        }
        if (left > guard.THRESHOLD_MS / 1000) { slot.noneNoted = false; continue; }
        slot.busy = true;
        try {
          let token;
          let device = null;
          if (site === 'kick') token = await readKickToken(acc);
          else ({ token, device } = await readTwitchLogin(acc));
          if (!token) continue;
          const candidates = guard.candidates(c[site === 'kick' ? 'kickChannels' : 'twitchChannels'], info, openOf(site, acc));
          let semLeitura = 0; // leituras da Kick que não passaram nesta conferência (a guarda não tem a página para ler)
          let motivo = null;
          for (const channel of candidates.filter((ch) => guard.stale(slot, ch))) {
            const read = site === 'kick'
              ? await R.kickReadAsync(D.kickReadApi, channel, token, reward, sessionFetch(acc))
              : await R.twitchReadAsync(D.twitchReadApi, channel, token, device, reward);
            if (site === 'kick' && kickReadProblem(read)) { semLeitura++; motivo = kickReadProblem(read); }
            guard.remember(slot, channel, read);
          }
          const when = left > 0 ? t('lives.guard.when.in', { time: bonusTime(left) }) : t('lives.guard.when.expired');
          const pick = guard.pick(slot, candidates, info);
          if (!pick) {
            if (!slot.noneNoted) {
              slot.noneNoted = true;
              const extra = semLeitura ? t('lives.guard.noRead', { n: semLeitura, why: motivo }) : '';
              log(t('lives.guard.none', { kind, when, n: candidates.length, extra }));
            }
            slot.holdUntil = Date.now() + 10 * 60 * 1000;
            continue;
          }
          log(t(pick.live ? 'lives.guard.redeemHere' : 'lives.guard.redeemHereOff', { ch: pick.channel, kind, when, points: pick.points }));
          const script = site === 'kick'
            ? redeemer.kickScript(D.kickApi, pick.channel, token, reward)
            : redeemer.twitchScript(D.twitchApi, pick.channel, token, device, reward, false);
          const result = await D.pages.runOnce(acc, site, pick.channel, script);
          note(acc, redeemer.apply(pick.channel, result));
          slot.reads.delete(pick.channel.toLowerCase());
          if (result.includes('"redeemed":true')) {
            slot.redeemedAt = Date.now();
            slot.leftBefore = left;
            slot.noneNoted = false;
            slot.holdUntil = Date.now() + 60 * 1000;
          } else {
            log(t('lives.guard.failed', { ch: pick.channel, why: result.length === 0 ? t('lives.guard.pageNoAnswer') : result }));
            slot.holdUntil = Date.now() + 10 * 60 * 1000;
          }
        } finally {
          slot.busy = false;
        }
      }
    }
  }

  // ---- ciclo ----
  function tick() {
    seconds++;
    const c = cfg();
    if (seconds % 5 === 0) sleepless(syncAccounts());
    if (!active.size) return;
    if (!liveChecking && Date.now() >= liveCheckAt) sleepless(checkLives());
    if (seconds % 30 === 10) for (const acc of active) sleepless(refreshBonus(acc));
    if (seconds % 30 === 15) sleepless(updateKickWatchers());
    if (!kickRedeeming && Date.now() >= kickRedeemAt && [...active].some((a) => rewardsOf(c, 'kick', a).length && openOf('kick', a).length)) sleepless(redeemKick());
    if (!twitchPointsBusy && Date.now() >= twitchPointsAt && [...active].some((a) => openOf('twitch', a).length)) sleepless(twitchPoints());
  }

  // ---- estado para a barra, o menu e os Detalhes ----
  const stoppedOf = (acc) => SITE_ORDER.map((s) => redeemers[s].get(acc)?.stopped).find(Boolean) ?? null;

  // O que pede uma ação numa conta: resgate parado (urgente) e falta entrar na Twitch/Kick (só um aviso)
  function problemsOf(acc) {
    const stopped = [];
    const login = [];
    const why = stoppedOf(acc);
    if (why) stopped.push(t('lives.problem.stopped', { tag: tag(acc), why }));
    if (twitchLogin.get(acc) === false) login.push(t('lives.problem.login', { tag: tag(acc), site: SITES.twitch.label }));
    else for (const s of SITE_ORDER) if (redeemers[s].get(acc)?.noLogin && openOf(s, acc).length) login.push(t('lives.problem.login', { tag: tag(acc), site: SITES[s].label }));
    return { stopped, login };
  }

  function problems() {
    const out = { stopped: [], login: [] };
    for (const acc of active) {
      const p = problemsOf(acc);
      out.stopped.push(...p.stopped);
      out.login.push(...p.login);
    }
    return out;
  }

  // O estado do botão Lives da barra (geral): none = desligadas; ok = ligadas; idle = falta entrar na Twitch/Kick; changed = resgate parado
  function state() {
    if (!active.size) return { kind: 'none', text: t('lives.state.none'), detail: t('lives.state.noneDetail') };
    const { stopped, login } = problems();
    const summary = [...active].map((a) => `${tag(a)}: Twitch ${openOf('twitch', a).length} · Kick ${openOf('kick', a).length}`).join('\n');
    if (stopped.length) return { kind: 'changed', text: t('lives.state.changed', { n: stopped.length }), detail: `${[...stopped, ...login].join('\n')}\n\n${summary}` };
    if (login.length) return { kind: 'idle', text: t('lives.state.idle'), detail: `${login.join('\n')}\n\n${summary}` };
    return { kind: 'ok', text: t('lives.state.ok'), detail: summary };
  }

  // O estado do botão Lives de UMA conta (mesmos tipos de state()): só a conta dela entra aqui
  function stateOf(acc) {
    const c = cfg();
    if (!c.accounts.includes(acc)) return { kind: 'none', text: t('lives.stateOf.none'), detail: '' };
    if (!active.has(acc)) return { kind: 'none', text: t('lives.stateOf.off'), detail: t('lives.stateOf.offDetail') };
    const { stopped, login } = problemsOf(acc);
    const resumo = short(acc);
    if (stopped.length) return { kind: 'changed', text: t('lives.stateOf.stopped'), detail: [...stopped, ...login, resumo].join('\n') };
    if (login.length) return { kind: 'idle', text: t('lives.state.idle'), detail: [...login, resumo].join('\n') };
    return { kind: 'ok', text: t('lives.stateOf.ok'), detail: resumo };
  }

  // O resumo curto de uma conta ("Twitch: canal 230/300 · Kick: ...")
  function short(acc) {
    const parts = [];
    for (const s of SITE_ORDER) {
      const list = openOf(s, acc).map((ch) => { const b = redeemers[s].get(acc)?.balance(ch); return b ? `${ch} ${b}` : ch; });
      if (list.length) parts.push(`${SITES[s].label}: ${list.join(', ')}`);
    }
    if (twitchLogin.get(acc) === false) parts.unshift(t('lives.short.login'));
    if (stoppedOf(acc)) parts.push(t('lives.short.stopped'));
    return parts.length ? parts.join(' · ') : t('lives.short.none');
  }

  // As lives de cada conta no formato do painel de pontos: [{ acc, twitch: [{ id, nome }], kick: [...] }]
  function accounts() {
    return [...active].sort((a, b) => a - b).map((acc) => ({
      acc,
      twitch: openOf('twitch', acc).map((id) => ({ id, nome: id })),
      kick: openOf('kick', acc).map((id) => ({ id, nome: id })),
    }));
  }

  function details() {
    const rows = [];
    const notes = [];
    for (const acc of [...active].sort((a, b) => a - b)) {
      for (const site of SITE_ORDER) {
        for (const channel of openOf(site, acc)) {
          const w = site === 'twitch' ? watchers.get(acc) : kickWatchers.get(acc);
          rows.push({ acc, accLabel: tag(acc), site: SITES[site].label, channel, light: w?.status(channel) ?? '', points: redeemers[site].get(acc)?.text(channel) ?? '' });
        }
      }
      const stopped = stoppedOf(acc);
      if (stopped) notes.push(t('lives.details.stopped', { tag: tag(acc), why: stopped }));
      if (twitchLogin.get(acc) === false) notes.push(t('lives.problem.login', { tag: tag(acc), site: SITES.twitch.label }));
      if (bonusInfo.has(acc)) notes.push(`${tag(acc)}: ${bonusInfo.get(acc)}`);
      const ps = pubsubs.get(acc);
      if (ps?.error) notes.push(t('lives.details.pubsub', { tag: tag(acc), err: ps.error }));
    }
    return { rows, notes };
  }

  // ---- janelas: login, detalhes, config, registro ----
  let loginWin = null;
  function showLogin(acc, site) {
    if (!SITES[site]) return;
    if (loginWin && !loginWin.isDestroyed()) loginWin.close();
    loginWin = new BrowserWindow({
      width: 1000, height: 760, title: t('lives.login.title', { site: SITES[site].label, tag: tag(acc) }), autoHideMenuBar: true,
      webPreferences: { partition: partitionOf(site, acc) },
    });
    const google = googleLogin.attach(loginWin.webContents, GOOGLE_SITES[site]); // "Entrar com Google" da Kick
    loginWin.webContents.setWindowOpenHandler(({ url }) => {
      if (google.intercept(url)) return { action: 'deny' };
      return { action: 'allow' };
    });
    loginWin.loadURL(SITES[site].loginUrl);
    loginWin.on('closed', () => {
      if (site === 'twitch') twitchLogin.delete(acc), activateLogin(acc);
    });
  }
  // Apaga o login da Twitch/Kick só desta conta (cookies e dados do site na sessão dela), para entrar de novo com a conta certa.
  async function logout(acc, site) {
    const ses = session.fromPartition(partitionOf(site, acc));
    const hosts = site === 'kick' ? ['kick.com'] : ['twitch.tv', 'twitchcdn.net'];
    try {
      for (const ck of await ses.cookies.get({})) {
        const d = String(ck.domain).replace(/^\./, '');
        if (hosts.some((h) => d === h || d.endsWith('.' + h))) await ses.cookies.remove(`https://${d}${ck.path || '/'}`, ck.name).catch(() => {});
      }
      for (const h of hosts) for (const origin of [`https://${h}`, `https://www.${h}`, `https://id.${h}`]) await ses.clearStorageData({ origin }).catch(() => {});
      if (site === 'kick') kickWatchers.get(acc) && stopKickWatcher(acc);
      redeemers[site].get(acc)?.restart?.();
      if (site === 'twitch') twitchLogin.set(acc, false);
      note(acc, t('lives.logout.done', { site: SITES[site].label }));
    } catch (err) {
      note(acc, t('lives.logout.fail', { site: SITES[site].label, err: err?.message ?? err }));
    }
  }
  const activateLogin = async (acc) => { if (active.has(acc)) { twitchLogin.set(acc, !!(await readTwitchLogin(acc)).token); liveCheckAt = 0; } };

  let detailsWin = null;
  function showDetails() {
    if (detailsWin && !detailsWin.isDestroyed()) return detailsWin.focus();
    detailsWin = new BrowserWindow({
      width: 960, height: 480, title: t('lives.win.details'), autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('lives-details.js') },
    });
    loadPage(detailsWin.webContents, UI('lives-details.html'));
  }

  let cfgWin = null;
  function showConfig() {
    if (cfgWin && !cfgWin.isDestroyed()) return cfgWin.focus();
    cfgWin = new BrowserWindow({
      width: 860, height: 700, title: t('lives.win.config'), autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('lives-config.js') },
    });
    loadPage(cfgWin.webContents, UI('lives-config.html'));
  }

  let logWin = null;
  function showLog() {
    if (logWin && !logWin.isDestroyed()) return logWin.focus();
    logWin = new BrowserWindow({
      width: 1000, height: 560, title: t('lives.win.log'), autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('redeem-log.js') },
    });
    loadPage(logWin.webContents, UI('redeem-log.html'));
  }

  // Fecha a live de `channel` nesta conta (ou todas, com null): a vaga dela vai junto, para a conferência de 2 em 2 min não abrir
  // outra no lugar até abrir de novo.
  function closeLive(acc, site, channel) {
    const c = cfg();
    const lim = c[site][acc];
    const max = site === 'kick' ? c.kickLives : c.twitchLives;
    for (const ch of channel === null ? openOf(site, acc) : [channel]) if (!lim.closed.includes(ch)) lim.closed.push(ch);
    lim.slots = channel === null ? 0 : Math.max(0, cfgLib.slotsOf(lim, max) - 1);
    config.set(c);
    applyLives();
    note(acc, channel === null ? t('lives.closed.all', { site: SITES[site].label }) : t('lives.closed.one', { site: SITES[site].label, ch: channel }));
  }

  // Abre de novo a live de `channel` fechada nesta conta (ou todas, com null), com a vaga dela.
  function reopenLive(acc, site, channel) {
    const c = cfg();
    const lim = c[site][acc];
    const max = site === 'kick' ? c.kickLives : c.twitchLives;
    if (channel === null) {
      lim.closed = [];
      lim.slots = null;
    } else if (lim.closed.includes(channel)) {
      lim.closed = lim.closed.filter((x) => x !== channel);
      lim.slots = cfgLib.slotsOf(lim, max) + 1 >= max ? null : cfgLib.slotsOf(lim, max) + 1;
    }
    config.set(c);
    applyLives();
    note(acc, channel === null ? t('lives.reopen.all', { site: SITES[site].label }) : t('lives.reopen.one', { site: SITES[site].label, ch: channel }));
  }

  // As lives de um site no menu da conta: fechar cada aberta ou todas; reabrir cada fechada ou todas
  function liveItems(acc, site) {
    const c = cfg();
    const shut = c[site][acc].closed;
    const opened = openOf(site, acc);
    const items = opened.map((ch) => ({ label: t('lives.menu.close', { ch }), click: () => closeLive(acc, site, ch) }));
    if (opened.length > 1) items.push({ label: t('lives.menu.closeAll'), click: () => closeLive(acc, site, null) });
    if (shut.length) {
      if (items.length) items.push({ type: 'separator' });
      items.push(...shut.map((ch) => ({ label: t('lives.menu.reopen', { ch }), click: () => reopenLive(acc, site, ch) })));
      if (shut.length > 1) items.push({ label: t('lives.menu.reopenAll'), click: () => reopenLive(acc, site, null) });
    }
    return items;
  }

  // Liga ou desliga as lives numa conta (a escolha fica salva). Só a conta mudada é ligada ou desligada.
  function toggleAccount(acc) {
    const c = cfg();
    const accountsOn = c.accounts.includes(acc) ? c.accounts.filter((a) => a !== acc) : [...c.accounts, acc].sort((a, b) => a - b);
    config.set({ ...c, accounts: accountsOn });
    sleepless(syncAccounts());
  }

  // O menu do botão Lives de UMA conta (template do Electron). Só mexe nela: marcar, fechar/reabrir as lives dela,
  // entrar e sair da Twitch/Kick dela, detalhes e registro.
  function accountMenu(acc) {
    const c = cfg();
    const template = [{ label: t('lives.menu.lives'), type: 'checkbox', checked: c.accounts.includes(acc), toolTip: t('lives.menu.livesTip'), click: () => toggleAccount(acc) }];
    if (active.has(acc)) {
      const sites = SITE_ORDER
        .filter((s) => openOf(s, acc).length || c[s][acc].closed.length)
        .map((s) => ({ label: `${SITES[s].label} (${openOf(s, acc).length})`, toolTip: t('lives.menu.siteTip', { site: SITES[s].label }), submenu: liveItems(acc, s) }));
      if (sites.length) template.push({ type: 'separator' }, ...sites);
    }
    template.push(
      { type: 'separator' },
      { label: t('lives.menu.login'), submenu: SITE_ORDER.map((s) => ({ label: SITES[s].label, click: () => showLogin(acc, s) })) },
      { label: t('lives.menu.logout'), submenu: SITE_ORDER.map((s) => ({ label: SITES[s].label, click: () => logout(acc, s) })) },
      { type: 'separator' },
      { label: t('lives.menu.details'), click: showDetails },
      { label: t('lives.menu.log'), click: showLog },
    );
    return template;
  }

  // Dados da janela "Pontos das contas": uma linha por conta, com o login, o bônus escolhido, as lives no ar com o saldo
  // de cada uma e o último resgate da conta. Só lê.
  async function pointsRows() {
    const c = cfg();
    const on = new Set(running());
    const last = rlog.read(200);
    const rows = [];
    for (const acc of accountIds()) {
      const sites = {};
      for (const s of SITE_ORDER) {
        const token = s === 'twitch' ? (await readTwitchLogin(acc)).token : await readKickToken(acc);
        const r = redeemers[s].get(acc);
        sites[s] = {
          login: !!token,
          bonus: rewardsOf(c, s, acc).map((k) => BONUSES[k]?.label ?? k).join(' + ') || t('lives.bonus.noneShort'),
          stopped: r?.stopped ?? null,
          channels: openOf(s, acc).map((ch) => ({ channel: ch, text: r?.text(ch) ?? '' })),
        };
      }
      const mine = last.find((x) => String(x.acc) === String(acc));
      rows.push({
        acc,
        label: tag(acc),
        running: on.has(acc),
        lives: c.accounts.includes(acc),
        sites,
        last: mine ? { t: mine.t, detalhe: `${mine.detalhe}` } : null,
      });
    }
    return rows;
  }

  // Salvar a configuração: as lives abertas reabrem com os canais novos e o resgate recomeça do zero
  function reopenAll() {
    for (const acc of [...active]) deactivate(acc);
    for (const site of SITE_ORDER) for (const r of redeemers[site].values()) r.restart();
    guard.restart();
    liveNow.twitch = {};
    liveNow.kick = {};
    sleepless(syncAccounts());
  }

  ipcMain.handle('lives:config-get', () => ({
    config: cfg(),
    accounts: accountIds(),
    labels: Object.fromEntries(accountIds().map((a) => [a, tag(a)])),
    bonuses: Object.fromEntries(Object.entries(BONUSES).map(([k, b]) => [k, { ...b, label: t(`lives.bonus.${k}`) }])),
    limits: { max: cfgLib.MAX_SLOTS },
    live: { twitch: { ...liveNow.twitch }, kick: { ...liveNow.kick } },
  }));
  // Optimize: reads what every channel of the lists charges for each bonus (with the login of the first account that has one on
  // that site) and ranks the channels by price, cheapest first; channels with the cheap bonus disabled or more expensive go last.
  // `lists` = { twitch: [channel], kick: [channel] } as shown in the window (maybe unsaved); `keys` = { twitch: [bonus], kick: [bonus] }.
  // Returns { twitch, kick } with { acc, order, rows, keys } or { error } per site. Reads only: nothing is redeemed or saved.
  const OPTIMIZE_PARALLEL = 4;
  async function optimizeChannels(lists = {}, keys = {}) {
    const out = {};
    for (const site of SITE_ORDER) {
      const channels = cfgLib.parseChannels(lists[site]);
      if (!channels.length) { out[site] = { acc: null, order: [], rows: [], keys: [] }; continue; }
      let acc = null, token = null, device = null;
      for (const a of accountIds()) {
        if (site === 'twitch') ({ token, device } = await readTwitchLogin(a)); else token = await readKickToken(a);
        if (token) { acc = a; break; }
      }
      if (!token) { out[site] = { error: 'noLogin' }; continue; }
      const reads = {};
      const all = Object.keys(BONUSES);
      for (let i = 0; i < channels.length; i += OPTIMIZE_PARALLEL) {
        await Promise.all(channels.slice(i, i + OPTIMIZE_PARALLEL).map(async (ch) => {
          try {
            reads[ch] = site === 'kick'
              ? await R.kickReadAsync(D.kickReadApi, ch, token, all, sessionFetch(acc))
              : await R.twitchReadAsync(D.twitchReadApi, ch, token, device, all);
          } catch { reads[ch] = null; }
        }));
      }
      out[site] = { acc, ...optimize.rank(channels, reads, R.keysOf(keys[site]), site) };
    }
    return out;
  }
  ipcMain.handle('lives:optimize', (_e, lists, keys) => optimizeChannels(lists, keys));
  ipcMain.handle('lives:official-channels', () => officialChannels());
  ipcMain.handle('lives:config-save', (_e, raw) => {
    config.set(cfgLib.normalize(raw, { maxAccounts }));
    reopenAll();
    return cfg();
  });
  ipcMain.handle('lives:details', () => details());
  ipcMain.handle('pts:log', () => ({ file: rlog.file, rows: rlog.read().map((r) => ({ ...r, accLabel: accountNames.label(r.acc) })) }));

  if (timers) timer = setInterval(tick, 1000);
  sleepless(syncAccounts());

  return {
    state,
    stateOf,
    accounts,
    details,
    pointsRows,
    accountMenu,
    showConfig,
    showLog,
    showDetails,
    showLogin,
    logout,
    toggleAccount,
    closeLive,
    reopenLive,
    reopenAll,
    migrateLogins,
    log: rlog,
    redeemerOf,
    // Para os testes
    tick,
    syncAccounts,
    checkLives,
    applyLives,
    officialChannels,
    optimizeChannels,
    redeemKick,
    twitchPoints,
    refreshBonus,
    onTwitchNotice,
    open: (site, acc) => openOf(site, acc),
    stop() {
      clearInterval(timer);
      for (const acc of [...active]) deactivate(acc);
    },
  };
}

module.exports = { createLives, classify };
