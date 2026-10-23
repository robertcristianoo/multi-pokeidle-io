// Aviso de versão nova: comparação de versões, consulta ao GitHub (com resposta falsa) e o botão na barra.
const { app, check, finish, waitFor } = require('./helpers');
const path = require('path');
const { BrowserWindow } = require('electron');
const { createUpdater, isNewer } = require('../updates');

const resp = (body, ok = true) => async () => ({ ok, json: async () => body });
const rel = (tag, extra = {}) => ({ tag_name: tag, html_url: `https://github.com/x/y/releases/tag/${tag}`, draft: false, prerelease: false, ...extra });

app.whenReady().then(async () => {
  try {
    check(isNewer('1.10.0', '1.9.9') && !isNewer('1.9.9', '1.10.0'), 'compara por número, não por texto (1.10.0 > 1.9.9)');
    check(!isNewer('1.2.3', '1.2.3') && !isNewer('lixo', '1.0.0') && !isNewer('1.0.1', null), 'igual, ilegível ou sem versão atual: sem aviso');

    // versão nova -> disponível, avisa uma única vez
    const avisos = [];
    const u = createUpdater({ currentVersion: '1.1.0', fetchImpl: resp(rel('v1.2.0')), onAvailable: (s) => avisos.push(s.latest), timers: false });
    let s = await u.check();
    check(s.kind === 'available' && s.latest === '1.2.0' && s.current === '1.1.0' && /releases\/tag\/v1\.2\.0/.test(s.url), `Release mais novo -> disponível (${s.latest})`);
    await u.check();
    check(avisos.length === 1, 'o aviso na tela sai uma vez por versão, não a cada consulta');

    // saiu outra versão depois do primeiro aviso: a consulta seguinte atualiza o estado (o botão não fica preso na antiga)
    let tag = 'v1.2.0';
    const u2 = createUpdater({ currentVersion: '1.1.0', fetchImpl: async () => resp(rel(tag))(), timers: false });
    await u2.check(); tag = 'v1.3.1';
    s = await u2.check();
    check(s.latest === '1.3.1' && /v1.3.1/.test(s.url), `nova consulta troca a versão e o link (${s.latest})`);

    // em dia / mais velho / rascunho / pré-lançamento / erro
    check((await createUpdater({ currentVersion: '1.2.0', fetchImpl: resp(rel('v1.2.0')), timers: false }).check()).kind === 'none', 'mesma versão: nada a avisar');
    check((await createUpdater({ currentVersion: '1.3.0', fetchImpl: resp(rel('v1.2.0')), timers: false }).check()).kind === 'none', 'build mais novo que o Release: nada a avisar');
    check((await createUpdater({ currentVersion: '1.0.0', fetchImpl: resp(rel('v1.2.0', { prerelease: true })), timers: false }).check()).kind === 'none', 'pré-lançamento é ignorado');
    check((await createUpdater({ currentVersion: '1.0.0', fetchImpl: resp(rel('v1.2.0', { draft: true })), timers: false }).check()).kind === 'none', 'rascunho é ignorado');
    check((await createUpdater({ currentVersion: '1.0.0', fetchImpl: resp({}, false), timers: false }).check()).kind === 'none', 'API recusou (limite/offline): silêncio');
    check((await createUpdater({ currentVersion: '1.0.0', fetchImpl: async () => { throw new Error('offline'); }, timers: false }).check()).kind === 'none', 'sem internet: silêncio, sem erro');
    let chamou = false;
    await createUpdater({ currentVersion: null, fetchImpl: async () => { chamou = true; return resp(rel('v9.9.9'))(); }, timers: false }).check();
    check(!chamou, 'build local/desenvolvimento (sem release-info.json): nem consulta o GitHub');

    // o botão na barra do app
    const snap = { kind: 'app', accounts: { count: 2, max: 4, focused: null, lives: { kind: 'none', text: '' }, version: '1.1.0', update: { kind: 'available', current: '1.1.0', latest: '1.2.0', url: 'https://x' } } };
    process.env.PKMULTI_TB_SNAP = JSON.stringify(snap);
    const win = new BrowserWindow({ show: false, width: 900, height: 60, webPreferences: { preload: path.join(__dirname, 'tb-stub-preload.js'), backgroundThrottling: false } });
    await win.loadFile(path.join(__dirname, '..', 'toolbar.html'));
    const run = (code) => win.webContents.executeJavaScript(code);
    check(await waitFor(() => run('[...document.querySelectorAll("button")].some(b => b.textContent === "Atualizar → v1.2.0")'), 4000), 'barra mostra "Atualizar → v1.2.0"');
    check(/v1\.1\.0/.test(await run('document.querySelector(".tag").textContent')), 'barra mostra a versão atual (v1.1.0)');
    check(/a sua é a v1\.1\.0/.test(await run('[...document.querySelectorAll("button")].find(b => b.textContent.startsWith("Atualizar")).title')), 'dica explica qual é a versão nova e qual é a sua');
    await run('[...document.querySelectorAll("button")].find(b => b.textContent.startsWith("Atualizar")).click()');
    check((await run('tb.acts()')).includes('update'), 'clicar pede a ação "update" (abre a página do Release)');

    snap.accounts.update = { kind: 'none', current: '1.1.0' };
    process.env.PKMULTI_TB_SNAP = JSON.stringify(snap);
    const win2 = new BrowserWindow({ show: false, width: 900, height: 60, webPreferences: { preload: path.join(__dirname, 'tb-stub-preload.js') } });
    await win2.loadFile(path.join(__dirname, '..', 'toolbar.html'));
    await waitFor(() => win2.webContents.executeJavaScript('document.querySelectorAll("button").length > 2'), 4000);
    check(!(await win2.webContents.executeJavaScript('[...document.querySelectorAll("button")].some(b => b.textContent.startsWith("Atualizar"))')), 'em dia: sem botão de atualizar');
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
