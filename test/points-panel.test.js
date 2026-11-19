// Painel de pontos (src/points): o script que deixa só o rodapé do chat (sobre uma página de fixture), o ciclo de vida
// das views (só existem com o painel aberto) e a altura ajustável (persistida, com limites).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BaseWindow, BrowserWindow, ipcMain, session } = require('electron');
const { check, finish, waitFor } = require('./helpers');
const { footerScript } = require('../src/points/sites');
const { createPoints } = require('../src/points');

const PAGE = `<!doctype html><body>
  <div id="video">video</div>
  <div id="chat"><div id="msgs">mensagens</div>
    <div id="footer"><textarea></textarea><button aria-label="Pontos do canal">P</button></div>
  </div>
</body>`;
const SEM_BOTAO = '<!doctype html><body><div id="video">v</div><div id="chat"><textarea></textarea></div></body>';
const dataUrl = (html) => 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

app.whenReady().then(async () => {
  let win = null;
  let fx = null;
  try {
    // ---- rodapé do chat ----
    fx = new BrowserWindow({ show: false, width: 800, height: 600 });
    await fx.loadURL(dataUrl(PAGE));
    const estilos = () => fx.webContents.executeJavaScript(
      '["video","msgs","footer"].map((id) => getComputedStyle(document.getElementById(id)).display)');
    check((await fx.webContents.executeJavaScript(footerScript('footer'))) === 'ok', 'rodapé: acha o botão dos pontos e o campo do chat');
    let [v, m, f] = await estilos();
    check(v === 'none' && m === 'none' && f !== 'none', `rodapé: esconde o vídeo e as mensagens, mantém o rodapé (${v}, ${m}, ${f})`);
    await fx.webContents.executeJavaScript(footerScript('full'));
    [v, m, f] = await estilos();
    check(v !== 'none' && m !== 'none' && f !== 'none', 'página completa: volta a mostrar tudo');
    await fx.loadURL(dataUrl(SEM_BOTAO));
    check((await fx.webContents.executeJavaScript(footerScript('footer'))) === 'nao-achou', 'sem o botão dos pontos: avisa "nao-achou" (mostra a página inteira)');

    // ---- painel: sempre da conta escolhida (antes, sempre a primeira conta com live) ----
    win = new BaseWindow({ show: false, width: 1200, height: 800 });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-painel-'));
    const cfg = {};
    const accounts = [
      { acc: 1, twitch: [], kick: [{ id: 'canal', nome: 'Canal' }] },
      { acc: 2, twitch: [{ id: 'tw', nome: 'Tw' }], kick: [] },
      { acc: 3, twitch: [], kick: [{ id: 'outro', nome: 'Outro' }] },
    ];
    const base = () => win.contentView.children.length;
    const place = () => ctl.place(1200, 800);
    const ctl = createPoints({
      mainWin: win,
      getAccounts: () => accounts,
      config: { get: () => cfg, set: (p) => Object.assign(cfg, p) },
      userDataDir: dir,
      relayout: place,
    });
    const b0 = base();
    check(ctl.panelHeight(800) === 0, 'fechado: não ocupa altura');

    ctl.open('kick', 1);
    check(base() === b0 + 2, `aberto com uma live: host + página do canal (${base() - b0} views)`);
    check(ctl.panelHeight(800) === 360, 'altura padrão do painel: 360');
    const canal = win.contentView.children[win.contentView.children.length - 1];
    const hostView = win.contentView.children[win.contentView.children.length - 2];
    check(canal.getBounds().height === 320 && hostView.getBounds().y === 800 - 360, 'painel embaixo, página do canal abaixo da barra do painel');
    check(ctl.state().acc === 1 && canal.webContents.session === session.fromPartition('persist:conta1'), 'painel da conta 1: página na sessão dela');

    // a conta do painel é a que abriu: outra conta com live troca o painel (não acumula) e usa a sessão dela
    ctl.open('kick', 3);
    const canal3 = win.contentView.children[win.contentView.children.length - 1];
    check(ctl.state().acc === 3 && base() === b0 + 2, 'painel da conta 3 troca o da conta 1, sem acumular views');
    check(canal3.webContents.session === session.fromPartition('persist:conta3'), 'página do painel da conta 3 usa a sessão da conta 3 (não a da conta 1)');

    ctl.next();
    check(ctl.state().acc === 3 && base() === b0 + 2, 'próxima live fica na mesma conta');

    ctl.toggle('kick', 3);
    check(base() === b0 && ctl.panelHeight(800) === 0 && ctl.state().acc === null, 'mesmo botão da mesma conta fecha o painel');

    // Twitch da conta 2 (com live) e Twitch da conta 1 (sem live: só a barra, com o aviso)
    ctl.toggle('twitch', 2);
    check(ctl.state().acc === 2 && base() === b0 + 2, 'Twitch da conta 2 abre o painel dela');
    const m2 = ctl.menu(2);
    check(m2[0].label === 'Twitch' && m2[0].checked === true && m2[1].checked === false, 'menu da conta 2: Twitch marcado, Kick não');
    ctl.open('twitch', 1);
    check(ctl.state().acc === 1 && base() === b0 + 1, 'conta sem live da Twitch: só a barra do painel, com o aviso');
    ctl.close();
    check(base() === b0, 'fechar o painel deixa a janela como estava');

    // altura: arrastar a borda (dy negativo = para cima = mais alto), com limites e persistência
    ctl.open('kick', 1);
    ipcMain.emit('pts:resize', {}, -60);
    check(cfg.height === 420 && ctl.panelHeight(800) === 420, `arrastar para cima aumenta e salva a altura (${cfg.height})`);
    ipcMain.emit('pts:resize', {}, 5000);
    check(ctl.panelHeight(800) === 160, 'altura mínima respeitada');
    ipcMain.emit('pts:resize', {}, -5000);
    check(ctl.panelHeight(800) === 640, 'altura máxima deixa espaço para as contas (800 - 160)');
    ctl.close();
    check(base() === b0, 'fechar de novo deixa a janela como estava');

    // ações: Entrar e Sair levam SEMPRE o número da conta do painel ou da linha da janela de contas
    const acoes = [];
    const ctl3 = createPoints({
      mainWin: win, getAccounts: () => accounts, config: { get: () => cfg, set: (p) => Object.assign(cfg, p) }, relayout: place,
      onAccount: (acc, site, action) => acoes.push(`${acc}/${site}/${action}`),
      getRows: async () => [
        { acc: 2, label: 'Conta 2', running: true, lives: true, last: null,
          sites: {
            twitch: { login: true, bonus: '+15% XP', stopped: null, channels: [{ channel: 'tw', text: '10 pts' }] },
            kick: { login: false, bonus: 'nenhum', stopped: null, channels: [] },
          } },
      ],
    });
    ipcMain.emit('pts:act', {}, 3, 'kick', 'login');
    ipcMain.emit('pts:act', {}, 2, 'twitch', 'logout');
    ipcMain.emit('pts:act', {}, 9, 'kick', 'login'); // número que não é de conta: ignorado sem erro
    ipcMain.emit('pts:act', {}, 2, 'xbox', 'login'); // site que não existe: ignorado
    check(acoes.join() === '3/kick/login,2/twitch/logout', `janela de contas: cada ação vai para a conta da linha (${acoes.join()})`);
    ctl3.open('kick', 3);
    ipcMain.emit('pts:cmd', {}, 'login');
    check(acoes.includes('3/kick/login') && acoes.length === 3, 'botão Entrar do painel age na conta do painel (3)');
    ctl3.close();

    // janela "Pontos das contas": uma linha por conta, a conta que abriu a janela em destaque
    ctl3.showAccounts(2);
    const aw = BrowserWindow.getAllWindows().find((w) => w.getTitle().startsWith('Pontos das contas'));
    check(!!aw, 'janela "Pontos das contas" abre');
    await waitFor(() => !aw.webContents.isLoading(), 5000);
    const linhas = await waitFor(async () => (await aw.webContents.executeJavaScript('document.querySelectorAll("#rows tr").length')) === 1, 4000);
    check(linhas, 'janela de contas: uma linha por conta (1 nos dados de teste)');
    const destaque = await aw.webContents.executeJavaScript('document.querySelector("tr.focus .who")?.textContent ?? ""');
    check(destaque === 'Conta 2', `janela aberta pela conta 2 já mostra a linha dela em destaque (${destaque})`);
    aw.destroy();
    // as janelas de configuração e de registro (do gerenciador de lives) abrem pelos botões do painel
    const opened = [];
    const ctl4 = createPoints({
      mainWin: win, getAccounts: () => accounts, config: { get: () => cfg, set: (p) => Object.assign(cfg, p) }, relayout: place,
      onConfig: () => opened.push('config'), onLog: () => opened.push('log'),
      getStatus: () => ({ text: '10/300 pontos', stopped: null }),
    });
    ipcMain.emit('pts:cmd', {}, 'config');
    ipcMain.emit('pts:cmd', {}, 'log');
    check(opened.join() === 'config,log', 'botões Config e Registro do painel abrem as janelas do gerenciador');
    ctl4.close();
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  fx?.destroy();
  win?.destroy();
  finish();
});
