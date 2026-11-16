// A ponte da Shiny WishList. Os scripts que leem o jogo rodam dentro da página (world: MAIN), e a CSP dela
// (connect-src) barraria um fetch deles para o nosso site. Este roda no mundo isolado, fora dessa regra, e só busca
// um endereço fixo: a lista pública, sem cookie. É dado, não código: PIN novo não pede versão nova da extensão.
// O site ganhou domínio próprio em 11/2026; o pages.dev segue respondendo a API e fica de reserva, para a lista não
// sumir se o domínio novo falhar (DNS, certificado).
(function () {
  'use strict';
  const URLS_LISTA = ['https://pokeidleguide.io/api/wishlist', 'https://pokeidle-gg.pages.dev/api/wishlist'];

  const buscar = async (url) => {
    const r = await fetch(url, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  addEventListener('message', async (ev) => {
    if (ev.source !== window || ev.data?.tipo !== 'pih:wishlist:pedir') return;
    const responder = (conteudo) => postMessage({ tipo: 'pih:wishlist:lista', id: ev.data.id, ...conteudo }, location.origin);
    let erro;
    for (const url of URLS_LISTA) {
      try { return responder({ dados: await buscar(url) }); } catch (e) { erro = e; }
    }
    responder({ erro: String(erro?.message ?? erro) });
  });
})();
