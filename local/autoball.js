// Extensão opcional do Auto-bola. Carregada por main.js.
// Auto-bola: clica na lista "Proximidade para Capturar" (#caidos-lista .caido). Funciona também no modo economia de energia.
// Atalhos: Ctrl+Alt+1..4 liga/desliga por posição, Ctrl+Alt+0 liga/desliga todas.

const MIN_MS = 500;
const MAX_MS = 1500;
const TICK_MS = 250;

module.exports = function init({ getSlots, sendLog }) {
  const autoBall = new Set();
  const state = new Map(); // id -> { next: timestamp do próximo clique (0 = sem alvo), busy }
  const randomDelay = () => MIN_MS + Math.random() * (MAX_MS - MIN_MS);

  // Roda dentro da página. `click` false = só conta os alvos/mostra o selo; true = clica num alvo.
  // Alvo: o que está acabando (classe `acabando`, menor tempo restante); senão o mais ao topo.
  const script = (on, click) => `(() => {
    window.__abLigado = ${on};
    const ID = 'pk-auto-badge';
    let badge = document.getElementById(ID);
    const ecoNow = document.documentElement.classList.contains('modo-economia');
    if (!${on}) {
      if (badge) badge.remove();
      return 0;
    }
    if (!badge) {
      badge = document.createElement('div');
      badge.id = ID;
      badge.textContent = 'AUTO BOLA';
      badge.style.cssText = 'position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:2147483647;' +
        'background:#1b8f3a;color:#fff;font:bold 11px sans-serif;padding:2px 8px;border-radius:4px;' +
        'pointer-events:none;opacity:.9';
      document.body.appendChild(badge);
    }
    // Modo economia: o jogo avisa o servidor (cliente.economia) para PARAR de mandar o campo, e a lista de caídos é desenhada a partir
    // dele: congela. Já os eventos "morte" continuam chegando (com o slot do corpo), e o clique da lista só envia
    // {"t":"ball.throw","ballId","slot"} pelo socket do jogo. O jogo é um módulo (nada dele é visível de fora), então o gancho no
    // WebSocket.send pega o socket, aprende o ballId do último arremesso/evento "bola" e ouve os eventos do servidor.
    // O servidor descarta, sem avisar, o arremesso que chega logo depois de outro (visto no diagnóstico: vários abates juntos
    // deixavam corpos sem nenhum evento "bola" e eles expiravam). Por isso: um arremesso por vez ("em voo"), confirmado pelo evento
    // "bola" do mesmo slot (ou pelo aviso "não está mais no chão"); sem resposta em 1,5 s, reenvia; e o seguinte só sai ESPERA_MS
    // depois da confirmação. Ocioso, o arremesso sai na hora do abate.
    const ESPERA_MS = 1000;
    const fila = (window.__abFila ??= new Map()); // slot -> { t }
    const hms = () => new Date().toISOString().slice(11, 23);
    const reg = (anel, o) => { (window[anel] ??= []).push({ h: hms(), ...o }); if (window[anel].length > 60) window[anel].shift(); };
    if (!window.__abHook) {
      window.__abHook = true;
      const ecoOn = () => document.documentElement.classList.contains('modo-economia');
      const enviar = (slot) => window.__abSock.send(JSON.stringify({ t: 'ball.throw', ballId: window.__abBall, slot: Number(slot) }));
      window.__abLivreEm = 0;
      window.__abProximo = () => {
        if (!window.__abLigado || !ecoOn()) return;
        const sock = window.__abSock;
        if (!sock || sock.readyState !== 1 || !window.__abBall) return;
        const agora = Date.now();
        for (const [k, v] of fila) if (agora - v.t > 27000) fila.delete(k); // quem cai some do chão em 30 s
        const voo = window.__abVoo;
        if (voo) {
          if (agora - voo.t < 1500) return; // aguarda a resposta do servidor
          if (voo.tent >= 3) { reg('__abEvt', { k: 'desistiu', slot: voo.slot }); window.__abVoo = null; }
          else { voo.tent++; voo.t = agora; reg('__abEnv', { slot: voo.slot, tent: voo.tent, via: 'reenvio' }); enviar(voo.slot); return; }
        }
        if (!fila.size) return;
        if (agora < window.__abLivreEm) { // logo depois de um arremesso: espera, senão o servidor descarta
          clearTimeout(window.__abTimer);
          window.__abTimer = setTimeout(window.__abProximo, window.__abLivreEm - agora + 20);
          return;
        }
        const slot = [...fila.keys()].sort((a, b) => fila.get(b).t - fila.get(a).t || Number(b) - Number(a))[0]; // o mais novo primeiro
        fila.delete(slot);
        window.__abVoo = { slot, t: agora, tent: 1 };
        reg('__abEnv', { slot, tent: 1, via: 'socket', fila: fila.size });
        enviar(slot);
      };
      const ouvinte = (m) => {
        if (typeof m.data !== 'string' || !/"k":"(morte|bola|aviso)"/.test(m.data)) return;
        try {
          for (const e of JSON.parse(m.data).ev || []) {
            if (e.k === 'bola') {
              if (e.ballId) window.__abBall = e.ballId;
              reg('__abEvt', { k: 'bola', slot: e.slot, ok: e.sucesso, chance: e.chance });
              if (window.__abVoo && String(e.slot) === window.__abVoo.slot) {
                window.__abVoo = null;
                window.__abLivreEm = Date.now() + ESPERA_MS;
                window.__abProximo();
              }
            } else if (e.k === 'aviso' && /ch[ãa]o/i.test(String(e.msg))) {
              reg('__abEvt', { k: 'aviso', msg: e.msg });
              if (window.__abVoo) { window.__abVoo = null; window.__abProximo(); }
            } else if (e.k === 'morte' && e.quem === 'selvagem' && !e.safari && e.slot != null) {
              reg('__abEvt', { k: 'morte', slot: e.slot });
              fila.set(String(e.slot), { t: Date.now() });
              window.__abProximo(); // ocioso: lança NA HORA em que o abate chega
            }
          }
        } catch {}
      };
      const orig = WebSocket.prototype.send;
      WebSocket.prototype.send = function (d) {
        try {
          if (typeof d === 'string' && d.startsWith('{"t":')) {
            window.__abSock = this; // o socket do jogo (as mensagens dele são JSON com "t")
            if (!this.__abOuve) { this.__abOuve = true; this.addEventListener('message', ouvinte); }
            if (d.includes('"ball.throw"')) { const b = JSON.parse(d).ballId; if (b) window.__abBall = b; }
          }
        } catch {}
        return orig.apply(this, arguments);
      };
    }
    if (ecoNow && window.__abSock) {
      window.__abProximo(); // também é a rede de segurança: reenvia o que ficou sem resposta
      if (!window.__abBall) {
        // ainda sem ballId conhecido (nenhum arremesso visto): usa o clique do jogo, que escolhe a bola, se a linha existir
        for (const slot of [...fila.keys()]) {
          const el = document.querySelector('#caidos-lista .caido[data-slot="' + slot + '"]');
          if (el) { fila.delete(slot); reg('__abEnv', { slot, via: 'clique' }); el.click(); }
        }
      }
      return 0; // nunca arma o atraso aleatório do modo normal
    }
    // Modo economia: o jogo some com a cena (a lista fica com 0x0 e sem offsetParent), mas os botões continuam na página,
    // atualizados em tempo real e clicáveis. Nele vale qualquer .caido da lista; no modo normal só os visíveis.
    const eco = document.documentElement.classList.contains('modo-economia');
    // Na economia o jogo não remove da lista os que já sumiram do chão (cada clique neles vira o aviso "esse pokemon não está mais
    // no chão"): cada slot é tentado uma vez só (a bola captura ou faz fugir, nunca sobra para uma 2ª) e o mais novo vem primeiro.
    const tentados = (window.__abTentados ??= new Set());
    const alvos = [...document.querySelectorAll(eco ? '#caidos-lista .caido' : '#caidos:not(.hidden) #caidos-lista .caido')]
      .filter((el) => (eco ? !tentados.has(el.dataset.slot) : el.offsetParent !== null));
    if (!alvos.length) return 0;
    if (${click}) {
      const restante = (el) => parseFloat(el.querySelector('.caido-tempo i')?.style.width) || 100;
      const acabando = alvos.filter((el) => el.classList.contains('acabando'));
      const alvo = eco
        ? alvos.reduce((a, b) => (Number(b.dataset.slot) > Number(a.dataset.slot) ? b : a))
        : acabando.length
        ? acabando.reduce((a, b) => (restante(b) < restante(a) ? b : a))
        : alvos.reduce((a, b) => (b.getBoundingClientRect().top < a.getBoundingClientRect().top ? b : a));
      if (eco) {
        tentados.add(alvo.dataset.slot);
        if (tentados.size > 500) tentados.delete(tentados.values().next().value);
      }
      (window.__abLog ??= []).push({ h: new Date().toTimeString().slice(0, 8), slot: alvo.dataset.slot, eco, alvos: alvos.length });
      if (window.__abLog.length > 40) window.__abLog.shift();
      const r = alvo.getBoundingClientRect();
      const x = r.left + r.width * (0.3 + Math.random() * 0.4);
      const y = r.top + r.height * (0.3 + Math.random() * 0.4);
      const ev = (type, Ctor) => alvo.dispatchEvent(new Ctor(type, {
        bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0,
      }));
      ev('pointerdown', PointerEvent); ev('mousedown', MouseEvent);
      ev('pointerup', PointerEvent); ev('mouseup', MouseEvent);
      ev('click', MouseEvent);
    }
    return alvos.length;
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
    const now = Date.now();
    for (const { id, view } of getSlots()) {
      const wc = vivo(view);
      if (!wc || wc.isLoading()) continue;
      let st = state.get(id);
      if (!autoBall.has(id)) {
        if (st) {
          state.delete(id);
          wc.executeJavaScript(script(false, false)).catch(() => {});
        }
        continue;
      }
      if (!st) state.set(id, (st = { next: 0, busy: false }));
      if (st.busy) continue;
      st.busy = true;
      try {
        const count = await wc.executeJavaScript(script(true, false));
        if (!count) {
          st.next = 0; // sem alvo: desarma
        } else if (count === 1) {
          await wc.executeJavaScript(script(true, true)); // só um: joga na hora
          st.next = 0;
        } else if (st.next === 0) {
          st.next = Date.now() + randomDelay(); // vários: arma o atraso
        } else if (now >= st.next) {
          await wc.executeJavaScript(script(true, true));
          st.next = Date.now() + randomDelay();
        }
      } catch {
        /* página navegando: tenta de novo no próximo tick */
      } finally {
        st.busy = false;
      }
    }
  }

  const tick = () => passo().catch(() => {});

  function toggle(index) {
    const slots = getSlots();
    if (index === null) {
      const allOn = slots.every((s) => autoBall.has(s.id));
      slots.forEach((s) => (allOn ? autoBall.delete(s.id) : autoBall.add(s.id)));
      sendLog({ acc: 'app', kind: 'load', level: 'info', text: `auto-bola ${allOn ? 'DESLIGADA' : 'LIGADA'} em todas` });
    } else {
      const { id } = slots[index];
      const on = !autoBall.has(id);
      on ? autoBall.add(id) : autoBall.delete(id);
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'info', text: `auto-bola ${on ? 'LIGADA' : 'DESLIGADA'}` });
    }
    tick();
  }

  setInterval(tick, TICK_MS);

  return {
    features: () => [{
      id: 'autobola',
      label: 'Auto-bola',
      title: 'Lança a bola sozinho na lista "Proximidade para Capturar"',
      isOn: (id) => autoBall.has(id),
      set: (id, on) => {
        on ? autoBall.add(id) : autoBall.delete(id);
        sendLog({ acc: `conta${id}`, kind: 'load', level: 'info', text: `auto-bola ${on ? 'LIGADA' : 'DESLIGADA'}` });
        tick();
      },
    }],
    // Retorna true se tratou o atalho
    onShortcut(event, input) {
      const m = /^Digit([0-9])$/.exec(input.code);
      const n = m ? Number(m[1]) : null;
      if (input.control && input.alt && !input.shift && n !== null && n <= getSlots().length) {
        event.preventDefault();
        toggle(n === 0 ? null : n - 1);
        return true;
      }
      return false;
    },
    onSlotRemoved(id) {
      autoBall.delete(id);
      state.delete(id);
    },
  };
};
