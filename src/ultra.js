// Modo ULTRA Economia do PRÓPRIO jogo, ligado (ou desligado) em todas as contas de uma vez.
//
// O jogo tem o interruptor "ULTRA" em Configurações (#btn-config → #cfg-ultra), que guarda a escolha e acende a classe
// `modo-ultra` no <html>: a tela vira uma caixa pequena de XP/Gold/drops e a caçada continua. Para sair, o jogo tem o
// "Voltar ao jogo" da caixa (#ultra-sair). Este módulo só CLICA nesses controles, como um jogador faria; não escreve no
// armazenamento do jogo, não envia nada ao servidor e não repete cliques depois que o estado foi alcançado.
//
// Reaplicação: a escolha fica em config.json (`ultra`). Ligada, cada carregamento de uma conta no site do jogo roda um
// "vigia" dentro da página (só consulta o DOM, a cada 1 s, por até 10 min). Assim a conta que recarrega, ou que ainda
// está na tela de login, entra em ULTRA ao chegar no jogo. Desligada, o vigia só roda quando o usuário clica em
// desligar, para não mexer numa escolha que ele tenha feito dentro do próprio jogo.
//
// Não validado contra o jogo real (exige login): os seletores vêm do projeto de referência (PokeIdleMulti, MIT).
// Se algum elemento não existir, o vigia simplesmente não age e termina sozinho.

const GAME_HOST = 'pokeidle.io';
const ULTRA_KEY = 'KeyU'; // Ctrl+U

// Roda dentro da página do jogo (via executeJavaScript). Precisa ser autocontida: é serializada com toString().
// want: true = deixar ULTRA ligado; false = deixar desligado. gen: identificador; uma nova ordem cancela a anterior.
async function pageWaiter(want, gen) {
  const W = window;
  const CLASSE = 'modo-ultra';
  const POLL_MS = 1000;
  const TIMEOUT_MS = 10 * 60 * 1000;
  const MAX_ACOES = 3; // limite de cliques por tipo de ação: se o jogo não mudar, para em vez de ficar clicando
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  W.__pkUltra = { gen };
  const ativo = () => document.documentElement.classList.contains(CLASSE);
  const escolhido = () => { try { return localStorage.getItem('cfg-ultra') === '1'; } catch { return false; } };
  const noJogo = () => { const a = document.querySelector('#app'); return !!a && !a.classList.contains('hidden'); };
  const feito = () => (want ? ativo() : !ativo() && !escolhido());
  const fechar = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));

  // Abre Configurações e clica no interruptor ULTRA do próprio jogo; fecha a janela se o interruptor não aparecer.
  async function clicarInterruptor() {
    const cfg = document.querySelector('#btn-config');
    if (!cfg) return false;
    cfg.click();
    let sw = null;
    for (let i = 0; i < 10 && !sw; i++) {
      await sleep(50);
      sw = document.querySelector('#cfg-ultra');
    }
    if (!sw) { fechar(); return false; }
    sw.click();
    await sleep(300);
    if (document.querySelector('#cfg-ultra')) fechar(); // o jogo costuma fechar sozinho; se não fechou, fecha
    return true;
  }

  const fim = Date.now() + TIMEOUT_MS;
  let tSair = 0;
  let tCfg = 0;
  while (W.__pkUltra.gen === gen) {
    if (feito()) return 'ok';
    if (Date.now() > fim) return 'tempo';
    if (want) {
      // ligar: só pelo interruptor, e só com o jogo na tela e sem a escolha já salva (o jogo liga sozinho ao entrar com ela)
      if (!ativo() && !escolhido() && noJogo() && tCfg++ < MAX_ACOES) await clicarInterruptor();
    } else {
      // desligar: "Voltar ao jogo" da caixa; depois, se a escolha continuar salva, desmarca no interruptor
      if (ativo() && tSair++ < MAX_ACOES) {
        document.querySelector('#ultra-sair')?.click();
        await sleep(300);
      }
      if (escolhido() && noJogo() && tCfg++ < MAX_ACOES) await clicarInterruptor();
    }
    if (feito()) return 'ok';
    await sleep(POLL_MS);
  }
  return 'cancelado';
}

function createUltra({ getSlots, sendLog = () => {}, notify = () => {}, store, isGame }) {
  let on = store.get() === true;
  let seq = 0;
  const jogoDe = isGame ?? ((wc) => {
    try { return new URL(wc.getURL()).hostname === GAME_HOST; } catch { return false; }
  });
  const emJogo = (view) => !view.webContents.isDestroyed() && jogoDe(view.webContents);

  function vigiar(id, view, want) {
    if (!emJogo(view)) return; // login, OAuth, captcha etc.: nada a fazer aqui
    const gen = ++seq;
    view.webContents
      .executeJavaScript(`(${pageWaiter})(${want}, ${gen})`)
      .catch(() => {}); // a página pode ter sido recarregada/fechada no meio: o próximo carregamento reaplica
  }

  function ativoNaPagina(view) {
    return !view.webContents.isDestroyed()
      ? view.webContents.executeJavaScript('document.documentElement.classList.contains("modo-ultra")').catch(() => false)
      : Promise.resolve(false);
  }

  function attach(id, view) {
    // a cada carregamento (inclusive recarregar, ou a tela de login virando jogo) reaplica se estiver ligado
    view.webContents.on('did-finish-load', () => {
      if (on) vigiar(id, view, true);
    });
  }

  function setOn(v) {
    on = !!v;
    store.set(on);
    const slots = getSlots();
    for (const { id, view } of slots) {
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'info', text: `[ultra] ${on ? 'ligar' : 'desligar'} pedido` });
      vigiar(id, view, on);
    }
    // confere depois de um tempo quantas já estão no estado pedido (as que estão fora do jogo aplicam ao entrar)
    setTimeout(async () => {
      const dentro = slots.filter(({ view }) => emJogo(view));
      const marcadas = (await Promise.all(dentro.map(({ view }) => ativoNaPagina(view)))).filter(Boolean).length;
      const total = slots.length;
      if (on) {
        const txt = marcadas === total
          ? `Modo ULTRA do jogo ativo em ${total} conta(s).`
          : `${marcadas} de ${total} conta(s) já em ULTRA. As demais entram em ULTRA ao chegar no jogo.`;
        notify({ kind: 'ok', title: 'ULTRA ligado', text: txt, ms: 5000 });
      } else {
        const txt = marcadas === 0
          ? `Modo ULTRA desligado em ${total} conta(s).`
          : `${marcadas} conta(s) ainda em ULTRA. Tente de novo ou desligue pelo jogo.`;
        notify({ kind: marcadas === 0 ? 'info' : 'fail', title: 'ULTRA desligado', text: txt, ms: 5000 });
      }
    }, 3000);
  }

  // Ctrl+U liga/desliga. Devolve true se tratou a tecla (o chamador para por aí).
  function onKey(event, input) {
    if (input.type !== 'keyDown' || !input.control || input.alt || input.shift || input.code !== ULTRA_KEY) return false;
    event.preventDefault();
    setOn(!on);
    return true;
  }

  return {
    attach,
    setOn,
    toggle: () => setOn(!on),
    isOn: () => on,
    onKey,
  };
}

module.exports = { createUltra, pageWaiter };
