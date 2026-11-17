// Extensão opcional do Auto-PvP. Carregada por main.js.
// Auto-PvP: mantém a conta na fila do PvP Ranqueado, ligado/desligado à mão (botão "Auto-PvP" da barra da conta).
// É o caminho PvP > aba Ranqueado > "Procurar partida" com a "Tela de batalha" em "Não mostrar", sem abrir o modal:
//  - "Não mostrar" é a preferência `pvpTelaBatalha` = "off" no localStorage do jogo (relida a cada partida);
//  - "Procurar partida" manda {"t":"pvp.fila.entrar"} pelo socket do jogo, o mesmo envio do clique do botão (#pvp-fila-bt);
//  - quem está na fila é o selo "Na fila PvP" (#pvp-fila-pill, sem a classe `hidden`), que o jogo mantém sincronizado.

const TICK_MS = 1000;

module.exports = function init({ getSlots, sendLog }) {
  const autoPvp = new Set();
  const state = new Map(); // id -> { busy }

  // Roda dentro da página. on=false só desfaz (selo e estado). Devolve uma sigla do que fez, para depuração.
  const script = (on) => `(() => {
    window.__apLigado = ${on};
    const ID = 'pk-autopvp-badge';
    let badge = document.getElementById(ID);
    if (!${on}) {
      if (badge) badge.remove();
      window.__apQuando = 0;
      window.__apFalhas = 0;
      return 'off';
    }
    if (!badge) {
      badge = document.createElement('div');
      badge.id = ID;
      badge.textContent = 'AUTO PVP';
      badge.style.cssText = 'position:fixed;top:4px;left:calc(50% + 50px);z-index:2147483647;' +
        'background:#6b3fa0;color:#fff;font:bold 11px sans-serif;padding:2px 8px;border-radius:4px;' +
        'pointer-events:none;opacity:.9';
      document.body.appendChild(badge);
    }
    // Tela de batalha: sempre "Não mostrar" (o jogo lê a cada partida; no modo economia já é assim).
    try { if (localStorage.getItem('pvpTelaBatalha') !== 'off') localStorage.setItem('pvpTelaBatalha', 'off'); } catch {}

    // O socket do jogo (as mensagens dele são JSON com "t"): o gancho no send o pega, como faz o auto-bola.
    if (!window.__apHook) {
      window.__apHook = true;
      const orig = WebSocket.prototype.send;
      WebSocket.prototype.send = function (d) {
        try { if (typeof d === 'string' && d.startsWith('{"t":')) window.__apSock = this; } catch {}
        return orig.apply(this, arguments);
      };
    }
    const sock = window.__apSock;
    if (!sock || sock.readyState !== 1) return 'sem-socket';

    const pill = document.getElementById('pvp-fila-pill');
    const agora = Date.now();
    const naFila = !!pill && !pill.classList.contains('hidden');
    if (naFila) {
      window.__apViuFila = true;
      window.__apFalhas = 0;
      window.__apAguardando = false;
      return 'na-fila';
    }
    // Saiu da fila (achou partida): o jogo exige ~20 s entre partidas, então espera antes de procurar a próxima.
    if (window.__apViuFila) {
      window.__apViuFila = false;
      window.__apQuando = Math.max(window.__apQuando || 0, agora + 22000);
    }
    // Mandou e a fila não apareceu (recusa por equipe vazia, nível, espera, ou partida instantânea): conta como falha e recua,
    // para não encher a tela de avisos do jogo.
    if (window.__apAguardando && agora - window.__apEnviadoEm > 5000) {
      window.__apAguardando = false;
      window.__apFalhas = (window.__apFalhas || 0) + 1;
      window.__apQuando = Math.max(window.__apQuando || 0, agora + Math.min(30000 * 2 ** (window.__apFalhas - 1), 300000));
    }
    if (window.__apAguardando) return 'aguardando';
    if (agora < (window.__apQuando || 0)) return 'espera';
    window.__apEnviadoEm = agora;
    window.__apAguardando = true;
    window.__apQuando = agora + 5000;
    sock.send(JSON.stringify({ t: 'pvp.fila.entrar' }));
    return 'entrou';
  })()`;

  // webContents da conta, ou null se a view já foi destruída (acessar `view.webContents` de uma view destruída lança)
  const vivo = (view) => {
    try {
      const wc = view.webContents;
      return wc.isDestroyed() ? null : wc;
    } catch {
      return null;
    }
  };

  async function passo() {
    for (const { id, view } of getSlots()) {
      const wc = vivo(view);
      if (!wc || wc.isLoading()) continue;
      let st = state.get(id);
      if (!autoPvp.has(id)) {
        if (st) {
          state.delete(id);
          wc.executeJavaScript(script(false)).catch(() => {});
        }
        continue;
      }
      if (!st) state.set(id, (st = { busy: false }));
      if (st.busy) continue;
      st.busy = true;
      try {
        await wc.executeJavaScript(script(true));
      } catch {
        /* página navegando: tenta de novo no próximo tick */
      } finally {
        st.busy = false;
      }
    }
  }

  const tick = () => passo().catch(() => {});
  setInterval(tick, TICK_MS);

  return {
    features: () => [{
      id: 'autopvp',
      label: 'Auto-PvP',
      title: 'Mantém a conta na fila do PvP Ranqueado (tela de batalha em "Não mostrar")',
      isOn: (id) => autoPvp.has(id),
      set: (id, on) => {
        on ? autoPvp.add(id) : autoPvp.delete(id);
        sendLog({ acc: `conta${id}`, kind: 'load', level: 'info', text: `auto-pvp ${on ? 'LIGADO' : 'DESLIGADO'}` });
        tick();
      },
    }],
    onSlotRemoved(id) {
      autoPvp.delete(id);
      state.delete(id);
    },
  };
};
