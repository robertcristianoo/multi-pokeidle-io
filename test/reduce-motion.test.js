// Reduzir animações: a emulação de `prefers-reduced-motion` chega à página (matchMedia e CSS), muda na hora ao
// alternar, é reaplicada depois de navegar e a escolha é lida/salva pela configuração.
const { app, sleep, check, finish, waitFor } = require('./helpers');
const { BaseWindow, WebContentsView } = require('electron');
const { createReduceMotion } = require('../src/reduce-motion');

const page = (tag) => 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html><title>${tag}</title>
<style>
  @keyframes girar { to { transform: rotate(360deg); } }
  #giro { width: 10px; height: 10px; animation: girar 1s linear infinite; }
  @media (prefers-reduced-motion: reduce) { #giro { animation: none; } }
</style>
<div id="giro"></div>`);

const lerPagina = (view) => view.webContents.executeJavaScript(`({
  mq: matchMedia('(prefers-reduced-motion: reduce)').matches,
  anim: getComputedStyle(document.getElementById('giro')).animationName,
})`);

const carregar = (view, url) => new Promise((resolve) => {
  view.webContents.once('did-finish-load', resolve);
  view.webContents.loadURL(url);
});

app.whenReady().then(async () => {
  try {
    const win = new BaseWindow({ show: false, width: 800, height: 600 });
    const config = {}; // substitui o config.json neste teste
    const motion = createReduceMotion({
      read: () => config.reduceMotion,
      write: (on) => { config.reduceMotion = on; },
    });

    check(motion.isOn() === true, 'sem escolha salva, começa ligado');

    const view = new WebContentsView();
    win.contentView.addChildView(view);
    motion.attach(view); // antes da primeira carga, como em createSlot()
    await carregar(view, page('a'));
    await sleep(200);

    const ligado = await lerPagina(view);
    check(ligado.mq === true && ligado.anim === 'none', `ligado por padrão: matchMedia=${ligado.mq}, animação=${ligado.anim}`);

    motion.toggle();
    check(motion.isOn() === false, 'toggle desliga');
    check(config.reduceMotion === false, 'escolha gravada no config');
    check(await waitFor(async () => (await lerPagina(view)).anim === 'girar', 3000), 'desligar aplica na hora, sem recarregar');
    const desligado = await lerPagina(view);
    check(desligado.mq === false, 'matchMedia volta a "no-preference"');

    // a página nova começa sem a emulação: tem de ser reaplicada ao navegar
    await carregar(view, page('b'));
    await sleep(200);
    const aposNavegar = await lerPagina(view);
    check(aposNavegar.mq === false && aposNavegar.anim === 'girar', 'depois de navegar continua desligado');

    motion.set(true);
    check(await waitFor(async () => (await lerPagina(view)).anim === 'none', 3000), 'ligar de novo aplica na hora');
    await carregar(view, page('c'));
    await sleep(200);
    const ligadoDeNovo = await lerPagina(view);
    check(ligadoDeNovo.mq === true && ligadoDeNovo.anim === 'none', 'depois de navegar continua ligado');

    // escolha salva é lida na próxima execução
    const depois = createReduceMotion({ read: () => false });
    check(depois.isOn() === false, 'escolha salva "desligado" é respeitada ao iniciar');
    check(createReduceMotion({ read: () => undefined }).isOn() === true, 'sem valor salvo, vale ligado');

    // conta fechada não quebra as demais
    view.webContents.close();
    let erro = null;
    try { motion.toggle(); } catch (err) { erro = err; }
    check(erro === null, 'alternar com conta já fechada não lança erro');

    win.destroy();
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
