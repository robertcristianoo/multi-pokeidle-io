// Vigia de captura e Auto-bola sem VIP. Carregado por main.js (uma chamada, isolada em try/catch).
//
// O que lê, sem injetar nada no jogo e sem enviar nada ao servidor: as mensagens que o próprio jogo recebe do
// socket dele, pelo protocolo de rede do DevTools (Network.webSocketFrameReceived). O vigia é ligado antes de a
// página carregar, então pega o `welcome` mesmo quando a conta entra sozinha ao abrir o app.
//   - VIP: `loja.vip` do estado do jogador (o próprio jogo trava o auto-fila PvP VIP com esse campo).
//   - Ultra Balls jogadas: eventos `bola` com ballId 4 (Ultra Ball) no lote `batalha`. O jogo não tem contador
//     explícito; cada arremesso gera um evento, e o contador é a soma deles.
//   - Alvo: evento `morte` de um selvagem (quem cai no chão pode ser capturado; some em ~30 s).
//   - "Em jogo": `loja.visualOk` e pokémons na conta, o mesmo critério que o jogo usa para liberar o modo ULTRA.
//
// Duas partes: createMonitor (estado de uma conta, sem Electron, com relógio injetado: os testes usam isso)
// e createCaptureWatch (liga o monitor às contas, mostra o aviso na página, toca o som e liga o Auto-bola).
const path = require('path');
const { WebContentsView, shell } = require('electron');

const ULTRA_BALL_ID = 4;
const MAX_DT_MS = 2000; // um intervalo longo sem tick (app suspenso) não vira tempo de captura parada
const SOM_MIN_MS = 5000; // entre dois sons de contas diferentes (4 contas não empilham bipes)
const BANNER_ID = 'pk-vigia-alerta';

function createMonitor({ limiteMs, alvoMs, repetirMs, now }) {
  let conn = false; // `welcome` recebido neste socket do jogo
  let campos = null; // `loja` e `balls` do estado do jogador
  let temPokemons = false;
  let novosBolas = 0; // arremessos de Ultra Ball desde o último tick
  let alvoEm = null; // último selvagem caído (null = nenhum ainda)
  let acc = 0; // ms em que havia alvo e nenhum arremesso de Ultra Ball
  let ultimo = null;
  let antesElegivel = false;
  let alerta = false;
  let somEm = 0;
  let autoTentado = false;

  const ultraBolas = () => Number(campos?.balls?.[ULTRA_BALL_ID]) || 0;
  const emJogo = () => conn && !!campos?.loja?.visualOk && temPokemons;
  const vip = () => (campos?.loja && 'vip' in campos.loja ? !!campos.loja.vip : null);

  function zera() {
    conn = false;
    campos = null;
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
        if (e.k === 'bola' && Number(e.ballId) === ULTRA_BALL_ID) novosBolas++;
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
    const elegivel = emJogo() && ultraBolas() > 0; // sem Ultra Balls ou fora do jogo: não há o que cobrar
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
    estado: () => ({ conectado: conn, emJogo: emJogo(), ultraBolas: ultraBolas(), vip: vip(), alerta, acc }),
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ESPERA_JOGO_MS = 1500; // tempo para o jogo aplicar a economia salva ao entrar, antes de conferir
const LISTA_MS = 15000; // tempo máximo para a lista de capturas aparecer

// Trechos que rodam na página do jogo (executeJavaScript). Só usam os controles do próprio jogo, com limite de espera.
const PAGE_ECO_LE = `document.documentElement.classList.contains('modo-economia')`;
const PAGE_TEM_LISTA = `!!document.querySelector('#caidos-lista')`;
const pageEcoSet = (want) => `(async () => {
  const want = ${want};
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const eco = () => document.documentElement.classList.contains('modo-economia');
  if (eco() === want) return 'ok';
  const cfg = document.querySelector('#btn-config');
  if (!cfg) return 'sem-config';
  cfg.click();
  let sw = null;
  for (let i = 0; i < 20 && !sw; i++) { await sleep(100); sw = document.querySelector('#cfg-economia'); }
  if (!sw) return 'sem-interruptor';
  sw.click();
  for (let i = 0; i < 20 && eco() !== want; i++) await sleep(100);
  await sleep(200);
  if (document.querySelector('#cfg-economia')) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
  return eco() === want ? 'ok' : 'falhou';
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
  const emCurso = new Set(); // contas com a sequência de ligar o Auto-bola em andamento
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

  // Sequência para o Auto-bola agir mesmo quando o jogo abre em modo economia (a lista de capturas só fica montada fora
  // dela). Se a conta estava em economia: desliga pelo interruptor do próprio jogo, espera a lista, liga o Auto-bola e só
  // então religa a economia, na escolha que estava. Conta que não usa economia: só liga o Auto-bola. Tudo com limite de tempo.
  async function ligaAuto(id, mon, wc) {
    if (emCurso.has(id) || !precisaLigar(id, mon)) return;
    emCurso.add(id);
    let eco0 = false;
    try {
      await sleep(ESPERA_JOGO_MS); // o jogo aplica a economia salva logo ao entrar
      eco0 = (await wc.executeJavaScript(PAGE_ECO_LE).catch(() => false)) === true;
      if (eco0) await ecoSet(id, wc, false);
      await esperaLista(wc, LISTA_MS);
      if (precisaLigar(id, mon)) getAutoBall()?.setAuto(id, true, 'conta sem VIP');
    } finally {
      if (eco0 && !wc.isDestroyed()) await ecoSet(id, wc, true);
      emCurso.delete(id);
    }
  }

  async function ecoSet(id, wc, want) {
    for (let k = 0; k < 2; k++) {
      if (wc.isDestroyed()) return false;
      const r = await wc.executeJavaScript(pageEcoSet(want)).catch(() => 'erro');
      if (r === 'ok') return true;
    }
    sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: `não consegui ${want ? 'ligar' : 'desligar'} a economia pelo jogo (vigia/auto-bola)` });
    return false;
  }

  async function esperaLista(wc, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (wc.isDestroyed()) return false;
      if (await wc.executeJavaScript(PAGE_TEM_LISTA).catch(() => false)) return true;
      await sleep(500);
    }
    return false;
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
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: `vigia: não está capturando Ultra Balls há ${s} s` });
      notify({ kind: 'fail', title: `Conta ${id}: sem captura`, text: `não está capturando há ${s} s`, ms: 5000 });
    }
    if (r.soar) tocar();
  }

  function tickAll() {
    const ligado = watchOn();
    for (const slot of getSlots()) {
      const e = monitors.get(slot.id);
      const wc = vivo(slot.view);
      if (!e || !wc || wc.isLoading()) continue;
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
