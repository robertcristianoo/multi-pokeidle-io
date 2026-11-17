// Os avisos da Twitch de uma conta, na hora, pelo websocket de avisos da Twitch (PubSub), com o login da conta (o cookie
// auth-token): o baú que apareceu, cada ponto que entrou (assistindo, baú, sequência de lives, raid) e, nos canais
// abertos, a raid e o "momento". Assim o app pega o baú sem esperar a conferência, entra na raid e sabe se as lives
// estão rendendo. A conexão que cai volta sozinha (5 s, 10 s… até 2 min); o login recusado (ERR_BADAUTH) para de vez.
const crypto = require('crypto');

const TWITCH_PUBSUB_URL = 'wss://pubsub-edge.twitch.tv/v1';

// A Twitch fecha a conexão sem um PING a cada 5 min; sem o PONG em 15 s, a conexão caiu.
const PING_EVERY_MS = 60 * 1000;
const PONG_WAIT_MS = 15 * 1000;
const MAX_WAIT_MS = 2 * 60 * 1000;

const channelTopics = (channelId) => [`raid.${channelId}`, `community-moments-channel-v1.${channelId}`];

// O canal do aviso: nos tópicos de canal é o do tópico; nos da conta vem na mensagem.
function channelOf(topic, suffix, message) {
  if (topic !== 'community-points-user-v1') return suffix;
  const data = message?.data;
  if (!data || typeof data !== 'object') return null;
  const id = (parent, name) => (parent && typeof parent === 'object' && parent[name] && typeof parent[name] === 'object' ? parent[name].channel_id ?? null : null);
  return id(data, 'claim') ?? data.channel_id ?? id(data, 'balance') ?? id(data, 'point_gain') ?? null;
}

class TwitchPubSub {
  // onNotice({ topic, type, channelId, message }): o tópico sem o id (community-points-user-v1, raid,
  // community-moments-channel-v1), o tipo (claim-available, points-earned, raid_update_v2, active…), o id do canal e a
  // mensagem inteira (já lida do JSON).
  constructor(url, token, userId, onNotice) {
    this._url = url;
    this._token = token;
    this._userId = userId;
    this._notice = onNotice;
    this._channels = new Set();
    this._socket = null;
    this._connected = false;
    this._connectedAt = null;
    this._error = null;
    this._pongAt = 0;
    this._disposed = false;
    this._timers = new Set();
    this._wake = null;
    this._run();
  }

  get token() { return this._token; }
  get userId() { return this._userId; }
  get connected() { return this._connected; }
  get connectedAt() { return this._connectedAt; }
  // O que deu errado por último (null: nada); com o login recusado, parou.
  get error() { return this._error; }

  get _userTopic() { return `community-points-user-v1.${this._userId}`; }

  // Os canais abertos (os ids): ouve a raid e o momento de cada um, e para de ouvir os que fecharam.
  setChannels(channelIds) {
    const next = new Set(channelIds);
    const added = [...next].filter((c) => !this._channels.has(c)).flatMap(channelTopics);
    const removed = [...this._channels].filter((c) => !next.has(c)).flatMap(channelTopics);
    this._channels = next;
    if (this._socket && this._socket.readyState === 1 && this._connected) {
      if (added.length) this._send(this._socket, this._listen('LISTEN', added));
      if (removed.length) this._send(this._socket, this._listen('UNLISTEN', removed));
    }
  }

  _listen(type, topics) {
    return JSON.stringify({ type, nonce: crypto.randomBytes(16).toString('hex'), data: { topics, auth_token: this._token } });
  }

  _send(socket, text) {
    try { socket.send(text); } catch {
      // A conexão caiu no meio: o laço conecta de novo e manda tudo outra vez.
    }
  }

  // Espera `ms` (acorda antes se o objeto for descartado).
  _sleep(ms) {
    return new Promise((resolve) => {
      const t = setTimeout(() => { this._wake = null; resolve(); }, ms);
      this._wake = () => { clearTimeout(t); this._wake = null; resolve(); };
    });
  }

