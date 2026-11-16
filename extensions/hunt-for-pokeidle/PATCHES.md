# Alterações locais na extensão /hunt for PokeIdle

Versão de origem: 1.0.19 (Chrome Web Store). Ao atualizar a extensão, reaplicar o que está marcado com
`[multi-pokeidle-io]`:

- `src/atalho.js` (novo): atalho "espada ?" sobre a arte dos pokémon (mercado, coleção etc.). Listado em
  `manifest.json`, depois de `src/ui.js`.
- `src/ui.js`: `pkManual` (pokémon escolhido pelo atalho), `PIH.abrirParaPokemon`, posicionamento centralizado do
  painel e exceção do clique fora para o atalho.
- `src/ui.css`: estilo do atalho e do painel aberto por ele.

O atalho depende de o app marcar a arte (`src/game-patch.js`, fora desta pasta).
