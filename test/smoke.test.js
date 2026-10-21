// Sobe o app de verdade (janela escondida, dados isolados) e confere a janela: barra do app, uma barra por
// conta colada no topo do jogo dela, nada sobreposto, botões das extensões e liga/desliga por conta.
const { app, sleep, check, finish, waitFor } = require('./helpers');
const { BaseWindow } = require('electron');

require('../main.js');

app.whenReady().then(async () => {
  try {
    await waitFor(() => BaseWindow.getAllWindows().length && BaseWindow.getAllWindows()[0].contentView.children.length >= 5, 15000);
    await sleep(1500);
    const win = BaseWindow.getAllWindows()[0];
    const content = win.getContentBounds();
    const views = win.contentView.children.filter((v) => v.getVisible?.() !== false && v.webContents);
    const urlOf = (v) => v.webContents.getURL();
    const bars = views.filter((v) => /toolbar\.html/.test(urlOf(v)));
    const appBar = bars.find((v) => /kind=app/.test(urlOf(v)));
    const slotBars = bars.filter((v) => /kind=slot/.test(urlOf(v)));
    const games = views.filter((v) => !/(toolbar|lives|help|logs)\.html/.test(urlOf(v)) && v.getBounds().height > 100);

    check(!!appBar, 'barra do app existe');
    check(slotBars.length === 2, `uma barra por conta (2 contas por padrão): ${slotBars.length}`);
    check(games.length === 2, `uma página de jogo por conta: ${games.length}`);
    if (appBar) {
      const b = appBar.getBounds();
      check(b.y === 0 && b.width === content.width && b.height > 0, 'barra do app no topo, largura total');
    }
    for (const sb of slotBars) {
      const b = sb.getBounds();
      const g = games.find((x) => { const gb = x.getBounds(); return gb.x === b.x && gb.width === b.width && gb.y === b.y + b.height; });
      check(!!g, `jogo logo abaixo da barra (x=${b.x}, y=${b.y})`);
    }
    // nada sobreposto, nada fora da janela
    const rects = [...slotBars, ...games, ...(appBar ? [appBar] : [])].map((v) => v.getBounds());
    let overlap = false;
    for (let i = 0; i < rects.length; i++) {
      const a = rects[i];
      if (a.x < 0 || a.y < 0 || a.x + a.width > content.width + 1 || a.y + a.height > content.height + 1) overlap = true;
      for (let j = i + 1; j < rects.length; j++) {
        const c = rects[j];
        if (a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height) overlap = true;
      }
    }
    check(!overlap, 'sem sobreposição e tudo dentro da janela');

    // botões das barras por conta
    const labels = async (v) => v.webContents.executeJavaScript('[...document.querySelectorAll("button")].map(b => b.textContent)');
    for (const sb of slotBars) {
      const l = await labels(sb);
      check(l.includes('Foco'), `barra da conta tem "Foco": ${JSON.stringify(l)}`);
    }
    const l0 = slotBars[0] ? await labels(slotBars[0]) : [];
    // botões em drop ("Grupo ▾") abrem um menu nativo em vez de ligar direto: ficam fora do liga/desliga abaixo
    const dropBtns = l0.filter((x) => x.endsWith(' ▾'));
    const featureBtns = l0.filter((x) => !['Foco', '⚙'].includes(x) && !dropBtns.includes(x));
    console.log(`  funcionalidades vistas na barra: ${featureBtns.join(', ') || '(nenhuma)'}${dropBtns.length ? ` | drops: ${dropBtns.join(', ')}` : ''}`);
    // barra do app: o botão Lives existe (a bolinha flutuante "Lives abertas" não existe mais)
    if (appBar) {
      const l = await labels(appBar);
      check(l.some((x) => x.startsWith('Lives')), `botão Lives na barra do app: ${JSON.stringify(l)}`);
    }
    check(!win.contentView.children.some((v) => /lives.html/.test(v.webContents?.getURL() ?? '')), 'sem view flutuante de lives');

    // sem selo na página do jogo (auto-captura) e sniper ligado sem regras avisa na barra
    if (slotBars[0]) {
      const find = (name) => `[...document.querySelectorAll("button")].find(b => b.textContent.startsWith(${JSON.stringify(name)}))`;
      const sn = featureBtns.includes('Sniper');
      if (sn) {
        await slotBars[0].webContents.executeJavaScript(find('Sniper') + '.click()');
        const ok = await waitFor(async () => /sem regras/.test(await slotBars[0].webContents.executeJavaScript(find('Sniper') + '.textContent')), 4000);
        check(ok, 'Sniper ligado sem regras mostra "⚠ sem regras" no botão');
        await slotBars[0].webContents.executeJavaScript(find('Sniper') + '.click()');
        await waitFor(async () => (await slotBars[0].webContents.executeJavaScript(find('Sniper') + '.textContent')) === 'Sniper', 4000);
      }
    }

    // liga/desliga é POR CONTA: clicar na conta 1 não pode acender a 2
    if (featureBtns.length && slotBars.length === 2) {
      const [b1, b2] = slotBars;
      const name = featureBtns[0];
      const isOn = (v) => v.webContents.executeJavaScript(`[...document.querySelectorAll("button")].find(b => b.textContent === ${JSON.stringify(name)}).classList.contains("on")`);
      const click = (v) => v.webContents.executeJavaScript(`[...document.querySelectorAll("button")].find(b => b.textContent === ${JSON.stringify(name)}).click()`);
      await click(b1);
      check(await waitFor(() => isOn(b1), 3000), `"${name}" liga na conta clicada`);
      check(!(await isOn(b2)), `"${name}" continua desligado na outra conta`);
      await click(b1);
      check(await waitFor(async () => !(await isOn(b1)), 3000), `"${name}" desliga de novo`);
    }

    // modo foco: a conta clicada ocupa a janela e a outra some
    if (slotBars[0]) {
      await slotBars[0].webContents.executeJavaScript('[...document.querySelectorAll("button")].find(b => b.textContent === "Foco").click()');
      await sleep(600);
      check(/posição 1/.test(win.getTitle()), `modo foco ativo (título: "${win.getTitle()}")`);
      const isGame = (v) => v.webContents && !/(toolbar|lives|help|logs).html/.test(v.webContents.getURL());
      check(!!win.contentView.children.find((v) => isGame(v) && v.getBounds().width === content.width), 'a conta em foco ocupa a largura inteira da janela');
      const appb = win.contentView.children.find((v) => /kind=app/.test(v.webContents?.getURL() ?? ''));
      await appb.webContents.executeJavaScript('[...document.querySelectorAll("button")].find(b => b.textContent === "Voltar à grade").click()');
      await sleep(600);
      check(win.getTitle() === 'PokeIdle Multi', 'Voltar à grade restaura a grade');
    }
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
