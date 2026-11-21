// Internacionalização: resolução do idioma, fallback para o inglês, paridade dos dicionários e a troca de idioma
// de verdade (Configurações -> config.json -> título da janela e páginas recarregadas).
const fs = require('fs');
const path = require('path');
const { app, sleep, check, finish, waitFor } = require('./helpers');
const { BaseWindow, BrowserWindow } = require('electron');
const core = require('../src/i18n/core');
const i18n = require('../src/i18n');

// --- núcleo (sem janela) ---
check(core.resolveLang(undefined, 'pt-BR') === 'pt-BR', 'sem idioma salvo, usa o do sistema (pt-BR)');
check(core.resolveLang(undefined, 'es-MX') === 'es' && core.resolveLang(undefined, 'pt-PT') === 'pt-BR', 'es-MX -> es; pt-PT -> pt-BR');
check(core.resolveLang(undefined, 'fr') === 'en' && core.resolveLang(undefined, '') === 'en', 'idioma do sistema não suportado -> inglês');
check(core.resolveLang('es', 'pt-BR') === 'es', 'o idioma salvo vale mais que o do sistema');
check(core.resolveLang('xx', 'pt-BR') === 'pt-BR', 'idioma salvo inválido é ignorado');

const tr = core.createTranslator([{ en: { a: 'Hello {name}', b: 'Only English' }, 'pt-BR': { a: 'Olá {name}' }, es: { a: 'Hola {name}' } }]);
check(tr.t('a', { name: 'Ash' }) === 'Hello Ash', 'inglês é o padrão, com interpolação');
tr.setLang('pt-BR');
check(tr.t('a', { name: 'Ash' }) === 'Olá Ash', 'troca para pt-BR');
check(tr.t('b') === 'Only English', 'chave ausente no idioma cai no inglês');
check(tr.t('nao.existe') === 'nao.existe', 'chave inexistente devolve a própria chave');
check(tr.t('a') === 'Olá {name}', 'parâmetro não informado fica como está');
check(!tr.setLang('fr') && tr.getLang() === 'pt-BR', 'idioma desconhecido é recusado');

// todos os idiomas têm as mesmas chaves do inglês (nada cai no fallback sem querer)
const { dicts } = i18n;
for (const l of ['pt-BR', 'es']) {
  const missing = Object.keys(dicts.en).filter((k) => !Object.hasOwn(dicts[l], k));
  const extra = Object.keys(dicts[l]).filter((k) => !Object.hasOwn(dicts.en, k));
  check(!missing.length && !extra.length, `${l} tem as mesmas chaves do inglês (faltam ${missing.length}, sobram ${extra.length})`);
  if (missing.length) console.log('   faltam:', missing.slice(0, 10).join(', '));
  if (extra.length) console.log('   sobram:', extra.slice(0, 10).join(', '));
}
// os parâmetros {x} de cada tradução são os mesmos do inglês
const params = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const badParams = ['pt-BR', 'es'].flatMap((l) => Object.keys(dicts[l]).filter((k) => dicts.en[k] && params(dicts[l][k]) !== params(dicts.en[k])).map((k) => `${l}:${k}`));
check(!badParams.length, `parâmetros {x} iguais em todos os idiomas ${badParams.slice(0, 5).join(' ')}`);

