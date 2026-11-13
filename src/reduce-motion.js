// Reduzir animações: emula `prefers-reduced-motion: reduce` em todas as contas abertas. O site do jogo respeita
// essa preferência (animações contínuas viram estáticas e vídeos não tocam sozinhos), então a CPU deixa de pagar
// por elas. A emulação usa o protocolo do DevTools (Emulation.setEmulatedMedia): não injeta CSS nem mexe no DOM,
// portanto não altera layout, textos nem o estado do jogo. Reaplica a cada carga/navegação e alterna na hora.
//   createReduceMotion({ read, write }) -> { attach(view), toggle(), set(on), isOn() }
//   read() devolve o valor salvo (undefined = nunca escolhido, vale ligado); write(bool) salva a escolha.
const FEATURE = { name: 'prefers-reduced-motion', value: 'reduce' };
const RESET = { name: 'prefers-reduced-motion', value: 'no-preference' };

function createReduceMotion({ read = () => undefined, write = () => {} } = {}) {
  let enabled = null; // lido sob demanda: o caminho de configuração só existe depois de app.whenReady()
  const pages = new Set(); // webContents das contas vivas

  const isOn = () => {
    if (enabled === null) enabled = read() !== false;
    return enabled;
  };

  function apply(wc) {
    if (!wc || wc.isDestroyed()) return;
    try {
      const dbg = wc.debugger;
      if (!dbg.isAttached()) dbg.attach('1.3');
      dbg.sendCommand('Emulation.setEmulatedMedia', { features: [isOn() ? FEATURE : RESET] }).catch((err) => {
        console.error('reduzir animações: falha ao aplicar na página:', err?.message ?? err);
      });
    } catch (err) {
      // outro depurador (ex.: DevTools aberto na conta) já está ligado: segue sem a emulação nessa conta
      console.error('reduzir animações: depurador indisponível:', err?.message ?? err);
    }
  }

  function set(on) {
    enabled = !!on;
    write(enabled);
    pages.forEach(apply);
    return enabled;
  }

  return {
    isOn,
    set,
    toggle: () => set(!isOn()),
    attach(view) {
      const wc = view.webContents;
      pages.add(wc);
      wc.once('destroyed', () => pages.delete(wc));
      // aplica já antes da primeira carga e de novo a cada navegação (a página nova começa sem a emulação)
      apply(wc);
      wc.on('dom-ready', () => apply(wc));
      wc.on('did-finish-load', () => apply(wc));
    },
  };
}

module.exports = { createReduceMotion };
