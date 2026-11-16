// Quem está ao vivo na Kick, pela mesma API que o site usa (kick.com/api/v2/channels/{canal}). Abre só as primeiras
// da lista que estão no ar, até o limite escolhido (2 de fábrica, as que a Kick conta para os pontos).

const DEFAULT_SLOTS = 2;
const MAX_SLOTS = 10; // cada live custa RAM
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15 * 1000;

// A resposta da API: "livestream" é null com o canal offline. true = no ar, false = offline, null = não deu para saber.
function parseLive(json) {
  try {
    const doc = typeof json === 'string' ? JSON.parse(json) : json;
    if (!doc || typeof doc !== 'object' || !('livestream' in doc)) return null;
    const live = doc.livestream;
    return !!live && typeof live === 'object' && live.is_live !== false;
  } catch {
    return null;
  }
}

async function isLiveAsync(channel, { api = 'https://kick.com' } = {}) {
  try {
    const r = await fetch(`${api}/api/v2/channels/${encodeURIComponent(channel)}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (r.status === 404) return false;
    return r.ok ? parseLive(await r.text()) : null;
  } catch {
    return null;
  }
}

// As lives para abrir: as primeiras da lista que estão no ar, até `slots` (a primeira tem prioridade). Canal que
// não deu para conferir conta como no ar, para não perder pontos.
const pick = (channels, live, slots) => [...channels].filter((c) => (live instanceof Map ? live.get(c) : live[c]) !== false).slice(0, Math.max(0, slots));

module.exports = { isLiveAsync, parseLive, pick, DEFAULT_SLOTS, MAX_SLOTS };
