// Vigia de captura e Auto-bola sem VIP. Duas partes:
//  1. a lógica pura (createMonitor) com relógio falso: sem dados, com alvo, sem alvo, sem Ultra Balls, sons, VIP;
//  2. o caminho real: um servidor WebSocket local (mesmo host da página, como o jogo), duas contas (uma VIP e uma não),
//     o protocolo de rede do DevTools que o app usa para ler o socket, o aviso injetado na página e o Auto-bola.
const { app, sleep, check, finish, waitFor } = require('./helpers');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const { BaseWindow, WebContentsView } = require('electron');
const { createCaptureWatch, createMonitor } = require('../src/capture-watch');

const welcome = (loja, balls = { 4: 5 }) => JSON.stringify({
  t: 'welcome', estado: { cheio: true, loja, balls, pokemons: [{ id: 1, maxHp: 50 }] },
});
const morte = () => JSON.stringify({ t: 'batalha', ev: [{ k: 'morte', quem: 'selvagem', slot: 3, nome: 'X' }] });
const bola = (ballId) => JSON.stringify({ t: 'batalha', ev: [{ k: 'bola', ballId, slot: 3, sucesso: false, chance: 0.1 }] });

// ---- 1. lógica pura ----
function testaMonitor() {
  let t = 0;
  const novo = () => createMonitor({ limiteMs: 45000, alvoMs: 30000, repetirMs: 60000, now: () => t });
  const loja = { vip: false, visualOk: true };

  // sem nenhum dado do jogo, nada acontece, por mais que o tempo passe (e mesmo com alvos)
  let m = novo();
  m.onSocketOpen();
  let disparou = false;
  for (t = 0; t <= 100000; t += 1000) {
    if (t % 10000 === 0) m.onFrame(morte());
    if (m.tick(t).acao === 'alerta') disparou = true;
  }
  check(!disparou, 'sem welcome (tela de login), nenhum alerta mesmo com alvos');

  // com alvos a cada 10 s e nenhum arremesso: dispara perto dos 45 s de captura parada
  m = novo();
  t = 0;
  m.onSocketOpen();
  m.onFrame(welcome(loja));
  let inicio = null;
  let sons = [];
  for (t = 0; t <= 200000; t += 1000) {
    if (t % 10000 === 0) m.onFrame(morte());
    const r = m.tick(t);
    if (r.acao === 'alerta' && r.inicio && inicio === null) inicio = t;
    if (r.acao === 'alerta' && r.soar) sons.push(t);
  }
  check(inicio !== null && inicio >= 44000 && inicio <= 47000, `alerta com alvos e sem captura, perto dos 45 s (em ${inicio} ms)`);
  // som: no início e depois só a cada 60 s no máximo
  check(sons[0] === inicio && sons.every((x, i) => i === 0 || x - sons[i - 1] >= 60000), `som no início e repetido a cada 60 s no máximo (${sons.join(', ')})`);

  // sem alvo (um selvagem só, há muito tempo): acúmulo para em 30 s, não chega a 45 s
  m = novo();
  t = 0;
  m.onSocketOpen();
  m.onFrame(welcome(loja));
  m.onFrame(morte());
  let alertou = false;
  for (t = 0; t <= 200000; t += 1000) if (m.tick(t).acao === 'alerta') alertou = true;
  check(!alertou, 'sem alvo na lista (um selvagem só), não alerta');

  // arremesso de outra bola não zera; Ultra Ball zera e some com o alerta
  m = novo();
  t = 0;
  m.onSocketOpen();
  m.onFrame(welcome(loja));
  for (t = 0; t <= 50000; t += 1000) {
    if (t % 10000 === 0) m.onFrame(morte());
    m.tick(t);
  }
  check(m.alertando(), 'alerta ativo antes do teste de arremesso');
  m.onFrame(bola(1)); // Poké Ball
  m.tick(t += 1000);
  check(m.alertando(), 'arremesso de outra bola (ballId 1) não some com o alerta');
  m.onFrame(bola(4)); // Ultra Ball
  const r = m.tick(t += 1000);
  check(r.acao === 'limpa' && !m.alertando(), 'arremesso de Ultra Ball some com o alerta');

  // sem Ultra Balls: nada a capturar com elas, não cobra
  m = novo();
  t = 0;
  m.onSocketOpen();
  m.onFrame(welcome(loja, { 4: 0 }));
  let semBolas = false;
  for (t = 0; t <= 100000; t += 1000) {
    if (t % 10000 === 0) m.onFrame(morte());
    if (m.tick(t).acao === 'alerta') semBolas = true;
  }
  check(!semBolas, 'sem Ultra Balls na conta, não alerta');

  // fechar o socket (reconexão) limpa o estado e devolve se havia alerta
  m = novo();
  t = 0;
  m.onSocketOpen();
  m.onFrame(welcome(loja));
  for (t = 0; t <= 50000; t += 1000) {
    if (t % 10000 === 0) m.onFrame(morte());
    m.tick(t);
  }
  check(m.onSocketClose() === true && !m.alertando(), 'fechar o socket devolve o alerta que estava ativo e zera');

  // VIP: a leitura é do `loja.vip` do welcome; quem não é VIP pode ter o Auto-bola ligado sozinho, uma vez por conexão
  m = novo();
  m.onSocketOpen();
  check(!m.precisaAuto(), 'antes do welcome, não decide sobre o Auto-bola');
  m.onFrame(welcome({ vip: true, visualOk: true }));
  check(m.estado().vip === true, 'VIP detectado pelo loja.vip');
  m.onSocketOpen();
  m.onFrame(welcome({ vip: false, visualOk: true }));
  check(m.precisaAuto() && m.estado().vip === false, 'conta sem VIP: pede para ligar o Auto-bola');
  m.marcaAuto();
  check(!m.precisaAuto(), 'pede só uma vez por conexão');
}

