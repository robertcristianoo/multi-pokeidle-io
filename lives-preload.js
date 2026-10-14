// Preload das contas: só LÊ o que o servidor do jogo já manda sobre as lives (Twitch/Kick). Pega o
// WebSocket do próprio jogo pelo primeiro `hello` e guarda os blocos `twitch` e `kick` do estado.
// Nada é enviado ao servidor; o main consulta `window.__lives.snap()`.
const { webFrame } = require('electron');

function hook() {
  if (window.__lives) return;
  const L = (window.__lives = { twitch: null, kick: null, socks: new WeakSet() });

  const origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      if (typeof data === 'string' && !L.socks.has(this) && data.includes('"t":"hello"')) {
        L.socks.add(this);
        this.addEventListener('message', onMessage);
      }
    } catch {}
    return origSend.apply(this, arguments);
  };

  function onMessage(ev) {
    const d = ev.data;
    // O estado vem em delta: a chave só aparece quando muda (null = apagou)
    if (typeof d !== 'string' || (!d.includes('"twitch"') && !d.includes('"kick"'))) return;
    let m;
    try { m = JSON.parse(d); } catch { return; }
    const e = m.t === 'welcome' || m.t === 'estado' ? m.estado : null;
    if (!e || typeof e !== 'object') return;
    if ('twitch' in e) L.twitch = e.twitch;
    if ('kick' in e) L.kick = e.kick;
  }

  L.snap = () => {
    const tw = L.twitch;
    const kk = L.kick;
    const lower = (x) => String(x ?? '').toLowerCase();
    let twitch = null;
    if (tw) {
      const bonus = new Set((tw.oficiais ?? []).filter((o) => o.bonus === true).map((o) => lower(o.login)));
      const temInfo = Array.isArray(tw.oficiais) && tw.oficiais.length > 0;
      twitch = {
        // só conta a live com bônus (o servidor lê o chat dela); sem info de bônus, considera todas
        lives: (tw.lives ?? []).filter((l) => !temInfo || bonus.has(lower(l.login))).map((l) => ({ id: lower(l.login), nome: l.nome || l.login })),
      };
    }
    const kick = kk ? { lives: (kk.oficiais ?? []).filter((o) => o.aoVivo && o.ativo).map((o) => ({ id: lower(o.slug), nome: o.nome || o.slug })) } : null;
    return { twitch, kick };
  };
}

webFrame.executeJavaScript(`(${hook.toString()})()`);
