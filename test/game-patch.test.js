// Marca da arte dos pokémon (src/game-patch.js) e atalho "espada ?" da /hunt (extensions/hunt-for-pokeidle/src/atalho.js).
//  1. patchApp: renomeia a função do jogo, anota a arte com o pokémon e recusa quando o ponto de encaixe sumiu;
//  2. interceptação: só o app.js de pokeidle.io é servido com a marcação (o restante do tráfego não é tocado);
//  3. atalho: aparece sobre as artes grandes marcadas, abre o painel com o pokémon certo e não aparece nas pequenas.
const { app, check, finish, waitFor } = require('./helpers');
const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');
const { BaseWindow, WebContentsView } = require('electron');
const { createGamePatch, patchApp } = require('../src/game-patch');

const JOGO = `// jogo de mentira
function spritePokemon(k, px = 40, { parado = false } = {}) {
  const el = document.createElement('canvas');
  el.dataset.looktype = String(k?.looktype ?? 0);
  return el;
}
function atualizarTilePkCofre(tile, x) { tile.dataset.atualizado = '1'; }
globalThis.__jogoCarregado = true;
`;

app.whenReady().then(async () => {
  try {
    // 1) patchApp
    const out = patchApp(JOGO);
    check(!!out && out.includes('function __spritePokemonOriginal(') && out.includes('function spritePokemon(...a)'), 'patchApp renomeia a função e põe o invólucro');
    check(patchApp(out) === null, 'patchApp não aplica duas vezes');
    check(patchApp('function outra() {}') === null, 'patchApp devolve null sem o ponto de encaixe');
    check(patchApp(`${JOGO}\n${JOGO}`) === null, 'patchApp recusa declaração duplicada (jogo mudou)');
    const ctx = { document: { createElement: () => ({ dataset: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }) }, globalThis: {} };
    vm.createContext(ctx);
    vm.runInContext(out.replace('globalThis.__jogoCarregado = true;', '') + '\nthis.r = spritePokemon({ speciesId: 7, looktype: 3 }, 64);', ctx);
    check(ctx.r?.__pk?.speciesId === 7 && ctx.r.attrs['data-pk-marca'] === '64', 'a arte sai com o pokémon e o tamanho anotados');
    check(ctx.r.dataset.looktype === '3', 'o resultado da função original é preservado');
    check(out.includes('function __atualizarTilePkCofreOriginal(') && out.includes('globalThis.__pkMarcaAtiva = true'), 'também marca os tiles do modo economia');
    const semTile = patchApp(JOGO.replace('function atualizarTilePkCofre', 'function outraCoisa'));
    check(!!semTile && !semTile.includes('__atualizarTilePkCofreOriginal'), 'sem o ponto opcional dos tiles, só o da arte é aplicado');

    // 2) interceptação pelo DevTools: servidor local fazendo o papel de pokeidle.io/app.js
    const srv = http.createServer((req, res) => {
      if (req.url.startsWith('/app.js')) { res.setHeader('content-type', 'text/javascript'); res.end(JOGO); return; }
      res.setHeader('content-type', 'text/html');
      res.end('<!doctype html><title>t</title><script src="/app.js?v=1"></script>');
    });
    await new Promise((r) => srv.listen(0, '127.0.0.1', r));
    const port = srv.address().port;
    // o padrão do módulo mira pokeidle.io; aqui só o formato do tratamento importa, então confere o padrão e o caminho de volta
    const win = new BaseWindow({ show: false, width: 600, height: 400 });
    const mk = (wanted) => {
      const v = new WebContentsView({ webPreferences: { partition: `gp-${wanted}-${Date.now()}` } });
      win.contentView.addChildView(v);
      return v;
    };
    // sem interceptação para um host que não é o do jogo: o app.js segue intocado
    const v1 = mk('a');
    createGamePatch({ isWanted: () => true }).attach(1, v1);
    await new Promise((r) => { v1.webContents.once('did-finish-load', r); v1.webContents.loadURL(`http://127.0.0.1:${port}/`); });
    check(await v1.webContents.executeJavaScript('globalThis.__jogoCarregado === true && globalThis.__pkMarcaAtiva === undefined'), 'tráfego fora de pokeidle.io/app.js não é alterado');
    srv.close();

    // 3) atalho sobre a arte
    const v2 = mk('b');
    await new Promise((r) => { v2.webContents.once('did-finish-load', r); v2.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><title>atalho</title><body></body>')); });
    const atalhoJs = fs.readFileSync(path.join(__dirname, '..', 'extensions', 'hunt-for-pokeidle', 'src', 'atalho.js'), 'utf8');
    await v2.webContents.executeJavaScript(`
      globalThis.__aberto = [];
      (globalThis.__pokeidleHunt ??= {}).abrirParaPokemon = (pk) => globalThis.__aberto.push(pk.speciesId);
      const grande = document.createElement('canvas'); grande.__pk = { speciesId: 25, nome: 'Pikachu', level: 50, stats: { hp: 1 } }; grande.setAttribute('data-pk-marca', '64');
      const pequena = document.createElement('canvas'); pequena.__pk = { speciesId: 4 }; pequena.setAttribute('data-pk-marca', '22');
      const semMarca = document.createElement('canvas');
      const soEspecie = document.createElement('canvas'); soEspecie.__pk = { speciesId: 7, nome: 'Squirtle' }; soEspecie.setAttribute('data-pk-marca', '64');
      for (const [id, el] of [['g', grande], ['p', pequena], ['s', semMarca], ['e', soEspecie]]) { const d = document.createElement('div'); d.id = id; d.append(el); document.body.append(d); }
      ${atalhoJs}
      true;`);
    check(await waitFor(() => v2.webContents.executeJavaScript('!!document.querySelector("#g .pih-atalho")'), 3000), 'arte grande marcada ganha o atalho');
    check(await v2.webContents.executeJavaScript('!document.querySelector("#p .pih-atalho") && !document.querySelector("#s .pih-atalho") && !document.querySelector("#e .pih-atalho")'), 'arte pequena, sem marca ou só com a espécie (sem nível e stats) fica sem atalho');
    await v2.webContents.executeJavaScript('document.querySelector("#g .pih-atalho").click()');
    check(await v2.webContents.executeJavaScript('JSON.stringify(globalThis.__aberto)') === '[25]', 'o clique abre o painel com o pokémon do card');
    // arte criada depois (card que redesenha) também ganha o atalho
    await v2.webContents.executeJavaScript(`(() => { const d = document.createElement('div'); d.id = 'n'; const c = document.createElement('canvas'); c.__pk = { speciesId: 9, level: 5, stats: { hp: 1 } }; c.setAttribute('data-pk-marca', '64'); d.append(c); document.body.append(d); })()`);
    check(await waitFor(() => v2.webContents.executeJavaScript('!!document.querySelector("#n .pih-atalho")'), 3000), 'card criado depois também ganha o atalho');

  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});
