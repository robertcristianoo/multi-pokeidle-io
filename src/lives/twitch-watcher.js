// A Twitch leve (por conta): assiste às lives da Twitch sem player, como os mineradores de pontos. A cada minuto manda à
// Twitch o aviso "minute-watched" de cada live (o mesmo que o player manda), com o id da conta; e, como um player, pede a
// lista dos pedaços do vídeo na menor qualidade e só o cabeçalho (HEAD) de cada pedaço novo, sem baixar o vídeo. Quase
// nada de CPU e memória. Os avisos da Twitch (twitch-pubsub.js) mostram se rende (os pontos de assistir).
const { CLIENT_ID } = require('./twitch-live');
const { t: tl, getLang } = require('../i18n');

// Onde ficam a página do canal (de onde sai o endereço do aviso), a API e as listas do vídeo.
const TWITCH_ENDPOINTS = { site: 'https://www.twitch.tv', gql: 'https://gql.twitch.tv/gql', usher: 'https://usher.ttvnw.net' };

// O mesmo navegador do app.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
// A operação salva da Twitch que dá o token do vídeo (a mesma do player).
const PLAYBACK_HASH = 'ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9';
const HTTP_TIMEOUT_MS = 15 * 1000;

// O endereço do aviso de "assistindo" (spade), por site: sai da config da página da Twitch e vale umas horas.
const SPADE = new Map(); // site -> { url, at }
const SPADE_FOR_MS = 6 * 60 * 60 * 1000;

