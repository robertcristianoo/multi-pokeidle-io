// Voto no IdleHub (idlehub.io, ranking de jogos idle). O pokeidle dá recompensa por voto para o personagem informado.
// Quem vota é a pessoa, na página de voto do IdleHub, numa janela própria do app: o captcha (Cloudflare Turnstile) e o
// voto são concluídos lá, nunca pelo app.
//
// O IdleHub não tem API pública de estado do voto (a API de status exige a chave do servidor do jogo, que o app não tem).
// Por isso o app só sabe dos votos feitos por ele mesmo, nesta janela, por duas vias:
//  1. a resposta do próprio site ao enviar o voto (JSON { ok: true, proximoEm }), lida pelo depurador da janela, só com
//     Network habilitado (rede): é o horário exato da próxima liberação;
//  2. se essa resposta não for lida, a tela de "voto registrado" da própria janela (tela): o texto "Próximo voto em …".
// Sem nenhuma das duas, a conta fica como "desconhecida": o app não sabe se já votou fora dele. Nada é consultado em
// segundo plano e nenhum dado sai para terceiros além do próprio site.
//
// Login: só com conta Google. O login fica numa partição própria por conta (`persist:idlehub{id}`), separada da sessão do
// jogo. O Google recusa login em janelas de apps, então o login é trazido pelo navegador instalado (src/browser-login.js),
// copiando só os cookies de idlehub.io.
const { BrowserWindow, dialog, session, shell } = require('electron');
const { EventEmitter } = require('events');
const { loginViaBrowser } = require('./browser-login');
const accountNames = require('./account-names');

const BASE = 'https://idlehub.io';
const IDLEHUB_HOSTS = ['idlehub.io', 'www.idlehub.io'];
const GAME_SLUG = 'pokeidle-io';
const PLAYER_RE = /^[A-Za-z0-9_-]{1,64}$/; // o mesmo formato que o IdleHub aceita como nome do personagem
const MIN = 60 * 1000;
const DIA = 24 * 60 * MIN;
const MAX_FUTURO = 48 * 60 * MIN; // um horário de liberação além disso não é plausível: descartado
const TICK_MS = 5 * 1000;
const FONTES = { rede: 3, tela: 2, estimado: 1 }; // quem vale mais (o horário exato da resposta sempre ganha)

const isObj = (x) => !!x && typeof x === 'object';
const parseUrl = (u) => {
  try {
    return new URL(String(u));
  } catch {
    return null;
  }
};
const isIdleHubHttps = (x) => !!x && x.protocol === 'https:' && IDLEHUB_HOSTS.includes(x.hostname);

// Nick que o jogo guarda no localStorage ("nick"). Pode vir JSON-codificado (até duas vezes).
function parseNick(raw) {
  if (typeof raw !== 'string') return null;
  let v = raw.trim();
  for (let i = 0; i < 2 && v.startsWith('"'); i++) {
    try {
      const d = JSON.parse(v);
      if (typeof d !== 'string') return null;
      v = d.trim();
    } catch {
      return null;
    }
  }
  return PLAYER_RE.test(v) ? v : null;
}

// Página de voto do jogo, com o personagem. O nick só entra se for um formato válido; nada mais vai na URL.
function voteUrl(nick) {
  const quem = PLAYER_RE.test(nick ?? '') ? `?jogador=${encodeURIComponent(nick)}` : '';
  return `${BASE}/votar/${GAME_SLUG}${quem}`;
}

// Qualquer link https do IdleHub (o "votar" de dentro do jogo) abre a janela de voto. A URL que é carregada é sempre a
// montada aqui, nunca a do jogo.
const isIdleHubLink = (url) => isIdleHubHttps(parseUrl(url));

// Momento em ms epoch (o que o site manda em `proximoEm`). Só aceita ms plausíveis; o resto é desconhecido (null).
function toMsEpoch(v) {
  const n = typeof v === 'string' && v.trim() && /^\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) && n > 1e12 ? n : null;
}

// Resposta do site ao enviar o voto: { ok: true, proximoEm, votosMes, mensagem }. Sem ok === true, não é voto.
// `proximoEm` só vale se estiver entre agora e 48 h; fora disso, devolve proximoEm null (o controlador estima).
function parseVoteResponse(json, t) {
  if (!isObj(json) || json.ok !== true) return null;
  const prox = toMsEpoch(json.proximoEm);
  return { proximoEm: prox != null && prox > t && prox <= t + MAX_FUTURO ? prox : null };
}

