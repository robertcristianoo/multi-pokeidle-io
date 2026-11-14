// Vigia de captura e Auto-bola sem VIP. Carregado por main.js (uma chamada, isolada em try/catch).
//
// O que lê, sem injetar nada no jogo e sem enviar nada ao servidor: as mensagens que o próprio jogo recebe do
// socket dele, pelo protocolo de rede do DevTools (Network.webSocketFrameReceived). O vigia é ligado antes de a
// página carregar, então pega o `welcome` mesmo quando a conta entra sozinha ao abrir o app.
//   - VIP: `loja.vip` do estado do jogador (o próprio jogo trava o auto-fila PvP VIP com esse campo).
//   - Capturas com bola contada: eventos `bola` com ballId de BOLAS_CONTADAS (Ultra Ball e Beast Ball) no lote
//     `batalha`. O jogo não tem contador explícito; cada arremesso gera um evento, e o contador é a soma deles.
//     Arremesso de outra bola não conta e não zera o prazo.
//   - Bola de arremesso: a mesma escolha que o jogo faz ao clicar num selvagem caído (`bolaEscolhida` no código
//     público): a primeira bola do catálogo (`catalogoBolas` do welcome) que a conta tem. Com isso o Auto-bola
//     já sabe a bola antes de qualquer arremesso, inclusive quando a conta abre em modo economia.
//   - Alvo: evento `morte` de um selvagem (quem cai no chão pode ser capturado; some em ~30 s).
//   - "Em jogo": `loja.visualOk` e pokémons na conta, o mesmo critério que o jogo usa para liberar o modo ULTRA.
//
// Duas partes: createMonitor (estado de uma conta, sem Electron, com relógio injetado: os testes usam isso)
// e createCaptureWatch (liga o monitor às contas, mostra o aviso na página, toca o som e liga o Auto-bola).
const path = require('path');
const { WebContentsView, shell } = require('electron');

// Bolas que contam como captura: Ultra Ball (4, id do catálogo de bolas: src/restock.js e a lista de bolas da página)
// e Beast Ball (5, `BEAST_BALL_ID` no código público do jogo). As demais bolas não contam nem zeram o prazo.
const BOLAS_CONTADAS = [4, 5];
const MAX_DT_MS = 2000; // um intervalo longo sem tick (app suspenso) não vira tempo de captura parada
const SOM_MIN_MS = 5000; // entre dois sons de contas diferentes (4 contas não empilham bipes)
const BANNER_ID = 'pk-vigia-alerta';

