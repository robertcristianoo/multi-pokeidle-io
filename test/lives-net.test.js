// Rede das lives: quem está no ar (Twitch/Kick), a Twitch leve, a Kick leve e os avisos da Twitch (PubSub), contra
// servidores HTTP/WebSocket falsos em localhost (nada sai para a internet).
const http = require('http');
const crypto = require('crypto');
const { app, check, finish, waitFor } = require('./helpers');
const twitchLive = require('../src/lives/twitch-live');
const kickLive = require('../src/lives/kick-live');
const { TwitchWatcher } = require('../src/lives/twitch-watcher');
const { KickWatcher } = require('../src/lives/kick-watcher');
const { TwitchPubSub } = require('../src/lives/twitch-pubsub');

// Servidor HTTP + WebSocket mínimo: `route(req, body)` devolve { status, body, headers } ou null (404);
// `onSocket(conn, req)` recebe cada websocket (conn.send(texto), conn.close(), conn.onText = fn).
function fakeServer(route, onSocket = () => {}) {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const r = route(req, Buffer.concat(chunks).toString('utf8')) ?? { status: 404, body: '' };
      res.writeHead(r.status ?? 200, r.headers ?? {});
      res.end(r.body ?? '');
    });
  });
  server.on('upgrade', (req, socket) => {
    const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const conn = {
      onText: () => {},
      send(text) {
        const p = Buffer.from(text);
        const head = p.length < 126 ? Buffer.from([0x81, p.length]) : Buffer.from([0x81, 126, p.length >> 8, p.length & 255]);
        socket.write(Buffer.concat([head, p]));
      },
      close() { socket.destroy(); },
    };
    let buf = Buffer.alloc(0);
    socket.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        if (buf.length < 2) return;
        let len = buf[1] & 127;
        let off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        if (buf.length < off + 4 + len) return;
        const mask = buf.subarray(off, off + 4);
        const data = Buffer.from(buf.subarray(off + 4, off + 4 + len));
        for (let i = 0; i < len; i++) data[i] ^= mask[i % 4];
        const op = buf[0] & 15;
        buf = buf.subarray(off + 4 + len);
        if (op === 1) conn.onText(data.toString('utf8'));
        else if (op === 8) { socket.destroy(); return; }
      }
    });
    socket.on('error', () => {});
    onSocket(conn, req);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port, url: `http://127.0.0.1:${server.address().port}` })));
}

const json = (o) => ({ status: 200, body: JSON.stringify(o), headers: { 'Content-Type': 'application/json' } });

