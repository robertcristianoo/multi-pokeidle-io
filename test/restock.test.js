// Auto-reposição (🛒): a página do jogo compra o que falta no Mercado do NPC pelo mesmo pedido do botão Comprar
// (shop.buy), dentro dos limites: 9.999 por pedido, uma compra a cada 4 s, 30 s de espera após recusa e pausa de 2 min
// após 3 falhas seguidas. Roda contra um socket falso e um servidor local; o jogo real não é acessado.
const { app, check, finish, waitFor, sleep } = require('./helpers');
const { BrowserWindow, ipcMain, session } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');
const restockPage = require('../src/preload/restock-frame.js'); // na main o `webFrame` não existe: só exporta a função

// Um recorte do catálogo do jogo (mesmos ids e campos que /assets/items.json traz)
const ITENS = {
  items: [
    { id: 200, name: 'Small Potion', category: 'heal', npcPrice: 50, healAmount: 60 },
    { id: 201, name: 'Great Potion', category: 'heal', npcPrice: 150, healAmount: 150 },
    { id: 204, name: 'Ultimate Potion', category: 'heal', npcPrice: 1500, healAmount: 3000 },
    { id: 70070, name: 'Golden Potion', category: 'heal', npcPrice: 2500, healPct: 0.5 },
    { id: 205, name: 'Revive', category: 'revive', npcPrice: 600, revivePct: 0.5 },
    { id: 206, name: 'Max Revive', category: 'revive', npcPrice: 2500, revivePct: 1 },
    { id: 300, name: 'Pedra Solar', category: 'stone', npcPrice: 10 },
  ],
};

// Socket falso no lugar do WebSocket do jogo: guarda o que a página envia
const FAKE_WS = `(() => {
  class FakeWS extends EventTarget {
    constructor(url) { super(); this.url = url; this.readyState = 1; this.enviados = []; window.__sock = this; }
    send(d) { this.enviados.push({ at: Date.now(), msg: JSON.parse(d) }); }
  }
  window.WebSocket = FakeWS;
})()`;

const CFG = {
  on: true,
  balls: { on: true, id: 4, below: 20, keep: 50 },
  revives: { on: true, below: 5, keep: 10 },
  potions: { on: true, id: 204, below: 3, keep: 6 },
  goldFloor: 1000000,
};

const welcome = (estado = {}) => ({
  t: 'welcome',
  catalogoBolas: [
    { id: 1, nome: 'Poke Ball', compravel: true, priceGold: 100 },
    { id: 4, nome: 'Ultra Ball', compravel: true, priceGold: 300 },
  ],
  itensNossos: [],
  estado: { cheio: true, nick: 'Teste', gold: 2000000, balls: { 4: 10 }, items: {}, activeId: 1, pokemons: [{ id: 1, maxHp: 100 }], automation: { hpLimiar: 0.3 }, ...estado },
});

const servidor = () => new Promise((resolve) => {
  const srv = http.createServer((req, res) => {
    if (req.url.startsWith('/assets/items.json')) {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(ITENS));
    } else {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end('<!doctype html><title>jogo falso</title><p>jogo falso</p>');
    }
  });
  srv.listen(0, '127.0.0.1', () => resolve(srv));
});

