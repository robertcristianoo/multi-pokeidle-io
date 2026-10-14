// Botão "Abrir lives": abre no navegador padrão as lives que dão bônus de XP no jogo (todas as da
// Twitch com bônus e até 2 da Kick) com um clique, e avisa quando o conjunto muda (live nova ou
// encerrada) para o jogador atualizar. Só lê o que o jogo já mostra; não envia nada ao servidor.
const path = require('path');
const { WebContentsView, shell, Notification, ipcMain } = require('electron');

const KICK_MAX = 2; // a Kick só conta 2 lives
const POLL_MS = 3000;
const OPEN_GAP_MS = 500;
const BTN_W = 360;
const BTN_H = 52;

const twitchUrl = (id) => `https://www.twitch.tv/${encodeURIComponent(id)}`;
const kickUrl = (id) => `https://kick.com/${encodeURIComponent(id)}`;

function createLives({ mainWin, getSlots }) {
  const view = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'lives-ui-preload.js') } });
  view.setBackgroundColor('#00000000');
  view.setVisible(false);
  mainWin.contentView.addChildView(view);
  view.webContents.loadFile(path.join(__dirname, 'lives.html'));

  let opened = null; // { tw: Set(id), kick: Set(id) } da última vez que o botão foi clicado
  let desired = { tw: [], kick: [] }; // [{ id, nome }]
  let lastAlert = '';
  let state = { kind: 'none', text: '' };
  let size = { width: 0, height: 0 };

  function place(width = size.width, height = size.height) {
    size = { width, height };
    view.setVisible(state.kind !== 'none');
    view.setBounds({ x: Math.max(0, width - BTN_W - 12), y: Math.max(0, height - BTN_H - 12), width: BTN_W, height: BTN_H });
  }

  function push() {
    place();
    if (!view.webContents.isDestroyed()) view.webContents.send('lives:state', state);
  }

  async function collect() {
    const tw = new Map();
    const kick = new Map();
    let any = false;
    for (const { view: v } of getSlots()) {
      const wc = v.webContents;
      if (wc.isDestroyed() || wc.isLoading()) continue;
      try {
        const snap = await wc.executeJavaScript('window.__lives ? window.__lives.snap() : null');
        if (!snap) continue;
        if (snap.twitch) { any = true; snap.twitch.lives.forEach((l) => tw.set(l.id, l)); }
        if (snap.kick) { any = true; snap.kick.lives.forEach((l) => kick.set(l.id, l)); }
      } catch {}
    }
    return { any, tw: [...tw.values()], kick: [...kick.values()] };
  }

  // Kick: mantém as já abertas que continuam no ar e completa até o limite
  function pickKick(live) {
    const keep = live.filter((l) => opened?.kick.has(l.id));
    const rest = live.filter((l) => !opened?.kick.has(l.id));
    return [...keep, ...rest].slice(0, KICK_MAX);
  }

  async function refresh() {
    const c = await collect();
    if (!c.any) {
      state = { kind: 'none', text: '' };
      return push();
    }
    desired = { tw: c.tw, kick: pickKick(c.kick) };
    const resumo = `Twitch ${desired.tw.length} · Kick ${desired.kick.length}`;
    if (opened === null) {
      state = desired.tw.length + desired.kick.length
        ? { kind: 'idle', text: `Abrir lives (${resumo})`, detail: 'Abre no navegador as lives que dão bônus de XP' }
        : { kind: 'none', text: '' };
      return push();
    }
    const idsTw = new Set(desired.tw.map((l) => l.id));
    const idsKick = new Set(desired.kick.map((l) => l.id));
    const novas = [
      ...desired.tw.filter((l) => !opened.tw.has(l.id)).map((l) => `+ ${l.nome} (Twitch)`),
      ...desired.kick.filter((l) => !opened.kick.has(l.id)).map((l) => `+ ${l.nome} (Kick)`),
    ];
    const fechadas = [
      ...[...opened.tw].filter((id) => !idsTw.has(id)).map((id) => `− ${id} (Twitch)`),
      ...[...opened.kick].filter((id) => !idsKick.has(id)).map((id) => `− ${id} (Kick)`),
    ];
    if (novas.length || fechadas.length) {
      const detail = [...novas, ...fechadas].join('\n');
      const contagem = [novas.length ? `+${novas.length}` : '', fechadas.length ? `−${fechadas.length}` : ''].filter(Boolean).join(' ');
      state = { kind: 'changed', text: `Lives mudaram: clique para atualizar (${contagem})`, detail: `${detail}\n\nO clique abre as novas; feche no navegador as encerradas.` };
      if (detail !== lastAlert) {
        lastAlert = detail;
        try { new Notification({ title: 'Lives mudaram', body: `${detail}\nAtualize as abas no navegador.` }).show(); } catch {}
        try { mainWin.flashFrame(true); } catch {}
      }
    } else {
      lastAlert = '';
      state = { kind: 'ok', text: `Lives abertas ✓ (${resumo})`, detail: 'Nada mudou desde o último clique' };
    }
    push();
  }

  async function open() {
    await refresh();
    if (state.kind === 'none') return;
    const aAbrir = [
      ...desired.tw.filter((l) => !opened?.tw.has(l.id)).map((l) => twitchUrl(l.id)),
      ...desired.kick.filter((l) => !opened?.kick.has(l.id)).map((l) => kickUrl(l.id)),
    ];
    opened = { tw: new Set(desired.tw.map((l) => l.id)), kick: new Set(desired.kick.map((l) => l.id)) };
    lastAlert = '';
    state = { kind: 'ok', text: `Lives abertas ✓ (Twitch ${desired.tw.length} · Kick ${desired.kick.length})`, detail: 'Nada mudou desde o último clique' };
    push();
    try { mainWin.flashFrame(false); } catch {}
    for (const url of aAbrir) {
      shell.openExternal(url);
      await new Promise((r) => setTimeout(r, OPEN_GAP_MS));
    }
  }

  ipcMain.on('lives:open', () => { open(); });
  view.webContents.on('did-finish-load', push);
  setInterval(refresh, POLL_MS);

  return {
    open,
    place,
    // re-adicionar move a view para o topo (contas novas entram por cima)
    raise: () => mainWin.contentView.addChildView(view),
  };
}

module.exports = { createLives };