// ---- 2. caminho real ----
// Servidor local: página da conta em / (com o socket do "jogo" em /ws), e mensagens de texto do servidor para cada conta.
function servidor() {
  const conns = new Map(); // conta (c) -> último socket
  // "jogo" falso: ?eco=1 abre em modo economia (sem a lista de capturas, que só fica montada fora dela); o interruptor
  // #cfg-economia (dentro de #btn-config) liga/desliga a economia como no jogo real; cada passo vai para window.eventos
  const pagina = (eco) => `<!doctype html><meta charset="utf-8"><title>jogo falso</title><body>jogo falso
    <button id="btn-config">config</button>
    <div id="modal" class="hidden"><button class="cfg-toggle" id="cfg-economia" role="switch"></button></div>
    <script>
      window.eventos = [];
      const eco = () => document.documentElement.classList.contains('modo-economia');
      const lista = () => {
        const L = document.getElementById('caidos-lista');
        if (eco()) { if (L) L.remove(); }
        else if (!L) { document.body.appendChild(Object.assign(document.createElement('div'), { id: 'caidos-lista' })); window.eventos.push('lista'); }
      };
      document.documentElement.classList.toggle('modo-economia', ${eco ? 'true' : 'false'});
      lista();
      document.getElementById('btn-config').onclick = () => document.getElementById('modal').classList.remove('hidden');
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('modal').classList.add('hidden'); });
      document.getElementById('cfg-economia').onclick = () => {
        const ligando = !eco();
        document.documentElement.classList.toggle('modo-economia', ligando);
        window.eventos.push('economia:' + (ligando ? 'on' : 'off'));
        lista();
        if (ligando) document.getElementById('modal').classList.add('hidden');
      };
      function conecta() { const ws = new WebSocket('ws://' + location.host + '/ws' + location.search); ws.onclose = () => setTimeout(conecta, 300); }
      conecta();
    </script>`;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(pagina(new URL(req.url, 'http://x').searchParams.get('eco') === '1'));
  });
  server.on('upgrade', (req, socket) => {
    const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const c = new URL(req.url, 'http://x').searchParams.get('c');
    conns.set(c, socket);
    socket.on('data', () => {}); // o cliente manda o hello: não precisamos ler
    socket.on('error', () => {});
    socket.on('close', () => { if (conns.get(c) === socket) conns.delete(c); });
  });
  // quadro de texto do servidor (sem máscara, como manda o servidor): até 64 KB, o suficiente aqui
  const frame = (str) => {
    const p = Buffer.from(str);
    const h = p.length < 126 ? Buffer.from([0x81, p.length]) : Buffer.from([0x81, 126, p.length >> 8, p.length & 255]);
    return Buffer.concat([h, p]);
  };
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    base: `http://127.0.0.1:${server.address().port}`,
    has: (c) => conns.has(c),
    get: (c) => conns.get(c),
    send: (c, s) => conns.get(c)?.write(frame(s)),
    drop: (c) => conns.get(c)?.destroy(),
    close: () => server.close(),
  })));
}

