// Avisos: pequenos, no canto superior direito (abaixo da barra do app), por cima, no máximo 3 de cada vez
// (os mais antigos saem) e somem sozinhos em até 5 s.
const { app, sleep, check, finish, waitFor } = require('./helpers');
const { BaseWindow } = require('electron');
const { createToasts } = require('../toasts');

app.whenReady().then(async () => {
  try {
    const win = new BaseWindow({ show: false, width: 1200, height: 800 });
    const { width, height } = win.getContentBounds();
    const ctl = createToasts({ mainWin: win, getTop: () => 30 });
    ctl.place(width, height);
    const view = win.contentView.children[0];
    await sleep(800);
    check(view.getBounds().height === 0, 'sem aviso, não ocupa espaço');

    ctl.show({ kind: 'ok', title: '✔ Conta 1: comprou 1× Bronze Boss Token', text: '4 gemas', ms: 60000 });
    check(await waitFor(() => view.getBounds().height > 20, 4000), 'aviso aparece (a view ganha altura)');
    const b = view.getBounds();
    check(b.width <= 280, `aviso estreito (${b.width}px)`);
    check(b.height <= 60, `aviso baixo, uma linha de título + uma de detalhe (${b.height}px)`);
    check(b.x + b.width <= width && b.x + b.width >= width - 12, `encostado à direita (x=${b.x}, w=${b.width}, janela=${width})`);
    check(b.y >= 30 && b.y <= 40, `no topo, logo abaixo da barra do app (y=${b.y})`);
    check(win.contentView.children[win.contentView.children.length - 1] === view, 'por cima das outras views');
    const texto = await view.webContents.executeJavaScript('document.getElementById("list").innerText');
    check(/Bronze Boss Token/.test(texto) && /4 gemas/.test(texto), 'mostra título e detalhe');

    // lotado: no máximo 3 visíveis, o mais antigo sai
    for (let i = 1; i <= 6; i++) ctl.show({ kind: i % 2 ? 'ok' : 'fail', title: `aviso ${i}`, text: 'x', ms: 60000 });
    await sleep(600);
    const itens = await view.webContents.executeJavaScript('[...document.querySelectorAll(".t b")].map((e) => e.textContent)');
    check(itens.length === 3, `no máximo 3 avisos na tela: ${JSON.stringify(itens)}`);
    check(itens[0] === 'aviso 6' && !itens.includes('aviso 1'), 'ficam os mais novos, os antigos são descartados');
    check(view.getBounds().height <= 3 * 50, `a pilha continua pequena (${view.getBounds().height}px)`);

    // duração máxima de 5 s mesmo pedindo mais
    const t0 = Date.now();
    check(await waitFor(() => view.getBounds().height === 0, 8000), 'some sozinho');
    const dur = Date.now() - t0;
    check(dur < 6000, `todos somem em até ~5 s (${dur}ms desde os últimos avisos)`);
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
