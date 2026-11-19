// Auxiliares dos testes do vigia de captura (público e módulos adicionais): mensagens do jogo falso e um servidor
// WebSocket local que se comporta como o socket do jogo (mesmo host da página).
const http = require('http');
const crypto = require('crypto');

// catálogo de bolas na ordem do jogo (welcome.catalogoBolas): o jogo arremessa com a primeira que a conta tem
const CATALOGO = [{ id: 1, nome: 'Poké Ball' }, { id: 4, nome: 'Ultra Ball' }, { id: 5, nome: 'Beast Ball' }];
const welcome = (loja, balls = { 4: 5 }, catalogo = CATALOGO) => JSON.stringify({
  t: 'welcome', catalogoBolas: catalogo, estado: { cheio: true, loja, balls, pokemons: [{ id: 1, maxHp: 50 }] },
});
const morte = () => JSON.stringify({ t: 'batalha', ev: [{ k: 'morte', quem: 'selvagem', slot: 3, nome: 'X' }] });
const bola = (ballId) => JSON.stringify({ t: 'batalha', ev: [{ k: 'bola', ballId, slot: 3, sucesso: false, chance: 0.1 }] });

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

module.exports = { CATALOGO, welcome, morte, bola, servidor };
