// Nomes dos jogadores das contas (o nome que aparece no jogo). A identificação das contas nas janelas, barras e avisos é
// esse nome; sem ele ainda, "Conta N" (N é o id fixo da conta, que define a sessão e o login). A posição na grade não entra
// no rótulo, porque muda quando o usuário reordena as contas.
//
// O nome é lido do próprio jogo (NAME_SCRIPT: `__lives.name` do preload ou o "nick" do localStorage) e salvo em config.json, na chave
// `accountNames` ({ "1": "Nome" }), para aparecer desde a abertura do app. Dois jogadores com o mesmo nome recebem o sufixo
// do id em todos os rótulos ("Nome (conta 2)"), para nunca depender da ordem ou da posição.
//
// Uso: `require('./account-names')` devolve a instância compartilhada; `configure({ store, getSlots })` é chamado pelo main
// antes de abrir as contas. Sem configurar, os nomes ficam só na memória (os testes usam `createAccountNames()` direto).
const MAX_NAME_LEN = 30;
const READ_EVERY_MS = 60 * 1000; // releitura barata das contas abertas (o nome também é lido ao carregar cada conta)
const FIRST_READS_MS = [5000, 15000, 40000]; // o nome chega com o `welcome` do jogo, depois de a página carregar

// Lê o nome do jogador na página do jogo (devolve string ou null). Fontes confiáveis, em ordem: o que o preload recebeu do
// servidor e o "nick" que o próprio jogo guarda no localStorage ao entrar (pode vir codificado em JSON). Não há leitura pela
// tela: um texto qualquer da página (por exemplo o nome de um pokémon) nunca pode virar o nome da conta.
const NAME_SCRIPT = String.raw`(() => { try {
    const ok = (v) => (typeof v === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(v.trim()) ? v.trim() : null);
    if (window.__lives && ok(window.__lives.name)) return ok(window.__lives.name);
    let v = localStorage.getItem('nick');
    for (let i = 0; i < 2 && typeof v === 'string' && v.trim().startsWith('"'); i++) v = JSON.parse(v);
    return ok(v);
  } catch {} return null; })()`;

// Aparada e dentro do limite; senão, '' (não grava)
function normalize(nome) {
  if (typeof nome !== 'string') return '';
  const t = nome.trim();
  return t.length >= 1 && t.length <= MAX_NAME_LEN ? t : '';
}

const idOf = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 ? n : null;
};

const sameName = (a, b) => a.toLocaleLowerCase('pt-BR') === b.toLocaleLowerCase('pt-BR');

function createAccountNames() {
  let names = {}; // id -> nome
  let store = null; // { get(): objeto salvo, set(objeto) }
  let getSlots = () => [];
  let timer = null;
  const listeners = new Set();

  // Carrega do armazenamento (valores inválidos são descartados)
  function load() {
    names = {};
    let raw = null;
    try { raw = store ? store.get() : null; } catch { raw = null; }
    if (!raw || typeof raw !== 'object') return;
    for (const [k, v] of Object.entries(raw)) {
      const id = idOf(k);
      const n = normalize(v);
      if (id !== null && n) names[id] = n;
    }
  }

  function configure(opts = {}) {
    store = opts.store ?? null;
    if (typeof opts.getSlots === 'function') getSlots = opts.getSlots;
    load();
  }

  const get = (id) => names[idOf(id)] ?? null;

  // Grava o nome (só se mudou e é válido). Devolve true se gravou.
  function set(id, nome) {
    const k = idOf(id);
    const n = normalize(nome);
    if (k === null || !n || names[k] === n) return false;
    names[k] = n;
    try { store?.set({ ...names }); } catch (err) { console.error('não foi possível salvar o nome da conta:', err); }
    for (const cb of listeners) { try { cb(k, n); } catch {} }
    return true;
  }

  // Rótulo mostrado ao usuário: o nome; "Conta N" sem nome; "Nome (conta N)" quando outra conta tem o mesmo nome
  function label(id) {
    const k = idOf(id);
    const n = get(k);
    if (!n) return `Conta ${k ?? id}`;
    const repetido = Object.entries(names).some(([other, v]) => Number(other) !== k && sameName(v, n));
    return repetido ? `${n} (conta ${k})` : n;
  }

  // { id: rótulo } para as contas pedidas (ex.: labels([1, 2, 3, 4]))
  const labels = (ids) => Object.fromEntries(ids.map((id) => [id, label(id)]));

  // Avisa quando um nome muda (ex.: as janelas e a barra do app se redesenham)
  function onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  // Lê o nome de uma página do jogo; null se ainda não há página carregada
  async function readFrom(view) {
    const wc = view?.webContents;
    if (!wc || wc.isDestroyed() || wc.isLoading()) return null;
    try {
      const n = await wc.executeJavaScript(NAME_SCRIPT);
      return normalize(n) || null;
    } catch {
      return null;
    }
  }

  async function refreshOne(id, view) {
    const n = await readFrom(view);
    if (n) set(id, n);
    return n;
  }

  // Relê todas as contas abertas (barato: só o nome, sem mexer no jogo)
  async function refreshAll() {
    for (const s of getSlots()) {
      if (s && s.id !== undefined) await refreshOne(s.id, s.view);
    }
  }

  // Ao criar a conta: algumas leituras espaçadas, até o jogo mostrar o nome; e a releitura periódica
  function attach(id, view) {
    for (const ms of FIRST_READS_MS) {
      const t = setTimeout(() => { refreshOne(id, view).catch(() => {}); }, ms);
      t.unref?.();
    }
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => { refreshAll().catch(() => {}); }, READ_EVERY_MS);
    timer.unref?.();
  }

  return { configure, get, set, label, labels, onChange, readFrom, refreshOne, refreshAll, attach, start };
}

const shared = createAccountNames();

module.exports = { ...shared, createAccountNames, NAME_SCRIPT, MAX_NAME_LEN };
