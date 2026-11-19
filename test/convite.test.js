// "Convide pelo Discord": validação do link, leitura do release-info.json e a janela (link, cópia, passo a passo da tag IDLE).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, check, finish, waitFor } = require('./helpers');
const { BrowserWindow, clipboard } = require('electron');
const { createConvite, validInvite, readInvite, DEFAULT_INVITE } = require('../src/convite');

app.whenReady().then(async () => {
  try {
    check(validInvite('https://discord.gg/y2y3XyPc') === 'https://discord.gg/y2y3XyPc', 'link discord.gg é aceito');
    check(validInvite('https://discord.com/invite/abc123') !== null, 'link discord.com/invite é aceito');
    check(validInvite('https://discord.gg.evil.com/abc') === null && validInvite('http://discord.gg/abc') === null && validInvite('javascript:alert(1)') === null && validInvite(42) === null, 'outros endereços são recusados');

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-convite-'));
    const info = path.join(dir, 'release-info.json');
    check(readInvite(info) === null, 'sem release-info.json não há link do pacote');
    fs.writeFileSync(info, JSON.stringify({ version: '1.2.3', discordInvite: 'https://discord.gg/NOVOLINK1' }));
    check(readInvite(info) === 'https://discord.gg/NOVOLINK1', 'o link gravado no release-info.json é lido');
    fs.writeFileSync(info, JSON.stringify({ discordInvite: 'https://exemplo.com/x' }));
    check(readInvite(info) === null, 'link inválido no release-info.json é ignorado');

    const abertos = [];
    const pai = new BrowserWindow({ show: false });
    const convite = createConvite({ mainWin: pai, infoFile: info, openExternal: (u) => abertos.push(u) });
    check(convite.invite() === DEFAULT_INVITE, 'sem link válido no pacote vale o link padrão');
    fs.writeFileSync(info, JSON.stringify({ discordInvite: 'https://discord.gg/NOVOLINK1' }));
    check(convite.invite() === 'https://discord.gg/NOVOLINK1', 'o link do pacote tem prioridade');

    convite.show();
    check(abertos.length === 0, 'abrir a janela não abre o navegador sozinho');
    const win = BrowserWindow.getAllWindows().find((w) => w !== pai);
    await new Promise((r) => (win.webContents.isLoading() ? win.webContents.once('did-finish-load', r) : r()));
    check(await waitFor(() => win.webContents.executeJavaScript('document.getElementById("link").textContent === "https://discord.gg/NOVOLINK1"'), 4000), 'a janela mostra o link');
    check(await win.webContents.executeJavaScript('document.body.textContent.includes("IDLE") && document.body.textContent.includes("/resgatar")'), 'a janela explica a tag IDLE e o /resgatar');
    clipboard.writeText('x');
    await win.webContents.executeJavaScript('window.convite.copy()');
    check((await clipboard.readText()) === 'https://discord.gg/NOVOLINK1', 'copiar coloca o link na área de transferência');
    await win.webContents.executeJavaScript('window.convite.open()');
    check(abertos.length === 1 && abertos[0] === 'https://discord.gg/NOVOLINK1', 'o botão abre o convite no navegador');
    convite.show();
    check(abertos.length === 1, 'reabrir a janela não abre o navegador');
  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});