  async _run() {
    await this._sleep(0); // deixa quem criou ligar o que precisa antes da primeira conexão
    let wait = 5000;
    while (!this._disposed) {
      let done = false;
      try {
        const socket = await this._open();
        this._socket = socket;
        this._connected = true;
        this._connectedAt = Date.now();
        this._error = null;
        wait = 5000;
        this._pongAt = Date.now();
        this._send(socket, this._listen('LISTEN', [this._userTopic, ...[...this._channels].flatMap(channelTopics)]));
        done = await this._receive(socket);
      } catch (err) {
        if (!this._disposed) this._error = String(err?.message ?? err);
      } finally {
        this._connected = false;
        this._socket = null;
      }
      if (done || this._disposed) break;
      await this._sleep(wait);
      wait = Math.min(wait * 2, MAX_WAIT_MS);
    }
  }

  _open() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this._url);
      socket.addEventListener('open', () => resolve(socket), { once: true });
      socket.addEventListener('error', (e) => reject(new Error(e?.message || 'não deu para conectar na Twitch')), { once: true });
      this._pending = socket;
    });
  }

  // Lê os avisos até a conexão cair (false: conectar de novo) ou o login ser recusado (true: parar).
  _receive(socket) {
    return new Promise((resolve) => {
      let ping = null;
      const finish = (stop) => {
        clearTimeout(ping);
        this._timers.delete(ping);
        try { socket.close(); } catch {}
        resolve(stop);
      };
      // PING a cada minuto; sem o PONG a tempo, derruba a conexão (e o laço conecta de novo).
      const pingLoop = () => {
        ping = setTimeout(() => {
          const sent = Date.now();
          this._send(socket, '{"type":"PING"}');
          ping = setTimeout(() => {
            if (this._pongAt < sent) return finish(false);
            pingLoop();
          }, PONG_WAIT_MS);
          this._timers.add(ping);
        }, PING_EVERY_MS);
        this._timers.add(ping);
      };
      pingLoop();
      socket.addEventListener('message', (e) => {
        const stop = this._handle(typeof e.data === 'string' ? e.data : String(e.data));
        if (stop !== null) finish(stop);
      });
      socket.addEventListener('close', () => finish(false), { once: true });
      socket.addEventListener('error', () => finish(false), { once: true });
    });
  }

  // Um texto do websocket. Devolve true para parar, false para conectar de novo, null para seguir.
  _handle(text) {
    try {
      const root = JSON.parse(text);
      switch (root?.type) {
        case 'PONG':
          this._pongAt = Date.now();
          return null;
        case 'RECONNECT':
          return false;
        case 'RESPONSE': {
          const error = root.error;
          if (!error) return null;
          this._error = error === 'ERR_BADAUTH' ? 'a Twitch recusou o login da conta nos avisos' : error;
          return error === 'ERR_BADAUTH' ? true : null;
        }
        case 'MESSAGE': {
          const topic = String(root.data.topic ?? '');
          const message = JSON.parse(root.data.message ?? '{}');
          const dot = topic.indexOf('.');
          const name = dot < 0 ? topic : topic.slice(0, dot);
          const suffix = dot < 0 ? '' : topic.slice(dot + 1);
          this._notice({ topic: name, type: typeof message?.type === 'string' ? message.type : '', channelId: channelOf(name, suffix, message), message });
          return null;
        }
      }
    } catch {
      // Aviso fora do formato: ignora esse e segue.
    }
    return null;
  }

  dispose() {
    this._disposed = true;
    this._wake?.();
    for (const t of this._timers) clearTimeout(t);
    this._timers.clear();
    try { this._socket?.close(); } catch {}
    try { this._pending?.close(); } catch {}
  }
}

module.exports = { TwitchPubSub, TWITCH_PUBSUB_URL };
