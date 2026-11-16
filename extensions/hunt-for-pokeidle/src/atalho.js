// [multi-pokeidle-io] Atalho "espada com ?" sobre a arte dos pokémon (mercado, coleção, listas...): abre o painel
// "Onde caçar?" da /hunt para aquele pokémon, não só para o que está em campo.
//
// O jogo não deixa o pokémon no DOM; quem o anota em cada arte é o app (src/game-patch.js), com `el.__pk` e o atributo
// `data-pk-marca` (tamanho da arte). Sem essa marcação (app fora do multi-pokeidle-io, ou jogo mudou), nada aparece.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  const MIN_PX = 40; // artes menores (ícones de lista) ficam sem o atalho
  const ICONE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 20l2.2-4.2L17 5l2 2L8.2 17.8 4 20zm13.2-15.2L19 3l2 2-1.8 1.8-2-2z" fill="currentColor"/></svg><b>?</b>';

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
