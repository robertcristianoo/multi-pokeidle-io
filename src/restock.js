// Auto-reposição por conta (🛒). Carregada por main.js (uma chamada, isolada em try/catch).
// Liga/desliga pelo botão da barra da conta; o ⚙ abre a janela com o estoque, o ouro, as regras e o registro de compras.
// A compra em si roda na página do jogo (src/preload/restock-frame.js), que é onde ficam o socket e o estado da conta.
// Aqui só se guarda a configuração (restock.json), se empurra para a página e se lê o resumo a cada segundo.
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const TICK_MS = 1000;
const MAX_ACCOUNTS = 4;
const MAX_STOCK = 10000000;
const DEFAULTS = {
  balls: { id: 4, below: 5000, keep: 30000 }, // 4 = Ultra Ball
  revives: { below: 100, keep: 500 },
  potions: { id: 204, below: 2000, keep: 5000 }, // 204 = Ultimate Potion; id 0 = melhor custo-benefício
  goldFloor: 1000000, // nunca compra a ponto de o ouro ficar abaixo disto
};

// Valores vindos da janela ou do arquivo: o que não faz sentido volta ao padrão ou ao limite.
function sanitize(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const int = (x, min, max, def) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.trunc(n))) : def;
  };
  const estoque = (r, d) => {
    const below = int(r?.below, 0, MAX_STOCK, d.below);
    return { on: r?.on !== false, below, keep: Math.max(below, int(r?.keep, 0, MAX_STOCK, d.keep)) };
  };
  return {
    on: !!c.on,
    balls: { ...estoque(c.balls, DEFAULTS.balls), id: int(c.balls?.id, 1, 9999, DEFAULTS.balls.id) },
    revives: estoque(c.revives, DEFAULTS.revives),
    potions: { ...estoque(c.potions, DEFAULTS.potions), id: int(c.potions?.id, 0, 9999, DEFAULTS.potions.id) },
    goldFloor: int(c.goldFloor, 0, 1e12, DEFAULTS.goldFloor),
  };
}

// Script que roda na página: empurra a configuração só quando ela mudou (ou a página recarregou) e devolve o resumo.
// Empurrar à toa reiniciaria a leitura da configuração a cada segundo, por isso o main controla quando isso acontece.
const script = (json) => `(() => {
  const r = window.__pkRestock;
  if (!r) return null;
  ${json ? `r.configure(${json});` : ''}
  return r.summary();
})()`;

