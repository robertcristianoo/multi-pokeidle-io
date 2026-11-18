// Preload das contas: só LÊ o que o servidor do jogo já manda sobre o bônus das lives (Twitch/Kick). Pega o WebSocket do
// próprio jogo pelo primeiro `hello` e guarda os blocos `twitch` e `kick` do estado da conta (o `welcome` e os deltas de
// `estado`). Nada é enviado ao servidor; o main consulta `window.__lives.summary()` para a dica do bônus e a guarda do bônus.
const { webFrame } = require('electron');

function hook() {
  if (window.__lives) return;
  const KEYS = ['twitch', 'kick'];
  const L = (window.__lives = { socks: new WeakSet(), me: null, skew: 0, socket: null });

  const origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      if (typeof data === 'string' && !L.socks.has(this) && data.includes('"t":"hello"')) {
        L.socks.add(this);
        L.socket = this;
        this.addEventListener('message', onMessage);
      }
    } catch {}
    return origSend.apply(this, arguments);
  };

  function onMessage(ev) {
    const d = ev.data;
    if (typeof d !== 'string' || !/^\{"t":"(welcome|estado)"/.test(d)) return;
    let m;
    try { m = JSON.parse(d); } catch { return; }
    const e = m.estado;
    // O nome do jogador, se o servidor mandar com um destes nomes (senão o app lê da tela)
    for (const o of [m, e, m.perfil, m.jogador, m.usuario]) {
      const n = o && typeof o === 'object' ? [o.apelido, o.nick, o.nickname, o.username, o.nomeJogador, o.nome].find((v) => typeof v === 'string' && v.trim() && v.length <= 30) : null;
      if (n) { L.name = n.trim(); break; }
    }
    if (!e || typeof e !== 'object') return;
    // O estado vem em delta: a chave só aparece quando muda (null = apagou); `cheio` (welcome, reconexão) recomeça do zero
    if (m.t === 'welcome' || e.cheio || !L.me) L.me = {};
    for (const k of KEYS) if (k in e) L.me[k] = e[k];
    if (Number(e.servidorAgora) > 0) L.skew = Date.now() - Number(e.servidorAgora); // os prazos dos bônus são do servidor
  }

  // O bônus das lives num site: se a conta vinculou o site no jogo, quantos segundos faltam para cada bônus vencer (xp,
  // captura, shiny; 0 = sem bônus) e os canais oficiais com os bônus do PokeIdle (e se estão no ar).
  function site(block) {
    if (!block || typeof block !== 'object') return null;
    const now = Date.now() - L.skew;
    const left = {};
    for (const [kind, until] of Object.entries(block.bonus ?? {})) left[kind] = Math.max(0, Math.round((Number(until) - now) / 1000)) || 0;
    return {
      linked: !!(block.vinculado ?? block.login),
      left,
      // na Twitch o canal vem em `login`; na Kick, em `slug`
      channels: (Array.isArray(block.oficiais) ? block.oficiais : []).filter((o) => (o?.login ?? o?.slug) && o.ativo !== false)
        .map((o) => ({ login: String(o.login ?? o.slug).toLowerCase(), live: !!o.aoVivo })),
    };
  }

  L.summary = () => ({ connected: L.socket?.readyState === 1, twitch: site(L.me?.twitch), kick: site(L.me?.kick) });
}

// Só no site do jogo: a sessão da conta também abre páginas da Twitch e da Kick (lives)
if (/(^|\.)pokeidle\.io$|^(localhost|127\.0\.0\.1)$/.test(location.hostname)) webFrame.executeJavaScript(`(${hook.toString()})()`);
