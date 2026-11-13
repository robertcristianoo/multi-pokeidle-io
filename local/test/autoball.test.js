// Auto-bola: no modo normal só clica em alvos visíveis; no modo economia (lista 0x0, sem offsetParent) clica nos que existem na página.
const { app, check, finish, waitFor } = require('../../test/helpers');
const { BrowserWindow } = require('electron');

const pagina = (cls, listaStyle, oculto = true) => 'data:text/html;charset=utf-8,' + encodeURIComponent(
  `<html class="${cls}"><head></head><body><div id="caidos"${oculto ? ' class="hidden" style="display:none"' : ''}><div id="caidos-lista" style="${listaStyle}">
   <button class="caido" data-slot="1" onclick="window.cliques=(window.cliques||0)+1;(window.ordem??=[]).push('1')">alvo</button>
   <button class="caido" data-slot="2" onclick="window.cliques=(window.cliques||0)+1;(window.ordem??=[]).push('2')">alvo</button></div></div></body></html>`);


// Modo economia de verdade: o jogo (módulo) desliga o campo e a lista congela; a fila vem dos eventos "morte" do servidor e o arremesso
// vai pelo socket do jogo ({ t: 'ball.throw', ballId, slot }). O socket falso imita o WebSocket do jogo.
const paginaEco = 'data:text/html;charset=utf-8,' + encodeURIComponent(
  `<html class="modo-economia"><head></head><body><div id="caidos" class="hidden" style="display:none"><div id="caidos-lista"></div></div>
   <script>
     class FakeWS extends EventTarget { constructor() { super(); this.readyState = 1; } send(d) { (window.enviados ??= []).push(JSON.parse(d)); } }
     window.WebSocket = FakeWS;
     window.sock = new WebSocket('ws://x');
     window.bola = (slot) => window.sock.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ t: 'batalha', ev: [{ k: 'bola', ballId: 4, slot, sucesso: false, chance: 0.009 }] }) }));
     window.aviso = () => window.sock.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ t: 'batalha', ev: [{ k: 'aviso', msg: 'esse pokemon não está mais no chão' }] }) }));
     window.morte = (slot, extra) => window.sock.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ t: 'batalha', ev: [{ k: 'morte', quem: 'selvagem', slot, nome: 'X', ...extra }] }) }));
   </script></body></html>`);

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { backgroundThrottling: false } });
  const ext = require('../autoball.js')({ getSlots: () => [{ id: 1, view: { webContents: win.webContents } }], sendLog: () => {} });
  const f = ext.features().find((x) => x.id === 'autobola');
  const cliques = () => win.webContents.executeJavaScript('window.cliques || 0');
  try {
    // modo economia: lista com 0x0 (como no jogo)
    await win.loadURL(pagina('modo-economia', 'display:flex;width:0;height:0;overflow:hidden'));
    f.set(1, true);
    check(await waitFor(async () => (await cliques()) >= 2, 6000), 'modo economia: clica nos alvos mesmo com a lista 0x0');
    await new Promise((r) => setTimeout(r, 2500)); // as entradas continuam na lista (como no jogo): não pode clicar de novo
    check((await cliques()) === 2, 'modo economia: cada slot é tentado uma vez só (cliques: ' + (await cliques()) + ')');
    check((await win.webContents.executeJavaScript('window.ordem.join(",")')) === '2,1', 'modo economia: o slot mais novo primeiro');
    f.set(1, false);

    // economia "de verdade": sem lista nenhuma, só eventos do servidor e o socket do jogo; um arremesso por vez, com confirmação
    await win.loadURL(paginaEco);
    f.set(1, true);
    await new Promise((r) => setTimeout(r, 700)); // o 1º passo instala o gancho no send
    const jogadas = () => win.webContents.executeJavaScript('(window.enviados || []).filter((m) => m.t === "ball.throw" && m.slot !== 1).map((m) => m.slot)');
    const srv = (js) => win.webContents.executeJavaScript(js);
    const esp = (ms) => new Promise((r) => setTimeout(r, ms));
    await srv('window.sock.send(JSON.stringify({ t: "ping" })); window.morte(11)'); // o jogo conversa: o gancho pega o socket
    await esp(1700);
    check((await jogadas()).length === 0, 'economia: sem ballId conhecido e sem linha na lista, não envia nada');
    await srv('window.sock.send(JSON.stringify({ t: "ball.throw", ballId: 4, slot: 1 }))'); // o jogador lança uma bola: aprende o ballId
    await srv('window.morte(12)');
    await esp(80);
    check(JSON.stringify(await jogadas()) === '[12]', 'economia: lança no instante do abate (o mais novo da fila): ' + JSON.stringify(await jogadas()));
    await srv('window.morte(13); window.morte(14, { safari: true }); window.morte(null)');
    await esp(300);
    check((await jogadas()).length === 1, 'economia: um arremesso por vez, o seguinte espera a resposta do servidor');
    await srv('window.bola(12)');
    await esp(300);
    check((await jogadas()).length === 1, 'economia: depois da resposta, espera o intervalo antes do seguinte (o servidor descarta o que chega cedo)');
    await esp(1100);
    check(JSON.stringify(await jogadas()) === '[12,13]', 'economia: passado o intervalo, lança o seguinte: ' + JSON.stringify(await jogadas()));
    await esp(1800); // sem resposta para o 13: reenvia
    check((await jogadas()).filter((x) => x === 13).length >= 2, 'economia: sem resposta, reenvia o arremesso');
    await srv('window.aviso()'); // "não está mais no chão": libera e segue para o que sobrou na fila
    await esp(150);
    check((await jogadas()).includes(11), 'economia: aviso de que não está mais no chão libera o próximo (o corpo 11 da fila)');
    await srv('window.bola(11)');
    await esp(2000);
    const fim = await jogadas();
    check(fim.filter((x) => x === 11).length === 1 && !fim.includes(14) && !fim.includes(null), 'economia: sem safari, sem slot nulo, sem repetir após a resposta: ' + JSON.stringify(fim));
    f.set(1, false);

    // modo normal com a lista escondida: não clica
    await win.loadURL(pagina('', 'display:none'));
    f.set(1, true);
    await new Promise((r) => setTimeout(r, 1500));
    check((await cliques()) === 0, 'modo normal: não clica em alvo escondido');
    f.set(1, false);

    // modo normal com a lista visível: clica
    await win.loadURL(pagina('', 'display:block', false));
    f.set(1, true);
    check(await waitFor(async () => (await cliques()) > 0, 4000), 'modo normal: clica em alvo visível');
    f.set(1, false);
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