function createMonitor({ limiteMs, alvoMs, repetirMs, now }) {
  let conn = false; // `welcome` recebido neste socket do jogo
  let campos = null; // `loja` e `balls` do estado do jogador
  let catalogo = []; // [{ id, nome }] das bolas do jogo, na ordem do catálogo (welcome)
  let temPokemons = false;
  let novosBolas = 0; // arremessos de bolas contadas desde o último tick
  let alvoEm = null; // último selvagem caído (null = nenhum ainda)
  let acc = 0; // ms em que havia alvo e nenhum arremesso de bola contada
  let ultimo = null;
  let antesElegivel = false;
  let alerta = false;
  let somEm = 0;
  let autoTentado = false;

  // quantas bolas contadas a conta tem (Ultra + Beast): sem nenhuma, não há o que cobrar
  const bolasContadas = () => BOLAS_CONTADAS.reduce((soma, id) => soma + (Number(campos?.balls?.[id]) || 0), 0);
  const emJogo = () => conn && !!campos?.loja?.visualOk && temPokemons;
  const vip = () => (campos?.loja && 'vip' in campos.loja ? !!campos.loja.vip : null);
  // mesma escolha do jogo para arremessar num selvagem caído: a primeira bola do catálogo que a conta tem
  const bolaArremesso = () => catalogo.find((b) => (Number(campos?.balls?.[b.id]) || 0) > 0) ?? null;

  function zera() {
    conn = false;
    campos = null;
    catalogo = [];
    temPokemons = false;
    novosBolas = 0;
    alvoEm = null;
    acc = 0;
    ultimo = null;
    antesElegivel = false;
    autoTentado = false;
    const eraAlerta = alerta;
    alerta = false;
    return eraAlerta;
  }

  function onFrame(data) {
    if (typeof data !== 'string') return;
    const head = /^\{"t":"([^"]*)"/.exec(data);
    const t = head?.[1];
    if (t !== 'welcome' && t !== 'estado' && t !== 'batalha') return;
    if (t === 'batalha' && !data.includes('"k":"bola"') && !data.includes('"k":"morte"')) return;
    let m;
    try {
      m = JSON.parse(data);
    } catch {
      return;
    }
    if (t === 'batalha') {
      for (const e of Array.isArray(m.ev) ? m.ev : []) {
        if (!e) continue;
        if (e.k === 'bola' && BOLAS_CONTADAS.includes(Number(e.ballId))) novosBolas++;
        else if (e.k === 'morte' && e.quem === 'selvagem' && !e.safari && e.slot != null) alvoEm = now();
      }
      return;
    }
    if (t === 'welcome' && Array.isArray(m.catalogoBolas)) {
      catalogo = m.catalogoBolas
        .filter((b) => b && Number.isFinite(Number(b.id)))
        .map((b) => ({ id: Number(b.id), nome: String(b.nome ?? `bola ${b.id}`) }));
    }
    const e = m.estado;
    if (!e || typeof e !== 'object') return;
    // mesma regra do jogo: `cheio` (ou o welcome) recomeça; senão cada chave presente substitui a anterior
    if (t === 'welcome') conn = true;
    if (t === 'welcome' || e.cheio || !campos) {
      campos = {};
      temPokemons = false;
    }
    for (const k of ['loja', 'balls']) if (k in e) campos[k] = e[k];
    if (Array.isArray(e.pokemons)) temPokemons = e.pokemons.length > 0;
    else if (Array.isArray(e.pkMud) && e.pkMud.length) temPokemons = true;
  }

  function tick(t = now()) {
    const elegivel = emJogo() && bolasContadas() > 0; // sem Ultra/Beast Ball ou fora do jogo: não há o que cobrar
    const dt = elegivel && antesElegivel && ultimo != null ? Math.min(t - ultimo, MAX_DT_MS) : 0;
    ultimo = t;
    antesElegivel = elegivel;
    if (!elegivel || novosBolas > 0) {
      novosBolas = 0;
      acc = 0;
      return limpa();
    }
    if (alvoEm !== null && t - alvoEm <= alvoMs) acc += dt;
    if (!alerta) {
      if (acc < limiteMs) return {};
      alerta = true;
      somEm = t;
      return { acao: 'alerta', inicio: true, soar: true, acc };
    }
    const soar = t - somEm >= repetirMs;
    if (soar) somEm = t;
    return { acao: 'alerta', inicio: false, soar, acc };
  }

  function limpa() {
    if (!alerta) return {};
    alerta = false;
    return { acao: 'limpa' };
  }

  return {
    onSocketOpen: zera,
    onSocketClose: zera,
    onFrame,
    tick,
    // o usuário desligou o vigia: some o aviso, mas o estado do socket continua sendo lido
    cancelaAlerta() {
      acc = 0;
      alerta = false;
    },
    alertando: () => alerta,
    precisaAuto: () => !autoTentado && conn && vip() !== null,
    marcaAuto() {
      autoTentado = true;
    },
    bolaArremesso,
    estado: () => ({ conectado: conn, emJogo: emJogo(), bolasContadas: bolasContadas(), vip: vip(), alerta, acc }),
  };
}

