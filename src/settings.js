// Janela modal de Configurações: reúne as opções que antes ficavam soltas na barra do app
// (animações, vigia de captura e o resgate automático de pontos), mais a licença desta máquina.
// Cada opção é um liga/desliga; o estado vem do main (`getState`) e a ação é a mesma que o botão da barra executava.
// As linhas `rows` vêm dos módulos adicionais (ver src/extras.js) e só aparecem quando eles estão carregados.
const path = require('path');
const { BrowserWindow, app, clipboard, dialog, ipcMain, screen } = require('electron');
const { t, loadPage, onChange } = require('./i18n');

const PRELOAD = path.join(__dirname, 'preload', 'settings.js');
const PAGE = path.join(__dirname, 'ui', 'settings.html');

// toggles: { nome: () => void } alterna a opção; open: { nome: () => void } abre uma janela auxiliar;
// extensions: { set(ext, conta, ligada) } liga/desliga uma extensão do Chromium em uma conta (o estado vem em getState);
// license: createLicense() (src/license.js), para a seção Licença;
// setLang(code): changes the app language (main saves it and reloads the screens)
function createSettings({ mainWin, getState, toggles, open, extensions, license, setLang }) {
  let win = null;

  function show() {
    if (win && !win.isDestroyed()) { win.focus(); return; }
    win = new BrowserWindow({
      width: 520,
      height: Math.min(860, screen.getPrimaryDisplay().workAreaSize.height - 80), // cabe em telas baixas (a página rola)
      useContentSize: true,
      resizable: false,
      parent: mainWin,
      modal: true,
      title: t('settings.window'),
      autoHideMenuBar: true,
      minimizable: false,
      webPreferences: { preload: PRELOAD },
    });
    win.on('closed', () => { win = null; });
    loadPage(win.webContents, PAGE);
  }
  onChange(() => { if (win && !win.isDestroyed()) win.setTitle(t('settings.window')); });

  // só aceita nomes conhecidos: a página nunca escolhe o que executar
  const fromWin = (e) => !!win && !win.isDestroyed() && e.sender === win.webContents;

  // Depois de mudar a licença, os módulos adicionais só mudam na próxima abertura do app: oferece reiniciar
  async function oferecerReinicio() {
    if (process.env.PKMULTI_TEST || !win || win.isDestroyed()) return;
    const r = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: [t('settings.license.restartNow'), t('settings.license.later')],
      defaultId: 0,
      cancelId: 1,
      title: t('settings.license.title'),
      message: t('settings.license.restartMessage'),
      detail: t('settings.license.restartDetail'),
    });
    if (r.response === 0) {
      app.relaunch();
      app.exit(0);
    }
  }

  const licenca = () => {
    if (!license) return null;
    const s = license.status();
    return { maquina: license.machineId().id, ativa: s.ativa, motivo: s.motivo, expiraEm: s.expiraEm };
  };

  ipcMain.handle('cfg:get', (e) => (fromWin(e) ? getState() : null));
  ipcMain.handle('cfg:toggle', (e, name) => {
    if (fromWin(e) && Object.hasOwn(toggles, name)) toggles[name]();
    return fromWin(e) ? getState() : null;
  });
  ipcMain.handle('cfg:ext', async (e, ext, acc, on) => {
    if (fromWin(e) && typeof ext === 'string' && Number.isInteger(acc) && typeof on === 'boolean') await extensions.set(ext, acc, on);
    return fromWin(e) ? getState() : null;
  });
  ipcMain.handle('cfg:lang', (e, code) => {
    if (fromWin(e) && typeof code === 'string') setLang(code);
    return fromWin(e) ? getState() : null;
  });
  ipcMain.on('cfg:open', (e, name) => {
    if (!fromWin(e) || !Object.hasOwn(open, name)) return;
    win.close(); // o modal sai da frente: a janela auxiliar abre livre, sem ficar presa atrás dele
    open[name]();
  });
  ipcMain.handle('cfg:lic:get', (e) => (fromWin(e) ? licenca() : null));
  ipcMain.handle('cfg:lic:ativar', async (e, chave) => {
    if (!fromWin(e) || !license) return null;
    const r = license.activate(typeof chave === 'string' ? chave.slice(0, 4096) : '');
    if (r.ok) await oferecerReinicio();
    return { ...r, licenca: licenca() };
  });
  ipcMain.handle('cfg:lic:remover', async (e) => {
    if (!fromWin(e) || !license) return null;
    license.deactivate();
    await oferecerReinicio();
    return { ok: true, licenca: licenca() };
  });
  ipcMain.handle('cfg:lic:copiar', (e) => {
    if (!fromWin(e) || !license) return false;
    clipboard.writeText(license.machineId().id);
    return true;
  });

  return { show, isOpen: () => !!win && !win.isDestroyed() };
}

module.exports = { createSettings };
