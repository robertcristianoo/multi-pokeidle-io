// Modo ULTRA: liga/desliga nas contas pelos controles do próprio jogo (fixture que imita os controles), reaplica ao
// recarregar, espera a tela de login virar jogo, não repete o clique depois de aplicado, não mexe numa escolha
// salva ao ligar, e não quebra numa página sem os controles.
const { app, sleep, check, finish, waitFor } = require('./helpers');
const path = require('path');
const { BaseWindow, WebContentsView } = require('electron');
const { createUltra } = require('../src/ultra');

const FIXTURE = path.join(__dirname, 'fixtures', 'jogo-ultra.html');
const VAZIA = path.join(__dirname, 'fixtures', 'vazia.html');

app.whenReady().then(async () => {
  try {
    const win = new BaseWindow({ show: false, width: 1200, height: 800 });
    const slots = [];
    const avisos = [];
    const store = { v: false, get() { return this.v; }, set(x) { this.v = x; } };
    // o arquivo de teste não tem o domínio do jogo: a checagem de host é trocada por "sim"
    const ultra = createUltra({ getSlots: () => slots, notify: (n) => avisos.push(n), store, isGame: () => true });

    const novaConta = async (id, { query, file = FIXTURE } = {}) => {
      const view = new WebContentsView({ webPreferences: { partition: `ultra-teste-${id}` } });
      win.contentView.addChildView(view);
      slots.push({ id, view });
      ultra.attach(id, view);
      await view.webContents.loadFile(file, query ? { query } : undefined);
      return view;
    };
    const cls = (v) => v.webContents.executeJavaScript('document.documentElement.classList.contains("modo-ultra")');
    const cfg = (v) => v.webContents.executeJavaScript('localStorage.getItem("cfg-ultra")');
    const cliques = async (v) => JSON.parse(await v.webContents.executeJavaScript('JSON.stringify(window.cliques || {})'));

    const v1 = await novaConta(1);
    const v2 = await novaConta(2);
    await sleep(300);

    // 1. liga nas duas contas pelo interruptor do jogo, uma vez por conta
    ultra.setOn(true);
    check(store.get() === true && ultra.isOn(), 'escolha salva como ligada (config.json)');
    check(await waitFor(async () => (await cls(v1)) && (await cls(v2)), 6000), 'liga o ULTRA nas duas contas');
    check((await cliques(v1)).cfg === 1 && (await cliques(v2)).cfg === 1, 'um clique no interruptor do jogo por conta');

    // 2. já aplicado: não repete o clique
    await sleep(2500);
    check((await cliques(v1)).cfg === 1, 'não repete o clique depois de aplicado');

    // 3. recarregar a conta reaplica (o jogo lê a escolha salva ao entrar; o vigia cobre o resto)
    const recarregou = new Promise((r) => v1.webContents.once('did-finish-load', r));
    v1.webContents.reload();
    await recarregou;
    check(await waitFor(() => cls(v1), 6000), 'recarregar a conta reaplica o ULTRA');

    // 4. desligar: sai da caixa e desmarca a escolha salva no jogo (sem repetir cliques além do necessário)
    ultra.setOn(false);
    check(store.get() === false, 'escolha salva como desligada (config.json)');
    check(await waitFor(async () => !(await cls(v1)) && !(await cls(v2)), 6000), 'desliga o ULTRA nas duas contas');
    check(await waitFor(async () => (await cfg(v1)) !== '1' && (await cfg(v2)) !== '1', 4000), 'a escolha salva no jogo também fica desligada');

    // 5. conta na tela de login: ligar não mexe antes de entrar; ao entrar, liga
    const v3 = await novaConta(3, { query: { login: '1' } });
    ultra.setOn(true);
    await sleep(1500);
    check(!(await cls(v3)), 'tela de login: não clica antes de o jogo abrir');
    await v3.webContents.executeJavaScript('window.entrar()');
    check(await waitFor(() => cls(v3), 6000), 'ao entrar no jogo, o vigia liga o ULTRA');
    check((await cliques(v3)).cfg === 1, 'liga pelo interruptor uma vez ao entrar');

    // 6. escolha já salva (cfg-ultra = 1) e o jogo ainda no login: o jogo liga sozinho; não clica (clicar desligaria)
    const v4 = await novaConta(4, { query: { login: '1' } });
    await v4.webContents.executeJavaScript('localStorage.setItem("cfg-ultra", "1")');
    await v4.webContents.executeJavaScript('window.entrar()');
    check(await waitFor(() => cls(v4), 6000), 'escolha salva: o jogo liga ao entrar');
    check((await cliques(v4)).cfg === 0, 'escolha salva: não clica no interruptor (não desliga por engano)');

    // 7. página sem os controles do jogo: nada quebra, e o aviso ainda sai
    const v5 = await novaConta(5, { file: VAZIA });
    let quebrou = false;
    try {
      ultra.setOn(true);
      await sleep(3300);
      ultra.setOn(false);
    } catch {
      quebrou = true;
    }
    check(!quebrou && (await v5.webContents.executeJavaScript('document.querySelector("p").textContent')).length > 0,
      'página sem os controles: não quebra');
    check(avisos.length > 0 && /ULTRA/.test(avisos[avisos.length - 1].title), `aviso de resultado: "${avisos[avisos.length - 1]?.title}"`);

    // 8. atalho Ctrl+U: só Ctrl (sem Alt/Shift) e só key down; devolve true e para o restante do atalho
    const evento = { prevented: false, preventDefault() { this.prevented = true; } };
    const tecla = (extra) => ({ type: 'keyDown', control: true, alt: false, shift: false, code: 'KeyU', ...extra });
    const antes = ultra.isOn();
    check(ultra.onKey(evento, tecla({ alt: true })) === false && ultra.isOn() === antes, 'Ctrl+Alt+U não é o atalho');
    check(ultra.onKey(evento, tecla({ type: 'keyUp' })) === false && ultra.isOn() === antes, 'soltar a tecla não conta');
    check(ultra.onKey(evento, tecla()) === true && evento.prevented && ultra.isOn() !== antes, 'Ctrl+U liga/desliga');
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