// Script que roda na página da conta: mostra ou tira a faixa de aviso (pointer-events:none, não atrapalha o clique).
const bannerScript = (on, texto) => `(() => {
  const el0 = document.getElementById(${JSON.stringify(BANNER_ID)});
  if (!${on}) { el0?.remove(); return 0; }
  if (!document.body) return 0;
  let el = el0;
  if (!el) {
    el = document.createElement('div');
    el.id = ${JSON.stringify(BANNER_ID)};
    el.setAttribute('role', 'alert');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#d9342b;color:#fff;' +
      'font:bold 15px "Segoe UI",sans-serif;text-align:center;padding:6px 10px;box-shadow:0 2px 12px #000a;pointer-events:none';
    document.body.appendChild(el);
  }
  el.textContent = ${JSON.stringify(texto)};
  return 1;
})()`;

// Passa ao modo de arremesso da página a bola que o jogo usaria (o Auto-bola no modo economia lança com ela; a página
// só aprende a bola de um arremesso ou de um evento, e na abertura não há nenhum). Não mexe na economia.
const bolaScript = (id) => `(() => { window.__abBall = ${Number(id)}; return window.__abBall === ${Number(id)}; })()`;

const vivo = (view) => {
  try {
    const wc = view.webContents;
    return wc.isDestroyed() ? null : wc;
  } catch {
    return null;
  }
};

