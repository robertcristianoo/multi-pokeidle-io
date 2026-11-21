// Gerenciador de lives (src/lives): a configuração (normalização e migração), a guarda do bônus (escolha do canal) e o fluxo
// completo de uma conta (quem está no ar, leitura do saldo, resgate pela página, registro, estado do botão), com a rede e as
// páginas falsas: nada sai para a internet.
const fs = require('fs');
const os = require('os');
const http = require('http');
const path = require('path');
const { app, session, BrowserWindow } = require('electron');
const { check, finish, waitFor } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // os textos conferidos abaixo são os em português
const cfgLib = require('../src/lives/config');
const { createGuard, kindName, time } = require('../src/lives/guard');
const { createLives, classify } = require('../src/lives');

const rewards = (prefix) => [
  { id: 'r10', title: `Bônus de +15% ${prefix} 10h PokeIdle`, description: 'pokeidle', cost: 3000, is_enabled: true, is_paused: false },
  { id: 'r1', title: `Bônus de +15% ${prefix} 1h PokeIdle`, description: 'pokeidle', cost: 300, is_enabled: true, is_paused: false },
];

// as janelas de config e detalhes fecham no meio do teste: sem isto o Electron sairia ao fechar a última
app.on('window-all-closed', () => {});

app.whenReady().then(async () => {
  let server = null;
  let dir = null;
  let lives = null;
  try {
    // ---- configuração ----
    const d = cfgLib.normalize({});
    check(JSON.stringify(d.accounts) === '[1]' && d.twitchLives === 2 && d.kickLives === 2 && d.claimTwitch === true, 'config de fábrica: conta 1, 2 vagas por site, baú ligado');
    check(d.guard[1] === true && d.guard[4] === true, 'config de fábrica: guarda do bônus ligada em todas as contas');
    check(cfgLib.parseChannels('https://kick.com/Yetz/\n@Rodil, biscoitao yetz').join() === 'yetz,rodil,biscoitao', 'canais: aceita endereço colado, @, vírgula e tira repetidos');
    const n = cfgLib.normalize({ accounts: [2, 2, 9, 1], redeemKick: { 1: 'xp', 2: 'nada', 7: 'shiny' }, twitchLives: 99, twitch: { 1: { slots: 5, closed: ['A'] } } });
    check(n.accounts.join() === '1,2' && n.redeemKick[1].join() === 'xp' && !n.redeemKick[2] && !n.redeemKick[7], 'config: contas e bônus inválidos caem fora (texto antigo vira lista de um item)');
    check(cfgLib.normalize({ redeemKick: { 1: ['captura', 'xp', 'captura', 'nada'] } }).redeemKick[1].join() === 'captura,xp', 'config: lista de bônus na ordem de prioridade, sem repetir nem inválidos');
    check(cfgLib.normalize({ redeemKick: { 1: '' }, redeemTwitch: { 1: [] } }).redeemKick[1] === undefined && cfgLib.normalize({ redeemTwitch: { 1: [] } }).redeemTwitch[1] === undefined, 'config: não resgatar (vazio) não guarda entrada');
    check(cfgLib.normalize({ redeemTwitch: { 1: ['shiny', 'xp'] } }).redeemTwitch[1].join() === 'shiny,xp' && cfgLib.rewardList(['xp', 'zzz']).join() === 'xp', 'config: lista da Twitch e lista de chaves válidas');
    check(n.twitchLives === 10 && n.twitch[1].slots === 5 && n.twitch[1].closed.join() === 'a', 'config: teto de vagas e canais fechados em minúsculo');
    check(cfgLib.normalize({ twitchLives: 3, twitch: { 1: { slots: 3 } } }).twitch[1].slots === null, 'config: chegar ao limite é ter todas as vagas (null)');
    const mig = cfgLib.normalize({}, { legacyAuto: { 1: { kick: 'captura', twitch: 'shiny' }, 2: { kick: 'xyz' } } });
    check(mig.redeemKick[1].join() === 'captura' && mig.redeemTwitch[1].join() === 'shiny' && !mig.redeemKick[2], 'config: migra o resgate automático da versão anterior (lista de um item)');
    check(cfgLib.normalize({ redeemKick: {} }, { legacyAuto: { 1: { kick: 'xp' } } }).redeemKick[1] === undefined, 'config: a escolha nova vence a antiga');

    const merged = cfgLib.mergeOfficial(['yetz', 'axt'], [{ login: 'AXT', live: true }, { login: 'rodil', live: false }, { login: 'novo_canal', live: true }, { login: '', live: true }]);
    check(merged.list.join() === 'yetz,axt,rodil,novo_canal' && merged.added.join() === 'rodil,novo_canal', `lista oficial: acrescenta no fim, sem repetir nem mexer na ordem (${merged.list})`);
    check(cfgLib.move(['a', 'b', 'c', 'd'], 3, 0).join() === 'd,a,b,c' && cfgLib.move(['a', 'b', 'c'], 0, 1).join() === 'b,a,c' && cfgLib.move(['a', 'b'], 0, 5).join() === 'a,b', 'reordenar: mover para cima, para baixo e índice inválido');

    // ordenar por status: no ar primeiro; quem ficou no ar vai para o fim dos no ar, quem caiu desce para o começo dos offline
    check(cfgLib.sortByStatus(['a', 'b', 'c', 'd'], { a: false, b: true, c: false, d: true }).join() === 'b,d,a,c', 'ordenar por status: sem histórico, no ar primeiro mantendo a ordem');
    check(cfgLib.sortByStatus(['b', 'd', 'a', 'c'], { a: true, b: true, c: false, d: true }, { a: false, b: true, c: false, d: true }).join() === 'b,d,a,c', 'ordenar por status: quem ficou no ar vai para o fim dos no ar');
    check(cfgLib.sortByStatus(['b', 'd', 'a', 'c'], { a: false, b: false, c: false, d: true }, { a: true, b: true, c: false, d: true }).join() === 'd,b,a,c', 'ordenar por status: quem caiu desce, logo abaixo dos no ar');
    check(cfgLib.sortByStatus(['b', 'a'], { a: null, b: null }, { a: true, b: false }).join() === 'a,b', 'ordenar por status: sem resposta vale o que era');
    check(cfgLib.normalize({ autoSort: true }).autoSort === true && cfgLib.normalize({}).autoSort === false, 'config: autoSort liga só quando true');

    // ---- guarda do bônus ----
    let clock = 1_000_000;
    const guard = createGuard({ now: () => clock });
    const slot = guard.slotOf(1, 'kick');
    const site = { channels: [{ login: 'Aberto', live: true }, { login: 'parado', live: false }, { login: 'rico', live: true }] };
    const cands = guard.candidates(['aberto', 'pobre'], site, ['Aberto']);
    check(cands.join() === 'pobre,parado,rico', `guarda: candidatos sem os abertos (${cands.join()})`);
    check(cands.every((c) => guard.stale(slot, c)), 'guarda: sem leitura, precisa ler');
    guard.remember(slot, 'pobre', '{"points":10,"cost":300}');
    guard.remember(slot, 'parado', '{"points":400,"cost":300,"paused":false}');
    guard.remember(slot, 'rico', '{"points":900,"cost":300}');
    check(!guard.stale(slot, 'rico'), 'guarda: leitura recente vale');
    check(guard.pick(slot, cands, site)?.channel === 'parado', 'guarda: offline primeiro (os pontos dele estão parados)');
    guard.remember(slot, 'parado', '{"points":400,"cost":300,"paused":true}');
    check(guard.pick(slot, cands, site)?.channel === 'rico', 'guarda: bônus pausado fica de fora');
    clock += 31 * 60 * 1000;
    check(guard.stale(slot, 'rico'), 'guarda: leitura com mais de 30 min é lida de novo');
    check(kindName('captura') === 'Captura' && time(5400) === '1 h 30 min' && time(60) === '1 min', 'guarda: nomes e tempos');
    check(classify('resgatou x (300 pontos)') === 'resgatou' && classify('o resgate de x foi recusado (erro 422)') === 'recusado'
      && classify('os pontos do último resgate voltaram') === 'parou', 'registro: classifica os eventos');

    // ---- fluxo da conta ----
    const hits = [];
    let points = 400;
    let extraRewards = false; // o Captura aparece no canal (combo de dois bônus)
    let kickFails = false; // a API da Kick recusa a leitura sem a página (403)
    const CAPTURA = { id: 'rc', title: 'Bônus de Captura 1h PokeIdle', description: 'pokeidle', cost: 500, is_enabled: true, is_paused: false };
    server = http.createServer((req, res) => {
      hits.push(req.url);
      const m = /^\/api\/v2\/channels\/([^/]+)(\/.*)?$/.exec(req.url);
      const send = (o) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
      if (kickFails && m?.[2] === '/points') { res.writeHead(403); return res.end('{}'); }
      if (m?.[2] === '/points') return send({ data: { points: m[1] === 'rico' ? 900 : points } });
      if (m?.[2] === '/rewards') return send({ data: extraRewards ? [...rewards('XP'), CAPTURA] : rewards('XP') });
      res.writeHead(404); res.end('{}');
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const api = `http://127.0.0.1:${server.address().port}`;

    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-lives-'));
    await session.fromPartition('persist:conta1').cookies.set({ url: 'https://kick.com', name: 'session_token', value: 'tok%20en' });
    await session.fromPartition('persist:conta1').cookies.set({ url: 'https://www.twitch.tv', name: 'auth-token', value: 'twtok' });

    let store = { accounts: [1], kickChannels: ['off', 'a', 'b', 'c'], twitchChannels: [], kickLives: 2, twitchLives: 0, redeemKick: { 1: 'xp' } };
    const kickOn = {}; // quem está no ar (canal -> true | false | null); sem entrada: no ar, menos 'off'
    const ran = [];
    const once = [];
    const notices = [];
    let summary = null; // o que o preload do jogo devolveria (guarda do bônus)
    const fakeView = { webContents: { isDestroyed: () => false, isLoading: () => false, executeJavaScript: async () => (summary ? JSON.stringify(summary) : null) } };
    let slotIds = [1]; // contas com o jogo carregado (ligadas na grade)
    lives = createLives({
      mainWin: null,
      getSlots: () => slotIds.map((id) => ({ id, view: fakeView })),
      config: { get: () => store, set: (c) => { store = c; } },
      userDataDir: dir,
      notify: (x) => notices.push(x),
      timers: false,
      deps: {
        kickLive: { ...require('../src/lives/kick-live'), isLiveAsync: async (c) => (c in kickOn ? kickOn[c] : c !== 'off') },
        twitchLive: { liveAsync: async () => ({}) },
        pages: {
          run: async (acc, siteName, channel, script) => {
            ran.push({ acc, siteName, channel, script });
            return JSON.stringify({ points: 400, cost: 300, title: 'Bônus de +15% XP 1h PokeIdle', redeemed: true, status: 200 });
          },
          runOnce: async (acc, siteName, channel, script) => {
            once.push({ acc, siteName, channel, script });
            return JSON.stringify({ points: 900, cost: 300, title: 'Bônus de +15% XP 1h PokeIdle', redeemed: true, status: 200 });
          },
          closeAccount: () => {},
        },
        TwitchWatcher: class { constructor() { this.token = 't'; this.userId = 'u'; } setChannels() {} dispose() {} status() { return ''; } },
        KickWatcher: class { constructor(e, t) { this.token = t; this.set = []; } setChannels(c) { this.set = c; } dispose() {} status() { return 'leve ✓ 10:00'; } },
        kickReadApi: api,
        kickApi: api,
      },
    });
    check(lives.state().kind !== 'none', 'conta marcada e ligada: as lives aparecem ligadas no botão');
    await lives.syncAccounts();
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'a,b', `abre só as primeiras no ar, até o limite (${lives.open('kick', 1).join()})`);
    check(lives.accounts()[0].kick.map((l) => l.id).join() === 'a,b', 'painel de pontos recebe as lives abertas da conta');

    await lives.redeemKick();
    check(ran.length === 2 && ran.every((r) => r.siteName === 'kick' && /"channel":"(a|b)"/.test(r.script)), `saldo dá para resgatar: abre a página de cada live (${ran.length})`);
    check(ran[0].script.includes('Bearer') && ran[0].script.includes('"token":"tok en"'), 'resgate usa o login da conta (cookie session_token decodificado)');
    const rows = lives.log.read();
    check(rows.filter((r) => r.evento === 'resgatou').length === 2 && rows[0].acc === '1' && rows[0].site === 'kick', `registro: resgatou nas duas lives (${rows.length} linhas)`);
    check(notices.some((x) => x.kind === 'ok' && /resgatei/.test(x.text)), 'aviso na tela do resgate');
    check(lives.redeemerOf('kick', 1).text('a').includes('pontos'), 'texto do saldo do canal para o painel e os Detalhes');
    check(lives.details().rows.length === 2 && lives.details().rows[0].light === '' , 'detalhes: uma linha por live aberta');

    // sem saldo: só a leitura, sem abrir a página
    points = 10;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 0, 'sem saldo para o bônus: não abre a página');

    // leitura da API da Kick que não passa (403): a página lê e resgata como antes, e o registro diz o motivo
    kickFails = true;
    points = 400;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 2 && ran.every((r) => r.siteName === 'kick' && r.script.includes('"spend":true')), `leitura da API que falha: a página lê e resgata nas duas lives (${ran.length})`);
    check(lives.log.read().some((r) => /leitura do saldo sem a página não passou \(erro 403\)/.test(r.detalhe)), 'leitura da API que falha: o registro diz o motivo');
    // dois bônus com a leitura da API falhando: a página só lê (o combo espera a leitura pela API)
    store = { ...store, redeemKick: { 1: ['xp', 'captura'] } };
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 2 && ran.every((r) => r.script.includes('"spend":false')), `combo com a leitura da API falhando: a página só lê, sem resgatar (${ran.length})`);
    store = { ...store, redeemKick: { 1: 'xp' } };
    kickFails = false;

    // combo de dois bônus (XP + Captura, nesta ordem): com 350 nos canais o Captura (500) não cabe, então nada resgata e espera
    extraRewards = true;
    store = { ...store, redeemKick: { 1: ['xp', 'captura'] }, comboAll: { 1: true } };
    points = 350;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 0 && lives.log.read().some((r) => /aguarda saldo/.test(r.detalhe)), 'combo: saldo que não cobre o combo inteiro não resgata nada e avisa no registro');
    // 900 no canal: 300 (XP) + 500 (Captura) = 800 cabem no mesmo canal: uma rodada, um de cada, na ordem da lista
    points = 900;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 2 && ran[0].channel === 'a' && ran[1].channel === 'a' && /bxp/.test(ran[0].script) && /captur/.test(ran[1].script),
      `combo: um de cada, na ordem da lista, somando o saldo do canal (${ran.map((r) => r.channel)})`);
    // sem "tudo de uma vez": com 350 resgata o XP (300) e deixa o Captura (500) esperando
    store = { ...store, comboAll: { 1: false } };
    points = 350;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 2 && ran.every((r) => /bxp/.test(r.script)), `sem combo: resgata o que o saldo cobre (só o XP, nas duas lives) (${ran.length})`);
    extraRewards = false;
    store = { ...store, redeemKick: { 1: 'xp' } };
    // limite de horas: com o bônus do jogo já em 30 h e o limite de 24 h, não resgata
    summary = { connected: true, kick: { linked: true, left: { xp: 30 * 3600 }, channels: [] }, twitch: null };
    await lives.refreshBonus(1);
    store = { ...store, maxHours: { 1: 24 } };
    points = 400;
    ran.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 0 && lives.log.read().some((r) => /limite de 24 h/.test(r.detalhe)), 'limite de horas: bônus acima do limite não resgata');
    // abaixo do limite volta a resgatar, e com limite é 1 resgate por conferência
    summary = { connected: true, kick: { linked: true, left: { xp: 3600 }, channels: [] }, twitch: null };
    await lives.refreshBonus(1);
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 1, `limite de horas: abaixo do limite resgata 1 por conferência (${ran.length})`);
    // lives abertas sem pontos: resgata num canal fora delas (o offline do jogo), numa página escondida
    store = { ...store, maxHours: { 1: 0 } };
    summary = { connected: true, kick: { linked: true, left: { xp: 7200 }, channels: [{ login: 'rico', live: false }] }, twitch: null };
    await lives.refreshBonus(1);
    points = 10;
    ran.length = 0;
    once.length = 0;
    lives.redeemerOf('kick', 1).restart();
    await lives.redeemKick();
    check(ran.length === 0 && once.length === 1 && once[0].channel === 'rico', `lives abertas sem pontos: resgata no canal offline (${once.map((o) => o.channel)})`);
    once.length = 0;
    points = 10;
    // o fixture devolve sempre o mesmo saldo nos resgates falsos: volta a resgatar do zero antes da guarda (como ao salvar a config)
    lives.redeemerOf('kick', 1).restart();

    // guarda do bônus: bônus do jogo vencendo em 10 min -> resgata num canal fora das lives abertas, com saldo
    summary = { connected: true, kick: { linked: true, left: { xp: 600 }, channels: [{ login: 'rico', live: true }] }, twitch: null };
    await lives.refreshBonus(1);
    check(once.length === 1 && once[0].channel === 'rico' && once[0].siteName === 'kick', `guarda do bônus: resgata no canal fora das abertas com pontos (${once.map((o) => o.channel)})`);
    check(lives.log.read().some((r) => /guarda do bônus/.test(r.detalhe)), 'guarda do bônus: vai para o registro');
    summary = { connected: true, kick: { linked: true, left: { xp: 7200 }, channels: [] }, twitch: null };
    once.length = 0;
    await lives.refreshBonus(1);
    check(once.length === 0, 'guarda do bônus: bônus com folga não resgata');

    // estado do botão
    const st = lives.state();
    check(['ok', 'idle', 'changed'].includes(st.kind) && st.detail.includes('Conta 1'), `estado do botão com a conta ativa (${st.kind})`);
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'a,b', 'nova conferência mantém as lives abertas');

    // troca automática: uma live aberta cai e a próxima online da lista que não estava aberta ocupa a vaga
    store = { ...store, kickChannels: ['off', 'a', 'b', 'c', 'd'] };
    lives.reopenAll();
    await lives.syncAccounts();
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'a,b', `antes da queda: a,b abertas, off pulada (${lives.open('kick', 1).join()})`);
    notices.length = 0;
    kickOn.a = false;
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'b,c', `a caiu: sai e a próxima online (c) entra (${lives.open('kick', 1).join()})`);
    check(notices.some((x) => /a ficou offline; abri c/.test(x.text)) && lives.log.read().some((r) => /ficou offline; abri c/.test(r.detalhe)), 'a troca é avisada e vai para o registro');
    kickOn.b = null; // conferência sem resposta: a live aberta continua, nenhuma desconhecida abre
    kickOn.c = null;
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'b,c', `sem resposta: as abertas ficam (${lives.open('kick', 1).join()})`);
    kickOn.b = false;
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'c,d', `b caiu com c sem resposta: c fica, d entra (${lives.open('kick', 1).join()})`);
    kickOn.a = true;
    delete kickOn.b;
    delete kickOn.c;
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'a,b', `a voltou: a prioridade da lista manda (${lives.open('kick', 1).join()})`);
    kickOn.a = true;
    for (const k of Object.keys(kickOn)) delete kickOn[k];
    store = { ...store, kickChannels: ['off', 'a', 'b', 'c'] };

    // a lista oficial que o jogo informa (no ar e offline), lida da conta ligada
    summary = { connected: true, kick: { linked: true, left: {}, channels: [{ login: 'axt', live: true }, { login: 'cogu', live: false }] }, twitch: { linked: true, left: {}, channels: [{ login: 'rodil', live: false }] } };
    const off = await lives.officialChannels();
    check(off.acc === 1 && off.kick.length === 2 && off.kick[1].live === false && off.twitch[0].login === 'rodil', 'lista oficial: traz os canais no ar e offline de cada site');
    summary = null;
    check((await lives.officialChannels()).acc === null, 'lista oficial: sem dados do jogo, devolve vazio (a janela avisa)');

    // fechar e abrir de novo uma live nesta conta (leva a vaga junto: não abre outra no lugar)
    store = { ...store, kickChannels: ['off', 'a', 'b', 'c'] };
    lives.reopenAll();
    await lives.syncAccounts();
    await lives.checkLives();
    lives.closeLive(1, 'kick', 'a');
    check(lives.open('kick', 1).join() === 'b', `fechar a live de a: a vaga vai junto, c não entra no lugar (${lives.open('kick', 1).join()})`);
    lives.reopenLive(1, 'kick', 'a');
    check(lives.open('kick', 1).join() === 'a,b', `abrir de novo: volta com a vaga (${lives.open('kick', 1).join()})`);
    lives.closeLive(1, 'kick', null);
    check(lives.open('kick', 1).length === 0, 'fechar todas: nenhuma aberta');
    lives.reopenLive(1, 'kick', null);
    check(lives.open('kick', 1).join() === 'a,b', 'abrir todas de novo');

    // botão Lives de cada conta: estado e menu só dela; ligar ou desligar uma conta não mexe nas outras
    check(lives.stateOf(1).kind !== 'none' && lives.stateOf(2).kind === 'none', 'estado por conta: conta 1 com lives, conta 2 sem');
    const menu1 = lives.accountMenu(1);
    check(menu1[0].label === 'Lives' && menu1[0].type === 'checkbox' && menu1[0].checked === true, 'menu da conta 1: o primeiro item marca as lives dela');
    const rotulos1 = menu1.filter((i) => i.label).map((i) => i.label);
    check(['Entrar', 'Sair', 'Detalhes', 'Registro'].every((x) => rotulos1.includes(x)), `menu da conta 1: entrar, sair, detalhes e registro (${rotulos1.join(' | ')})`);
    check(rotulos1.every((x) => x.split(' ').length <= 3), 'menu: itens curtos (até 3 palavras)');
    check(!lives.accountMenu(2).some((i) => /\(\d+\)/.test(i.label ?? '')), 'menu da conta desligada: sem as lives de site');
    const antes1 = lives.open('kick', 1).join();
    slotIds = [1, 2];
    lives.toggleAccount(2);
    const ligou = await waitFor(() => lives.stateOf(2).kind !== 'none', 4000);
    check(ligou && store.accounts.join() === '1,2' && lives.open('kick', 1).join() === antes1,
      `ligar a conta 2 não mexe nas lives da conta 1 (${lives.open('kick', 1).join()})`);
    const abertas2 = lives.open('kick', 2).join();
    lives.closeLive(2, 'kick', 'a');
    check(!lives.open('kick', 2).includes('a') && lives.open('kick', 1).join() === antes1,
      `fechar a live da conta 2 não fecha a da conta 1 (conta 2 tinha: ${abertas2})`);
    lives.reopenLive(2, 'kick', 'a');
    lives.toggleAccount(2);
    const desligou = await waitFor(() => lives.open('kick', 2).length === 0, 4000);
    slotIds = [1];
    check(desligou && store.accounts.join() === '1' && lives.open('kick', 1).join() === antes1 && lives.stateOf(2).kind === 'none',
      'desligar a conta 2 só a desliga; as lives da conta 1 seguem');

    // janela de configuração: carrega a página, mostra as 4 contas, salva a escolha e devolve normalizada
    const winByTitle = (t) => BrowserWindow.getAllWindows().find((w) => w.getTitle().startsWith(t));
    lives.showConfig();
    const cw = winByTitle('Config das lives');
    await waitFor(() => !cw.webContents.isLoading(), 5000);
    const rowsN = await waitFor(async () => (await cw.webContents.executeJavaScript('document.querySelectorAll("#rows tr").length')) === 4, 4000);
    check(rowsN, 'config: uma linha por conta (4)');
    check(await cw.webContents.executeJavaScript('document.querySelectorAll("#kk li").length') >= 4, 'config: a lista de canais da Kick aparece, um item por canal');
    // reordenar: ▼ no primeiro da Kick desce uma posição; adicionar e remover canal na Twitch
    const kkBefore = await cw.webContents.executeJavaScript('[...document.querySelectorAll("#kk .name")].map((e) => e.textContent).join()');
    await cw.webContents.executeJavaScript('document.querySelectorAll("#kk li")[0].querySelectorAll("button")[1].click()');
    const kkAfter = await cw.webContents.executeJavaScript('[...document.querySelectorAll("#kk .name")].map((e) => e.textContent).join()');
    const [k0, k1, ...kRest] = kkBefore.split(',');
    check(kkAfter === [k1, k0, ...kRest].join(), `config: ▼ troca o primeiro com o segundo (${kkAfter})`);
    await cw.webContents.executeJavaScript(`(() => {
      document.querySelector('tr[data-acc="2"] .on').checked = true;
      document.querySelector('tr[data-acc="2"] .pick.twitch').picker.value = ['captura'];
      document.querySelector('tr[data-acc="1"] .pick.kick').picker.value = ['shiny', 'xp'];
      for (const name of ['https://www.twitch.tv/Rodil', '@cogu', 'sobrando']) { document.getElementById('add-tw').value = name; document.getElementById('btn-tw').click(); }
      document.querySelector('#tw li:last-child button:last-child').click(); // remove 'sobrando'
      document.getElementById('save').click();
    })()`);
    const saved = await waitFor(() => store.redeemKick?.[1]?.join() === 'shiny,xp', 4000);
    check(saved && store.redeemTwitch[2].join() === 'captura' && store.accounts.join() === '1,2', `config: salvar leva a lista de bônus por conta (${JSON.stringify(store.redeemKick)})`);
    check(Array.isArray(store.twitchChannels) && store.twitchChannels.join() === 'rodil,cogu', `config: canais normalizados ao salvar (${store.twitchChannels})`);
    cw.destroy();

    // janela de detalhes: uma linha por live aberta
    store = { ...store, accounts: [1] };
    lives.reopenAll();
    await lives.syncAccounts();
    await lives.checkLives();
    lives.showDetails();
    const dw = winByTitle('Detalhes das lives');
    await waitFor(() => !dw.webContents.isLoading(), 5000);
    check(await waitFor(async () => (await dw.webContents.executeJavaScript('document.querySelectorAll("#rows tr").length')) >= 1, 4000), 'detalhes: mostra as lives abertas');
    dw.destroy();

    // login antigo do painel de pontos é trazido para a sessão da conta (uma vez)
    const oldKick = session.fromPartition('persist:pontos-kick-conta3');
    await oldKick.cookies.set({ url: 'https://kick.com', name: 'session_token', value: 'velho', expirationDate: Math.floor(Date.now() / 1000) + 3600 });
    await oldKick.cookies.flushStore();
    await lives.migrateLogins(3);
    const moved = (await session.fromPartition('persist:conta3').cookies.get({ url: 'https://kick.com', name: 'session_token' }))[0]?.value;
    check(moved === 'velho' || !fs.existsSync(path.join(app.getPath('userData'), 'Partitions', 'pontos-kick-conta3')), `login antigo da Kick migra para a conta (${moved})`);

    // salvar a configuração reabre e recomeça
    store = { ...store, kickChannels: ['c'] };
    lives.reopenAll();
    await waitFor(() => lives.state().kind !== undefined, 1000);
    await lives.syncAccounts();
    await lives.checkLives();
    check(lives.open('kick', 1).join() === 'c', `reabrir com os canais novos (${lives.open('kick', 1).join()})`);
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  lives?.stop();
  server?.close();
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
  finish();
});
