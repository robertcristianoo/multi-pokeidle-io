// [multi-pokeidle-io] Atalho "espada com ?" sobre a arte dos pokémon (mercado, coleção, listas...): abre o painel
// "Onde caçar?" da /hunt para aquele pokémon, não só para o que está em campo.
//
// O jogo não deixa o pokémon no DOM; quem o anota em cada arte é o app (src/game-patch.js), com `el.__pk` e o atributo
// `data-pk-marca` (tamanho da arte). Sem essa marcação (app fora do multi-pokeidle-io, ou jogo mudou), nada aparece.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  const MIN_PX = 40; // artes menores (ícones de lista) ficam sem o atalho
  // duas espadas cruzadas (lâmina, guarda e cabo de cada uma) + "?"
  const ICONE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path stroke-width="2" d="M4 4l11 11M20 4L9 15"/><path stroke-width="2" d="M12.3 17.7l5.4-5.4M11.7 17.7L6.3 12.3"/><path stroke-width="2.6" d="M16 16l3.5 3.5M8 16l-3.5 3.5"/></svg><b>?</b>';

  function pokemonDaArte(el) {
    const pk = el.__pk;
    // só vale com o pokémon completo (nível e stats): as listas por espécie do mercado trazem só a espécie
    return pk && typeof pk === 'object' && pk.speciesId != null && pk.stats && pk.level != null ? pk : null;
  }

  function enfeitar(el) {
    if (el.__pihAtalho) return;
    el.__pihAtalho = true;
    if (Number(el.getAttribute('data-pk-marca')) < MIN_PX) return;
    if (!pokemonDaArte(el)) return;
    const pai = el.parentElement;
    if (!pai || pai.closest('#p-ativo, .pih-painel') || pai.querySelector(':scope > .pih-atalho')) return;
    if (getComputedStyle(pai).position === 'static') pai.style.position = 'relative';
    const b = document.createElement('button');
    b.type = 'button';
    // tiles pequenos (coleção/depot no modo economia, ~55 px) levam a versão mini, no canto de cima
    b.className = pai.offsetWidth && pai.offsetWidth < 90 ? 'pih-atalho pih-mini' : 'pih-atalho';
    b.innerHTML = ICONE;
    b.title = 'Onde caçar com este pokémon? (/hunt)';
    b.setAttribute('aria-label', b.title);
    const abrir = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const pk = pokemonDaArte(el);
      if (pk && PIH.abrirParaPokemon) PIH.abrirParaPokemon(pk);
    };
    b.addEventListener('click', abrir);
    for (const t of ['pointerdown', 'mousedown']) b.addEventListener(t, (ev) => ev.stopPropagation()); // não abre a ficha nem arrasta o card
    pai.append(b);
  }

  function varrer(no) {
    if (!no || no.nodeType !== 1) return;
    if (no.hasAttribute?.('data-pk-marca')) enfeitar(no);
    for (const el of no.querySelectorAll?.('[data-pk-marca]') ?? []) enfeitar(el);
  }

  function iniciar() {
    varrer(document.body);
    new MutationObserver((muts) => { for (const m of muts) for (const n of m.addedNodes) varrer(n); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) iniciar();
  else addEventListener('DOMContentLoaded', iniciar, { once: true });
})(globalThis);