function createCaptureWatch({
  mainWin,
  getSlots,
  getAutoBall = () => null,
  sendLog = () => {},
  notify = () => {},
  store = { get: () => true, set: () => {} }, // vigia ligado (padrão)
  storeAuto = { get: () => true, set: () => {} }, // Auto-bola sozinho em conta sem VIP (padrão)
  timers = true,
  limiteMs = 45000,
  alvoMs = 30000,
  repetirMs = 60000,
  intervaloMs = 1000,
  somMinMs = SOM_MIN_MS,
  tocar: tocarTeste = null, // testes: troca o som por um contador
}) {
  const monitors = new Map(); // id -> { mon, wc }
  const manual = new Set(); // contas em que o usuário desligou o Auto-bola nesta sessão do app
  const semeados = new Map(); // id -> bola já passada à página nesta conexão
  const emCurso = new Set(); // contas com a ligação do Auto-bola em andamento
  let ultimoSom = 0;
  let somView = null;
  let somPronto = null;
  const now = () => Date.now();
  const watchOn = () => store.get() !== false;
  const autoOn = () => storeAuto.get() !== false;
  const state = () => ({ watch: watchOn(), autoNoVip: autoOn() });

  // Janela de som própria (view 1x1 dentro da janela do app): não é afetada pelo mudo de cada conta.
  function somWc() {
    if (!somView || somView.webContents.isDestroyed()) {
      somView = new WebContentsView({ webPreferences: { backgroundThrottling: false } });
      somView.setBounds({ x: 0, y: 0, width: 1, height: 1 });
      mainWin.contentView.addChildView(somView);
      somPronto = somView.webContents.loadFile(path.join(__dirname, 'ui', 'alerta-som.html'));
    }
    return somPronto.then(() => somView.webContents);
  }

  async function tocar() {
    if (now() - ultimoSom < somMinMs) return;
    ultimoSom = now();
    if (tocarTeste) return tocarTeste();
    try {
      const estado = await (await somWc()).executeJavaScript('window.tocar()', true); // gesto do usuário: o som não depende da política de autoplay
      if (estado !== 'running') shell.beep();
    } catch {
      shell.beep();
    }
  }

  function banner(wc, texto) {
    if (!wc) return;
    wc.executeJavaScript(bannerScript(texto !== null, texto ?? ''), false).catch(() => {});
  }

  // O Auto-bola liga sozinho só em conta sem VIP, se a opção estiver ligada e o usuário não o desligou nesta sessão
  function precisaLigar(id, mon) {
    if (!autoOn() || mon.estado().vip !== false || manual.has(id)) return false;
    const ab = getAutoBall();
    return !!ab && !ab.isOn(id);
  }

  const log = (id, nivel, texto) => sendLog({ acc: `conta${id}`, kind: 'load', level: nivel, text: `auto-bola: ${texto}` });

  // Ligação do Auto-bola em conta sem VIP. Passos (cada um vai para o log):
  //   1. lê a bola de arremesso do estado do jogo (a que o jogo usaria);
  //   2. passa essa bola à página (sem mexer na economia: a conta continua do jeito que abriu);
  //   3. liga o Auto-bola. No fim, um aviso do app diz se ligou ou por que não ligou.
  // Não há espera: o estado do jogo já chega completo no welcome, e nada aqui depende da lista de capturas.
  async function ligaAuto(id, mon, wc) {
    if (emCurso.has(id) || !precisaLigar(id, mon)) return;
    emCurso.add(id);
    try {
      const bola = mon.bolaArremesso();
      if (!bola) return falha(id, 'a conta não tem nenhuma bola para arremessar');
      log(id, 'info', `passo 1/3: bola de arremesso ${bola.id} (${bola.nome}) lida do estado do jogo`);
      if (wc.isDestroyed()) return;
      const passou = await semeia(id, wc, bola.id);
      if (!passou) return falha(id, 'não consegui passar a bola à página do jogo');
      log(id, 'info', 'passo 2/3: bola passada à página (economia não foi alterada)');
      if (!precisaLigar(id, mon)) return;
      getAutoBall().setAuto(id, true, `conta sem VIP, bola ${bola.id}`);
      log(id, 'info', 'passo 3/3: Auto-bola ligado');
      notify({ kind: 'ok', title: `Conta ${id}: Auto-bola ativo`, text: `arremessando com ${bola.nome}`, ms: 4000 });
      // O gancho do Auto-bola na página só pega o socket do jogo se estiver instalado antes do `hello`. Conta que já
      // estava conectada perdeu isso, então recarrega UMA vez: o Auto-bola (ainda ligado) instala o gancho cedo, e a nova
      // conexão passa a ser a que ele acompanha. A economia não é tocada (a escolha fica salva no próprio jogo).
      if (mon.estado().conectado && !wc.isDestroyed()) {
        log(id, 'info', 'passo 4/4: recarregando a conta para o Auto-bola acompanhar o socket do jogo (uma vez)');
        wc.reload();
      }
    } catch (err) {
      falha(id, String(err?.message ?? err));
    } finally {
      emCurso.delete(id);
    }
  }

  function falha(id, motivo) {
    log(id, 'error', `não ligou: ${motivo}`);
    notify({ kind: 'fail', title: `Conta ${id}: Auto-bola não ligou`, text: motivo, ms: 5000 });
  }

  async function semeia(id, wc, bola) {
    const ok = (await wc.executeJavaScript(bolaScript(bola)).catch(() => false)) === true;
    if (ok) semeados.set(id, bola);
    return ok;
  }

  function onFrameAfter(id) {
    const e = monitors.get(id);
    if (!e || !e.mon.precisaAuto()) return;
    e.mon.marcaAuto();
    ligaAuto(id, e.mon, e.wc).catch(() => {});
  }

  function attach(id, view) {
    const wc = view.webContents;
    let dbg;
    try {
      dbg = wc.debugger;
      if (!dbg.isAttached()) dbg.attach('1.3');
    } catch (err) {
      // DevTools aberto na conta: o vigia dessa conta fica desligado (o resto do app segue)
      console.error('vigia de captura: depurador indisponível:', err?.message ?? err);
      return;
    }
    const mon = createMonitor({ limiteMs, alvoMs, repetirMs, now });
    monitors.set(id, { mon, wc });
    let reqId = null; // socket do jogo (mesmo host da página)
    const ignorados = new Set(); // sockets de outro host (o evento de criação diz qual é)
    const hostDaPagina = () => {
      try {
        return new URL(wc.getURL()).host;
      } catch {
        return '';
      }
    };
    // O evento de criação pode chegar antes de o Network estar ligado (a página carrega logo depois): então o socket
    // também é adotado pelos eventos de handshake, que trazem o requestId sem a URL.
    const adota = (rid) => {
      if (reqId === rid || ignorados.has(rid)) return;
      reqId = rid;
      semeados.delete(id); // conexão nova: a página pode ter recarregado e perdido a bola passada
      if (mon.onSocketOpen() && !wc.isDestroyed()) banner(wc, null);
    };
    dbg.on('message', (_e, method, params) => {
      if (wc.isDestroyed()) return;
      if (method === 'Network.webSocketCreated') {
        let mesmoHost = false;
        try {
          mesmoHost = new URL(params.url).host === hostDaPagina();
        } catch {}
        if (mesmoHost) adota(params.requestId);
        else ignorados.add(params.requestId);
      } else if (method === 'Network.webSocketWillSendHandshakeRequest' || method === 'Network.webSocketHandshakeResponseReceived') {
        adota(params.requestId);
      } else if (method === 'Network.webSocketClosed') {
        if (params.requestId !== reqId) return;
        reqId = null;
        if (mon.onSocketClose()) banner(wc, null);
      } else if (method === 'Network.webSocketFrameReceived') {
        if (params.requestId !== reqId || params.response?.opcode !== 1) return;
        mon.onFrame(params.response.payloadData);
        onFrameAfter(id);
      }
    });
    dbg.sendCommand('Network.enable').catch(() => {});
  }

  function avisa(id, mon, r) {
    const s = Math.round(r.acc / 1000);
    if (r.inicio) {
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: `vigia: não está capturando com Ultra/Beast Ball há ${s} s` });
      notify({ kind: 'fail', title: `Conta ${id}: sem captura`, text: `não está capturando há ${s} s`, ms: 5000 });
    }
    if (r.soar) tocar();
  }

  // Com o Auto-bola ligado, mantém a bola de arremesso da página igual à do estado (muda quando a conta fica sem a bola)
  function sincronizaBola(id, e, wc) {
    const ab = getAutoBall();
    if (!ab || !ab.isOn(id)) return;
    const bola = e.mon.bolaArremesso();
    if (bola && semeados.get(id) !== bola.id) semeia(id, wc, bola.id).then((ok) => ok || semeados.delete(id));
  }

  function tickAll() {
    const ligado = watchOn();
    for (const slot of getSlots()) {
      const e = monitors.get(slot.id);
      const wc = vivo(slot.view);
      if (!e || !wc || wc.isLoading()) continue;
      sincronizaBola(slot.id, e, wc);
      if (!ligado) {
        if (e.mon.alertando()) {
          e.mon.cancelaAlerta();
          banner(wc, null);
        }
        continue;
      }
      const r = e.mon.tick(now());
      if (r.acao === 'limpa') {
        banner(wc, null);
        sendLog({ acc: `conta${slot.id}`, kind: 'load', level: 'info', text: 'vigia: a conta voltou a capturar' });
      } else if (r.acao === 'alerta') {
        banner(wc, `⚠ Conta ${slot.id}: não está capturando há ${Math.round(r.acc / 1000)} s`);
        avisa(slot.id, e.mon, r);
      }
    }
  }

  // Ao ligar o Auto-bola sem VIP, aplica já nas contas conectadas (sem esperar a próxima conexão)
  function aplicaAutoAgora() {
    for (const slot of getSlots()) {
      const e = monitors.get(slot.id);
      if (e && e.mon.estado().vip === false) ligaAuto(slot.id, e.mon, e.wc).catch(() => {});
    }
  }

  if (timers) setInterval(tickAll, intervaloMs);

  return {
    attach,
    tick: tickAll,
    // escolha do usuário no Auto-bola (botão da conta, atalho): a partir daqui não o ligamos sozinhos nesta sessão
    autoBallToggled(id, on) {
      if (on) manual.delete(id);
      else manual.add(id);
    },
    toggleWatch() {
      store.set(!watchOn());
      tickAll();
      return state();
    },
    toggleAutoNoVip() {
      storeAuto.set(!autoOn());
      if (autoOn()) aplicaAutoAgora();
      return state();
    },
    state,
  };
}

module.exports = { createCaptureWatch, createMonitor };
