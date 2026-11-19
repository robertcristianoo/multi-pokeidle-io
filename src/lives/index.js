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
const noteKind = (t) => (/recusado|parei|gastos fora|não passou/i.test(t) ? 'fail' : /resgatei|pegou|entrei/i.test(t) ? 'ok' : 'info');

// Classifica a linha de registro ("canal: o que houve") no evento do registro dos resgates
function classify(detalhe) {
  if (/^(resgatou|pegou|entrou na raid)/i.test(detalhe)) return 'resgatou';
  if (/parei|voltaram/i.test(detalhe)) return 'parou';
  if (/recusad|não passou|não somou|não veio|não abriu|caiu de/i.test(detalhe)) return 'recusado';
  if (/erro|não respond|sem resposta/i.test(detalhe)) return 'erro';
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
    logLine(acc, site, `${gone.join(', ')}: ficou offline; abri ${added.join(', ')} no lugar`);
    note(acc, `${SITES[site].label}: ${gone.join(', ')} ficou offline; abri ${added.join(', ')}`);
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
    if (missing.length) return `o combo ${keys.map(label).join(' + ')} aguarda: sem canal liberado com ${missing.map(label).join(', ')}`;
    if (!eligible.length) return `o combo ${keys.map(label).join(' + ')} aguarda saldo: nenhum canal com pontos para resgatar`;
    const saldos = eligible.map((e) => `${e.channel} ${e.points}`).join(', ');
    return `o combo ${keys.map(label).join(' + ')} aguarda saldo: nenhuma divisão pelos canais cobre todos os bônus (saldos: ${saldos})`;
  };
  async function comboCheck(acc, site, redeemer, rewards, reads, scriptOf) {
    const keys = R.keysOf(rewards);
    const parsed = reads.map(({ channel, read }) => {
      let info = null;
      try { info = JSON.parse(read); } catch { info = null; }
      return { channel, read, info };
    });
    const eligible = parsed
      .filter((p) => p.info && Number.isInteger(p.info.points) && redeemer.spendable(p.channel, p.info.points))
      .map((p) => ({ channel: p.channel, points: p.info.points, options: p.info.options ?? [] }));
    const round = R.planRound(keys, eligible);
    const slotKey = `${acc}|${site}`;
    const ran = new Set();
    if (round) {
      comboNoted.delete(slotKey);
      for (const a of round) {
        ran.add(a.channel);
        const result = await D.pages.run(acc, site, a.channel, scriptOf(a.channel, a.key));
        note(acc, redeemer.apply(a.channel, result));
        if (keys.length > 1 && !result.includes('"redeemed":true')) break;
      }
    } else if (keys.length > 1) {
      const text = waitText(keys, eligible);
      if (comboNoted.get(slotKey) !== text) {
        comboNoted.set(slotKey, text);
        logLine(acc, site, text);
      }
    }
    // Os canais que não resgataram nesta conferência só anotam a leitura (o saldo deles não mudou)
    for (const p of parsed) if (!ran.has(p.channel)) note(acc, redeemer.apply(p.channel, p.read));
  }

  // O motivo de a leitura da Kick sem a página não ter passado (saldo não lido), ou null se leu os pontos
  const kickReadProblem = (read) => {
    let root = null;
    try { root = JSON.parse(read); } catch { root = null; }
    if (root?.failed) return root.failed;
    return Number.isInteger(root?.points) ? null : 'resposta estranha';
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
              logTwitchProblem(acc, channel, `a leitura do saldo sem a página não passou (${problem}); abri o player`, 'kick');
              const result = await D.pages.run(acc, 'kick', channel, redeemer.kickScript(D.kickApi, channel, token, rewards[0], rewards.length === 1));
              if (!result) logTwitchProblem(acc, channel, 'o player não abriu', 'kick');
              note(acc, redeemer.apply(channel, result));
              continue;
            }
            reads.push({ channel, read });
          }
          await comboCheck(acc, 'kick', redeemer, rewards, reads, (channel, key) => redeemer.kickScript(D.kickApi, channel, token, key));
        } catch (e) {
          // Um erro aqui não pode parar o resgate da Kick em silêncio: vai para o registro e a próxima conferência tenta de novo
          logLine(acc, 'kick', `o resgate da Kick parou por um erro (${(e && e.message) || e}); tento de novo na próxima conferência`);
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
            if (failed) logTwitchProblem(acc, channel, `a leitura do saldo sem a página não passou (${failed}); abri o player`);
            const result = await D.pages.run(acc, 'twitch', channel, redeemer.twitchScript(D.twitchApi, channel, token, device, null, claim));
            if (!result) logTwitchProblem(acc, channel, `o player não abriu${chestWaiting ? ' (com o baú esperando)' : ''}`);
            if (chestWaiting && R.claimProblem(result)) logTwitchProblem(acc, channel, `o baú estava esperando, mas ${R.claimProblem(result)}`);
            note(acc, redeemer.apply(channel, result));
            continue;
          }
          reads.push({ channel, read });
        }
        await comboCheck(acc, 'twitch', redeemer, rewards, reads, (channel, key) => redeemer.twitchScript(D.twitchApi, channel, token, device, key, false));
        updatePubSub(acc, token);
        updateWatcher(acc, token, device);
        for (const quiet of redeemer.newQuiet(openOf('twitch', acc))) {
          note(acc, `Twitch: ${quiet} está aberta há ${Math.round(redeemer.quietLimit / 60000)} min sem os pontos de assistir`);
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
      return o[ok] === true ? null : (o.error ?? 'sem resposta');
    } catch {
      return 'a live não respondeu';
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
        if (!result) logTwitchProblem(acc, channel, 'o baú apareceu, mas o player não abriu');
        const problem = R.claimProblem(result);
        if (problem) logTwitchProblem(acc, channel, `o baú apareceu, mas ${problem}`);
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
        logLine(acc, 'twitch', error === null
          ? `${channel}: entrou na raid (para ${raid.target_login ?? '?'})`
          : `${channel}: a raid (para ${raid.target_login ?? '?'}) não passou (${error})`);
        if (error === null) note(acc, `Twitch: entrei na raid de ${channel}`);
      } else if (notice.topic === 'community-moments-channel-v1' && notice.type === 'active') {
        const momentId = message.data?.moment_id ?? '';
        const set = taken.get(acc) ?? taken.set(acc, new Set()).get(acc);
        if (set.has(`momento ${momentId}`)) return;
        set.add(`momento ${momentId}`);
        const { token, device } = await readTwitchLogin(acc);
        if (!token) return;
        const result = await D.pages.run(acc, 'twitch', channel, R.twitchMomentScript(D.twitchApi, token, device, momentId));
        const error = actionError(result, 'claimed');
        logLine(acc, 'twitch', error === null ? `${channel}: pegou o momento` : `${channel}: o momento não passou (${error})`);
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
        parts.push(`${SITES[site].label} ${kindName(r)}: ${!info.linked ? 'não vinculada no jogo' : left > 0 ? bonusTime(left) : 'vencido'}`);
      }
    }
    return parts.length ? `Bônus das lives: ${parts.join(' · ')}${c.guard[acc] ? ' (guarda do bônus ligada)' : ''}` : null;
  }

  async function refreshBonus(acc) {
    if (bonusBusy.has(acc)) return;
    bonusBusy.add(acc);
    try {
      const summary = await readBonus(acc);
      if (!summary) { bonusInfo.delete(acc); return; }
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
            const at = new Date(slot.redeemedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            slot.redeemedAt = null;
            slot.holdUntil = Date.now() + 60 * 60 * 1000;
            log(`guarda do bônus: o resgate das ${at} não somou no bônus de ${kind} do jogo (${SITES[site].label} vinculada?); paro a guarda aqui por 1 h`);
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
          const when = left > 0 ? `vence em ${bonusTime(left)}` : 'venceu';
          const pick = guard.pick(slot, candidates, info);
          if (!pick) {
            if (!slot.noneNoted) {
              slot.noneNoted = true;
              const nao = semLeitura ? `, ${semLeitura} sem leitura da Kick: ${motivo}` : '';
              log(`guarda do bônus: o de ${kind} ${when}, e nenhum canal fora das lives abertas tem os pontos (${candidates.length} conferidos${nao})`);
            }
            slot.holdUntil = Date.now() + 10 * 60 * 1000;
            continue;
          }
          log(`${pick.channel}: guarda do bônus: o de ${kind} ${when}; resgato aqui (${pick.points} pontos${pick.live ? ')' : ', canal offline)'}`);
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
            log(`${pick.channel}: guarda do bônus: o resgate não passou (${result.length === 0 ? 'a página do canal não respondeu' : result}); tento de novo em 10 min`);
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
    if (why) stopped.push(`${tag(acc)}: resgate parado (${why})`);
    if (twitchLogin.get(acc) === false) login.push(`${tag(acc)}: entre na Twitch (botão Lives da conta › Entrar)`);
    else for (const s of SITE_ORDER) if (redeemers[s].get(acc)?.noLogin && openOf(s, acc).length) login.push(`${tag(acc)}: entre na ${SITES[s].label} (botão Lives da conta › Entrar)`);
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
    if (!active.size) return { kind: 'none', text: 'Lives desligadas', detail: 'Clique para abrir a configuração das lives' };
    const { stopped, login } = problems();
    const summary = [...active].map((a) => `${tag(a)}: Twitch ${openOf('twitch', a).length} · Kick ${openOf('kick', a).length}`).join('\n');
    if (stopped.length) return { kind: 'changed', text: `Lives: ${stopped.length} resgate(s) parado(s)`, detail: `${[...stopped, ...login].join('\n')}\n\n${summary}` };
    if (login.length) return { kind: 'idle', text: 'Lives: falta entrar na Twitch/Kick', detail: `${login.join('\n')}\n\n${summary}` };
    return { kind: 'ok', text: 'Lives ligadas', detail: summary };
  }

  // O estado do botão Lives de UMA conta (mesmos tipos de state()): só a conta dela entra aqui
  function stateOf(acc) {
    const c = cfg();
    if (!c.accounts.includes(acc)) return { kind: 'none', text: 'Lives desligadas nesta conta', detail: '' };
    if (!active.has(acc)) return { kind: 'none', text: 'Lives marcadas, mas a conta está desligada', detail: 'As lives voltam ao ligar a conta.' };
    const { stopped, login } = problemsOf(acc);
    const resumo = short(acc);
    if (stopped.length) return { kind: 'changed', text: 'Lives: resgate parado', detail: [...stopped, ...login, resumo].join('\n') };
    if (login.length) return { kind: 'idle', text: 'Lives: falta entrar na Twitch/Kick', detail: [...login, resumo].join('\n') };
    return { kind: 'ok', text: 'Lives ligadas nesta conta', detail: resumo };
  }

  // O resumo curto de uma conta ("Twitch: canal 230/300 · Kick: ...")
  function short(acc) {
    const parts = [];
    for (const s of SITE_ORDER) {
      const list = openOf(s, acc).map((ch) => { const b = redeemers[s].get(acc)?.balance(ch); return b ? `${ch} ${b}` : ch; });
      if (list.length) parts.push(`${SITES[s].label}: ${list.join(', ')}`);
    }
    if (twitchLogin.get(acc) === false) parts.unshift('⚠ entre na Twitch');
    if (stoppedOf(acc)) parts.push('⚠ resgate parado');
    return parts.length ? parts.join(' · ') : 'nenhuma live no ar';
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
      if (stopped) notes.push(`${tag(acc)}: resgate parado: ${stopped}`);
      if (twitchLogin.get(acc) === false) notes.push(`${tag(acc)}: entre na Twitch (botão Lives da conta › Entrar)`);
      if (bonusInfo.has(acc)) notes.push(`${tag(acc)}: ${bonusInfo.get(acc)}`);
      const ps = pubsubs.get(acc);
      if (ps?.error) notes.push(`${tag(acc)}: avisos da Twitch: ${ps.error}`);
    }
    return { rows, notes };
  }

  // ---- janelas: login, detalhes, config, registro ----
  let loginWin = null;
  function showLogin(acc, site) {
    if (!SITES[site]) return;
    if (loginWin && !loginWin.isDestroyed()) loginWin.close();
    loginWin = new BrowserWindow({
      width: 1000, height: 760, title: `Entrar na ${SITES[site].label} - ${tag(acc)}`, autoHideMenuBar: true,
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
      note(acc, `${SITES[site].label}: login apagado nesta conta. Use Lives › Entrar para entrar de novo.`);
    } catch (err) {
      note(acc, `${SITES[site].label}: não consegui apagar o login (${err?.message ?? err})`);
    }
  }
  const activateLogin = async (acc) => { if (active.has(acc)) { twitchLogin.set(acc, !!(await readTwitchLogin(acc)).token); liveCheckAt = 0; } };

  let detailsWin = null;
  function showDetails() {
    if (detailsWin && !detailsWin.isDestroyed()) return detailsWin.focus();
    detailsWin = new BrowserWindow({
      width: 960, height: 480, title: 'Detalhes das lives - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('lives-details.js') },
    });
    detailsWin.loadFile(UI('lives-details.html'));
  }

  let cfgWin = null;
  function showConfig() {
    if (cfgWin && !cfgWin.isDestroyed()) return cfgWin.focus();
    cfgWin = new BrowserWindow({
      width: 860, height: 700, title: 'Config das lives - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('lives-config.js') },
    });
    cfgWin.loadFile(UI('lives-config.html'));
  }

  let logWin = null;
  function showLog() {
    if (logWin && !logWin.isDestroyed()) return logWin.focus();
    logWin = new BrowserWindow({
      width: 1000, height: 560, title: 'Log de resgates - Multi PokeIdle IO', autoHideMenuBar: true,
      webPreferences: { preload: PRELOAD('redeem-log.js') },
    });
    logWin.loadFile(UI('redeem-log.html'));
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
    note(acc, channel === null ? `${SITES[site].label}: fechei todas as lives` : `${SITES[site].label}: fechei a live de ${channel}`);
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
    note(acc, channel === null ? `${SITES[site].label}: as lives voltam a abrir` : `${SITES[site].label}: ${channel} volta a abrir (se estiver no ar)`);
  }

  // As lives de um site no menu da conta: fechar cada aberta ou todas; reabrir cada fechada ou todas
  function liveItems(acc, site) {
    const c = cfg();
    const shut = c[site][acc].closed;
    const opened = openOf(site, acc);
    const items = opened.map((ch) => ({ label: `Fechar ${ch}`, click: () => closeLive(acc, site, ch) }));
    if (opened.length > 1) items.push({ label: 'Fechar todas', click: () => closeLive(acc, site, null) });
    if (shut.length) {
      if (items.length) items.push({ type: 'separator' });
      items.push(...shut.map((ch) => ({ label: `Reabrir ${ch}`, click: () => reopenLive(acc, site, ch) })));
      if (shut.length > 1) items.push({ label: 'Reabrir todas', click: () => reopenLive(acc, site, null) });
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
    const template = [{ label: 'Lives', type: 'checkbox', checked: c.accounts.includes(acc), toolTip: 'Mantém as lives desta conta', click: () => toggleAccount(acc) }];
    if (active.has(acc)) {
      const sites = SITE_ORDER
        .filter((s) => openOf(s, acc).length || c[s][acc].closed.length)
        .map((s) => ({ label: `${SITES[s].label} (${openOf(s, acc).length})`, toolTip: `Lives da ${SITES[s].label} no ar nesta conta`, submenu: liveItems(acc, s) }));
      if (sites.length) template.push({ type: 'separator' }, ...sites);
    }
    template.push(
      { type: 'separator' },
      { label: 'Entrar', submenu: SITE_ORDER.map((s) => ({ label: SITES[s].label, click: () => showLogin(acc, s) })) },
      { label: 'Sair', submenu: SITE_ORDER.map((s) => ({ label: SITES[s].label, click: () => logout(acc, s) })) },
      { type: 'separator' },
      { label: 'Detalhes', click: showDetails },
      { label: 'Registro', click: showLog },
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
          bonus: rewardsOf(c, s, acc).map((k) => BONUSES[k]?.label ?? k).join(' + ') || 'nenhum',
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
    bonuses: BONUSES,
    limits: { max: cfgLib.MAX_SLOTS },
    live: { twitch: { ...liveNow.twitch }, kick: { ...liveNow.kick } },
  }));
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
