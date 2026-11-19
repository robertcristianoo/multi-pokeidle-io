// Vigia de captura. Carregado por main.js (uma chamada, isolada em try/catch).
//
// O que lê, sem injetar nada no jogo e sem enviar nada ao servidor: as mensagens que o próprio jogo recebe do
// socket dele, pelo protocolo de rede do DevTools (Network.webSocketFrameReceived). O vigia é ligado antes de a
// página carregar, então pega o `welcome` mesmo quando a conta entra sozinha ao abrir o app.
//   - Capturas com bola contada: eventos `bola` com ballId de BOLAS_CONTADAS (Ultra Ball e Beast Ball) no lote
//     `batalha`. O jogo não tem contador explícito; cada arremesso gera um evento, e o contador é a soma deles.
//     Arremesso de outra bola não conta e não zera o prazo.
//   - Alvo: evento `morte` de um selvagem (quem cai no chão pode ser capturado; some em ~30 s).
//   - "Em jogo": `loja.visualOk` e pokémons na conta, o mesmo critério que o jogo usa para liberar o modo ULTRA.
//
// Módulos adicionais podem acompanhar o socket de cada conta (addListener): recebem as mesmas mensagens e um
// `tick` por conta, com um auxiliar para o aviso na página e o som. Sem nenhum deles, o vigia segue igual.
//
// Duas partes: createMonitor (estado de uma conta, sem Electron, com relógio injetado: os testes usam isso)
// e createCaptureWatch (liga o monitor às contas, mostra o aviso na página e toca o som).
const path = require('path');
const { WebContentsView, shell } = require('electron');
const accountNames = require('./account-names');

// Bolas que contam como captura: Ultra Ball (4, id do catálogo de bolas: src/restock.js e a lista de bolas da página)
// e Beast Ball (5, `BEAST_BALL_ID` no código público do jogo). As demais bolas não contam nem zeram o prazo.
const BOLAS_CONTADAS = [4, 5];
const MAX_DT_MS = 2000; // um intervalo longo sem tick (app suspenso) não vira tempo de captura parada
const SOM_MIN_MS = 5000; // entre dois sons de contas diferentes (4 contas não empilham bipes)
const BANNER_ID = 'pk-vigia-alerta';

function createMonitor({ limiteMs, alvoMs, repetirMs, now }) {
  let conn = false; // `welcome` recebido neste socket do jogo
  let campos = null; // `loja` e `balls` do estado do jogador
  let temPokemons = false;
  let novosBolas = 0; // arremessos de bolas contadas desde o último tick
  let alvoEm = null; // último selvagem caído (null = nenhum ainda)
  let acc = 0; // ms em que havia alvo e nenhum arremesso de bola contada
  let ultimo = null;
  let antesElegivel = false;
  let alerta = false;
  let somEm = 0;

  // quantas bolas contadas a conta tem (Ultra + Beast): sem nenhuma, não há o que cobrar
  const bolasContadas = () => BOLAS_CONTADAS.reduce((soma, id) => soma + (Number(campos?.balls?.[id]) || 0), 0);
  const emJogo = () => conn && !!campos?.loja?.visualOk && temPokemons;

  function zera() {
    conn = false;
    campos = null;
    temPokemons = false;
    novosBolas = 0;
    alvoEm = null;
    acc = 0;
    ultimo = null;
    antesElegivel = false;
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
    estado: () => ({ conectado: conn, emJogo: emJogo(), bolasContadas: bolasContadas(), alerta, acc }),
  };
}