app.whenReady().then(async () => {
  const srv = await servidor();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const win = new BrowserWindow({ show: false, webPreferences: { backgroundThrottling: false } });
  const exec = (js) => win.webContents.executeJavaScript(js);
  const emitir = (obj) => exec(`window.__sock.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(obj))} })); 0`);
  const enviados = () => exec('window.__sock.enviados');
  const compras = async () => (await enviados()).filter((x) => x.msg.t === 'shop.buy');
  const resumo = () => exec('window.__pkRestock.summary()');
  const configurar = (c) => exec(`window.__pkRestock.configure(${JSON.stringify(c)}); 0`);
  // página nova, com o gancho instalado antes do socket do jogo (como o preload faz) e o socket falso
  const nova = async (opts = {}) => {
    await win.loadURL(`${base}/`);
    await exec(FAKE_WS);
    await exec('sessionStorage.clear(); 0');
    await exec(`(${restockPage})(${JSON.stringify(opts)}); 0`);
    await exec(`new WebSocket('ws://' + location.host + '/ws'); 0`);
  };
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  try {
    // A: ordem de prioridade, intervalo de 4 s e confirmação da compra
    await nova();
    await configurar(CFG);
    await emitir(welcome());
    check(await waitFor(async () => (await compras()).length >= 1, 6000), 'A: começa a repor sozinha depois do welcome');
    let c = await compras();
    check(igual(c[0]?.msg, { t: 'shop.buy', kind: 'item', id: 204, qty: 6 }), `A: primeiro pedido são poções até "manter": ${JSON.stringify(c[0]?.msg)}`);
    await emitir({ t: 'batalha', ev: [{ k: 'compra', qtd: 6, gasto: 9000 }] });
    await emitir({ t: 'estado', estado: { items: { 204: 6 } } });
    check(await waitFor(async () => (await compras()).length >= 2, 6000), 'A: a próxima compra vem depois da confirmação');
    c = await compras();
    check(igual(c[1]?.msg, { t: 'shop.buy', kind: 'item', id: 205, qty: 10 }), `A: sem poções faltando, repõe o revive mais barato até "manter": ${JSON.stringify(c[1]?.msg)}`);
    check(c[1].at - c[0].at >= 3990, `A: intervalo mínimo de 4 s entre compras (${c[1].at - c[0].at} ms)`);
    await emitir({ t: 'batalha', ev: [{ k: 'compra', qtd: 10, gasto: 6000 }] });
    await emitir({ t: 'estado', estado: { items: { 204: 6, 205: 10 } } });
    check(await waitFor(async () => (await compras()).length >= 3, 6000), 'A: passa para as pokébolas quando poções e revives estão em "manter"');
    c = await compras();
    check(igual(c[2]?.msg, { t: 'shop.buy', kind: 'ball', id: 4, qty: 40 }), `A: pokébola pedida com kind "ball": ${JSON.stringify(c[2]?.msg)}`);
    check(c[2].at - c[1].at >= 3990, `A: intervalo de 4 s também entre tipos (${c[2].at - c[1].at} ms)`);
    const r = await resumo();
    check(r.connected === true && r.gold === 2000000 && r.potionId === 204, `A: resumo com conexão, ouro e poção escolhida (conectado=${r.connected}, ouro=${r.gold}, poção=${r.potionId})`);

    // B: ouro mínimo. Com a poção (prioritária) sem ouro para uma unidade, nada de menor prioridade é comprado.
    await nova({ gapMs: 300 });
    await configurar(CFG);
    await emitir(welcome({ gold: 1000500 }));
    await sleep(2000);
    check((await compras()).length === 0, 'B: ouro mínimo: poção sem ouro para uma unidade bloqueia revives e bolas');
    await emitir({ t: 'estado', estado: { gold: 1005000 } });
    check(await waitFor(async () => (await compras()).length >= 1, 4000), 'B: com ouro acima do mínimo, volta a repor');
    c = await compras();
    check(igual(c[0]?.msg, { t: 'shop.buy', kind: 'item', id: 204, qty: 3 }), `B: compra só o que o ouro acima do mínimo permite: ${JSON.stringify(c[0]?.msg)}`);

    // C: nunca mais de 9.999 por pedido
    await nova({ gapMs: 300 });
    await configurar({ on: true, balls: { on: true, id: 4, below: 20000, keep: 30000 }, revives: { on: false }, potions: { on: false }, goldFloor: 1000000 });
    await emitir(welcome({ gold: 1000000000 }));
    check(await waitFor(async () => (await compras()).length >= 1, 4000), 'C: repõe as bolas com ouro de sobra');
    c = await compras();
    check(igual(c[0]?.msg, { t: 'shop.buy', kind: 'ball', id: 4, qty: 9999 }), `C: no máximo 9.999 por pedido: ${JSON.stringify(c[0]?.msg)}`);

    // D: recusa do jogo: espera antes de pedir de novo (30 s no app; 1,5 s aqui)
    await nova({ gapMs: 300, refusalMs: 1500 });
    await configurar({ on: true, balls: { on: false }, revives: { on: false }, potions: { on: true, id: 204, below: 3, keep: 6 }, goldFloor: 1000000 });
    await emitir(welcome({ gold: 2000000 }));
    check(await waitFor(async () => (await compras()).length >= 1, 4000), 'D: primeiro pedido');
    const T = Date.now();
    await emitir({ t: 'erro', chave: 'sem_estoque' });
    await sleep(1200);
    check((await compras()).length === 1, 'D: depois de uma recusa, não pede de novo logo');
    check(await waitFor(async () => (await compras()).length >= 2, 4000), 'D: depois da espera, volta a pedir');
    c = await compras();
    check(c[1].at - T >= 1450, `D: a espera após a recusa é respeitada (${c[1].at - T} ms; 1,5 s configurados)`);

    // E: 3 falhas seguidas (o jogo não responde) pausam a reposição
    await nova({ gapMs: 200, timeoutMs: 400, pauseMs: 2000 });
    await configurar({ on: true, balls: { on: false }, revives: { on: false }, potions: { on: true, id: 204, below: 3, keep: 6 }, goldFloor: 1000000 });
    await emitir(welcome({ gold: 2000000 }));
    check(await waitFor(async () => (await compras()).length >= 3, 6000), 'E: três pedidos sem resposta');
    await sleep(1000);
    check((await compras()).length === 3, 'E: depois de 3 falhas seguidas, nada é enviado durante a pausa');
    check((await resumo()).paused === true, 'E: o resumo mostra a pausa');
    check(await waitFor(async () => (await compras()).length >= 4, 5000), 'E: volta depois da pausa');
    c = await compras();
    check(c[3].at - c[2].at >= 2300, `E: a pausa é respeitada (${c[3].at - c[2].at} ms; 2 s configurados)`);

    // F: "melhor custo-benefício" escolhe a de menor ouro por HP curado; a Golden Potion entra na conta
    await nova({ gapMs: 300 });
    await configurar({ on: true, balls: { on: false }, revives: { on: false }, potions: { on: true, id: 0, below: 3, keep: 6 }, goldFloor: 1000000 });
    await emitir(welcome({ gold: 2000000 }));
    check(await waitFor(async () => (await compras()).length >= 1, 4000), 'F: primeiro pedido com a melhor poção');
    c = await compras();
    check(igual(c[0]?.msg, { t: 'shop.buy', kind: 'item', id: 200, qty: 6 }), `F: melhor custo-benefício é a Small Potion: ${JSON.stringify(c[0]?.msg)}`);
    const rf = await resumo();
    check(rf.potionId === 200 && rf.potions.some((p) => p.id === 70070), 'F: a Golden Potion entra na conta, mas a Small continua a de melhor custo-benefício');

    // H: a Golden Potion (padrão da reposição) é comprada pelo id 70070, ao preço de 2.500
    await nova({ gapMs: 300 });
    await configurar({ on: true, balls: { on: false }, revives: { on: false }, potions: { on: true, id: 70070, below: 3, keep: 6 }, goldFloor: 1000000 });
    await emitir(welcome({ gold: 2000000 }));
    check(await waitFor(async () => (await compras()).length >= 1, 4000), 'H: primeiro pedido com a Golden Potion');
    c = await compras();
    check(igual(c[0]?.msg, { t: 'shop.buy', kind: 'item', id: 70070, qty: 6 }), `H: compra a Golden Potion pelo id 70070: ${JSON.stringify(c[0]?.msg)}`);
    const rh = await resumo();
    check(rh.potionId === 70070 && rh.potions.find((p) => p.id === 70070)?.price === 2500, 'H: resumo mostra a Golden Potion escolhida, a 2.500 de ouro');

    // G: desligada não compra
    await nova({ gapMs: 300 });
    await configurar({ ...CFG, on: false });
    await emitir(welcome());
    await sleep(2000);
    check((await compras()).length === 0, 'G: desligada não compra');
    check((await resumo()).on === false, 'G: o resumo mostra desligada');

    // P: pelo caminho real, com o preload registrado pela extensão, e a janela de configuração
    const ses = session.fromPartition('persist:teste-reposicao');
    const slots = [];
    const logs = [];
    const ext = require('../src/restock.js')({ getSlots: () => slots, sendLog: (e) => logs.push(e) });
    const f = ext.features().find((x) => x.id === 'reposicao');
    check(!!f && f.label === '🛒' && f.isOn(1) === false && f.badge(1) === '', 'extensão: botão 🛒 desligado e sem aviso por padrão');
    const conta = new BrowserWindow({ show: false, webPreferences: { session: ses, backgroundThrottling: false } });
    ext.onSlotCreated(1, { webContents: { session: ses } });
    slots.push({ id: 1, view: { webContents: conta.webContents } });
    await conta.loadURL(`${base}/`);
    check(await conta.webContents.executeJavaScript('typeof window.__pkRestock === "object"'), 'preload: a página ganha window.__pkRestock pelo registro da extensão');
    f.set(1, true);
    check(await waitFor(async () => (await conta.webContents.executeJavaScript('window.__pkRestock.summary().on')) === true, 3000), 'extensão: empurra a configuração (ligada) para a página');
    check(await waitFor(() => f.badge(1) === '⚠ sem jogo', 3000), `extensão: ligada sem jogo conectado mostra aviso (${f.badge(1)})`);
    const arq = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'restock.json'), 'utf8'));
    check(arq['1'] && arq['1'].on === true, 'extensão: a configuração fica salva em restock.json');

    f.settings(1);
    const jan = BrowserWindow.getAllWindows().find((w) => /conta 1/.test(w.getTitle()));
    check(!!jan, 'janela de configuração abre para a conta 1');
    if (jan) {
      await waitFor(() => !jan.webContents.isLoading(), 4000);
      check(await jan.webContents.executeJavaScript('!!document.getElementById("salvar") && !!window.rst'), 'janela de configuração carrega a página e a ponte');
      const salvo = await ipcMain._invokeHandlers.get('rst:save')({ sender: jan.webContents }, {
        on: false,
        balls: { id: 0, below: -5, keep: 10 },
        revives: { on: true, below: 5, keep: 3 },
        potions: { id: 999999999, below: 10, keep: 3 },
        goldFloor: -1,
      });
      check(salvo.on === true, 'janela: salvar não mexe no liga/desliga (é da barra)');
      check(salvo.balls.id === 1 && salvo.balls.below === 0 && salvo.balls.keep === 10, `janela: valores fora da faixa são corrigidos (bolas ${JSON.stringify(salvo.balls)})`);
      check(salvo.revives.keep === 5, `janela: "manter" nunca fica abaixo de "repor abaixo de" (${salvo.revives.keep})`);
      check(salvo.potions.id === 99999 && salvo.goldFloor === 0, 'janela: id e ouro mínimo dentro da faixa');
      const lido = await ipcMain._invokeHandlers.get('rst:get')({ sender: jan.webContents });
      check(lido && lido.id === 1 && lido.cfg.on === true, 'janela: rst:get devolve a conta da janela');
      jan.close();
    }
    f.set(1, false);
    check(await waitFor(async () => (await conta.webContents.executeJavaScript('window.__pkRestock.summary().on')) === false, 3000), 'extensão: desligar chega à página');
    check(f.badge(1) === '', 'extensão: desligada não mostra aviso');
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  srv.close();
  finish();
});
