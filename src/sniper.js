// Sniper do mercado: botão da barra de cada conta e atalho (Ctrl+Alt+S) que abrem o "cockpit" da extensão
// Rotom Sniper (regras, radar de Shiny/P5 e liga/desliga do sniper) em janela própria, na sessão da conta.
// A extensão em si é carregada por conta em src/chrome-ext.js, onde também se liga/desliga por conta
// (Configurações › Extensões por conta).
const { BrowserWindow, session } = require('electron');
const { t } = require('./i18n');

module.exports = function init({ getSlots, notify, chromeExt }) {
  const cockpits = new Map(); // contaId -> janela do cockpit

  // desligar a extensão numa conta fecha o cockpit dela
  chromeExt.onChange((ext, id, on) => { if (ext === 'rotom' && !on) cockpits.get(id)?.close(); });

  function openCockpit(id) {
    const cur = cockpits.get(id);
    if (cur && !cur.isDestroyed()) { cur.show(); cur.focus(); return; }
    const extId = chromeExt.idOf('rotom', id);
    if (!extId) {
      notify?.({ kind: 'fail', title: t('sniper.offTitle', { id }), text: t('sniper.offText'), ms: 4000 });
      return;
    }
    const win = new BrowserWindow({
      width: 1160,
      height: 760,
      title: t('sniper.window', { id }),
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
    features: () => [{
      id: 'sniper',
      get label() { return t('sniper.label'); },
      get title() { return t('sniper.title'); },
      // verde = extensão carregada na conta (o sniper trabalha na página, com ou sem a janela do cockpit aberta)
      isOn: (id) => chromeExt.isEnabled('rotom', id) && !!chromeExt.idOf('rotom', id),
      hint: (id) => t(chromeExt.isEnabled('rotom', id) ? 'sniper.hint.on' : 'sniper.hint.off'),
      badge: (id) => (chromeExt.isEnabled('rotom', id) ? '' : 'off'),
      set: (id) => openCockpit(id), // o botão só abre (ou traz à frente) o cockpit; ligar/desligar a extensão é em Configurações
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
