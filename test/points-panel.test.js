// Painel de pontos (src/points): o script que deixa só o rodapé do chat (sobre uma página de fixture), o ciclo de vida
// das views (só existem com o painel aberto) e a altura ajustável (persistida, com limites).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BaseWindow, BrowserWindow, ipcMain } = require('electron');
const { check, finish, sleep } = require('./helpers');
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

    // ---- painel ----
    win = new BaseWindow({ show: false, width: 1200, height: 800 });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-painel-'));
    const cfg = {};
    const accounts = [{ acc: 1, twitch: [], kick: [{ id: 'canal', nome: 'Canal' }] }, { acc: 2, twitch: [], kick: [] }];
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

    ctl.open('kick');
    check(base() === b0 + 2, `aberto com uma live: host + página do canal (${base() - b0} views)`);
    check(ctl.panelHeight(800) === 360, 'altura padrão do painel: 360');
    const canal = win.contentView.children[win.contentView.children.length - 1];
    const hostView = win.contentView.children[win.contentView.children.length - 2];
    check(canal.getBounds().height === 320 && hostView.getBounds().y === 800 - 360, 'painel embaixo, página do canal abaixo da barra do painel');

    ctl.next();
    check(base() === b0 + 2, 'próxima conta: troca a página, sem acumular views');

    ctl.toggle('kick');
    check(base() === b0 && ctl.panelHeight(800) === 0, 'fechar (toggle): remove as views e libera a altura');

    ctl.open('twitch');
    check(base() === b0 + 1, 'sem live da Twitch: só a barra do painel, sem página');
    ctl.close();

    // altura: arrastar a borda (dy negativo = para cima = mais alto), com limites e persistência
    ctl.open('kick');
    ipcMain.emit('pts:resize', {}, -60);
    check(cfg.height === 420 && ctl.panelHeight(800) === 420, `arrastar para cima aumenta e salva a altura (${cfg.height})`);
    ipcMain.emit('pts:resize', {}, 5000);
    check(ctl.panelHeight(800) === 160, 'altura mínima respeitada');
    ipcMain.emit('pts:resize', {}, -5000);
    check(ctl.panelHeight(800) === 640, 'altura máxima deixa espaço para as contas (800 - 160)');
    ctl.close();
    check(base() === b0, 'fechar de novo deixa a janela como estava');

    // janela de configuração do resgate automático abre sem erro
    ctl.showConfig();
    await sleep(50);
    check(true, 'janela de configuração abre sem erro');
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  fx?.destroy();
  win?.destroy();
  finish();
});
