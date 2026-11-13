// Testa a extensão de auto-captura contra uma página que imita o Mapa novo do jogo (local/test/fixture-map.html):
// lista + filtro Pokédex + dropdown de região.
// Captura semanal: o selo "já capturado" do jogo (lifetime) é ignorado; só vale o cache da semana.
// Fluxo esperado: Kanto do menor nível ao maior (sem as travadas) -> Johto -> Outland -> fim; depois do reset, tudo de novo.
// Hoenn (cadeado) e Sinnoh (em obra) não podem ser visitadas. Um clique recusado pela "trava de combate" é repetido.
const { app, sleep, check, finish, waitFor } = require('../../test/helpers');
const path = require('path');
const { BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { backgroundThrottling: false } });
  await win.loadFile(path.join(__dirname, 'fixture-map.html'));
  const logs = [];
  const ext = require('../autocatch.js')({
    getSlots: () => [{ id: 1, view: { webContents: win.webContents } }],
    sendLog: (e) => logs.push(e.text),
  });
  const f = ext.features().find((x) => x.id === 'autocatch');
  const game = (expr) => win.webContents.executeJavaScript(`window.__game.${expr}`);
  // simula a captura: marca o pokémon como capturado e avisa o contador que o gancho do WebSocket incrementaria
  const capture = async (slug) => {
    await win.webContents.executeJavaScript(`(() => {
      for (const r of Object.values(window.__game.data)) for (const m of r) if (m.slug === ${JSON.stringify(slug)}) m.cap = true;
      window.__acx.captured++;
    })()`);
  };

  try {
    check(!!f && f.isOn(1) === false, 'funcionalidade registrada e desligada por padrão');
    await game('bloquear = 1'); // o 1º clique é recusado (trava de combate): tem que tentar de novo sozinho
    f.set(1, true);
    check(f.isOn(1), 'liga na conta 1');

    const picked = () => game('picked');
    const pick = (n) => waitFor(async () => (await picked()).length >= n, 15000);

    check(await pick(1) && (await picked())[0] === 'k-capturado', `1º alvo = menor nível liberado de Kanto, mesmo já capturado antes (k-capturado): ${await picked()}`);
    check(await game('modo') === 'lista', 'passou o mapa para o modo Lista');
    check(await game('filtro') === '', 'filtro Pokédex ficou em "Todos"');
    check((await picked()).length === 1, 'o clique recusado pela trava de combate foi repetido (uma única escolha registrada)');
    await sleep(1500);
    check((await picked()).length === 1, 'sem captura nova, não troca de área');

    await capture('k-capturado');
    check(await pick(2) && (await picked())[1] === 'k-nv8', `depois de capturar, vai para o próximo (k-nv8): ${await picked()}`);
    await capture('k-nv8');
    check(await pick(3) && (await picked())[2] === 'k-nv12', `próximo (k-nv12): ${await picked()}`);
    await capture('k-nv12');
    check(await pick(4) && (await picked())[3] === 'k-nv30', `próximo (k-nv30): ${await picked()}`);
    await capture('k-nv30');
    check(await pick(5) && (await picked())[4] === 'j-capturado', `Kanto acabou -> Johto (j-capturado, já capturado antes mas não nesta semana): ${await picked()}`);
    await capture('j-capturado');
    check(await pick(6) && (await picked())[5] === 'j-nv20', `próximo (j-nv20): ${await picked()}`);
    await capture('j-nv20');
    check(await pick(7) && (await picked())[6] === 'o-nv150', `Johto acabou -> Outland (o-nv150): ${await picked()}`);
    await capture('o-nv150');

    check(await waitFor(() => !f.isOn(1), 15000), 'nada mais disponível: desliga sozinha');
    const p = await picked();
    check(!p.includes('h-nv40') && !p.includes('k-travado'), `não visitou região com cadeado nem área travada: ${p}`);
    check(await win.webContents.executeJavaScript('document.getElementById("modal").classList.contains("hidden")'), 'mapa fechado ao terminar');
    check(logs.some((l) => /nada mais disponível agora \(1 área/.test(l)), `log explica que sobrou área travada pelo nível: ${logs.filter((l) => /disponível|concluída/.test(l))}`);
    check(logs.some((l) => /capturado nesta semana: k-nv8/.test(l)), 'cada captura vira linha no log e entra no cache');
    const cacheFile = path.join(process.env.PKMULTI_TEST_DATA, 'autocatch-semana.json');
    const gravado = () => JSON.parse(require('fs').readFileSync(cacheFile, 'utf8'));
    check(Object.keys(gravado().contas.conta1).length === 7, `cache em disco com as 7 capturas da semana: ${Object.keys(gravado().contas.conta1)}`);
    check(!logs.some((l) => /erro/.test(l)), `nenhum erro logado: ${logs.filter((l) => /erro/.test(l))}`);
    check((await game('pickedNoCentro')).every(Boolean), `toda troca de área foi escolhida já DENTRO do Centro Pokémon: ${await game('pickedNoCentro')}`);
    const curas = await game('curasNoPick');
    check(curas.every((c, i) => c >= i + 1), `curou a equipe no Centro ANTES de cada nova área (curas acumuladas a cada escolha: ${curas})`);
    check(await game('irCentroCliques') === p.length, `usou o atalho Ir para o Centro uma vez por troca (${await game('irCentroCliques')} cliques, ${p.length} trocas)`);
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }

  // Reset semanal: zera o cache e a automação volta a capturar tudo, inclusive o que já tinha capturado
  try {
    const antes = (await game('picked')).length;
    ext.zerar();
    check(!require('fs').existsSync(path.join(process.env.PKMULTI_TEST_DATA, 'autocatch-semana.json')) || Object.keys(JSON.parse(require('fs').readFileSync(path.join(process.env.PKMULTI_TEST_DATA, 'autocatch-semana.json'), 'utf8')).contas).length === 0, 'reset esvazia o cache em disco');
    f.set(1, true);
    check(await waitFor(async () => (await game('picked')).length > antes, 15000) && (await game('picked'))[antes] === 'k-capturado', `depois do reset volta a caçar do começo (k-capturado): ${(await game('picked')).slice(antes)}`);
    f.set(1, false);
  } catch (err) {
    check(false, `erro inesperado (reset): ${err.stack || err}`);
  }

  // Se o jogo mudar o mapa de novo e a automação não achar os elementos, ela avisa — e NÃO dá a lista por concluída
  try {
    await win.webContents.executeJavaScript('document.getElementById("modal").classList.add("hidden"); document.querySelector(".menu-topo button").dataset.modal = "outra"');
    await sleep(2500); // deixa terminar o passo em andamento
    ext.zerar(); // sem alvo em andamento, senão a automação nem confere o mapa
    logs.length = 0;
    f.set(1, true);
    check(await waitFor(() => logs.some((l) => /erro/.test(l)), 8000), `UI desconhecida gera erro no log: ${logs.filter((l) => /erro/.test(l))}`);
    check(f.isOn(1), 'e continua ligada (não desliga achando que terminou)');
    f.set(1, false);
  } catch (err) {
    check(false, `erro inesperado (UI desconhecida): ${err.stack || err}`);
  }
  // Diagnóstico: grava a foto da tela em arquivo (para investigar o modo economia de energia)
  try {
    const fs = require('fs');
    const arq = path.join(app.getPath('userData'), 'autocatch-diagnostico.txt');
    const acao = f.actions.find((x) => /Diagnóstico/.test(x.label));
    check(!!acao, 'menu tem a ação de diagnóstico');
    acao.run(1);
    check(await waitFor(() => fs.existsSync(arq), 8000), 'diagnóstico grava o arquivo');
    const d = JSON.parse(fs.readFileSync(arq, 'utf8'))[0];
    check(d && d.conta === 1 && Array.isArray(d.menu) && d.controles && 'servidor' in d && typeof d.textoVisivel === 'string', 'diagnóstico traz menu, controles, texto e mensagens do servidor');
  } catch (err) {
    check(false, `erro inesperado (diagnóstico): ${err.stack || err}`);
  }
  finish();
});
