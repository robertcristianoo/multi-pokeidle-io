// Sniper do mercado Carregado por main.js junto com as outras extensões.
// Por conta: liga/desliga e escolhe "simulação" (só loga) ou "compra real". As regras
// (item/pokémon, moeda, preço máximo) valem para todas as contas ligadas. Atalho: Ctrl+Alt+S.
//
// Como funciona: o preload (local-sniper-preload.js) empresta o WebSocket que o próprio jogo abriu e
// pede ao servidor os anúncios mais baratos de cada regra. Se há anúncio dentro do preço máximo,
// compra com o mesmo comando do botão "Comprar" do jogo. Anúncios ainda em retenção
// (`compravelEm`) são pulados; nada aqui contorna as travas do servidor.
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const TICK_MS = 1000;
const MAX_ACCOUNTS = 4;
const DEFAULT_CFG = { accounts: {}, rules: [], intervalSec: 8, cap: { gold: 0, orb: 0 } };

module.exports = function init({ getSlots, sendLog, notify }) {
  const file = () => path.join(app.getPath('userData'), 'sniper.json');
  const preloadPath = path.join(__dirname, 'sniper-preload.js');

  function sanitize(raw) {
    const c = raw && typeof raw === 'object' ? raw : {};
    const num = (x, min, max, def) => (Number.isFinite(Number(x)) ? Math.min(max, Math.max(min, Number(x))) : def);
    const accounts = {};
    for (let id = 1; id <= MAX_ACCOUNTS; id++) {
      const a = c.accounts?.[id] ?? {};
      accounts[id] = { on: !!a.on, live: !!a.live };
    }
    const rules = (Array.isArray(c.rules) ? c.rules : []).slice(0, 50).map((r, i) => ({
      id: String(r?.id ?? `r${Date.now()}${i}`),
      ativo: r?.ativo !== false,
      tipo: r?.tipo === 'pokemon' ? 'pokemon' : 'item',
      nome: String(r?.nome ?? '').trim().slice(0, 80),
      moeda: r?.moeda === 'orb' ? 'orb' : 'gold',
      maxPreco: Math.floor(num(r?.maxPreco, 0, 1e15, 0)),
      qtd: Math.floor(num(r?.qtd, 1, 1000, 1)),
      soShiny: !!r?.soShiny,
      soP5: !!r?.soP5,
    }));
    return {
      accounts,
      rules,
      intervalSec: num(c.intervalSec, 5, 600, 8),
      cap: { gold: Math.floor(num(c.cap?.gold, 0, 1e15, 0)), orb: Math.floor(num(c.cap?.orb, 0, 1e15, 0)) },
    };
  }

  function load() {
    try {
      return sanitize(JSON.parse(fs.readFileSync(file(), 'utf8')));
    } catch {
      return sanitize(DEFAULT_CFG);
    }
  }

  let cfg = load();
  const spent = new Map(); // id -> { gold, orb } gasto acumulado desde que o app abriu (sobrevive a F5)
  const status = new Map(); // id -> { socket, running, catalogo }

  // Compra confirmada ou recusada: tira um print da conta, guarda em <dados do app>/sniper-prints e avisa no canto
  // superior direito da janela (com o print) — um print por compra, seja sucesso ou falha.
  const fmtN = (n) => Number(n).toLocaleString('pt-BR');
  // chaves do servidor viram texto curto; o que não conheço aparece como veio
  const motivoCurto = (t) => {
    const x = String(t ?? '');
    if (/saiu|indispon|vendid|n[aã]o existe/i.test(x)) return 'anúncio já saiu';
    if (/reten[cç]|aguard|liber/i.test(x)) return 'anúncio ainda em retenção';
    if (/saldo|insuf|sem (coins|gemas)/i.test(x)) return 'saldo insuficiente';
    if (/sem confirma/i.test(x)) return 'sem resposta do servidor';
    return x.slice(0, 70);
  };
  async function onBuyEvent(id, wc, e) {
    const ok = e.ev === 'ok';
    const c = e.compra ?? {};
    const unidade = c.moeda === 'orb' ? 'gemas' : 'coins';
    const dir = path.join(app.getPath('userData'), 'sniper-prints');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = String(c.nome ?? 'compra').normalize('NFD').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 30);
    const file = path.join(dir, `${stamp}-conta${id}-${ok ? 'sucesso' : 'falha'}-${slug}.png`);
    sendLog({ acc: `conta${id}`, kind: 'load', level: ok ? 'info' : 'error', text: `[sniper] ${ok ? 'COMPRA OK' : 'COMPRA FALHOU'}: ${e.texto} — print: ${file}` });
    // aviso pequeno e imediato (clicar nele abre o print, que é gravado logo em seguida)
    notify?.({
      kind: ok ? 'ok' : 'fail',
      title: ok ? `✔ Conta ${id}: comprou ${c.qtd}× ${c.nome}` : `✖ Conta ${id}: falhou${c.nome ? ` (${c.nome})` : ''}`,
      text: ok ? `${fmtN(c.preco)} ${unidade}` : motivoCurto(e.texto),
      openPath: file,
      ms: 5000,
    });
    try {
      await new Promise((r) => setTimeout(r, 300)); // deixa o aviso do jogo ("comprado: ...") aparecer no print
      const img = await wc.capturePage();
      if (!img.isEmpty()) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(file, img.toPNG());
      }
    } catch (err) {
      console.error('sniper: não consegui tirar o print:', err);
    }
  }

  // Roda na página: entrega a configuração da conta e recolhe logs/gasto
  const script = (c) => `(() => { const s = window.__snp; if (!s) return null; s.setCfg(${JSON.stringify(c)}); return s.drain(); })()`;

  async function tick() {
    for (const { id, view } of getSlots()) {
      const wc = view.webContents;
      if (wc.isDestroyed() || wc.isLoading()) continue;
      const a = cfg.accounts[id] ?? { on: false, live: false };
      const payload = {
        on: a.on,
        live: a.live,
        rules: cfg.rules,
        intervalSec: cfg.intervalSec,
        cap: cfg.cap,
        spentBase: spent.get(id) ?? { gold: 0, orb: 0 },
      };
      try {
        const r = await wc.executeJavaScript(script(payload));
        if (!r) { status.set(id, { socket: false, hook: false }); continue; }
        spent.set(id, r.spent);
        status.set(id, { hook: true, socket: r.socket, running: r.running, catalogo: r.catalogo });
        for (const e of r.events ?? []) onBuyEvent(id, wc, e);
        for (const l of r.logs) {
          sendLog({ acc: `conta${id}`, kind: 'load', level: l.level === 'error' ? 'error' : l.level === 'warn' ? 'warn' : 'info', text: `[sniper] ${l.text}` });
        }
      } catch {
        /* página navegando: tenta no próximo tick */
      }
    }
  }
  setInterval(tick, TICK_MS);

  // ---- janela de configuração ----
  let win = null;
  function openWindow() {
    if (win && !win.isDestroyed()) { win.show(); win.focus(); return; }
    toggleWindow();
  }
  function toggleWindow() {
    if (win && !win.isDestroyed()) {
      win.close();
      return;
    }
    win = new BrowserWindow({
      width: 720,
      height: 760,
      title: 'Sniper do mercado - Multi PokeIdle IO',
      autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, 'sniper-ui-preload.js') },
    });
    win.loadFile(path.join(__dirname, 'sniper.html'));
  }

  ipcMain.handle('snp:get', () => ({
    cfg,
    slots: getSlots().map((s) => s.id),
    status: Object.fromEntries(status),
    spent: Object.fromEntries(spent),
  }));
  ipcMain.handle('snp:save', (_e, raw) => {
    const prevAccounts = cfg.accounts;
    cfg = sanitize(raw);
    // o liga/desliga é da barra: a janela de configuração (que pode estar desatualizada) não mexe nele
    for (const id of Object.keys(cfg.accounts)) {
      cfg.accounts[id].on = !!prevAccounts[id]?.on;
      if (!cfg.accounts[id].on) cfg.accounts[id].live = false;
    }
    try {
      fs.writeFileSync(file(), JSON.stringify(cfg, null, 2));
    } catch (err) {
      console.error('não foi possível salvar sniper.json:', err);
    }
    tick();
    return cfg;
  });

  function diag(id) {
    const a = cfg.accounts[id];
    if (!a?.on) return { badge: '', hint: 'Desligado nesta conta.' };
    const st = status.get(id);
    const ativas = cfg.rules.filter((r) => r.ativo !== false && r.maxPreco > 0 && r.nome).length;
    if (!ativas) return { badge: '⚠ sem regras', hint: 'Ligado, mas sem regra ativa (nome + preço máximo > 0). Abra o ⚙ e crie uma regra.' };
    if (!st?.hook) return { badge: '⚠ sem gancho', hint: 'A página do jogo ainda não carregou o gancho do sniper. Recarregue a conta (F5).' };
    if (!st.socket) return { badge: '⚠ sem socket', hint: 'O jogo ainda não abriu a conexão (faça login nesta conta).' };
    const modo = a.live ? 'COMPRA REAL' : 'simulação (só registra no log; marque "Compra real" no ⚙ para comprar)';
    return { badge: a.live ? 'REAL' : 'sim', hint: `${ativas} regra(s) ativa(s) · ${modo}` };
  }

  return {
    features: () => [{
      id: 'sniper',
      label: 'Sniper',
      title: 'Compra anúncios do mercado dentro das regras configuradas (⚙ escolhe simulação ou compra real)',
      isOn: (id) => !!cfg.accounts[id]?.on,
      set: (id, v) => {
        // ligar (ou desligar) sempre volta para a simulação: compra real só se marcar de novo em ⚙
        cfg.accounts[id] = { on: v, live: false };
        try { fs.writeFileSync(file(), JSON.stringify(cfg, null, 2)); } catch (err) { console.error('não foi possível salvar sniper.json:', err); }
        tick();
      },
      settings: openWindow,
      // texto curto ao lado do nome no botão da barra + dica detalhada (aparece quando algo impede de funcionar)
      badge: (id) => diag(id).badge,
      hint: (id) => diag(id).hint,
    }],
    onShortcut(event, input) {
      if (input.control && input.alt && !input.shift && input.code === 'KeyS') {
        event.preventDefault();
        toggleWindow();
        return true;
      }
      return false;
    },
    // Registra o preload antes de a conta carregar o jogo, para o gancho existir quando o socket abrir
    onSlotCreated(_id, view) {
      const ses = view.webContents.session;
      if (typeof ses.registerPreloadScript === 'function') {
        // API atual (o setPreloads foi descontinuado): registra uma vez por sessão
        if (!ses.getPreloadScripts().some((p) => p.filePath === preloadPath)) ses.registerPreloadScript({ type: 'frame', filePath: preloadPath });
      } else {
        ses.setPreloads([...new Set([...ses.getPreloads(), preloadPath])]);
      }
    },
    onSlotRemoved(id) {
      status.delete(id);
    },
  };
};