const SETTINGS_JS = /(https?:\/\/[^"'\s]+\/config\/settings[^"'\s]*?\.js)/;
const SPADE_URL = /"spade_url"\s*:\s*"(.*?)"/;
const BANDWIDTH = /(?<![-A-Z])BANDWIDTH=(\d+)/;

const sleep = (ms, signal) => new Promise((resolve) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
});

class TwitchWatcher {
  constructor(endpoints, userId, token, device) {
    this._endpoints = endpoints;
    this._userId = userId;
    this._token = token;
    this._device = device ?? null;
    this._lives = new Map();
    this._stop = new AbortController();
    // De quanto em quanto tempo (ms) olha cada live, manda o aviso de assistindo, pede a lista dos pedaços e relê a live.
    this.tick = 5 * 1000;
    this.minuteEvery = 60 * 1000;
    this.playlistEvery = 20 * 1000;
    this.infoEvery = 2 * 60 * 1000;
    // Começa no próximo ciclo, para quem criou poder ajustar os tempos antes.
    setTimeout(() => this._run(), 0);
  }

  get userId() { return this._userId; }
  get token() { return this._token; }

  // As lives que a conta assiste agora (as abertas, no máximo 2: o que a Twitch conta).
  setChannels(logins) {
    const next = new Set(logins);
    for (const gone of [...this._lives.keys()]) if (!next.has(gone)) this._lives.delete(gone);
    for (const login of next) {
      if (this._lives.has(login)) continue;
      this._lives.set(login, {
        login, channelId: null, broadcastId: null, game: null, gameId: null, offline: false, infoAt: 0, minuteAt: Date.now(),
        playlistAt: 0, mediaUrl: null, mediaAt: 0, seen: new Set(), seenOrder: [], watchedAt: null, minutes: 0, segments: 0, error: null,
      });
    }
  }

  // "leve ✓ 14:05" (o último aviso de assistindo que a Twitch aceitou), "leve…" (ainda não mandou) ou o erro.
  status(login) {
    const live = this._lives.get(login);
    if (!live) return '';
    if (live.error) return tl('lives.watch.err', { err: live.error });
    if (live.watchedAt) return tl('lives.watch.ok', { time: new Date(live.watchedAt).toLocaleTimeString(getLang(), { hour: '2-digit', minute: '2-digit' }) });
    return tl('lives.watch.wait');
  }

  // Quantos avisos de assistindo a Twitch aceitou e quantos pedaços do vídeo pediu, por live.
  counts(login) {
    const live = this._lives.get(login);
    return live ? { minutes: live.minutes, segments: live.segments } : { minutes: 0, segments: 0 };
  }

  async _run() {
    const signal = this._stop.signal;
    while (!signal.aborted) {
      for (const live of [...this._lives.values()]) {
        if (signal.aborted) return;
        try {
          await this._step(live);
        } catch (err) {
          if (signal.aborted) return;
          live.error = err?.name === 'TimeoutError' || err?.name === 'AbortError' ? tl('lives.watch.twitchNoAnswer') : String(err?.message ?? err);
        }
      }
      await sleep(this.tick, signal);
    }
  }

  async _step(live) {
    const now = Date.now();
    if (live.channelId === null || now - live.infoAt >= this.infoEvery) await this._info(live);
    if (live.offline || live.broadcastId === null || !this._lives.has(live.login)) return;
    if (now - live.playlistAt >= this.playlistEvery) {
      live.playlistAt = now;
      await this._segments(live);
    }
    if (now - live.minuteAt >= this.minuteEvery) {
      live.minuteAt = now;
      await this._minute(live);
    }
  }

  _headers(url, login = false) {
    const h = { 'User-Agent': USER_AGENT };
    if (url.startsWith(this._endpoints.gql)) {
      h['Client-Id'] = CLIENT_ID;
      if (login) {
        h.Authorization = `OAuth ${this._token}`;
        if (this._device) h['X-Device-Id'] = this._device;
      }
    }
    return h;
  }

  _fetch(url, init = {}, login = false) {
    return fetch(url, {
      ...init,
      headers: { ...this._headers(url, login), ...(init.headers ?? {}) },
      signal: AbortSignal.any([this._stop.signal, AbortSignal.timeout(HTTP_TIMEOUT_MS)]),
    });
  }

  async _gql(body, login) {
    const r = await this._fetch(this._endpoints.gql, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body) }, login);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data && typeof j.data === 'object' ? j.data : null;
  }

  // O id do canal, o da transmissão e o jogo (o que vai no aviso); sem transmissão, a live está offline.
  async _info(live) {
    live.infoAt = Date.now();
    const data = await this._gql({ query: 'query($l:String!){user(login:$l){id stream{id game{id name}}}}', variables: { l: live.login } }, false);
    const user = data?.user;
    if (!user || typeof user !== 'object') {
      live.error = tl('lives.watch.twitchNoChannel');
      return;
    }
    live.channelId = user.id;
    const stream = user.stream;
    if (!stream || typeof stream !== 'object') {
      live.offline = true;
      live.error = 'offline';
      return;
    }
    if (stream.id !== live.broadcastId) {
      // Outra transmissão: o vídeo é outro.
      live.mediaUrl = null;
      live.seen.clear();
      live.seenOrder.length = 0;
    }
    live.broadcastId = stream.id;
    live.offline = false;
    if (stream.game && typeof stream.game === 'object') {
      live.game = stream.game.name;
      live.gameId = stream.game.id;
    }
    if (live.error === 'offline') live.error = null;
  }

  // O aviso de "assistindo" de um minuto, como o player manda: o evento em JSON, em base64, no campo data.
  async _minute(live) {
    const spade = await this._spade(live.login);
    if (!spade) {
      live.error = tl('lives.watch.noSpade');
      return;
    }
    const properties = { channel_id: live.channelId, broadcast_id: live.broadcastId, player: 'site', user_id: this._userId, live: true, channel: live.login };
    if (live.game && live.gameId) {
      properties.game = live.game;
      properties.game_id = live.gameId;
    }
    const json = JSON.stringify([{ event: 'minute-watched', properties }]);
    const r = await this._fetch(spade, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: Buffer.from(json, 'utf8').toString('base64') }).toString(),
    });
    if (r.ok) {
      live.watchedAt = Date.now();
      live.minutes++;
      live.error = null;
    } else {
      live.error = tl('lives.watch.minuteErr', { status: r.status });
      // O endereço pode ter mudado: busca de novo na próxima vez.
      SPADE.delete(this._endpoints.site);
    }
  }

  // O endereço do aviso de "assistindo": está na config da página da Twitch (settings…js → spade_url).
  async _spade(login) {
    const known = SPADE.get(this._endpoints.site);
    if (known && Date.now() - known.at < SPADE_FOR_MS) return known.url;
    const page = await this._fetch(`${this._endpoints.site}/${encodeURIComponent(login)}`);
    const settings = SETTINGS_JS.exec(await page.text());
    if (!settings) return null;
    const config = await this._fetch(settings[1]);
    const spade = SPADE_URL.exec(await config.text());
    if (!spade) return null;
    // O texto vem como dentro de um JSON (com \/ no lugar de /, às vezes).
    let url;
    try { url = JSON.parse(`"${spade[1]}"`); } catch { url = spade[1]; }
    SPADE.set(this._endpoints.site, { url, at: Date.now() });
    return url;
  }

  // Como um player: a lista dos pedaços do vídeo na menor qualidade e só o cabeçalho (HEAD) de cada pedaço novo. A lista
  // (com o token do vídeo) é pedida de novo a cada 10 min ou quando a Twitch recusa.
  async _segments(live) {
    if (!live.mediaUrl || Date.now() - live.mediaAt > 10 * 60 * 1000) {
      live.mediaUrl = await this._mediaUrl(live);
      live.mediaAt = Date.now();
    }
    const media = live.mediaUrl;
    if (!media) return;
    const r = await this._fetch(media);
    if (!r.ok) {
      live.mediaUrl = null;
      return;
    }
    const lines = (await r.text()).replace(/\r\n/g, '\n').split('\n');
    for (const line of lines.filter((l) => l.length > 0 && !l.startsWith('#'))) {
      const segment = new URL(line, media).toString();
      if (live.seen.has(segment)) continue;
      live.seen.add(segment);
      live.seenOrder.push(segment);
      while (live.seenOrder.length > 300) live.seen.delete(live.seenOrder.shift());
      const head = await this._fetch(segment, { method: 'HEAD' });
      head.body?.cancel?.().catch(() => {});
      live.segments++;
    }
  }

  // O token do vídeo (com o login da conta; sem ele, se a Twitch recusar) e a lista da menor qualidade com imagem.
  async _mediaUrl(live) {
    const body = () => ({
      operationName: 'PlaybackAccessToken',
      variables: { login: live.login, isLive: true, isVod: false, vodID: '', playerType: 'site', platform: 'web' },
      extensions: { persistedQuery: { version: 1, sha256Hash: PLAYBACK_HASH } },
    });
    let access = null;
    for (const login of [true, false]) {
      const data = await this._gql(body(), login);
      const t = data?.streamPlaybackAccessToken;
      if (t && typeof t === 'object') {
        access = t;
        break;
      }
    }
    if (!access) return null;
    const master = `${this._endpoints.usher}/api/channel/hls/${encodeURIComponent(live.login)}.m3u8` +
      `?sig=${encodeURIComponent(access.signature ?? '')}&token=${encodeURIComponent(access.value ?? '')}` +
      `&allow_source=true&allow_audio_only=true&player=twitchweb&type=any&p=${1000000 + Math.floor(Math.random() * 8999999)}`;
    const r = await this._fetch(master);
    if (!r.ok) return null;
    const lines = (await r.text()).replace(/\r\n/g, '\n').split('\n');
    const variants = [];
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('#EXT-X-STREAM-INF:')) continue;
      let next = i + 1;
      while (next < lines.length && (lines[next].length === 0 || lines[next].startsWith('#'))) next++;
      if (next >= lines.length) break;
      const m = BANDWIDTH.exec(lines[i]);
      variants.push({ bandwidth: m ? Number(m[1]) : Infinity, video: lines[i].includes('RESOLUTION='), uri: new URL(lines[next], master).toString() });
      i = next;
    }
    const video = variants.filter((v) => v.video).sort((a, b) => a.bandwidth - b.bandwidth);
    return video[0]?.uri ?? variants.at(-1)?.uri ?? null;
  }

  dispose() { this._stop.abort(); }
}

module.exports = { TwitchWatcher, TWITCH_ENDPOINTS };