// Duração do texto da tela: "Próximo voto em 3 h 20 min.", "… 45 min.", "… 2 dias.", "Next vote in 2 days."
// "agora"/"now" = 0. Sem duração reconhecível: null.
function parseDuracao(texto) {
  if (typeof texto !== 'string') return null;
  const t = texto.toLowerCase();
  if (/\b(agora|now|ahora)\b/.test(t)) return 0;
  let ms = 0;
  let achou = false;
  const soma = (re, unidade) => {
    const m = t.match(re);
    if (m) { ms += Number(m[1]) * unidade; achou = true; }
  };
  soma(/(\d+)\s*(?:d[ií]as?|days?)/, 24 * 60 * MIN);
  soma(/(\d+)\s*h\b/, 60 * MIN);
  soma(/(\d+)\s*min/, MIN);
  return achou ? ms : null;
}

// "2 h 05 min" ou "12 min" (nunca 0 min: arredonda para cima)
function formatLeft(ms) {
  const min = ms / MIN;
  if (min >= 60) return `${Math.floor(min / 60)} h ${String(Math.floor(min % 60)).padStart(2, '0')} min`;
  return `${Math.max(1, Math.ceil(min))} min`;
}

function formatWhen(at, now) {
  const hm = new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const day = (ms) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const dias = Math.round((day(at) - day(now)) / (24 * 60 * MIN));
  if (dias === 0) return `hoje às ${hm}`;
  if (dias === 1) return `amanhã às ${hm}`;
  return `em ${new Date(at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hm}`;
}

// O que o botão 🗳 da conta mostra. s = { proximoEm, fonte } ou null (desconhecido).
// kind = unknown | ready | wait
function voteInfo(s, now) {
  if (!s || s.proximoEm == null) {
    return { kind: 'unknown', label: '🗳 Votar', hint: 'Votar no pokeidle pelo IdleHub (o jogo dá recompensa por voto). Quem vota é você, na página do IdleHub. O app só sabe dos votos feitos por ele: se esta conta já votou fora do app, o site avisa ao enviar.' };
  }
  if (s.proximoEm <= now) {
    return { kind: 'ready', label: '🗳 Votar', hint: 'Voto liberado. Clique para votar: quem vota é você, na página do IdleHub.' };
  }
  const estimado = s.fonte === 'estimado' ? ' (estimado: 24 h após o voto, porque o site não informou o horário)' : '';
  return {
    kind: 'wait',
    label: `🗳 ✓ Votou · ${formatLeft(s.proximoEm - now)}`,
    hint: `Voto feito pelo app. O próximo libera ${formatWhen(s.proximoEm, now)}${estimado}.`,
  };
}

