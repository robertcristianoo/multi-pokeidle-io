// Tudo o que vem do jogo, sempre da versão no ar.
//
// Nada de tabela copiada: as fórmulas são os próprios módulos `shared/` do pokeidle.io,
// importados da página, e o catálogo de espécies é remontado a partir dos mesmos JSONs e na
// mesma ordem que o cliente oficial usa (`carregarCatalogoEspecies` no app.js deles). Quando
// o jogo muda um golpe, um cooldown ou uma curva de XP, a extensão muda junto no próximo F5.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});

  const SEM_CACHE = { cache: 'no-cache' };
  const url = (caminho) => `${location.origin}/${caminho}`;
  const json = (caminho, opcional = false) =>
    fetch(url(caminho), SEM_CACHE).then((r) => {
      if (r.ok) return r.json();
      if (opcional) return null;
      throw new Error(`${caminho}: HTTP ${r.status}`);
    }).catch((err) => { if (opcional) return null; throw err; });

  /** A versão do cliente, lida da folha de estilo (`estilo.css?v=1.233.0`). */
  PIH.versaoDoJogo = () => {
    const link = document.querySelector('link[href*="estilo.css?v="]');
    return link?.getAttribute('href')?.split('v=')[1] ?? null;
  };

  /** Os módulos do jogo que a extensão usa — a mesma lista serve aos testes (scripts/). */
  const MODULOS = {
    cooldown: 'shared/cooldown-golpes.mjs',
    especiais: 'shared/golpes-especiais.mjs',
    planilhas: 'shared/golpes-planilhas.mjs',
    outland: 'shared/outland.mjs',
    baseOutland: 'shared/herdar-base-outland.mjs',
    golpesOrre: 'shared/herdar-golpes-orre.mjs',
    megas: 'shared/megas.mjs',
    evolucoes: 'shared/evolucoes-cruzadas.mjs',
    recompensa: 'shared/recompensa-hunt.mjs',
    ajustes: 'shared/ajustes-especie-espelho.mjs',
    analyser: 'hunt-analyser.mjs',
    // O pódio dos ginásios (+25/10/5% de dano na hunt, jogo 1.377.0): a regra é a do jogo.
    ginasios: 'shared/ginasios.mjs',
    // O dia sazonal (desde 20/10/2026): a tipagem do dia fica 2× mais forte nas hunts do Mapa.
    sazonal: 'shared/dia-sazonal.mjs',
    // A chance de captura pelo estágio evolutivo (desde 17/10/2026) e o Fragmento de Ovo Shiny (Unova em diante).
    captura: 'shared/captura-degrau.mjs',
    ovoShiny: 'shared/ovo-shiny.mjs',
  };
  const CATALOGOS = {
    cr: 'assets/creatures.json',
    novos: 'assets/creatures-novos.json',
    outlandNovos: 'assets/creatures-outland-novos.json',
    formas: 'assets/creatures-formas.json',
    overrides: 'assets/creatures-audit-overrides.json',
  };
  PIH.MODULOS_DO_JOGO = MODULOS;
  PIH.CATALOGOS_DO_JOGO = CATALOGOS;

  // Os módulos do jogo vêm do pacote (jogo-bundle.js) ou do carregador do userscript, via boot.js —
  // nunca de um import remoto, que o Manifest V3 proíbe. Os catálogos (JSON) seguem buscados ao vivo.
  const carregarModulos = () => PIH.jogoPronto;

  /**
   * O catálogo de espécies como o cliente monta — só os passos que mexem em combate:
   * stats-base, tipos e golpes. Evolução, teto de captura e valor de mercado ficam de fora.
   */
  function montarCatalogo(mod, fontes) {
    const { cr, novos, outlandNovos, formas, overrides } = fontes;
    const lista = [...(cr?.creatures ?? [])];
    if (novos?.creatures?.length) lista.push(...novos.creatures);
    if (outlandNovos?.creatures?.length) lista.push(...outlandNovos.creatures);
    // As formas (Heat Rotom, Castform Rainy, Alolan…) têm ficha própria e hunts próprias desde a
    // 1.31x; entram na mesma lista e no mesmo ponto do cliente, antes do remap e das planilhas.
    if (formas?.creatures?.length) lista.push(...formas.creatures);
    mod.outland.aplicarRemapOutlandLista(lista);

    for (const o of overrides?.overrides ?? []) {
      const c = lista.find((x) => x.pokeId === o.pokeId);
      if (!c) continue;
      for (const k of ['baseHp', 'baseAtk', 'baseDef', 'baseSpAtk', 'baseSpDef', 'baseSpeed']) {
        if (typeof o[k] === 'number') c[k] = o[k];
      }
      if (Array.isArray(o.attacks)) c.attacks = o.attacks.map((a) => ({ ...a }));
    }

    // A ordem dos tipos que o espelho trouxe trocada (Lucario, jogo 1.408): antes de tudo que lê o tipo, como o cliente.
    mod.ajustes?.aplicarAjustesTipos?.((id) => lista.filter((c) => c.pokeId === id));
    mod.planilhas.aplicarGolpesDasPlanilhas((id) => lista.filter((c) => c.pokeId === id));
    mod.baseOutland.herdarBaseOutland(lista);
    // Cadeias truncadas antes da injeção dos golpes de 600: é o que tira o ultimate de quem
    // deixou de ser última evolução (Vigoroth, Shelgon), igual ao servidor.
    mod.evolucoes.aplicarCadeiasTruncadas(lista);
    mod.evolucoes.normalizarEvolveLevel600(lista);
    // Os ajustes de huntLevel por cima do espelho (Rhydon, Lucario, Smeargle…) mudam o XP e o
    // ouro por abate dessas espécies: o cliente aplica aqui, nós também.
    mod.ajustes?.aplicarAjustesHuntLevel?.((id) => lista.find((c) => c.pokeId === id));

    const especies = new Map();
    for (const c of lista) {
      if (mod.outland.isEspelhoFantasmaPokeId(c.pokeId)) continue;
      mod.especiais.injetarGolpesEspeciais(c);
      especies.set(c.pokeId, c);
    }
    mod.golpesOrre.herdarGolpesOrre(lista);
    for (const mega of mod.megas.criarEspeciesMega(lista)) especies.set(mega.pokeId, mega);
    return especies;
  }

  // Para os testes montarem o mesmo catálogo fora do navegador.
  PIH._montarCatalogo = montarCatalogo;

  let promessa = null;
  /** Carrega uma vez por página; as chamadas seguintes recebem o mesmo resultado. */
  PIH.carregarJogo = () => (promessa ??= (async () => {
    const inicio = performance.now();
    const [mod, cr, novos, outlandNovos, formas, overrides] = await Promise.all([
      carregarModulos(),
      json(CATALOGOS.cr),
      json(CATALOGOS.novos, true),
      json(CATALOGOS.outlandNovos, true),
      json(CATALOGOS.formas, true),
      json(CATALOGOS.overrides, true),
    ]);
    const especies = montarCatalogo(mod, { cr, novos, outlandNovos, formas, overrides });
    return {
      mod,
      especies,
      versao: PIH.versaoDoJogo(),
      msCarga: Math.round(performance.now() - inicio),
    };
  })().catch((err) => { promessa = null; throw err; }));
})(globalThis);