module.exports = function init({ getSlots, sendLog }) {
  const file = () => path.join(app.getPath('userData'), 'restock.json');
  const framePath = path.join(__dirname, 'preload', 'restock-frame.js');
  const windowPreload = path.join(__dirname, 'preload', 'restock-window.js');
  const windowPage = path.join(__dirname, 'ui', 'restock.html');

  const cfgs = new Map(); // id -> configuração sanitizada
  const status = new Map(); // id -> resumo que a página devolveu no último ciclo
  const pushed = new Map(); // id -> último JSON empurrado para a página
  const seen = new Map(); // id -> última linha do registro já levada ao log
  const wins = new Map(); // id -> janela de configuração
  let running = false;

  function load() {
    let raw = {};
    try {
      raw = JSON.parse(fs.readFileSync(file(), 'utf8')) || {};
    } catch {
      /* sem arquivo: tudo desligado, padrão */
    }
    for (let id = 1; id <= MAX_ACCOUNTS; id++) cfgs.set(id, sanitize(raw[id]));
  }

  const cfgOf = (id) => cfgs.get(id) ?? sanitize(null);

  function save(id, cfg) {
    cfgs.set(id, cfg);
    try {
      fs.writeFileSync(file(), JSON.stringify(Object.fromEntries(cfgs), null, 2));
    } catch (err) {
      console.error('não foi possível salvar restock.json:', err);
    }
  }

  // Linhas novas do registro da página viram log do app (o que já foi levado não se repete).
  function logNew(id, lines) {
    if (!Array.isArray(lines) || !lines.length) return;
    const last = seen.get(id);
    const i = last === undefined ? -1 : lines.lastIndexOf(last);
    for (const t of lines.slice(i + 1)) {
      sendLog({
        acc: `conta${id}`,
        kind: 'load',
        level: /recus|falh|pausa|mínimo|minimo|não/i.test(t) ? 'warn' : 'info',
        text: `[reposição] ${t}`,
      });
    }
    seen.set(id, lines[lines.length - 1]);
  }

  const fmtN = (n) => Math.round(Number(n) || 0).toLocaleString('pt-BR');

  // Texto curto ao lado do botão (aparece em laranja quando algo impede a reposição) e dica detalhada.
  function diag(id) {
    const c = cfgOf(id);
    if (!c.on) return { badge: '', hint: 'Desligada nesta conta. Ligue aqui; o ⚙ configura o que repor.' };
    const s = status.get(id);
    if (!s) return { badge: '⚠ sem gancho', hint: 'A página do jogo ainda não carregou a reposição. Recarregue a conta (F5).' };
    if (!s.connected) return { badge: '⚠ sem jogo', hint: 'Sem conexão com o jogo nesta conta: faça login para a reposição começar.' };
    if (s.paused) return { badge: '⚠ pausa', hint: 'Pausada após 3 compras seguidas sem dar certo. Volta sozinha em até 2 min.' };
    const ultima = s.log?.at(-1);
    return {
      badge: '',
      hint: `Conectado${s.nick ? ` (${s.nick})` : ''} · ouro ${fmtN(s.gold)}${ultima ? `\núltimo: ${ultima}` : ''}`,
    };
  }

  // Um ciclo: para cada conta aberta, empurra a configuração se mudou e lê o resumo da página.
  async function tick() {
    if (running) return;
    running = true;
    try {
      for (const { id, view } of getSlots()) {
        let wc;
        try {
          wc = view.webContents;
          if (wc.isDestroyed() || wc.isLoading()) continue;
        } catch {
          continue; // view já destruída
        }
        const json = JSON.stringify(cfgOf(id));
        const push = pushed.get(id) !== json;
        try {
          const s = await wc.executeJavaScript(script(push ? json : null));
          if (!s) {
            status.delete(id);
            pushed.delete(id);
            continue;
          }
          status.set(id, s);
          if (push) pushed.set(id, json);
          if (!s.configured) pushed.delete(id); // página nova (F5): empurra de novo no próximo ciclo
          logNew(id, s.log);
        } catch {
          /* página navegando: tenta de novo no próximo ciclo */
        }
      }
    } finally {
      running = false;
    }
  }

  function openWindow(id) {
    const w = wins.get(id);
    if (w && !w.isDestroyed()) {
      w.show();
      w.focus();
      return;
    }
    const win = new BrowserWindow({
      width: 640,
      height: 800,
      title: `Reposição - conta ${id} - Multi PokeIdle IO`,
      autoHideMenuBar: true,
      webPreferences: { preload: windowPreload },
    });
    win.loadFile(windowPage, { query: { id: String(id) } });
    wins.set(id, win);
    win.on('closed', () => wins.delete(id));
  }

  const idOf = (e) => [...wins].find(([, w]) => !w.isDestroyed() && w.webContents === e.sender)?.[0];

  load();
  ipcMain.handle('rst:get', (e) => {
    const id = idOf(e);
    if (id === undefined) return null;
    return { id, cfg: cfgOf(id), status: status.get(id) ?? null };
  });
  ipcMain.handle('rst:save', (e, raw) => {
    const id = idOf(e);
    if (id === undefined) return null;
    // o liga/desliga é da barra: a janela (que pode estar desatualizada) não mexe nele
    save(id, { ...sanitize(raw), on: cfgOf(id).on });
    tick();
    return cfgOf(id);
  });
  setInterval(() => tick(), TICK_MS);

  const feature = {
    id: 'reposicao',
    label: '🛒',
    title: 'Auto-reposição: repõe pokébolas, revives e poções no Mercado do NPC quando o estoque cai (gasta ouro do jogo)',
    isOn: (id) => !!cfgOf(id).on,
    set: (id, on) => {
      save(id, { ...cfgOf(id), on: !!on });
      sendLog({ acc: `conta${id}`, kind: 'load', level: 'info', text: `reposição ${on ? 'LIGADA' : 'DESLIGADA'}` });
      tick();
    },
    settings: (id) => openWindow(id),
    badge: (id) => diag(id).badge,
    hint: (id) => diag(id).hint,
  };

  return {
    features: () => [feature],
    // Registra o preload antes de a conta carregar o jogo, para a página ter a reposição desde o começo
    onSlotCreated(_id, view) {
      const ses = view.webContents.session;
      if (typeof ses.registerPreloadScript === 'function') {
        if (!ses.getPreloadScripts().some((p) => p.filePath === framePath)) ses.registerPreloadScript({ type: 'frame', filePath: framePath });
      } else {
        ses.setPreloads([...new Set([...ses.getPreloads(), framePath])]);
      }
    },
    onSlotRemoved(id) {
      status.delete(id);
      pushed.delete(id);
      seen.delete(id);
      wins.get(id)?.close();
      wins.delete(id);
    },
  };
};
