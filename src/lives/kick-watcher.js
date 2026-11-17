// A Kick leve (por conta): assiste às lives da Kick sem player, mandando o que o player da Kick manda por baixo (lido no
// código do player.kick.com em 05/11/2026). Pede o token de espectador com o login da conta, abre o websocket de
// espectador (um por live, como um player em cada) e manda o "channel_handshake" a cada 15 s, o "ping" a cada 30 s e o
// evento "tracking.user.watch.livestream" (o tempo assistido) no intervalo que a Kick pede (120 s de fábrica). Sem
// vídeo: quase nada de CPU e memória.

// A API do site, a do websocket (o token) e o endereço do websocket.
const KICK_ENDPOINTS = { api: 'https://kick.com', websockets: 'https://websockets.kick.com', socket: 'wss://websockets.kick.com/viewer/v1/connect' };

// O token público do site para o websocket de espectador (NEXT_PUBLIC_WEBSOCKET_CLIENT_TOKEN do player).
const KICK_CLIENT_TOKEN = 'e1393935a959b4020a4491574f6490129f678acdaa92760471263db43487f823';

// O mesmo navegador do app.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const HTTP_TIMEOUT_MS = 15 * 1000;

class Aborted extends Error {}

// Espera `ms` e falha com Aborted se o sinal disparar.
const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if (signal.aborted) return reject(new Aborted());
  const t = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
  const onAbort = () => { clearTimeout(t); reject(new Aborted()); };
  signal.addEventListener('abort', onAbort, { once: true });
});

class KickWatcher {
  // `fetchFn`: como pedir à Kick. No app é o da sessão do Chromium da conta (cookies e identidade de navegador, que o site
  // confere: o fetch do Node leva 403); sem ele usa o fetch do Node.
  constructor(endpoints, token, fetchFn = null) {
    this._fetch = fetchFn ?? ((...a) => fetch(...a));
    this._endpoints = endpoints;
    this._token = token;
    this._lives = new Map();
    this._stop = new AbortController();
    this._asked = null;
    // De quanto em quanto tempo (ms) olha o que mandar, e os tempos do player.
    this.tick = 1000;
    this.handshakeEvery = 15 * 1000;
    this.pingEvery = 30 * 1000;
    this.infoEvery = 2 * 60 * 1000;
    this.watchEvery = null; // o intervalo do evento de tempo assistido; null: o que a Kick pede (120 s se não vier)
  }

  // O login da conta (o cookie session_token da Kick).
  get token() { return this._token; }

  // As lives que a conta assiste agora.
  setChannels(slugs) {
    const next = new Set(slugs);
    for (const gone of [...this._lives.keys()]) {
      if (next.has(gone)) continue;
      this._lives.get(gone).stop.abort();
      this._lives.delete(gone);
    }
    for (const slug of next) {
      if (this._lives.has(slug)) continue;
      const stop = new AbortController();
      this._stop.signal.addEventListener('abort', () => stop.abort(), { once: true });
      const live = { slug, stop, channelId: null, livestreamId: null, vodId: null, offline: false, watchedAt: null, events: 0, handshakes: 0, received: 0, error: null };
      this._lives.set(slug, live);
      this._run(live).catch(() => {});
    }
  }

