# Alterações locais na extensão /hunt for PokeIdle

Versão de origem: 1.0.19 (Chrome Web Store). Ao atualizar a extensão, reaplicar o que está marcado com
`[multi-pokeidle-io]`:

- `src/atalho.js` (novo): atalho "espada ?" sobre a arte dos pokémon (mercado, coleção etc.). Listado em
  `manifest.json`, depois de `src/ui.js`.
- `src/ui.js`: `pkManual` (pokémon escolhido pelo atalho), `PIH.abrirParaPokemon`, posicionamento centralizado do
  painel e exceção do clique fora para o atalho. O clique fora só fecha o painel se `isTrusted`: o Auto-bola do app dispara
  `pointerdown`/`click` sintéticos nos caídos a cada ~1 s, o que fechava o painel sozinho fora do modo economia.
- `src/ui.css`: estilo do atalho e do painel aberto por ele.

O atalho depende de o app marcar a arte (`src/game-patch.js`, fora desta pasta).
- `src/ui.js`, `src/geo.js`: endurecimento apontado pela análise de código (CodeQL): campos do pokémon escapados antes
  de entrarem em `innerHTML`, preferências (`ordem`, `regiao`) validadas e `slug` recusado quando é chave especial
  (`__proto__`, `constructor`, `prototype`).
