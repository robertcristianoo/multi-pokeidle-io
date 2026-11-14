// Liga/desliga por conta: a conta marcada como desligada no config.json abre sem jogo (página de "desligada");
// os botões ⏻ da barra e o da página ligam e desligam; o jogo desligado é destruído; o estado vai para o config.json;
// o foco numa conta desligada mostra a página em tela cheia.
const fs = require('fs');
const path = require('path');
const { app, sleep, check, finish, waitFor } = require('./helpers');
const { BaseWindow } = require('electron');

// Estado inicial: conta 2 desligada (o arquivo é lido na inicialização do app, então precisa existir antes do require)
const cfg = () => path.join(app.getPath('userData'), 'config.json');
fs.writeFileSync(cfg(), JSON.stringify({ accounts: 2, offAccounts: [2] }));
require('../src/main.js');

const savedOff = () => JSON.parse(fs.readFileSync(cfg(), 'utf8')).offAccounts;

app.whenReady().then(async () => {
  try {
    await waitFor(() => BaseWindow.getAllWindows().length && BaseWindow.getAllWindows()[0].contentView.children.length >= 5, 15000);
    await sleep(1500);
    const win = BaseWindow.getAllWindows()[0];
    const urlOf = (v) => v.webContents?.getURL() ?? '';
    const kids = () => win.contentView.children.filter((v) => v.webContents);
    const games = () => kids().filter((v) => !/(toolbar|lives|help|logs|offline|toasts)\.html/.test(urlOf(v)) && v.getBounds().height > 100);
    const placeholders = () => kids().filter((v) => /offline\.html/.test(urlOf(v)));
    const slotBar = (id) => kids().find((v) => new RegExp(`toolbar\\.html.*kind=slot&id=${id}\\b`).test(urlOf(v)));
    const appBar = () => kids().find((v) => /kind=app/.test(urlOf(v)));
    const hasBtn = (v, label) => v.webContents.executeJavaScript(`[...document.querySelectorAll("button")].some(b => b.textContent === ${JSON.stringify(label)})`);
    const clickBtn = (v, label) => v.webContents.executeJavaScript(`[...document.querySelectorAll("button")].find(b => b.textContent === ${JSON.stringify(label)}).click()`);
    const tagOf = (v) => v.webContents.executeJavaScript('document.querySelector(".tag").textContent');

    const bar1 = slotBar(1);
    const bar2 = slotBar(2);
    check(!!bar1 && !!bar2, 'uma barra por conta');
    check(await waitFor(() => hasBtn(bar2, '⏻ Ligar'), 4000), 'conta desligada na config mostra "⏻ Ligar" na barra');
    check(/Conta 2 · desligada/.test(await tagOf(bar2)), `rótulo da conta desligada: "${await tagOf(bar2)}"`);
    check(games().length === 1, `só a conta ligada tem jogo carregado: ${games().length}`);
    check(placeholders().length === 1, 'a conta desligada mostra a página de desligada');
    const ph = placeholders()[0];
    check(ph.getBounds().height > 100 && ph.getBounds().width > 100, 'a página de desligada ocupa o quadrante');
    check(await hasBtn(bar1, '⏻') && /Conta 1 · \d+ min/.test(await tagOf(bar1)), 'conta ligada: botão ⏻ e "rodando há X min" no rótulo');
    check(JSON.stringify(savedOff()) === '[2]', 'config.json guarda a conta desligada');

    // ligar pela barra da conta 2: o jogo volta e a página some
    await clickBtn(bar2, '⏻ Ligar');
    check(await waitFor(() => games().length === 2 && placeholders().length === 0, 8000), 'ligar pela barra: jogo volta e a página some');
    check(JSON.stringify(savedOff()) === '[]', 'ligada: config.json sem a conta 2');

    // desligar pela barra da conta 1: o jogo é destruído (sem CPU/RAM) e a página entra no lugar
    // (guarda o WebContents antes: depois de fechado, a view perde a referência a ele)
    const wc1 = games().find((v) => v.getBounds().x === 0)?.webContents;
    await clickBtn(bar1, '⏻');
    check(await waitFor(() => games().length === 1 && placeholders().length === 1, 8000), 'desligar pela barra: jogo sai e a página entra');
    check(!!wc1 && wc1.isDestroyed(), 'o processo do jogo desligado foi destruído');
    check(JSON.stringify(savedOff()) === '[1]', 'config.json guarda a conta 1 desligada');

    // o botão da própria página de desligada liga a conta
    const ph1 = placeholders()[0];
    await ph1.webContents.executeJavaScript('document.getElementById("ligar").click()');
    check(await waitFor(() => games().length === 2 && placeholders().length === 0, 8000), 'botão "Ligar conta" da página liga a conta');
    check(JSON.stringify(savedOff()) === '[]', 'ligada pela página: config.json sem desligadas');

    // foco numa conta desligada: a página ocupa a janela inteira e a barra mostra "Foco" para voltar
    await clickBtn(slotBar(2), '⏻');
    await waitFor(() => placeholders().length === 1, 4000);
    await clickBtn(slotBar(2), 'Foco');
    await sleep(600);
    const content = win.getContentBounds();
    const ph2 = placeholders()[0];
    check(!!ph2 && ph2.getBounds().width === content.width, 'foco numa conta desligada ocupa a largura inteira');
    check(/posição 2/.test(win.getTitle()), `título em foco: "${win.getTitle()}"`);
    await clickBtn(appBar(), 'Voltar à grade');
    await sleep(600);
    check(win.getTitle() === 'PokeIdle Multi' && placeholders().length === 1, 'Voltar à grade restaura a grade com a conta desligada');
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