  // "leve ✓ 14:05" (o último tempo assistido mandado), "leve…" (ainda não mandou), fora do ar ou o erro.
  status(slug) {
    const live = this._lives.get(slug);
    if (!live) return '';
    if (live.error) return `leve: ${live.error}`;
    if (live.offline) return 'leve: fora do ar';
    if (live.watchedAt) return `leve ✓ ${new Date(live.watchedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    return 'leve…';
  }

  // Quantos eventos de tempo assistido e quantos handshakes mandou, e quantas mensagens a Kick mandou.
  counts(slug) {
    const live = this._lives.get(slug);
    return live ? { events: live.events, handshakes: live.handshakes, received: live.received } : { events: 0, handshakes: 0, received: 0 };
  }

  async _run(live) {
    const stop = live.stop.signal;
    let failures = 0;
    await sleep(0, stop).catch(() => {}); // deixa quem criou ajustar os tempos antes
    while (!stop.aborted) {
      try {
        await this._info(live, stop);
        const viewer = await this._viewerToken(stop);
        const socket = await this._connect(viewer, stop);
        live.error = null;
        failures = 0;
        const every = this.watchEvery ?? (await this._askedInterval(stop));
        socket.addEventListener('message', () => { live.received++; });
        try {
          await this._talk(live, socket, every, stop);
        } finally {
          // Saindo (a live fechou ou a Kick leve desligou): avisa, como o player, e fecha.
          if (socket.readyState === 1) {
            try {
              if (live.channelId !== null) socket.send(this._message('channel_disconnect', { channelId: String(live.channelId) }));
              socket.close(1000, '');
            } catch {}
          }
        }
      } catch (err) {
        if (stop.aborted) return;
        live.error = err?.name === 'TimeoutError' || err?.name === 'AbortError' ? 'a Kick não respondeu' : String(err?.message ?? err);
      }
      failures++;
      try {
        await sleep(Math.min(60, 2 << Math.min(failures, 5)) * 1000, stop);
      } catch {
        return;
      }
    }
  }

  // Conversa com a Kick até a conexão fechar ou o sinal disparar.
  async _talk(live, socket, every, stop) {
    let closed = null;
    socket.addEventListener('close', (e) => { closed = e; });
    let handshakeAt = 0;
    let watchAt = 0;
    let pingAt = Date.now() + this.pingEvery;
    let infoAt = Date.now() + this.infoEvery;
    while (!stop.aborted && socket.readyState === 1) {
      const now = Date.now();
      if (now >= infoAt) {
        infoAt = now + this.infoEvery;
        try {
          await this._info(live, stop);
        } catch (err) {
          if (stop.aborted) throw err;
          // Fica com o que já sabia; tenta de novo na próxima.
        }
      }
      if (now >= handshakeAt && live.channelId !== null) {
        handshakeAt = now + this.handshakeEvery;
        socket.send(this._message('channel_handshake', { channelId: String(live.channelId) }));
        live.handshakes++;
      }
      if (now >= pingAt) {
        pingAt = now + this.pingEvery;
        socket.send('{"type":"ping"}');
      }
      // Como o player: o tempo assistido só vai com a live no ar e o id do VOD dela.
      if (now >= watchAt && !live.offline && live.channelId !== null && live.livestreamId !== null && live.vodId !== null) {
        watchAt = now + every;
        socket.send(this._message('user_event', {
          name: 'tracking.user.watch.livestream', channel_id: live.channelId, livestream_id: live.livestreamId, vod_id: live.vodId,
        }));
        live.events++;
        live.watchedAt = Date.now();
      }
      await sleep(this.tick, stop);
    }
    if (!stop.aborted) live.error = `a Kick fechou a conexão${closed?.code ? ` (${closed.code})` : ''}`;
  }

  _message(type, message) { return JSON.stringify({ type, data: { message } }); }

  // Abre o websocket (com o User-Agent e a Origin do site, que a Kick confere).
  _connect(viewer, stop) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`${this._endpoints.socket}?token=${encodeURIComponent(viewer)}`, {
        headers: { 'User-Agent': USER_AGENT, Origin: 'https://kick.com' },
      });
      const onAbort = () => { try { socket.close(); } catch {} reject(new Aborted()); };
      stop.addEventListener('abort', onAbort, { once: true });
      socket.addEventListener('open', () => { stop.removeEventListener('abort', onAbort); resolve(socket); }, { once: true });
      socket.addEventListener('error', (e) => {
        stop.removeEventListener('abort', onAbort);
        reject(new Error(e?.message || 'não deu para conectar na Kick'));
      }, { once: true });
    });
  }

  _request(url, stop) {
    return this._fetch(url, {
      headers: {
        'User-Agent': USER_AGENT, Accept: 'application/json', 'x-app-platform': 'web', Referer: 'https://kick.com',
        Authorization: `Bearer ${this._token}`,
      },
      signal: AbortSignal.any([stop, AbortSignal.timeout(HTTP_TIMEOUT_MS)]),
    });
  }

  // O canal (o id), a live no ar (o id) e o VOD dela: o que vai no tempo assistido.
  async _info(live, stop) {
    const r = await this._request(`${this._endpoints.api}/api/v2/channels/${encodeURIComponent(live.slug)}/info`, stop);
    if (!r.ok) throw new Error(`o canal não abriu (erro ${r.status})`);
    let root = await r.json().catch(() => null);
    if (!root || typeof root !== 'object') throw new Error('o canal veio sem dados');
    if (root.data && typeof root.data === 'object' && root.id == null) root = root.data;
    if (root.id == null) throw new Error('o canal veio sem o id');
    live.channelId = root.id;
    const stream = root.livestream && typeof root.livestream === 'object' ? root.livestream : null;
    live.offline = !stream || stream.is_live === false;
    live.livestreamId = stream?.id ?? null;
    live.vodId = stream?.vod_id ?? null;
  }

  // O token de espectador, com o login da conta (vale para uma conexão).
  async _viewerToken(stop) {
    const r = await this._fetch(`${this._endpoints.websockets}/viewer/v1/token`, {
      headers: {
        'User-Agent': USER_AGENT, Accept: 'application/json', 'x-app-platform': 'web', Referer: 'https://kick.com',
        Authorization: `Bearer ${this._token}`, 'X-CLIENT-TOKEN': KICK_CLIENT_TOKEN,
      },
      signal: AbortSignal.any([stop, AbortSignal.timeout(HTTP_TIMEOUT_MS)]),
    });
    if (!r.ok) throw new Error(`a Kick recusou o token de espectador (erro ${r.status})`);
    const doc = await r.json().catch(() => null);
    const token = doc?.data?.token;
    if (typeof token !== 'string' || !token) throw new Error('a Kick não mandou o token de espectador');
    return token;
  }

  // O intervalo que a Kick pede para o tempo assistido (o mesmo para todas as lives), 120 s se não vier.
  async _askedInterval(stop) {
    if (this._asked !== null) return this._asked;
    let asked = 120 * 1000;
    try {
      const r = await this._request(`${this._endpoints.api}/api/internal/settings/global`, stop);
      if (r.ok) {
        const root = await r.json();
        const interval = (root?.events ?? root?.data?.events)?.['tracking.user.watch.livestream']?.interval;
        if (typeof interval === 'number') asked = Math.min(600, Math.max(30, interval)) * 1000;
      }
    } catch (err) {
      if (stop.aborted) throw err;
      // Fica com os 120 s do player.
    }
    this._asked = asked;
    return asked;
  }

  dispose() {
    this._stop.abort();
    for (const live of this._lives.values()) live.stop.abort();
    this._lives.clear();
  }
}

module.exports = { KickWatcher, KICK_ENDPOINTS, KICK_CLIENT_TOKEN };
