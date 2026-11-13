// Servidor WebSocket mínimo que imita o que o sniper enxerga do jogo (hello, catálogo, market.item, market.comprar).
const http = require('http');
const crypto = require('crypto');

function frame(str) {
  const p = Buffer.from(str);
  const n = p.length;
  let h;
  if (n < 126) h = Buffer.from([0x81, n]);
  else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(n, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([h, p]);
}

function* parse(state) {
  for (;;) {
    const b = state.buf;
    if (b.length < 2) return;
    let len = b[1] & 0x7f;
    let off = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
    const masked = !!(b[1] & 0x80);
    const total = off + (masked ? 4 : 0) + len;
    if (b.length < total) return;
    const mask = masked ? b.subarray(off, off + 4) : null;
    const payload = Buffer.from(b.subarray(off + (masked ? 4 : 0), total));
    if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    const op = b[0] & 0x0f;
    state.buf = b.subarray(total);
    if (op === 1) yield payload.toString('utf8');
  }
}

// `onMessage(msg, send)` recebe cada JSON que o cliente mandar; `send(obj)` responde.
function startFakeGame(onMessage) {
  const server = http.createServer();
  server.on('upgrade', (req, socket) => {
    const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const state = { buf: Buffer.alloc(0) };
    const send = (obj) => { try { socket.write(frame(JSON.stringify(obj))); } catch {} };
    socket.on('data', (d) => {
      state.buf = Buffer.concat([state.buf, d]);
      for (const text of parse(state)) {
        try { onMessage(JSON.parse(text), send); } catch (e) { console.error('fakegame:', e); }
      }
    });
    socket.on('error', () => {});
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ port: server.address().port, close: () => server.close() })));
}

module.exports = { startFakeGame };
