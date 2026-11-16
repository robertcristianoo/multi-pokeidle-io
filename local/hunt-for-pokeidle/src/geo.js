// O que a extensão aprende enquanto você joga.
//
// MAPA (entra no cálculo): o servidor diz, no `campo.init`, de qual mapa vem a geografia da hunt —
// muitas hunts dividem um mapa. Guardamos o mapa de cada hunt em que você entra; o motor usa o tempo
// do simulador do jogo para esse mapa (ritmo.js) quando a tabela ainda não conhece a hunt, como uma
// hunt criada depois do export de que a tabela saiu.
//
// RITMO (só referência): os abates/h de verdade por hunt e por pokémon. NÃO muda o ranking —
// senão a hunt em que você está caçando ganharia ou perderia posição só por isso.
//
// A geometria das ondas cheias (a distância até cada selvagem novo), que entrava no cálculo até a
// versão 1.0.7, saiu: o ritmo das hunts em bandos é do mapa e foi medido em jogo (ver engine.js).
// As amostras antigas são apagadas do banco; o ritmo, medido desde 28/10/2026, fica.
//
// Tudo fica no localStorage do pokeidle.io, numa chave só da extensão.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  const CHAVE = 'pokeidle-hunt:geo:v4';
  const ANTIGAS = ['pokeidle-hunt:geo:v3', 'pokeidle-hunt:geo:v2', 'pokeidle-hunt:geo:v1'];

  let banco = ler();
  function ler() {
    try {
      for (const chave of ANTIGAS) localStorage.removeItem?.(chave);
      const b = JSON.parse(localStorage.getItem(CHAVE)) ?? { hunts: {} };
      for (const h of Object.values(b.hunts ?? {})) { delete h.amostras; delete h.medidoEm; }
      return b;
    } catch { return { hunts: {} }; }
  }
  let gravarTimer = null;
  function gravar() {
    clearTimeout(gravarTimer);
    gravarTimer = setTimeout(() => {
      try { localStorage.setItem(CHAVE, JSON.stringify(banco)); } catch { /* cota cheia: segue sem */ }
    }, 2000);
  }

  // O pacote vem com chaves curtas (ver `mesclar` em campo.mjs do jogo): `s` slot, `x` morto.
  // Boneco de XP Share, pet em treino, NPCs e treinadores não são selvagens.
  const naoSelvagem = (m) => m.bn || m.ti !== undefined || m.cura || m.tm || m.depot || m.tr;

  // ---- sessão atual -----------------------------------------------------------------------
  // { slug, pkId, inicio, abates, slots: Map(slot → vivo?) }
  let sessao = null;

  function fecharSessao() {
    if (!sessao) return;
    const seg = (Date.now() - sessao.inicio) / 1000;
    if (seg >= 60 && sessao.abates > 0) {
      const h = (banco.hunts[sessao.slug] ??= {});
      const r = ((h.ritmo ??= {})[sessao.pkId ?? '?'] ??= { abates: 0, seg: 0 });
      r.abates += sessao.abates;
      r.seg += seg;
      gravar();
    }
    sessao = null;
  }

  // O ritmo é guardado por pokémon. Os discos (AoE, TM Elemental) não entram na conta desde
  // 18/10/2026, então também não separam a medição.
  const chaveDoPokemon = (pk) => (pk?.id ? String(pk.id) : null);
  let pkAtivoId = null;
  PIH.on?.('estado', (eu) => {
    const chave = chaveDoPokemon(eu?.pokemons?.find((p) => p.id === eu.activeId));
    if (chave !== pkAtivoId) {
      fecharSessao();
      pkAtivoId = chave;
    }
  });

  PIH.on?.('campo.init', (m) => {
    fecharSessao();
    if (!m?.slug || m.centro || m.pvp || m.casa != null) return;
    if (m.mapa && banco.hunts[m.slug]?.mapa !== m.mapa) {
      (banco.hunts[m.slug] ??= {}).mapa = m.mapa;
      gravar();
    }
    sessao = { slug: m.slug, pkId: pkAtivoId, inicio: Date.now(), abates: 0, slots: new Map() };
    for (const x of m.mobs ?? []) if (!naoSelvagem(x)) sessao.slots.set(x.s, !x.x);
  });

  PIH.on?.('campo', (m) => {
    const s = sessao;
    if (!s) return;
    for (const x of m.mobs ?? []) {
      if (naoSelvagem(x)) continue;
      const vivoAntes = s.slots.get(x.s);
      if (x.x) {
        if (vivoAntes) s.abates++;
        s.slots.set(x.s, false);
      } else if (!s.slots.has(x.s) || (vivoAntes === false && x.x === false)) {
        s.slots.set(x.s, true); // slot novo, ou um corpo que voltou à vida
      }
    }
    for (const slot of m.fora ?? []) s.slots.delete(slot);
  });

  addEventListener('pagehide', fecharSessao);

  PIH.geo = {
    /** O mapa que o servidor mandou quando você entrou nesta hunt, ou null. */
    mapaDa: (slug) => banco.hunts[slug]?.mapa ?? null,
    chaveDoPokemon,
    /** Abates/h medidos com este pokémon nesta hunt (só com 10+ min acumulados). Só referência. */
    ritmoMedido(slug, chave) {
      const r = banco.hunts[slug]?.ritmo?.[chave];
      return r && r.seg >= 600 ? r.abates * 3600 / r.seg : null;
    },
    /** Em quantas hunts você já entrou desde que a extensão guarda o mapa. */
    huntsComMapa: () => Object.values(banco.hunts).filter((h) => h.mapa).length,
  };
})(globalThis);
