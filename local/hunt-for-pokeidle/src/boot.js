// O "pronto" dos módulos do jogo. Na loja, quem os entrega é o pacote embutido (jogo-bundle.js,
// gerado por scripts/vendor-jogo.mjs); no userscript, um carregador que os importa ao vivo da
// página. Os dois chamam `definirModulosDoJogo`; game.js e hook.js esperam por `jogoPronto`.
// Nada aqui baixa código: é só o ponto de encontro, para o Manifest V3 não ver import remoto.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  let resolver;
  PIH.jogoPronto = new Promise((r) => { resolver = r; });
  PIH.definirModulosDoJogo = (mod, criarMescladorDeEstado) => {
    PIH.modulosDoJogo = mod;
    PIH.criarMescladorDeEstado = criarMescladorDeEstado;
    resolver(mod);
  };
})(globalThis);
