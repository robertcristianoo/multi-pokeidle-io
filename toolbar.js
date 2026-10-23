// Barras de botões (liga/desliga), cada uma numa view própria isolada das páginas do jogo:
//  - uma barra POR CONTA, no topo do quadrante dela, com as funcionalidades das extensões (`features()`):
//    cada botão liga/desliga só aquela conta;
//  - uma barra global fina no topo da janela, com o que é do app (contas, logs, lives, ajuda).
const path = require('path');
const { WebContentsView, ipcMain, Menu } = require('electron');

const SLOT_BAR_H = 30;
const APP_BAR_H = 30;
const POLL_MS = 600;

function createToolbars({ mainWin, getSlots, getFeatures, getAccountInfo, getSlotState = () => ({}), actions }) {
  const bars = new Map(); // 'app' | id -> { view, last }

  function makeView(kind) {
    const view = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'toolbar-preload.js') } });
    view.setBackgroundColor('#1b1220');
    mainWin.contentView.addChildView(view);
    const query = kind === 'app' ? { kind: 'app' } : { kind: 'slot', id: String(kind) };
    view.webContents.loadFile(path.join(__dirname, 'toolbar.html'), { query });
    const bar = { view, last: '' };
    bars.set(kind, bar);
    view.webContents.on('did-finish-load', () => push(kind, true));
    return bar;
  }

  function snapshot(kind) {
    if (kind === 'app') return { kind: 'app', accounts: getAccountInfo() };
    const slots = getSlots();
    const pos = slots.findIndex((s) => s.id === kind);
    return {
      kind: 'slot',
      id: kind,
      pos,
      ...getSlotState(kind),
      features: getFeatures().map((f) => ({
        id: f.id,
        label: f.label,
        title: f.title ?? '',
        group: f.group ?? '',
        hasSettings: typeof f.settings === 'function',
        on: !!f.isOn(kind),
        badge: f.badge?.(kind) ?? '',
        hint: f.hint?.(kind) ?? '',
      })),
    };
  }

  function push(kind, force = false) {
    const bar = bars.get(kind);
    if (!bar || bar.view.webContents.isDestroyed()) return;
    const s = snapshot(kind);
    const json = JSON.stringify(s);
    if (!force && json === bar.last) return;
    bar.last = json;
    bar.view.webContents.send('tb:state', s);
  }

  // Descobre de quem é a barra que mandou a mensagem (nunca confia no que a página diz)
  const whoIs = (e) => [...bars].find(([, b]) => b.view.webContents === e.sender)?.[0];

  ipcMain.handle('tb:get', (e) => {
    const kind = whoIs(e);
    return kind === undefined ? null : snapshot(kind);
  });
  ipcMain.on('tb:toggle', (e, featureId) => {
    const kind = whoIs(e);
    if (kind === undefined || kind === 'app') return;
    const f = getFeatures().find((x) => x.id === featureId);
    if (!f) return;
    f.set(kind, !f.isOn(kind));
    push(kind);
    actions.refocus?.(kind);
  });
  // Menu em drop das funcionalidades com `group`: uma entrada liga/desliga por funcionalidade, seguida das ações dela
  // (`actions: [{ label, run(contaId) }]`). É um menu nativo, porque a barra tem só 30 px de altura e cortaria um drop em HTML.
  ipcMain.on('tb:menu', (e, group, rect) => {
    const kind = whoIs(e);
    if (kind === undefined || kind === 'app' || typeof group !== 'string' || !group) return;
    const bar = bars.get(kind);
    const feats = getFeatures().filter((f) => f.group === group);
    if (!bar || !feats.length) return;
    const after = () => { push(kind); actions.refocus?.(kind); };
    const template = feats.flatMap((f, i) => [
      ...(i ? [{ type: 'separator' }] : []),
      { label: f.label, type: 'checkbox', checked: !!f.isOn(kind), toolTip: f.title ?? '', click: () => { f.set(kind, !f.isOn(kind)); after(); } },
      ...(f.actions ?? []).map((a) => ({ label: a.label, click: () => { a.run(kind); after(); } })),
    ]);
    const b = bar.view.getBounds();
    Menu.buildFromTemplate(template).popup({
      window: mainWin,
      x: Math.round(b.x + (Number(rect?.x) || 0)),
      y: Math.round(b.y + (Number(rect?.y) || b.height)),
      callback: () => actions.refocus?.(kind),
    });
  });
  ipcMain.on('tb:action', (e, name) => {
    const kind = whoIs(e);
    if (kind === undefined) return;
    if (name.startsWith('settings:')) getFeatures().find((x) => x.id === name.slice(9))?.settings?.(kind);
    else actions[name]?.(kind);
    push(kind);
  });

  setInterval(() => bars.forEach((_b, kind) => push(kind)), POLL_MS);
  makeView('app');

  return {
    slotBarH: SLOT_BAR_H,
    appBarH: APP_BAR_H,
    addSlot: (id) => bars.get(id) ?? makeView(id),
    removeSlot(id) {
      const bar = bars.get(id);
      if (!bar) return;
      mainWin.contentView.removeChildView(bar.view);
      bar.view.webContents.close();
      bars.delete(id);
    },
    placeApp(width) {
      bars.get('app')?.view.setBounds({ x: 0, y: 0, width, height: APP_BAR_H });
    },
    placeSlot(id, bounds, visible) {
      const bar = bars.get(id);
      if (!bar) return;
      bar.view.setVisible(visible);
      if (visible) bar.view.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: SLOT_BAR_H });
    },
    raise() {
      bars.forEach((b) => mainWin.contentView.addChildView(b.view));
    },
    push: () => bars.forEach((_b, kind) => push(kind, true)),
  };
}

module.exports = { createToolbars };
