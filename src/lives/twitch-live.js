// Quem está ao vivo na Twitch, pela mesma API que o site usa (gql.twitch.tv, com o Client-Id público do site),
// todos os canais numa pergunta só. Como na Kick, só as primeiras da lista que estão no ar abrem, até o limite
// escolhido (kick-live.js `pick`), e live offline não fica aberta gastando.

const DEFAULT_SLOTS = 2; // quantas lives da Twitch abrir em cada conta, de fábrica (como na Kick)
const MAX_SLOTS = 10; // o teto do campo
const CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // o Client-Id do próprio site da Twitch (público)
const STILL = 'autoplay=false'; // o player parado da Twitch leve: sem vídeo, só para o baú e o resgate
const TIMEOUT_MS = 15 * 1000;

// O player da live sozinho (o mesmo do "player em janela" do site), que entra com o login do perfil.
const playerUrl = (channel) => `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=twitch.tv&player=popout`;

// A resposta: "users" vem na ordem dos canais pedidos, null para o canal que não existe, e "stream" é null com o canal offline.
function parseLive(channels, json) {
  const result = Object.fromEntries(channels.map((c) => [c, null]));
  try {
    const doc = typeof json === 'string' ? JSON.parse(json) : json;
    const users = doc?.data?.users;
    if (!Array.isArray(users)) return result;
    const found = new Map();
    for (const user of users) {
      if (user && typeof user === 'object' && typeof user.login === 'string') {
        found.set(user.login.toLowerCase(), !!user.stream && typeof user.stream === 'object');
      }
    }
    for (const channel of channels) result[channel] = found.get(channel.toLowerCase()) ?? null;
  } catch {}
  return result;
}

// Cada canal: true = no ar, false = offline ou não existe, null = não deu para saber agora.
async function liveAsync(channels, { api = 'https://gql.twitch.tv/gql' } = {}) {
  if (!channels.length) return {};
  try {
    const r = await fetch(api, {
      method: 'POST',
      headers: { 'Client-Id': CLIENT_ID, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'query($l:[String!]){users(logins:$l){login stream{id}}}', variables: { l: channels } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (r.ok) return parseLive(channels, await r.text());
  } catch {
    // Sem internet ou a Twitch não respondeu: fica tudo como "não deu para saber".
  }
  return Object.fromEntries(channels.map((c) => [c, null]));
}

module.exports = { liveAsync, parseLive, playerUrl, STILL, DEFAULT_SLOTS, MAX_SLOTS, CLIENT_ID };
