// Barra de RAM: uma faixa fina no rodapé da janela com o consumo de memória do app, total e por conta.
// Os números vêm de app.getAppMetrics() (memória de trabalho de cada processo do Electron). Cada conta é mapeada
// pelo processo da sua WebContents (webContents.getOSProcessId()); o que sobra (processo principal, GPU, utilitários,
// barras e avisos) entra em "app/outros".
// Leve: a view só é criada quando a barra é mostrada pela primeira vez, a amostragem roda a cada POLL_MS e só
// enquanto a barra estiver visível (e a janela não minimizada), e só é enviada à página quando algum número muda.
// Ocultar a barra é persistido pelo chamador (main.js, em config.json) via `onToggle`.
const path = require('path');
const { app, WebContentsView, ipcMain } = require('electron');

const BAR_H = 22;
const POLL_MS = 5000;
const KB_PER_MB = 1024;
// Limites de alerta (em MB): acima do "warn" a cor vira laranja; acima do "danger", vermelha.
const TOTAL_LIMITS = { warn: 3 * 1024, danger: 4 * 1024 };
const ACCOUNT_LIMITS = { warn: 1024, danger: 1536 };

// KB -> texto curto em pt-BR: "512 MB" ou "1,4 GB"
function formatMemory(kb) {
  const mb = Math.max(0, Number(kb) || 0) / KB_PER_MB;
  if (mb < 1024) return `${Math.round(mb)} MB`;
  return `${(mb / 1024).toFixed(1).replace('.', ',')} GB`;
}

function levelOf(mb, limits) {
  if (mb >= limits.danger) return 'danger';
  if (mb >= limits.warn) return 'warn';
  return 'ok';
}

// Soma a memória de trabalho (em MB, inteiros) por conta e do app. `metrics` é o retorno de app.getAppMetrics().
// Um processo só conta para uma conta (se duas contas caírem no mesmo processo, a primeira leva).
function sampleMemory(slots, metrics = app.getAppMetrics()) {
  const byPid = new Map(metrics.map((m) => [m.pid, m]));
  const kbOf = (m) => m?.memory?.workingSetSize ?? 0;
  const claimed = new Set();
  const accounts = slots.map((slot, pos) => {
    let pid = null;
    try {
      pid = slot.view.webContents.getOSProcessId();
    } catch {
      pid = null; // WebContents já fechada
    }
    const ok = pid !== null && byPid.has(pid) && !claimed.has(pid);
    if (ok) claimed.add(pid);
    const mb = Math.round(ok ? kbOf(byPid.get(pid)) / KB_PER_MB : 0);
    return { id: slot.id, pos, mb, txt: formatMemory(mb * KB_PER_MB), level: levelOf(mb, ACCOUNT_LIMITS) };
  });
  const totalKb = metrics.reduce((s, m) => s + kbOf(m), 0);
  const accountsKb = accounts.reduce((s, a) => s + a.mb * KB_PER_MB, 0);
  const appKb = Math.max(0, totalKb - accountsKb);
  const totalMb = Math.round(totalKb / KB_PER_MB);
  return {
    total: { mb: totalMb, txt: formatMemory(totalKb), level: levelOf(totalMb, TOTAL_LIMITS) },
    app: { mb: Math.round(appKb / KB_PER_MB), txt: formatMemory(appKb) },
    accounts,
  };
}

function createRamBar({ mainWin, getSlots, visible = true, onToggle = () => {} }) {
  let view = null;
  let shown = !!visible;
  let timer = null;
  let last = '';

  function ensureView() {
    if (view) return view;
    view = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload', 'ram.js') } });
    view.setBackgroundColor('#1b1220');
    mainWin.contentView.addChildView(view);
    view.webContents.loadFile(path.join(__dirname, 'ui', 'ram.html'));
    view.webContents.on('did-finish-load', () => push(true));
    return view;
  }

  function push(force = false) {
    if (!view || view.webContents.isDestroyed() || view.webContents.isLoading()) return;
    const snap = sampleMemory(getSlots());
    const json = JSON.stringify(snap);
    if (!force && json === last) return;
    last = json;
    view.webContents.send('ram:state', snap);
  }

  function tick() {
    if (mainWin.isDestroyed() || mainWin.isMinimized()) return;
    push();
  }

  function startPolling() {
    if (timer) return;
    timer = setInterval(tick, POLL_MS);
    timer.unref?.();
  }

  function stopPolling() {
    clearInterval(timer);
    timer = null;
  }

  // Só quem é desta barra (e não a página do jogo) pode pedir para escondê-la
  ipcMain.on('ram:hide', (e) => {
    if (view && e.sender === view.webContents) api.toggle(false);
  });

  const api = {
    height: () => (shown ? BAR_H : 0),
    isVisible: () => shown,
    // Posiciona no rodapé da janela (fullHeight = altura total da área de conteúdo)
    place(width, fullHeight) {
      if (!shown) return;
      ensureView().setBounds({ x: 0, y: Math.max(0, fullHeight - BAR_H), width, height: BAR_H });
    },
    toggle(show = !shown) {
      if (show === shown) return shown;
      shown = show;
      if (shown) {
        ensureView().setVisible(true);
        startPolling();
        push(true);
      } else {
        view?.setVisible(false);
        stopPolling();
      }
      onToggle(shown);
      return shown;
    },
  };

  if (shown) startPolling();
  return api;
}

module.exports = { createRamBar, sampleMemory, formatMemory, BAR_H, POLL_MS };
