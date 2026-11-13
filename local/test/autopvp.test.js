// Auto-PvP: entra na fila pelo socket do jogo, grava a "tela de batalha" como "off", espera ~22 s entre partidas e recua se a fila não abre.
const { app, check, finish, waitFor } = require('../../test/helpers');
const { BrowserWindow } = require('electron');

const http = require('http');
const html = (
  `<html><head></head><body><div id="pvp-fila-pill" class="hidden"></div>
   <script>
     class FakeWS extends EventTarget { constructor() { super(); this.readyState = 1; } send(d) { (window.enviados ??= []).push(JSON.parse(d)); } }
     window.WebSocket = FakeWS;
     window.sock = new WebSocket('ws://x');
     window.ping = () => window.sock.send(JSON.stringify({ t: 'ping' })); // o jogo conversa: o gancho pega o socket
     window.fila = (on) => document.getElementById('pvp-fila-pill').classList.toggle('hidden', !on);
   </script></body></html>`);
// http de verdade: o localStorage não existe numa página data:
const servidor = http.createServer((_, res) => { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(html); });

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { backgroundThrottling: false } });
  const ext = require('../autopvp.js')({ getSlots: () => [{ id: 1, view: { webContents: win.webContents } }], sendLog: () => {} });
  const f = ext.features().find((x) => x.id === 'autopvp');
  const js = (s) => win.webContents.executeJavaScript(s);
  const entradas = () => js('(window.enviados || []).filter((m) => m.t === "pvp.fila.entrar").length');
  const esp = (ms) => new Promise((r) => setTimeout(r, ms));
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const pagina = `http://127.0.0.1:${servidor.address().port}/`;
  const ligar = async () => { f.set(1, true); await esp(1300); await js('window.ping()'); };
  try {
    await win.loadURL(pagina);
    await esp(300);
    check((await entradas()) === 0, 'desligado: não envia nada');
    await ligar();
    check(await waitFor(async () => (await entradas()) === 1, 4000), 'ligado: entra na fila pelo socket do jogo');
    check((await js('localStorage.getItem("pvpTelaBatalha")')) === 'off', 'tela de batalha gravada como "off"');
    check(await js('!!document.getElementById("pk-autopvp-badge")'), 'mostra o selo AUTO PVP');
    await js('window.fila(true)'); // o servidor confirmou a fila
    await esp(2500);
    check((await entradas()) === 1, 'na fila: não manda de novo');
    await js('window.fila(false)'); // achou partida: saiu da fila
    await esp(2500);
    check((await entradas()) === 1, 'saiu da fila: espera a pausa entre partidas antes de procurar');
    f.set(1, false);
    await esp(1500);
    check(await js('!document.getElementById("pk-autopvp-badge")'), 'desligado: remove o selo');

    // fila que não abre (recusa): recua em vez de insistir a cada segundo
    await win.loadURL(pagina);
    await ligar();
    await esp(7000);
    check((await entradas()) === 1, 'recusa: recua em vez de reenviar a cada segundo (envios: ' + (await entradas()) + ')');
    f.set(1, false);
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  servidor.close();
  finish();
});