async function testaCaminhoReal() {
  const srv = await servidor();
  const win = new BaseWindow({ show: false, width: 1200, height: 800 });
  const slots = [];
  const novaConta = (id) => {
    const v = new WebContentsView({ webPreferences: { partition: `vigia-teste-${id}`, backgroundThrottling: false } });
    win.contentView.addChildView(v);
    v.setBounds({ x: 0, y: 0, width: 600, height: 400 });
    slots.push({ id, view: v });
    return v;
  };
  const autos = [];
  const autoBall = {
    on: new Set(),
    isOn: (id) => autoBall.on.has(id),
    setAuto(id, on) {
      autos.push([id, on]);
      on ? autoBall.on.add(id) : autoBall.on.delete(id);
      if (on) slots.find((s) => s.id === id)?.view.webContents.executeJavaScript('window.eventos.push("auto")').catch(() => {});
      return autoBall.on.has(id);
    },
  };
  let sons = 0;
  const avisos = [];
  const cfg = { captureWatch: true, autoBallNoVip: true }; // o app guarda isso em config.json
  const cw = createCaptureWatch({
    mainWin: win,
    store: { get: () => cfg.captureWatch, set: (on) => { cfg.captureWatch = on; } },
    storeAuto: { get: () => cfg.autoBallNoVip, set: (on) => { cfg.autoBallNoVip = on; } },
    getSlots: () => slots,
    getAutoBall: () => autoBall,
    sendLog: () => {},
    notify: (n) => avisos.push(n),
    limiteMs: 1500, alvoMs: 3000, repetirMs: 2500, somMinMs: 0, intervaloMs: 200,
    tocar: () => { sons++; },
  });

  const v1 = novaConta(1);
  const v2 = novaConta(2);
  cw.attach(1, v1); // antes de carregar a página: é assim que o app liga o vigia
  cw.attach(2, v2);
  v1.webContents.loadURL(`${srv.base}/?c=1`);
  v2.webContents.loadURL(`${srv.base}/?c=2`);
  check(await waitFor(() => srv.has('1') && srv.has('2'), 8000), 'as duas contas abriram o socket do jogo (mesmo host da página)');

  check(autos.length === 0, 'antes do welcome (tela de login), o Auto-bola não é mexido');

  // conta sem VIP: liga o Auto-bola sozinha ao chegar o welcome
  srv.send('1', welcome({ vip: false, visualOk: true }));
  check(await waitFor(() => autos.some(([id, on]) => id === 1 && on), 3000), 'conta sem VIP: liga o Auto-bola ao entrar no jogo');
  // conta VIP: não liga sozinha
  srv.send('2', welcome({ vip: true, visualOk: true }));
  await sleep(800);
  check(!autos.some(([id]) => id === 2), 'conta VIP: não liga o Auto-bola sozinha');

  // o usuário desliga o Auto-bola da conta 1; a conexão cai e volta: não religa à força
  cw.autoBallToggled(1, false);
  autoBall.on.delete(1);
  const antigo = srv.get('1');
  srv.drop('1');
  check(await waitFor(() => srv.get('1') && srv.get('1') !== antigo, 8000), 'a conta 1 reconectou ao jogo');
  srv.send('1', welcome({ vip: false, visualOk: true }));
  await sleep(800);
  check(autos.filter(([id]) => id === 1).length === 1, 'desligado à mão nesta sessão: não religa depois de reconectar');

  // vigia: conta 2 com alvos e sem Ultra Ball: aviso na própria página e som, mesmo a conta silenciada
  v2.webContents.setAudioMuted(true);
  const bannerDe2 = () => v2.webContents.executeJavaScript('document.getElementById("pk-vigia-alerta")?.textContent || ""').catch(() => '');
  let alvos = setInterval(() => srv.send('2', morte()), 400);
  check(await waitFor(async () => /Conta 2/.test(await bannerDe2()), 8000), `aviso aparece na tela da conta 2 (${await bannerDe2()})`);
  check(sons >= 1, `som tocou ao disparar (sons: ${sons}), com a conta silenciada`);
  check(avisos.some((n) => /Conta 2/.test(n.title)), 'aviso no canto do app ao disparar');
  // outra bola (Poké Ball) não some com o aviso
  srv.send('2', bola(1));
  await sleep(600);
  check(/Conta 2/.test(await bannerDe2()), 'arremesso de outra bola não tira o aviso');
  // Ultra Ball: some (com os alvos parados, para não voltar a disparar)
  clearInterval(alvos);
  srv.send('2', bola(4));
  check(await waitFor(async () => (await bannerDe2()) === '', 3000), 'arremesso de Ultra Ball tira o aviso');

  // vigia desligado: não aparece aviso nenhum, mesmo com alvos parados
  cw.toggleWatch();
  alvos = setInterval(() => srv.send('2', morte()), 400);
  await sleep(4500);
  check((await bannerDe2()) === '' && cw.state().watch === false, 'vigia desligado: nenhum aviso, mesmo com alvos');
  clearInterval(alvos);
  cw.toggleWatch();
  check(cw.state().watch === true, 'vigia religado pela alternância');

  // abertura em modo economia: sem VIP, desliga a economia pelo interruptor do jogo, espera a lista, liga o Auto-bola
  // e religa a economia; a escolha volta a ser a de antes (ligada)
  const v3 = novaConta(3);
  cw.attach(3, v3);
  v3.webContents.loadURL(`${srv.base}/?c=3&eco=1`);
  const v4 = novaConta(4);
  cw.attach(4, v4);
  v4.webContents.loadURL(`${srv.base}/?c=4&eco=0`);
  check(await waitFor(() => srv.has('3') && srv.has('4'), 8000), 'contas 3 e 4 abriram o socket do jogo');
  await sleep(500);
  const eventos = (v) => v.webContents.executeJavaScript('window.eventos').catch(() => []);
  const ecoOn = (v) => v.webContents.executeJavaScript("document.documentElement.classList.contains('modo-economia')").catch(() => null);
  check((await ecoOn(v3)) === true, 'conta 3 abre em modo economia (jogo falso)');
  await v3.webContents.executeJavaScript('window.eventos = []');
  srv.send('3', welcome({ vip: false, visualOk: true }));
  check(await waitFor(async () => (await eventos(v3)).length >= 4, 25000), 'economia na abertura: sequência completa');
  check(JSON.stringify(await eventos(v3)) === '["economia:off","lista","auto","economia:on"]', `economia desligada, lista, Auto-bola, economia religada (${JSON.stringify(await eventos(v3))})`);
  check((await ecoOn(v3)) === true && autoBall.on.has(3), 'no fim: economia ligada de novo e Auto-bola ligado');

  // abertura normal: só liga o Auto-bola, sem mexer na economia (quem não usa economia continua sem usar)
  await v4.webContents.executeJavaScript('window.eventos = []');
  srv.send('4', welcome({ vip: false, visualOk: true }));
  check(await waitFor(() => autoBall.on.has(4), 8000), 'abertura normal: liga o Auto-bola');
  await sleep(500);
  check(JSON.stringify(await eventos(v4)) === '["auto"]' && (await ecoOn(v4)) === false, `abertura normal: não mexe na economia (${JSON.stringify(await eventos(v4))})`);

  // o som sai de uma página própria, em áudio liberado pelo gesto (não depende do mudo das contas)
  const sv = new WebContentsView({ webPreferences: { backgroundThrottling: false } });
  win.contentView.addChildView(sv);
  await sv.webContents.loadFile(path.join(__dirname, '..', 'src', 'ui', 'alerta-som.html'));
  const estadoSom = await sv.webContents.executeJavaScript('window.tocar()', true);
  check(estadoSom === 'running', `página do alerta toca o som (áudio: ${estadoSom})`);

  srv.close();
}

app.whenReady().then(async () => {
  try {
    testaMonitor();
    await testaCaminhoReal();
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