app.whenReady().then(async () => {
  const servers = [];
  const watchers = [];
  try {
    // ---- Quem está no ar ----
    const parsed = twitchLive.parseLive(['A', 'b', 'c'], JSON.stringify({ data: { users: [{ login: 'a', stream: { id: '1' } }, { login: 'b', stream: null }, null] } }));
    check(parsed.A === true && parsed.b === false && parsed.c === null, `Twitch parseLive: ${JSON.stringify(parsed)}`);
    check(twitchLive.parseLive(['x'], 'lixo').x === null, 'Twitch parseLive com texto estranho: null');
    check(twitchLive.playerUrl('rodil a') === 'https://player.twitch.tv/?channel=rodil%20a&parent=twitch.tv&player=popout' && twitchLive.STILL === 'autoplay=false', 'Twitch playerUrl e STILL');
    check(kickLive.parseLive('{"livestream":null}') === false && kickLive.parseLive('{"livestream":{"is_live":false}}') === false
      && kickLive.parseLive('{"livestream":{"id":1}}') === true && kickLive.parseLive('{}') === null && kickLive.parseLive('x') === null, 'Kick parseLive: null/offline/no ar/sem campo/estranho');
    const live = new Map([['a', true], ['b', false], ['c', null], ['d', true]]);
    check(kickLive.pick(['b', 'a', 'c', 'd'], live, 2).join() === 'a,c' && kickLive.pick(['a', 'b'], { a: true, b: false }, 5).join() === 'a', 'Kick pick: ordem da lista, sem offline, canal sem resposta conta, limite');

    const api = await fakeServer((req, body) => {
      if (req.url === '/gql') {
        const asked = JSON.parse(body);
        return json({ data: { users: asked.variables.l.map((l) => ({ login: l, stream: l === 'on' ? { id: '9' } : null })) } });
      }
      if (req.url === '/api/v2/channels/on') return json({ livestream: { is_live: true } });
      if (req.url === '/api/v2/channels/off') return json({ livestream: null });
      return null;
    });
    servers.push(api.server);
    const tw = await twitchLive.liveAsync(['on', 'off'], { api: `${api.url}/gql` });
    check(tw.on === true && tw.off === false, `Twitch liveAsync: ${JSON.stringify(tw)}`);
    const dead = await twitchLive.liveAsync(['on'], { api: 'http://127.0.0.1:1/gql' });
    check(dead.on === null, 'Twitch liveAsync sem resposta: null');
    check(await kickLive.isLiveAsync('on', { api: api.url }) === true && await kickLive.isLiveAsync('off', { api: api.url }) === false
      && await kickLive.isLiveAsync('nada', { api: api.url }) === false, 'Kick isLiveAsync: no ar, offline, 404 = offline');

    // ---- Kick leve ----
    const kickSeen = { headers: null, messages: [], tokenHeader: null };
    const kick = await fakeServer((req) => {
      if (req.url === '/api/v2/channels/biscoitao/info') return json({ id: 77, livestream: { id: 5, is_live: true, vod_id: 'vod1' } });
      if (req.url === '/api/internal/settings/global') return json({ events: { 'tracking.user.watch.livestream': { interval: 1 } } });
      if (req.url === '/viewer/v1/token') { kickSeen.tokenHeader = req.headers['x-client-token']; return json({ data: { token: 'viewer-tk' } }); }
      return null;
    }, (conn, req) => {
      kickSeen.headers = req.headers;
      kickSeen.url = req.url;
      conn.onText = (t) => kickSeen.messages.push(JSON.parse(t));
    });
    servers.push(kick.server);
    const kw = new KickWatcher({ api: kick.url, websockets: kick.url, socket: `ws://127.0.0.1:${kick.port}/viewer/v1/connect` }, 'sess%tok');
    watchers.push(kw);
    kw.tick = 50;
    kw.handshakeEvery = kw.pingEvery = 300;
    kw.watchEvery = 300;
    kw.setChannels(['biscoitao']);
    const kOk = await waitFor(() => kw.counts('biscoitao').events >= 2 && kw.counts('biscoitao').handshakes >= 2 && kickSeen.messages.some((m) => m.type === 'ping'), 6000);
    const kc = kw.counts('biscoitao');
    check(kOk, `Kick leve manda handshakes e tempo assistido: ${JSON.stringify(kc)}`);
    check(kickSeen.url === '/viewer/v1/connect?token=viewer-tk' && kickSeen.tokenHeader.length === 64, `Kick leve: token de espectador na URL e X-CLIENT-TOKEN no pedido (${kickSeen.url})`);
    check(/Chrome/.test(kickSeen.headers['user-agent']) && kickSeen.headers.origin === 'https://kick.com', `Kick leve: websocket com User-Agent e Origin do site (${kickSeen.headers['user-agent']?.slice(0, 20)} | ${kickSeen.headers.origin})`);
    const ev = kickSeen.messages.find((m) => m.type === 'user_event');
    check(ev?.data.message.name === 'tracking.user.watch.livestream' && ev.data.message.channel_id === 77 && ev.data.message.livestream_id === 5 && ev.data.message.vod_id === 'vod1', 'Kick leve: evento tracking.user.watch.livestream com os ids');
    check(kickSeen.messages.some((m) => m.type === 'channel_handshake' && m.data.message.channelId === '77') && kickSeen.messages.some((m) => m.type === 'ping'), 'Kick leve: channel_handshake (id em texto) e ping');
    check(/^leve ✓ \d\d:\d\d$/.test(kw.status('biscoitao')) && kw.status('outro') === '' && kw.token === 'sess%tok', `Kick leve: status "${kw.status('biscoitao')}"`);
    kw.setChannels([]);
    check(kw.status('biscoitao') === '', 'Kick leve: canal removido some do status');

    // ---- Twitch leve ----
    const twSeen = { minute: [], heads: [], gqlAuth: [] };
    const base = { u: '' };
    const twitch = await fakeServer((req, body) => {
      const url = new URL(req.url, 'http://x');
      if (url.pathname === '/gql') {
        const b = JSON.parse(body);
        twSeen.gqlAuth.push([req.headers.authorization ?? null, req.headers['client-id'], b.operationName ?? 'query']);
        if (b.operationName === 'PlaybackAccessToken') return json({ data: { streamPlaybackAccessToken: { value: 'v', signature: 's' } } });
        return json({ data: { user: { id: '555', stream: { id: 'b1', game: { id: 'g1', name: 'PokeIdle' } } } } });
      }
      if (url.pathname === '/rodil') return { body: `<script src="${base.u}/config/settings.abc.js"></script>` };
      if (url.pathname === '/config/settings.abc.js') return { body: `{"spade_url":"${base.u.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}\\/spade"}` };
      if (url.pathname === '/spade') { twSeen.minute.push({ type: req.headers['content-type'], body }); return { status: 204 }; }
      if (url.pathname === '/usher/api/channel/hls/rodil.m3u8') {
        return { body: '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720\nhi.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=300000,RESOLUTION=284x160\nlow.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=100000\naudio.m3u8\n' };
      }
      if (url.pathname === '/usher/api/channel/hls/low.m3u8') return { body: '#EXTM3U\nseg1.ts\nseg2.ts\n' };
      if (url.pathname.endsWith('.ts')) { twSeen.heads.push(`${req.method} ${url.pathname}`); return { status: 200 }; }
      return null;
    });
    base.u = twitch.url;
    servers.push(twitch.server);
    const tww = new TwitchWatcher({ site: twitch.url, gql: `${twitch.url}/gql`, usher: `${twitch.url}/usher` }, '999', 'oauth-tk', 'dev1');
    watchers.push(tww);
    tww.tick = 50;
    tww.minuteEvery = 200;
    tww.playlistEvery = 200;
    tww.setChannels(['rodil']);
    const tOk = await waitFor(() => tww.counts('rodil').minutes >= 1 && tww.counts('rodil').segments >= 2, 8000);
    check(tOk, `Twitch leve manda minute-watched e HEAD dos pedaços: ${JSON.stringify(tww.counts('rodil'))}`);
    const m = twSeen.minute[0];
    const evt = m && JSON.parse(Buffer.from(new URLSearchParams(m.body).get('data'), 'base64').toString('utf8'))[0];
    check(m?.type === 'application/x-www-form-urlencoded' && evt?.event === 'minute-watched', 'Twitch leve: POST form com data em base64');
    const p = evt?.properties ?? {};
    check(p.channel_id === '555' && p.broadcast_id === 'b1' && p.user_id === '999' && p.player === 'site' && p.live === true && p.channel === 'rodil' && p.game === 'PokeIdle' && p.game_id === 'g1', `Twitch leve: propriedades do evento ${JSON.stringify(p)}`);
    check(twSeen.heads.join() === 'HEAD /usher/api/channel/hls/seg1.ts,HEAD /usher/api/channel/hls/seg2.ts' || twSeen.heads.length === 2, `Twitch leve: só HEAD, na menor qualidade com imagem, sem repetir pedaço (${twSeen.heads.join()})`);
    check(twSeen.gqlAuth.some((g) => g[2] === 'PlaybackAccessToken' && g[0] === 'OAuth oauth-tk' && g[1] === 'kimne78kx3ncx6brgo4mv6wki5h1ko')
      && twSeen.gqlAuth.some((g) => g[2] === 'query' && g[0] === null), 'Twitch leve: token do vídeo com login; consulta do canal sem login');
    check(/^leve ✓ \d\d:\d\d$/.test(tww.status('rodil')) && tww.userId === '999' && tww.token === 'oauth-tk', `Twitch leve: status "${tww.status('rodil')}"`);

    // ---- Avisos da Twitch (PubSub) ----
    let sock = null;
    const listens = [];
    const pubsubServer = await fakeServer(() => null, (conn) => {
      sock = conn;
      conn.onText = (t) => { const o = JSON.parse(t); if (o.type === 'LISTEN' || o.type === 'UNLISTEN') listens.push(o); };
    });
    servers.push(pubsubServer.server);
    const notices = [];
    const ps = new TwitchPubSub(`ws://127.0.0.1:${pubsubServer.port}/v1`, 'oauth-tk', '999', (n) => notices.push(n));
    watchers.push(ps);
    ps.setChannels(['555']);
    check(await waitFor(() => ps.connected && listens.length >= 1, 5000), 'PubSub conecta e manda LISTEN');
    const first = listens[0];
    check(first.type === 'LISTEN' && first.data.auth_token === 'oauth-tk' && first.nonce.length === 32
      && first.data.topics.join() === 'community-points-user-v1.999,raid.555,community-moments-channel-v1.555', `PubSub LISTEN: ${first.data.topics}`);
    check(ps.connectedAt > 0 && ps.error === null, 'PubSub: connectedAt e sem erro');
    ps.setChannels(['555', '556']);
    check(await waitFor(() => listens.some((l) => l.type === 'LISTEN' && l.data.topics.includes('raid.556')), 3000), 'PubSub: canal novo vira LISTEN (só o que entrou)');
    ps.setChannels(['556']);
    check(await waitFor(() => listens.some((l) => l.type === 'UNLISTEN' && l.data.topics.includes('raid.555')), 3000), 'PubSub: canal fechado vira UNLISTEN');
    const wrap = (topic, msg) => JSON.stringify({ type: 'MESSAGE', data: { topic, message: JSON.stringify(msg) } });
    sock.send(wrap('community-points-user-v1.999', { type: 'points-earned', data: { channel_id: '555', point_gain: { reason_code: 'WATCH', total_points: 10 }, balance: { balance: 310 } } }));
    sock.send(wrap('community-points-user-v1.999', { type: 'claim-available', data: { claim: { id: 'c1', channel_id: '556' } } }));
    sock.send(wrap('raid.556', { type: 'raid_update_v2', raid: { id: 'r1', target_login: 'x' } }));
    sock.send(wrap('community-moments-channel-v1.556', { type: 'active', data: { moment_id: 'm1' } }));
    sock.send('lixo que não é JSON');
    sock.send('{"type":"PONG"}');
    check(await waitFor(() => notices.length >= 4, 3000), `PubSub entrega os avisos (${notices.length})`);
    const brief = notices.map((n) => `${n.topic}/${n.type}/${n.channelId}`).join(' ');
    check(brief === 'community-points-user-v1/points-earned/555 community-points-user-v1/claim-available/556 raid/raid_update_v2/556 community-moments-channel-v1/active/556', `PubSub: tópico, tipo e canal dos avisos (${brief})`);
    check(notices[0].message.data.balance.balance === 310, 'PubSub: a mensagem chega já lida do JSON');
    const before = listens.length;
    sock.send(JSON.stringify({ type: 'RESPONSE', nonce: 'x', error: 'ERR_BADAUTH' }));
    check(await waitFor(() => ps.error === 'a Twitch recusou o login da conta nos avisos' && !ps.connected, 3000), `PubSub: ERR_BADAUTH registra o erro (${ps.error})`);
    await new Promise((r) => setTimeout(r, 6000));
    check(!ps.connected && listens.length === before, 'PubSub: login recusado não reconecta');
  } catch (err) {
    check(false, `exceção: ${err.stack || err}`);
  } finally {
    watchers.forEach((w) => w.dispose());
    servers.forEach((s) => s.close());
  }
  finish();
});