// --- app de verdade ---
// the helpers save pt-BR in config.json; this test starts without a saved language to check the system/default one
try { fs.unlinkSync(path.join(app.getPath('userData'), 'config.json')); } catch { /* none */ }
require('../src/main.js');
app.whenReady().then(async () => {
  try {
    const cfgFile = path.join(app.getPath('userData'), 'config.json');
    const savedLang = () => { try { return JSON.parse(fs.readFileSync(cfgFile, 'utf8')).lang; } catch { return undefined; } };
    await waitFor(() => BaseWindow.getAllWindows().length && BaseWindow.getAllWindows()[0].contentView.children.length >= 5, 15000);
    const win = BaseWindow.getAllWindows()[0];
    const views = () => win.contentView.children.filter((v) => v.webContents);
    const find = (re) => views().find((v) => re.test(v.webContents.getURL()));
    const text = (wc, js) => wc.executeJavaScript(js).catch(() => null);

    check(savedLang() === undefined, 'nada salvo na primeira execução (o idioma vem do sistema)');
    check(['en', 'pt-BR', 'es'].includes(i18n.getLang()), `idioma inicial válido: ${i18n.getLang()}`);

    // abre as Configurações pelo botão da barra e escolhe o espanhol
    const appBar = await waitFor(() => find(/toolbar\.html\?.*kind=app/), 8000) && find(/toolbar\.html\?.*kind=app/);
    await waitFor(async () => (await text(appBar.webContents, 'document.querySelectorAll("button").length')) > 3, 8000);
    await text(appBar.webContents, 'window.tb.action("settings")');
    const settingsWin = await waitFor(() => BrowserWindow.getAllWindows().some((w) => /settings\.html/.test(w.webContents.getURL())), 8000)
      && BrowserWindow.getAllWindows().find((w) => /settings\.html/.test(w.webContents.getURL()));
    check(!!settingsWin, 'janela de Configurações abre');
    await waitFor(async () => (await text(settingsWin.webContents, 'document.getElementById("lang")?.options.length')) === 3, 8000);
    check(await text(settingsWin.webContents, 'document.getElementById("lang").options.length') === 3, 'seletor de idioma com 3 idiomas');

    // parte de um idioma conhecido: o app ignora a escolha do idioma que já está ativo, então sai do inglês antes
    // (o idioma inicial depende do sistema onde o teste roda: o CI começa em inglês)
    if (i18n.getLang() === 'en') {
      await text(settingsWin.webContents, 'window.cfg.setLang("pt-BR")');
      await waitFor(() => i18n.getLang() === 'pt-BR');
    }
    await text(settingsWin.webContents, 'window.cfg.setLang("en")');
    check(await waitFor(() => i18n.getLang() === 'en' && savedLang() === 'en'), 'escolher inglês salva em config.json');
    check(await waitFor(async () => (await text(settingsWin.webContents, 'document.querySelector("h1").textContent')) === 'Settings', 8000), 'a janela de Configurações recarrega em inglês');
    await text(settingsWin.webContents, 'window.cfg.setLang("pt-BR")');
    check(await waitFor(() => i18n.getLang() === 'pt-BR' && savedLang() === 'pt-BR'), 'escolher pt-BR troca o idioma e salva em config.json');
    check(await waitFor(() => win.getTitle() === 'PokeIdle Multi'), 'título da janela segue o idioma');
    check(await waitFor(async () => (await text(settingsWin.webContents, 'document.querySelector("h1").textContent')) === 'Configurações', 8000), 'a janela de Configurações recarrega em pt-BR');
    check(await waitFor(async () => /Configurações/.test(await text(appBar.webContents, '[...document.querySelectorAll("button")].map((b) => b.title).join(" ")') ?? ''), 8000), 'a barra do app recarrega em pt-BR');
    check(await text(settingsWin.webContents, 'document.getElementById("lang").value') === 'pt-BR', 'o seletor mostra o idioma atual');

    await text(settingsWin.webContents, 'window.cfg.setLang("es")');
    check(await waitFor(async () => (await text(settingsWin.webContents, 'document.querySelector("h1").textContent')) === 'Configuración', 8000), 'troca para espanhol sem reiniciar');
    check(savedLang() === 'es', 'espanhol salvo em config.json');
    await text(settingsWin.webContents, 'window.cfg.setLang("en")');
    check(await waitFor(async () => (await text(settingsWin.webContents, 'document.querySelector("h1").textContent')) === 'Settings', 8000), 'volta ao inglês');
    await text(settingsWin.webContents, 'window.cfg.setLang("fr")');
    await sleep(300);
    check(i18n.getLang() === 'en' && savedLang() === 'en', 'idioma inválido é ignorado');
  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});
