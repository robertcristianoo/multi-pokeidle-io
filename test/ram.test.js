// Barra de RAM: formato dos números, soma por conta (processo da página) e o resto como "app/outros",
// posição no rodapé (sem sobrepor as contas), ocultar/mostrar e o texto que aparece na barra.
const { app, check, finish, waitFor, sleep } = require('./helpers');
const { BaseWindow, WebContentsView } = require('electron');
const { createRamBar, sampleMemory, formatMemory, BAR_H } = require('../src/ram');

const KB = 1024;
const mb = (n) => n * KB;

app.whenReady().then(async () => {
  try {
    check(formatMemory(mb(512)) === '512 MB' && formatMemory(mb(1536)) === '1,5 GB' && formatMemory(0) === '0 MB', `formato: ${formatMemory(mb(512))} | ${formatMemory(mb(1536))}`);

    // soma pura, com processos falsos: conta 1 = pid 11, conta 2 = pid 22; pid 99 é do app
    const slotsFake = [
      { id: 1, view: { webContents: { getOSProcessId: () => 11 } } },
      { id: 2, view: { webContents: { getOSProcessId: () => 22 } } },
    ];
    const metricsFake = [
      { pid: 1, type: 'Browser', memory: { workingSetSize: mb(200) } },
      { pid: 11, type: 'Tab', memory: { workingSetSize: mb(900) } },
      { pid: 22, type: 'Tab', memory: { workingSetSize: mb(1200) } },
      { pid: 99, type: 'GPU', memory: { workingSetSize: mb(100) } },
    ];
    const s = sampleMemory(slotsFake, metricsFake);
    check(s.accounts[0].mb === 900 && s.accounts[1].mb === 1200, `cada conta soma o próprio processo: ${s.accounts.map((a) => a.mb)}`);
    check(s.app.mb === 300 && s.total.mb === 2400, `app/outros = o que não é conta (300 MB), total = 2400 MB: app ${s.app.mb}, total ${s.total.mb}`);
    const alto = sampleMemory([slotsFake[1]], [{ pid: 22, memory: { workingSetSize: mb(1600) } }]);
    const total = sampleMemory(slotsFake, [...metricsFake, { pid: 77, memory: { workingSetSize: mb(3500) } }]);
    check(s.accounts[0].level === 'ok' && s.accounts[1].level === 'warn', `alerta por conta: ${s.accounts.map((a) => a.level)} (1200 MB = aviso)`);
    check(alto.accounts[0].level === 'danger', 'conta acima de 1,5 GB: vermelha');
    check(s.total.level === 'ok' && total.total.level === 'danger', `alerta do total: 2,3 GB ok, 6 GB vermelho (${s.total.level} / ${total.total.level})`);
    const s2 = sampleMemory([{ id: 1, view: { webContents: { getOSProcessId: () => 555 } } }], metricsFake);
    check(s2.accounts[0].mb === 0, 'processo que não existe na lista (conta fechada): 0 MB, sem erro');
    const dup = sampleMemory([slotsFake[0], { id: 3, view: { webContents: { getOSProcessId: () => 11 } } }], metricsFake);
    check(dup.accounts[0].mb === 900 && dup.accounts[1].mb === 0, 'dois quadrantes no mesmo processo: só o primeiro conta');
    const destruida = sampleMemory([{ id: 1, view: { webContents: { getOSProcessId: () => { throw new Error('destroyed'); } } } }], metricsFake);
    check(destruida.accounts[0].mb === 0, 'WebContents destruída não derruba a amostragem');

    // com processos de verdade: as contas aparecem e a soma bate com o que o Electron reporta
    const win = new BaseWindow({ show: false, width: 1000, height: 600 });
    const mk = (id) => {
      const view = new WebContentsView({ webPreferences: { partition: `ramtest${id}` } });
      win.contentView.addChildView(view);
      view.webContents.loadURL('data:text/html,<p>conta</p>');
      return { id, view };
    };
    const slots = [mk(1), mk(2)];
    await waitFor(() => slots.every((x) => !x.view.webContents.isLoading()), 8000);
    await sleep(800);
    const real = sampleMemory(slots);
    const soma = real.accounts.reduce((t, a) => t + a.mb, 0);
    check(real.accounts.some((a) => a.mb > 0), `processos reais mapeados (MB por conta: ${real.accounts.map((a) => a.mb)})`);
    check(real.total.mb >= soma && real.app.mb >= 0, `total (${real.total.mb} MB) cobre as contas (${soma} MB) e o app (${real.app.mb} MB)`);

    // barra: escondida não cria view nem ocupa espaço; mostrada fica no rodapé, sem sobrepor as contas
    const toggled = [];
    const bar = createRamBar({ mainWin: win, getSlots: () => slots, visible: false, onToggle: (v) => toggled.push(v) });
    const views0 = win.contentView.children.length;
    bar.place(1000, 600);
    check(bar.height() === 0 && !bar.isVisible() && win.contentView.children.length === views0, 'escondida: sem view e sem altura');

    bar.toggle(true);
    check(bar.height() === BAR_H && bar.isVisible() && toggled.at(-1) === true, `ligada: ${BAR_H}px e avisa para salvar a escolha`);
    bar.place(1000, 600);
    const barView = win.contentView.children.find((v) => v.getBounds().height === BAR_H);
    const b = barView.getBounds();
    check(b.y === 600 - BAR_H && b.width === 1000 && b.x === 0, `rodapé inteiro: y=${b.y}, largura=${b.width}`);

    await waitFor(() => barView.webContents.executeJavaScript('document.getElementById("bar").textContent.length > 0').then(Boolean, () => false), 8000);
    const texto = await barView.webContents.executeJavaScript('document.getElementById("bar").innerText');
    check(/RAM/.test(texto) && /app\/outros/.test(texto) && /Conta 1/.test(texto) && /Conta 2/.test(texto), `barra mostra total, app/outros e as contas: ${texto.replace(/\s+/g, ' ')}`);

    bar.toggle(false);
    check(bar.height() === 0 && !bar.isVisible() && toggled.at(-1) === false, 'ocultada: sem altura e avisa para salvar');
    check(barView.getVisible() === false, 'view escondida');
    bar.toggle(false);
    check(toggled.length === 2, 'mesmo estado não grava de novo');
    win.destroy();
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
