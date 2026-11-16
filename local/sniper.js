// Sniper do mercado: carrega a extensão "Rotom Sniper - Assistente PokéIdle" (pasta local/rotom-sniper,
// versão da Chrome Web Store) dentro de cada conta. Cada conta tem a própria sessão, então a extensão é
// carregada uma vez por partição `persist:contaN`, ANTES de o jogo abrir (os content scripts só entram
// em páginas carregadas depois). O motor de compra roda na página do jogo; as regras e o liga/desliga
// ficam no "cockpit" da extensão, que abre em janela própria por conta (botão Sniper ou Ctrl+Alt+S).
const path = require('path');
const { BrowserWindow, session } = require('electron');

const MAX_ACCOUNTS = 4;
// dentro do app empacotado a pasta fica fora do asar (ver asarUnpack no package.json)
const EXT_DIR = path.join(__dirname, 'rotom-sniper').replace('app.asar', 'app.asar.unpacked');

module.exports = function init({ getSlots, sendLog }) {
  const extIds = new Map(); // contaId -> id da extensão naquela sessão
  const cockpits = new Map(); // contaId -> janela do cockpit

  async function loadInto(id) {
    const ses = session.fromPartition(`persist:conta${id}`);
    const api = ses.extensions ?? ses; // API atual: session.extensions
    try {
      const ext = await api.loadExtension(EXT_DIR);
      extIds.set(id, ext.id);
    } catch (err) {
      console.error(`sniper: não consegui carregar a extensão na conta ${id}:`, err);
      sendLog?.({ acc: `conta${id}`, kind: 'load', level: 'error', text: `[sniper] falha ao carregar a extensão: ${err.message}` });
    }
  }

  function openCockpit(id) {
    const cur = cockpits.get(id);
    if (cur && !cur.isDestroyed()) { cur.show(); cur.focus(); return; }
    const extId = extIds.get(id);
    if (!extId) return;
    const win = new BrowserWindow({
      width: 1160,
      height: 760,
      title: `Sniper (Rotom) - Conta ${id}`,
      autoHideMenuBar: true,
      webPreferences: { session: session.fromPartition(`persist:conta${id}`) },
    });
    cockpits.set(id, win);
    win.on('closed', () => { if (cockpits.get(id) === win) cockpits.delete(id); });
    win.loadURL(`chrome-extension://${extId}/cockpit.html`);
  }

  // Conta em foco do teclado, na ordem da grade (a que tiver sido aberta por último serve de reserva)
  const firstLiveId = () => getSlots()[0]?.id;

  return {
    // o main espera isto antes de criar as contas
    ready: () => Promise.all(Array.from({ length: MAX_ACCOUNTS }, (_v, i) => loadInto(i + 1))),
    features: () => [{
      id: 'sniper',
      label: 'Sniper',
      title: 'Abre o cockpit do Rotom Sniper desta conta (regras, radar de Shiny/P5 e liga/desliga do sniper)',
      isOn: (id) => !!cockpits.get(id) && !cockpits.get(id).isDestroyed(),
      set: (id, v) => {
        if (v) openCockpit(id);
        else cockpits.get(id)?.close();
      },
      settings: openCockpit,
    }],
    onShortcut(event, input) {
      if (input.control && input.alt && !input.shift && input.code === 'KeyS') {
        event.preventDefault();
        const id = firstLiveId();
        if (id !== undefined) openCockpit(id);
        return true;
      }
      return false;
    },
    onSlotRemoved(id) {
      const w = cockpits.get(id);
      if (w && !w.isDestroyed()) w.close();
    },
  };
};
