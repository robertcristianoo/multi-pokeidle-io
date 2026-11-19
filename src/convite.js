// "Convide pelo Discord" (botão do app): janela com o link de convite do servidor do jogo (cada pessoa que entra por ele conta para o
// Convide & Ganhe de quem o gerou) e, depois do convite, o passo a passo da tag IDLE do servidor (5 💎 na hora e 5 💎 a cada 10 dias).
// O link vale 1 dia e é gerado pelo bot do servidor (botão "Gerar meu convite"), então não dá para criá-lo pela API:
// o workflow de Release grava o link vigente em release-info.json (variável DISCORD_INVITE_URL do repositório) e o app o lê de lá;
// sem isso (desenvolvimento ou build local) vale o link padrão abaixo.
const fs = require('fs');
const path = require('path');
const { BrowserWindow, clipboard, ipcMain, shell } = require('electron');
const { t, loadPage } = require('./i18n');

const DEFAULT_INVITE = 'https://discord.gg/y2y3XyPc';
const PRELOAD = path.join(__dirname, 'preload', 'convite.js');
const PAGE = path.join(__dirname, 'ui', 'convite.html');
const INVITE_RE = /^https:\/\/(discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]{2,32}$/;

// Aceita só link de convite do Discord (https), para a janela nunca abrir/copiar outra coisa.
function validInvite(url) {
  return typeof url === 'string' && INVITE_RE.test(url.trim()) ? url.trim() : null;
}

function readInvite(file = path.join(__dirname, '..', 'release-info.json')) {
  try {
    return validInvite(JSON.parse(fs.readFileSync(file, 'utf8')).discordInvite);
  } catch {
    return null;
  }
}

function createConvite({ mainWin, infoFile, openExternal = (u) => shell.openExternal(u) }) {
  let win = null;
  const invite = () => readInvite(infoFile) ?? DEFAULT_INVITE;

  function show() {
    if (win && !win.isDestroyed()) { win.focus(); return; }
    win = new BrowserWindow({
      width: 480,
      height: 720,
      useContentSize: true,
      resizable: false,
      parent: mainWin,
      modal: true,
      title: t('convite.title'),
      autoHideMenuBar: true,
      minimizable: false,
      webPreferences: { preload: PRELOAD },
    });
    win.on('closed', () => { win = null; });
    loadPage(win.webContents, PAGE);
  }

  const fromWin = (e) => !!win && !win.isDestroyed() && e.sender === win.webContents;
  ipcMain.handle('convite:get', (e) => (fromWin(e) ? { link: invite() } : null));
  // a página só pede "copiar" ou "abrir": o link vem sempre daqui
  ipcMain.handle('convite:copy', (e) => {
    if (!fromWin(e)) return false;
    clipboard.writeText(invite());
    return true;
  });
  ipcMain.handle('convite:open', (e) => {
    if (!fromWin(e)) return false;
    openExternal(invite());
    return true;
  });
  ipcMain.on('convite:close', (e) => { if (fromWin(e)) win.close(); });

  return { show, invite };
}

module.exports = { createConvite, validInvite, readInvite, DEFAULT_INVITE };