// Script que roda na página da conta: mostra ou tira a faixa de aviso (pointer-events:none, não atrapalha o clique).
// `piscar` faz a faixa piscar e `topo` a empilha abaixo de outra faixa; `id` separa cada aviso.
const bannerScript = (on, texto, { id = BANNER_ID, topo = 0, piscar = false } = {}) => `(() => {
  const el0 = document.getElementById(${JSON.stringify(id)});
  if (!${on}) { el0?.remove(); return 0; }
  if (!document.body) return 0;
  let el = el0;
  if (!el) {
    el = document.createElement('div');
    el.id = ${JSON.stringify(id)};
    el.setAttribute('role', 'alert');
    el.style.cssText = 'position:fixed;top:${Number(topo)}px;left:0;right:0;z-index:2147483647;background:#d9342b;color:#fff;' +
      'font:bold 15px "Segoe UI",sans-serif;text-align:center;padding:6px 10px;box-shadow:0 2px 12px #000a;pointer-events:none';
    if (${piscar === true}) {
      if (!document.getElementById('pk-vigia-pisca')) {
        const st = document.createElement('style');
        st.id = 'pk-vigia-pisca';
        st.textContent = '@keyframes pk-vigia-pisca{0%,100%{opacity:1}50%{opacity:.2}}';
        document.head.appendChild(st);
      }
      el.style.animation = 'pk-vigia-pisca 1s ease-in-out infinite';
    }
    document.body.appendChild(el);
  }
  el.textContent = ${JSON.stringify(texto)};
  return 1;
})()`;

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
  sendLog = () => {},
  notify = () => {},
  store = { get: () => true, set: () => {} }, // vigia ligado (padrão)
  timers = true,
  limiteMs = 45000,
  alvoMs = 30000,
  repetirMs = 60000,
  intervaloMs = 1000,
  somMinMs = SOM_MIN_MS,
  tocar: tocarTeste = null, // testes: troca o som por um contador
}) {
  const monitors = new Map(); // id -> { mon, wc }
  const listeners = []; // módulos adicionais (addListener)
  let ultimoSom = 0;
  let somView = null;
  let somPronto = null;
  const now = () => Date.now();
  const watchOn = () => store.get() !== false;
  const state = () => ({ watch: watchOn() });

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

  // Auxiliares para os módulos adicionais: aviso na página (texto null = tira) e o som do vigia
  const H = {
    banner(wc, texto, opts = {}) {
      if (!wc) return;
      wc.executeJavaScript(bannerScript(texto !== null, texto ?? '', opts), false).catch(() => {});
    },
    beep: () => tocar(),
  };
  const avisoCaptura = (wc, texto) => H.banner(wc, texto);

  const chama = (fn) => {
    try {
      fn();
    } catch (err) {
      console.error('vigia de captura: módulo adicional falhou:', err?.message ?? err);
    }
  };

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
      if (mon.onSocketOpen() && !wc.isDestroyed()) avisoCaptura(wc, null);
      for (const l of listeners) chama(() => l.onSocketOpen?.(id, wc, H));
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
        if (mon.onSocketClose()) avisoCaptura(wc, null);
        for (const l of listeners) chama(() => l.onSocketClose?.(id, wc, H));
      } else if (method === 'Network.webSocketFrameReceived') {
        if (params.requestId !== reqId || params.response?.opcode !== 1) return;
        mon.onFrame(params.response.payloadData);
        for (const l of listeners) chama(() => l.onFrame?.(id, wc, params.response.payloadData, H));
      }
    });
    dbg.sendCommand('Network.enable').catch(() => {});
  }

  function avisa(id, r) {
    const s = Math.round(r.acc / 1000);
    if (r.inicio) {
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: `vigia: não está capturando com Ultra/Beast Ball há ${s} s` });
      notify({ kind: 'fail', title: `${accountNames.label(id)}: sem captura`, text: `não está capturando há ${s} s`, ms: 5000 });
    }
    if (r.soar) tocar();
  }

  function tickAll() {
    const ligado = watchOn();
    for (const l of listeners) chama(() => l.onTickStart?.(ligado, H));
    tickContas(ligado);
    for (const l of listeners) chama(() => l.onTickEnd?.(ligado, H));
  }

  function tickContas(ligado) {
    for (const slot of getSlots()) {
      const e = monitors.get(slot.id);
      const wc = vivo(slot.view);
      if (!wc || wc.isLoading()) continue;
      for (const l of listeners) chama(() => l.onTick?.(slot, wc, ligado, H));
      if (!e) continue;
      if (!ligado) {
        if (e.mon.alertando()) {
          e.mon.cancelaAlerta();
          avisoCaptura(wc, null);
        }
        continue;
      }
      const r = e.mon.tick(now());
      if (r.acao === 'limpa') {
        avisoCaptura(wc, null);
        sendLog({ acc: `conta${slot.id}`, kind: 'load', level: 'info', text: 'vigia: a conta voltou a capturar' });
      } else if (r.acao === 'alerta') {
        avisoCaptura(wc, `⚠ ${accountNames.label(slot.id)}: não está capturando há ${Math.round(r.acc / 1000)} s`);
        avisa(slot.id, r);
      }
    }
  }

  if (timers) setInterval(tickAll, intervaloMs);

  return {
    attach,
    tick: tickAll,
    // módulos adicionais acompanham o socket das contas (ver os ganchos chamados em attach e tickAll)
    addListener(l) {
      if (l && typeof l === 'object') listeners.push(l);
    },
    toggleWatch() {
      store.set(!watchOn());
      tickAll();
      return state();
    },
    state,
  };
}

module.exports = { createCaptureWatch, createMonitor, bannerScript };