// Votos guardados (config.json, só local). Valores inválidos são descartados; `avisado` evita repetir o aviso de liberação.
function lerVotos(raw, t) {
  const out = new Map();
  if (!isObj(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const id = Number(k);
    const prox = isObj(v) ? toMsEpoch(v.proximoEm) : null;
    if (!Number.isInteger(id) || id < 1 || prox == null) continue;
    out.set(id, { proximoEm: prox, fonte: FONTES[v.fonte] ? v.fonte : 'estimado', avisado: prox <= t });
  }
  return out;
}

// O Google recusa login dentro de janelas de apps ("Esse navegador ou app pode não ser seguro"). Em vez da tela de erro,
// o login pode ser feito pelo Chrome/Edge instalado, trazendo a sessão do IdleHub de volta para a conta (src/browser-login.js).
const isGoogleLogin = (url) => /^https:\/\/accounts\.google\.com(\/|$)/i.test(url);
const loginsRunning = new Set(); // partições com login pelo navegador em andamento (um por conta)
const loginEvents = new EventEmitter(); // 'done' com { id, ok, count, reason }
const idOfPartition = (p) => Number(String(p).replace('persist:idlehub', ''));

async function runBrowserLogin(parent, partition) {
  if (loginsRunning.has(partition)) {
    dialog.showMessageBox(parent ?? undefined, {
      type: 'info',
      title: 'Login pelo navegador',
      message: 'Já há um login em andamento para esta conta.',
      detail: 'Conclua o login na janela do Chrome (ou Edge) e feche-a: é ao fechar que o login volta para o app.',
      buttons: ['Entendi'],
    }).catch(() => {});
    return null;
  }
  loginsRunning.add(partition);
  try {
    // Começa na entrada do Google do próprio IdleHub (não na página de voto)
    const r = await loginViaBrowser({ url: `${BASE}/api/auth/entrar?volta=%2F`, domains: IDLEHUB_HOSTS, session: session.fromPartition(partition) });
    loginEvents.emit('done', { id: idOfPartition(partition), ...r });
    if (!r.ok) {
      dialog.showMessageBox(parent ?? undefined, { type: 'warning', title: 'Login pelo navegador', message: 'Não foi possível trazer o login.', detail: (r.reason || 'Tente de novo') + '. O login do IdleHub só existe com conta Google.', buttons: ['Entendi'] }).catch(() => {});
    }
    return r;
  } finally {
    loginsRunning.delete(partition);
  }
}

// Confirmação antes de abrir o navegador (o clique no botão do Google dentro da janela do IdleHub cai aqui).
// Depois do login, a janela volta para a página de voto com o personagem (`destino`), não para a página em que o Google parou.
async function offerBrowserLogin(win, partition, destino) {
  if (loginsRunning.has(partition)) { runBrowserLogin(win, partition); return; }
  const { response } = await dialog.showMessageBox(win, {
    type: 'info',
    title: 'Login com Google',
    message: 'O Google não permite login dentro deste app.',
    detail: 'Posso abrir o Chrome (ou o Edge) só para você entrar no IdleHub e trazer o login para esta conta. '
      + 'Entre normalmente, depois feche a janela do navegador. Só os cookies do IdleHub são copiados. '
      + 'Não vote no navegador: o app só percebe os votos feitos nesta janela.',
    buttons: ['Entrar pelo navegador', 'Cancelar'],
    defaultId: 0,
    cancelId: 1,
  });
  if (response !== 0) return;
  const r = await runBrowserLogin(win, partition);
  if (r?.ok && !win.isDestroyed()) win.loadURL(destino);
}

// Janela de voto da conta: partição própria (login separado do jogo), o aviso de quem vota no título
function defaultWindow(id, destino) {
  const partition = `persist:idlehub${id}`;
  const win = new BrowserWindow({
    width: 1100,
    height: 820,
    autoHideMenuBar: true,
    title: `Votar · ${accountNames.label(id)} · quem vota é você, nesta página do IdleHub`,
    webPreferences: { partition },
  });
  // O site pode manter o título; o aviso de quem vota fica no título da janela
  win.on('page-title-updated', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(({ url }) => {
    // O Google recusa login dentro de apps embutidos ("Esse navegador ou app pode não ser seguro"): avisa em vez de mostrar o erro
    if (isGoogleLogin(url)) { offerBrowserLogin(win, partition, destino); return { action: 'deny' }; }
    // Login (Google) abre popup: fica na mesma partição, senão o login cairia no navegador do sistema
    if (/^https:/i.test(url)) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { partition } } };
    if (/^mailto:/i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  const guardGoogle = (e, url) => {
    if (isGoogleLogin(url)) { e.preventDefault(); offerBrowserLogin(win, partition, destino); }
  };
  win.webContents.on('will-navigate', guardGoogle);
  win.webContents.on('will-redirect', guardGoogle);
  // popups (login do site) também não podem ir para o Google: o redirecionamento deles é interceptado igual
  win.webContents.on('did-create-window', (popup) => {
    popup.webContents.on('will-navigate', guardGoogle);
    popup.webContents.on('will-redirect', guardGoogle);
  });
  return win;
}

// Leitura só de texto da tela de voto (sem alterar a página). Dois formatos reais do site, em qualquer idioma:
//  - logo após o voto: `.voto-feito` com "Próximo voto em 23 h 59 min.";
//  - página já votada (também ao reabrir ou recarregar): "Você já votou em ... O próximo voto libera em 23 h 59 min."
// Procura a linha que fala do "próximo voto" (pt/en/es) e devolve só ela; a duração é lida no app (parseDuracao).
const LER_TELA = `(() => {
  const v = document.querySelector('.voto-feito');
  const p = v && v.querySelector('p.nota');
  if (p && p.textContent) return { voto: true, texto: p.textContent };
  const linhas = String(document.body ? document.body.innerText : '').split(/\\n+/);
  const l = linhas.find((x) => /(pr[óo]ximo voto|next vote)/i.test(x) && /\\d+\\s*(h|min|d)|agora|now|ahora/i.test(x));
  if (l) return { voto: true, texto: l.slice(0, 200) };
  return v ? { voto: true, texto: '' } : null;
})()`;
const isIdleHubRequest = (url) => isIdleHubHttps(parseUrl(url));

// Controlador do voto. `getSlots()` devolve [{ id, view }] (as contas abertas); `notify` mostra um aviso;
// `store` ({ get(), set(obj) }) guarda os horários de liberação só neste computador.
// Fora do app, injete `makeWindow(id, destino)`, `now` e `timers: false` (os testes fazem isso).
function createIdleHub({
  getSlots,
  notify = () => {},
  store = null,
  makeWindow = defaultWindow,
  now = () => Date.now(),
  timers = true,
}) {
  const t0 = now();
  const estado = (() => {
    let raw = null;
    try { raw = store ? store.get() : null; } catch { raw = null; }
    return lerVotos(raw, t0);
  })();
  const wins = new Map(); // id -> { win, registrado, parar }

  function persistir() {
    try {
      store?.set(Object.fromEntries([...estado].map(([id, v]) => [id, { proximoEm: v.proximoEm, fonte: v.fonte }])));
    } catch (err) {
      console.error('não foi possível salvar o voto do IdleHub:', err);
    }
  }

  // Registra um voto feito nesta janela. Enquanto o horário anterior ainda não passou, uma fonte mais fraca não troca a
  // mais forte (rede > tela > estimado). Depois da liberação, um voto novo sempre substitui o antigo.
  function registrar(id, reg, { proximoEm, fonte }) {
    const atual = estado.get(id);
    const f = proximoEm == null ? 'estimado' : fonte;
    if (atual && atual.proximoEm > now() && FONTES[atual.fonte] > FONTES[f]) return;
    estado.set(id, { proximoEm: proximoEm ?? now() + DIA, fonte: f, avisado: false });
    persistir();
    if (reg) {
      reg.registrado = true;
      if (!reg.win.isDestroyed()) reg.win.setTitle(`✓ Voto registrado (${accountNames.label(id)})! Pode fechar esta janela`);
    }
  }

  // Ouve o depurador só desta janela (Network habilitado): a resposta do POST de voto traz o horário exato.
  // Se o depurador falhar, sobra a leitura da tela (tick). Nada de Runtime/Page: o captcha roda nesta página.
  function observar(id, reg) {
    const wc = reg.win.webContents;
    const pedidos = new Set(); // requestIds de POST para o IdleHub
    const onMessage = async (_e, metodo, p) => {
      try {
        if (metodo === 'Network.requestWillBeSent') {
          if (p.request?.method === 'POST' && isIdleHubRequest(p.request.url)) pedidos.add(p.requestId);
        } else if (metodo === 'Network.responseReceived') {
          const mime = String(p.response?.mimeType ?? '');
          if (pedidos.has(p.requestId) && !(p.response.status >= 200 && p.response.status < 300 && /json/.test(mime))) pedidos.delete(p.requestId);
        } else if (metodo === 'Network.loadingFinished' && pedidos.has(p.requestId)) {
          pedidos.delete(p.requestId);
          const r = await wc.debugger.sendCommand('Network.getResponseBody', { requestId: p.requestId });
          const corpo = r.base64Encoded ? Buffer.from(r.body, 'base64').toString('utf8') : r.body;
          const v = parseVoteResponse(JSON.parse(corpo), now());
          if (v) registrar(id, reg, v.proximoEm != null ? { proximoEm: v.proximoEm, fonte: 'rede' } : { proximoEm: null, fonte: 'estimado' });
        }
      } catch {
        /* resposta que não é JSON do voto: ignora */
      }
    };
    try {
      wc.debugger.attach('1.3');
      wc.debugger.on('message', onMessage);
      wc.debugger.sendCommand('Network.enable').catch(() => {});
      reg.parar = () => {
        try {
          wc.debugger.off('message', onMessage);
          if (wc.debugger.isAttached()) wc.debugger.detach();
        } catch { /* a janela pode já ter sido fechada */ }
      };
    } catch {
      reg.parar = () => {};
    }
  }

  async function lerNick(slot) {
    const wc = slot.view?.webContents;
    if (!wc || wc.isDestroyed() || wc.isLoading()) return null;
    try {
      return parseNick(await wc.executeJavaScript("localStorage.getItem('nick')"));
    } catch {
      return null;
    }
  }

  // Abre (ou reaproveita) a janela de voto da conta, com a página de voto do personagem
  async function abrir(id) {
    const slot = getSlots().find((s) => s.id === id);
    if (!slot) return;
    const existente = wins.get(id);
    if (existente && !existente.win.isDestroyed()) {
      existente.win.focus();
      return;
    }
    const destino = voteUrl(await lerNick(slot));
    const win = makeWindow(id, destino);
    const reg = { win, registrado: false, parar: () => {} };
    wins.set(id, reg);
    win.on('closed', () => {
      reg.parar();
      if (wins.get(id) === reg) wins.delete(id);
    });
    observar(id, reg);
    // a página recarrega sozinha depois do voto (estado "voto registrado" vindo do servidor): lê assim que carregar,
    // sem esperar o próximo ciclo do timer
    try {
      win.webContents.on('did-finish-load', () => { tick().catch(() => {}); });
    } catch { /* janela de teste sem webContents completo */ }
    win.loadURL(destino);
  }

  // Liberação (aviso uma vez) e leitura da tela das janelas abertas que ainda não registraram o voto.
  // Chamado a cada TICK_MS pelo timer (e direto pelos testes).
  async function tick() {
    const t = now();
    const abertos = new Set(getSlots().map((s) => s.id));
    for (const [id, v] of estado) {
      if (v.avisado || v.proximoEm > t || !abertos.has(id)) continue;
      v.avisado = true;
      notify({ kind: 'ok', title: `${accountNames.label(id)}: voto liberado`, text: 'Clique em 🗳 para votar de novo', ms: 6000 });
    }
    for (const [id, reg] of wins) {
      if (reg.registrado || reg.win.isDestroyed()) continue;
      try {
        const tela = await reg.win.webContents.executeJavaScript(LER_TELA);
        if (tela?.voto && !reg.registrado) {
          reg.registrado = true;
          const d = parseDuracao(tela.texto);
          registrar(id, reg, d != null && d > 0 ? { proximoEm: now() + d, fonte: 'tela' } : { proximoEm: null, fonte: 'estimado' });
        }
      } catch {
        /* a página ainda não carregou: tenta no próximo tick */
      }
    }
  }

  // Login trazido pelo navegador: avisa o resultado (a janela já volta para a página de voto)
  loginEvents.on('done', (r) => {
    if (!getSlots().some((s) => s.id === r.id)) return;
    if (r.ok) notify({ kind: 'ok', title: `${accountNames.label(r.id)}: login do IdleHub trazido`, text: 'Clique em 🗳 para votar', ms: 5000 });
  });

  if (timers) setInterval(() => { tick(); }, TICK_MS).unref?.();

  return {
    open: (id) => abrir(id),
    // O "votar" de dentro do jogo: abre a janela de voto em vez do navegador. true = tratado aqui.
    handleLink(id, url) {
      if (!isIdleHubLink(url)) return false;
      abrir(id).catch(() => {});
      return true;
    },
    // Texto de um botão 🗳 da conta (a barra desenha)
    info(id) {
      return voteInfo(estado.get(id) ?? null, now());
    },
    // Resumo para a barra do app: quem pode votar agora e quanto falta para o próximo voto
    summary() {
      const t = now();
      const ids = getSlots().map((s) => s.id);
      const ready = ids.filter((id) => estado.get(id) && estado.get(id).proximoEm <= t);
      const proximos = ids.map((id) => estado.get(id)).filter((v) => v && v.proximoEm > t).map((v) => v.proximoEm);
      const falta = proximos.length ? Math.min(...proximos) - t : null;
      const texto = ready.length
        ? `🗳 Voto liberado: ${ready.map((id) => accountNames.label(id)).join(', ')}`
        : falta != null ? `🗳 Próximo voto em ${formatLeft(falta)}` : null;
      return { ready, text: texto };
    },
    tick,
  };
}

module.exports = {
  createIdleHub,
  parseNick,
  voteUrl,
  isIdleHubLink,
  toMsEpoch,
  parseVoteResponse,
  parseDuracao,
  formatLeft,
  voteInfo,
  lerVotos,
  LER_TELA,
};
