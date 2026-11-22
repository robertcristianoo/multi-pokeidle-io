// GERADO por scripts/vendor-jogo.mjs — NÃO EDITAR. Os módulos do jogo embutidos (sem import remoto).
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // tests/.cache/shared/cooldown-golpes.mjs
  var cooldown_golpes_exports = {};
  __export(cooldown_golpes_exports, {
    COOLDOWN_600_MS: () => COOLDOWN_600_MS,
    COOLDOWN_MEGA_MS: () => COOLDOWN_MEGA_MS,
    PODER_MINIMO: () => PODER_MINIMO,
    SPEED_POTENCIAL_TETO_PCT: () => SPEED_POTENCIAL_TETO_PCT,
    aplicarCurvaNoGolpe: () => aplicarCurvaNoGolpe,
    cooldownDoPoder: () => cooldownDoPoder,
    cooldownGolpeComSpeed: () => cooldownGolpeComSpeed,
    descontoDoSpeedPct: () => descontoDoSpeedPct,
    poderNormalizado: () => poderNormalizado,
    potencialDoSpeed: () => potencialDoSpeed
  });
  var PODER_MINIMO = 15;
  var PODER_JOELHO = 100;
  var COOLDOWN_600_MS = 6e4;
  var COOLDOWN_MEGA_MS = 3e4;
  function poderNormalizado(power) {
    const p = Number(power);
    return Number.isFinite(p) && p > PODER_MINIMO ? p : PODER_MINIMO;
  }
  function cooldownDoPoder(power) {
    const p = poderNormalizado(power);
    const seg = p <= PODER_JOELHO ? 10 + (p - PODER_MINIMO) * 20 / (PODER_JOELHO - PODER_MINIMO) : 30 + (p - PODER_JOELHO) * 30 / (600 - PODER_JOELHO);
    return Math.round(seg * 10) * 100;
  }
  function aplicarCurvaNoGolpe(a) {
    if (!a) return false;
    const poder = poderNormalizado(a.power);
    const cd = cooldownDoPoder(poder);
    if (a.power === poder && a.cooldownMs === cd) return false;
    a.power = poder;
    a.cooldownMs = cd;
    return true;
  }
  var SPEED_POTENCIAL_TETO_PCT = 7;
  var SPEED_JOELHO = 120;
  var ivDoSpeed = (iv) => Math.min(32, Math.max(1, Math.round(Number(iv) || 1)));
  function potencialDoSpeed(speedBase) {
    const s = Math.max(0, Number(speedBase) || 0);
    const pct = s <= SPEED_JOELHO ? s / 20 : 6 + (s - SPEED_JOELHO) / 40;
    return Math.min(SPEED_POTENCIAL_TETO_PCT, pct);
  }
  function descontoDoSpeedPct(speedBase, ivSpeed) {
    return potencialDoSpeed(speedBase) * (ivDoSpeed(ivSpeed) / 32);
  }
  function cooldownGolpeComSpeed(cooldownMs, speedBase, ivSpeed) {
    const base = Math.max(0, Number(cooldownMs) || 0);
    if (base <= 0) return base;
    return Math.round(base * (1 - descontoDoSpeedPct(speedBase, ivSpeed) / 100));
  }

  // tests/.cache/shared/golpes-especiais.mjs
  var golpes_especiais_exports = {};
  __export(golpes_especiais_exports, {
    GOLPE_600_POR_TIPO: () => GOLPE_600_POR_TIPO,
    GOLPE_600_POR_TIPO_B: () => GOLPE_600_POR_TIPO_B,
    GOLPE_600_RESERVA: () => GOLPE_600_RESERVA,
    TIPOS_ELEMENTO: () => TIPOS_ELEMENTO,
    dexDe: () => dexDe,
    ehUltimaEvolucao: () => ehUltimaEvolucao,
    elegivelParaGolpeEspecial: () => elegivelParaGolpeEspecial,
    fixarCooldownGolpe600: () => fixarCooldownGolpe600,
    golpesDaFicha: () => golpesDaFicha,
    injetarGolpesEspeciais: () => injetarGolpesEspeciais,
    limparGolpesQuebrados: () => limparGolpesQuebrados,
    temGolpe600DoTipo: () => temGolpe600DoTipo
  });

  // tests/.cache/shared/outland.mjs
  var outland_exports = {};
  __export(outland_exports, {
    OUTLAND_DEX_BASE: () => OUTLAND_DEX_BASE,
    OUTLAND_POKE_LEGADO_MAX: () => OUTLAND_POKE_LEGADO_MAX,
    OUTLAND_POKE_LEGADO_MIN: () => OUTLAND_POKE_LEGADO_MIN,
    OUTLAND_POKE_MAX: () => OUTLAND_POKE_MAX,
    OUTLAND_POKE_MIN: () => OUTLAND_POKE_MIN,
    OUTLAND_POKE_REMAP_OFFSET: () => OUTLAND_POKE_REMAP_OFFSET,
    aplicarRemapOutlandLista: () => aplicarRemapOutlandLista,
    dexChaveOutland: () => dexChaveOutland,
    isEspelhoFantasmaPokeId: () => isEspelhoFantasmaPokeId,
    isOutlandPokeId: () => isOutlandPokeId,
    isOutlandPokeIdLegado: () => isOutlandPokeIdLegado,
    montarOutlandDex: () => montarOutlandDex,
    montarOutlandDexLegado48: () => montarOutlandDexLegado48,
    remapOutlandPokeId: () => remapOutlandPokeId
  });
  var OUTLAND_DEX_BASE = 2001;
  var OUTLAND_POKE_MIN = 2001;
  var OUTLAND_POKE_MAX = 2059;
  var OUTLAND_POKE_LEGADO_MIN = 10501;
  var OUTLAND_POKE_LEGADO_MAX = 10548;
  var OUTLAND_POKE_REMAP_OFFSET = OUTLAND_POKE_LEGADO_MIN - OUTLAND_POKE_MIN;
  function isOutlandPokeId(pokeId) {
    const id = Number(pokeId);
    return id >= OUTLAND_POKE_MIN && id < OUTLAND_POKE_MAX;
  }
  function isOutlandPokeIdLegado(pokeId) {
    const id = Number(pokeId);
    return id >= OUTLAND_POKE_LEGADO_MIN && id < OUTLAND_POKE_LEGADO_MAX;
  }
  function remapOutlandPokeId(pokeId) {
    const id = Number(pokeId);
    if (!Number.isFinite(id)) return pokeId;
    if (isOutlandPokeIdLegado(id)) return id - OUTLAND_POKE_REMAP_OFFSET;
    return id;
  }
  function isEspelhoFantasmaPokeId(pokeId) {
    const id = Number(pokeId);
    return id >= 1e4 && id < OUTLAND_POKE_LEGADO_MIN;
  }
  function montarOutlandDex(especiesMap) {
    const lista = [...especiesMap.values()].filter((e) => isOutlandPokeId(e.pokeId)).sort((a, b) => a.pokeId - b.pokeId);
    const pokeToDex = {};
    const dexToPoke = {};
    for (const e of lista) {
      pokeToDex[e.pokeId] = e.pokeId;
      dexToPoke[e.pokeId] = e.pokeId;
    }
    const total = lista.length;
    return {
      pokeToDex,
      dexToPoke,
      total,
      min: OUTLAND_DEX_BASE,
      max: total ? OUTLAND_DEX_BASE + total - 1 : OUTLAND_DEX_BASE
    };
  }
  function dexChaveOutland(pokeId) {
    return isOutlandPokeId(pokeId) ? pokeId : null;
  }
  function montarOutlandDexLegado48(_speciesMap) {
    const dexToPoke = {};
    for (let i = 0; i < 47; i++) {
      dexToPoke[OUTLAND_DEX_BASE + i] = OUTLAND_POKE_LEGADO_MIN + i;
    }
    return dexToPoke;
  }
  function aplicarRemapOutlandLista(lista) {
    for (const c of lista) {
      if (isOutlandPokeIdLegado(c.pokeId)) c.pokeId = remapOutlandPokeId(c.pokeId);
      if (c.evolvesToId && isOutlandPokeIdLegado(c.evolvesToId)) {
        c.evolvesToId = remapOutlandPokeId(c.evolvesToId);
      }
    }
  }

  // tests/.cache/shared/golpes-especiais.mjs
  var GOLPE_600_POR_TIPO = {
    GRASS: { name: "Petal Bloom", power: 600, type: "GRASS", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    WATER: { name: "Cyclonic Tide", power: 600, type: "WATER", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    FIRE: { name: "Ignition Point", power: 600, type: "FIRE", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    FLYING: { name: "Massive Hurricane", power: 600, type: "FLYING", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    BUG: { name: "Hive Crush", power: 600, type: "BUG", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    POISON: { name: "Toxic Deluge", power: 600, type: "POISON", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    ELECTRIC: { name: "Static Overload", power: 600, type: "ELECTRIC", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    GROUND: { name: "Crossing Fissure", power: 600, type: "GROUND", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FIGHTING: { name: "Meteor Fists", power: 600, type: "FIGHTING", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    PSYCHIC: { name: "Mental Singularity", power: 600, type: "PSYCHIC", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    ROCK: { name: "Crumbling Rain", power: 600, type: "ROCK", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    GHOST: { name: "Untold Nightmare", power: 600, type: "GHOST", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    ICE: { name: "Ice Time", power: 600, type: "ICE", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    DARK: { name: "Endless Hollow", power: 600, type: "DARK", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    STEEL: { name: "Alloy Breaker", power: 600, type: "STEEL", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    DRAGON: { name: "Eternal Dragon", power: 600, type: "DRAGON", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    FAIRY: { name: "Starlight Charm", power: 600, type: "FAIRY", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    NORMAL: { name: "Ultimate Force", power: 600, type: "NORMAL", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS }
  };
  var GOLPE_600_POR_TIPO_B = {
    NORMAL: { name: "Giga Impact", power: 600, type: "NORMAL", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FIRE: { name: "Blast Burn", power: 600, type: "FIRE", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    WATER: { name: "Hydro Cannon", power: 600, type: "WATER", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    GRASS: { name: "Frenzy Plant", power: 600, type: "GRASS", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    ELECTRIC: { name: "Bolt Strike", power: 600, type: "ELECTRIC", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    ICE: { name: "Glacial Lance", power: 600, type: "ICE", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FIGHTING: { name: "Meteor Assault", power: 600, type: "FIGHTING", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    POISON: { name: "Gunk Shot", power: 600, type: "POISON", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    GROUND: { name: "Precipice Blades", power: 600, type: "GROUND", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FLYING: { name: "Sky Attack", power: 600, type: "FLYING", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    PSYCHIC: { name: "Prismatic Laser", power: 600, type: "PSYCHIC", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    BUG: { name: "Megahorn", power: 600, type: "BUG", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    ROCK: { name: "Rock Wrecker", power: 600, type: "ROCK", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    GHOST: { name: "Astral Barrage", power: 600, type: "GHOST", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    DRAGON: { name: "Roar of Time", power: 600, type: "DRAGON", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    DARK: { name: "Wicked Blow", power: 600, type: "DARK", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    STEEL: { name: "Steel Beam", power: 600, type: "STEEL", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    FAIRY: { name: "Light of Ruin", power: 600, type: "FAIRY", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS }
  };
  var GOLPE_600_RESERVA = {
    NORMAL: { name: "Blood Moon", power: 600, type: "NORMAL", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FIRE: { name: "Mind Blown", power: 600, type: "FIRE", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    WATER: { name: "Steam Eruption", power: 600, type: "WATER", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    GRASS: { name: "Chloroblast", power: 600, type: "GRASS", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    ELECTRIC: { name: "Plasma Fists", power: 600, type: "ELECTRIC", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    ICE: { name: "Freeze Shock", power: 600, type: "ICE", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FIGHTING: { name: "Combat Torque", power: 600, type: "FIGHTING", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    POISON: { name: "Noxious Torque", power: 600, type: "POISON", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    GROUND: { name: "Land's Wrath", power: 600, type: "GROUND", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    FLYING: { name: "Bleakwind Storm", power: 600, type: "FLYING", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    PSYCHIC: { name: "Psycho Boost", power: 600, type: "PSYCHIC", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    BUG: { name: "Pollen Puff", power: 600, type: "BUG", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    ROCK: { name: "Diamond Storm", power: 600, type: "ROCK", category: "PHYSICAL", cooldownMs: COOLDOWN_600_MS },
    GHOST: { name: "Moongeist Beam", power: 600, type: "GHOST", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    DRAGON: { name: "Dynamax Cannon", power: 600, type: "DRAGON", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    DARK: { name: "Fiery Wrath", power: 600, type: "DARK", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    STEEL: { name: "Make It Rain", power: 600, type: "STEEL", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS },
    FAIRY: { name: "Fleur Cannon", power: 600, type: "FAIRY", category: "SPECIAL", cooldownMs: COOLDOWN_600_MS }
  };
  var TIPOS_ELEMENTO = Object.keys(GOLPE_600_POR_TIPO);
  function dexDe(id) {
    return id < 1e3 ? id : id % 1e3;
  }
  function ehUltimaEvolucao(c) {
    return !c.evolvesToId;
  }
  function elegivelParaGolpeEspecial(c) {
    if (!ehUltimaEvolucao(c)) return false;
    if (isEspelhoFantasmaPokeId(c.pokeId)) return false;
    if (c.megaDeDex != null) return false;
    if (c.golpesFechados) return false;
    return true;
  }
  function temGolpe600DoTipo(attacks, tipo) {
    return (attacks ?? []).some((a) => a.power >= 600 && a.type === tipo);
  }
  function limparGolpesQuebrados(attacks) {
    return (attacks ?? []).filter((a) => {
      if (!TIPOS_ELEMENTO.includes(a.type)) return false;
      if ((a.power ?? 0) <= 10) return false;
      return true;
    });
  }
  function fixarCooldownGolpe600(creature) {
    let mexeu = false;
    for (const a of creature.attacks ?? []) {
      if (a.cdFixo) continue;
      if ((a.power ?? 0) >= 600 && a.cooldownMs !== COOLDOWN_600_MS) {
        a.cooldownMs = COOLDOWN_600_MS;
        mexeu = true;
      }
    }
    return mexeu;
  }
  function injetarGolpesEspeciais(creature) {
    fixarCooldownGolpe600(creature);
    if (!elegivelParaGolpeEspecial(creature)) return false;
    let attacks = limparGolpesQuebrados(creature.attacks);
    const antes = JSON.stringify(attacks);
    const tipos = [...new Set([creature.type1, creature.type2].filter((t) => t && TIPOS_ELEMENTO.includes(t)))];
    const catAssinatura = (creature.baseAtk ?? 0) >= (creature.baseSpAtk ?? 0) ? "PHYSICAL" : "SPECIAL";
    for (const a of attacks) {
      if (a.power < 600) continue;
      if (!a.categoriaFixa) a.category = catAssinatura;
      a.cooldownMs = COOLDOWN_600_MS;
    }
    for (const tipo of tipos) {
      const tmpl = GOLPE_600_POR_TIPO[tipo];
      if (!tmpl || temGolpe600DoTipo(attacks, tipo)) continue;
      attacks.push({ ...tmpl, category: catAssinatura, learnLevel: 1 });
    }
    const golpes600 = attacks.filter((a) => a.power >= 600 && TIPOS_ELEMENTO.includes(a.type));
    if (golpes600.length === 1) {
      const b = [GOLPE_600_POR_TIPO_B, GOLPE_600_RESERVA].map((tabela) => tabela[golpes600[0].type]).find((g) => g && !attacks.some((a) => a.name === g.name));
      if (b) attacks.push({ ...b, category: catAssinatura, learnLevel: 1 });
    }
    if (JSON.stringify(attacks) === antes) return false;
    creature.attacks = attacks;
    return true;
  }
  function golpesDaFicha(especie) {
    if (!especie) return [];
    const clone = { ...especie, attacks: (especie.attacks ?? []).map((a) => ({ ...a })) };
    injetarGolpesEspeciais(clone);
    return clone.attacks ?? [];
  }

  // tests/.cache/shared/golpes-planilhas.mjs
  var golpes_planilhas_exports = {};
  __export(golpes_planilhas_exports, {
    GOLPES_ARTE_NOVA: () => GOLPES_ARTE_NOVA,
    GOLPES_ARTE_NOVA_2026_10_30: () => GOLPES_ARTE_NOVA_2026_10_30,
    GOLPES_ARTE_NOVA_2026_11_05: () => GOLPES_ARTE_NOVA_2026_11_05,
    GOLPES_ARTE_NOVA_2026_11_15: () => GOLPES_ARTE_NOVA_2026_11_15,
    GOLPES_CONTRATO_2026_10_16: () => GOLPES_CONTRATO_2026_10_16,
    GOLPES_DUAS_FORMAS_2026_11_05: () => GOLPES_DUAS_FORMAS_2026_11_05,
    GOLPES_INICIAIS: () => GOLPES_INICIAIS,
    GOLPES_LENDARIOS_2026_10_11: () => GOLPES_LENDARIOS_2026_10_11,
    GOLPES_LENDARIOS_2026_10_27: () => GOLPES_LENDARIOS_2026_10_27,
    GOLPES_LENDARIOS_2026_10_29: () => GOLPES_LENDARIOS_2026_10_29,
    GOLPES_MEGAS_2026_10_03: () => GOLPES_MEGAS_2026_10_03,
    GOLPES_MEGAS_2026_10_21: () => GOLPES_MEGAS_2026_10_21,
    GOLPES_MEGAS_2026_10_22: () => GOLPES_MEGAS_2026_10_22,
    GOLPES_MEGAS_2026_10_23: () => GOLPES_MEGAS_2026_10_23,
    GOLPES_MEGAS_2026_10_26: () => GOLPES_MEGAS_2026_10_26,
    GOLPES_MEGAS_2026_10_27: () => GOLPES_MEGAS_2026_10_27,
    GOLPES_MEGAS_2026_10_29: () => GOLPES_MEGAS_2026_10_29,
    GOLPES_MEGAS_2026_10_30: () => GOLPES_MEGAS_2026_10_30,
    GOLPES_MEGAS_2026_11_15: () => GOLPES_MEGAS_2026_11_15,
    GOLPES_MEGAS_CONTRATO_2026_10_16: () => GOLPES_MEGAS_CONTRATO_2026_10_16,
    GOLPES_MENOS_DE_10: () => GOLPES_MENOS_DE_10,
    GOLPES_OUTLAND_2026_10_13: () => GOLPES_OUTLAND_2026_10_13,
    GOLPES_OUTLAND_2026_10_15: () => GOLPES_OUTLAND_2026_10_15,
    GOLPES_OUTLAND_2026_10_27: () => GOLPES_OUTLAND_2026_10_27,
    GOLPES_OUTLAND_2026_11_02: () => GOLPES_OUTLAND_2026_11_02,
    GOLPES_OUTLAND_2026_11_05: () => GOLPES_OUTLAND_2026_11_05,
    GOLPES_PRE_EVOLUCOES_KANTO: () => GOLPES_PRE_EVOLUCOES_KANTO,
    GOLPES_PRIMEIRO_ESTAGIO_2026_11_05: () => GOLPES_PRIMEIRO_ESTAGIO_2026_11_05,
    GOLPES_PSEUDO_LENDARIOS: () => GOLPES_PSEUDO_LENDARIOS,
    GOLPES_REWORK_2026_09: () => GOLPES_REWORK_2026_09,
    GOLPES_REWORK_2026_09_28: () => GOLPES_REWORK_2026_09_28,
    GOLPES_REWORK_2026_10_03: () => GOLPES_REWORK_2026_10_03,
    GOLPES_REWORK_2026_10_04: () => GOLPES_REWORK_2026_10_04,
    GOLPES_REWORK_2026_10_13: () => GOLPES_REWORK_2026_10_13,
    GOLPES_REWORK_2026_10_15: () => GOLPES_REWORK_2026_10_15,
    GOLPES_REWORK_2026_10_23: () => GOLPES_REWORK_2026_10_23,
    GOLPES_REWORK_2026_10_26: () => GOLPES_REWORK_2026_10_26,
    GOLPES_REWORK_2026_10_27: () => GOLPES_REWORK_2026_10_27,
    GOLPES_REWORK_2026_10_29: () => GOLPES_REWORK_2026_10_29,
    GOLPES_REWORK_2026_11_02: () => GOLPES_REWORK_2026_11_02,
    GOLPES_SEGUNDA_EVO_2026_10_15: () => GOLPES_SEGUNDA_EVO_2026_10_15,
    GOLPES_SEM_EVOLUCAO_2026_11_05: () => GOLPES_SEM_EVOLUCAO_2026_11_05,
    aplicarGolpesDasPlanilhas: () => aplicarGolpesDasPlanilhas,
    golpesDaPlanilhaDaMega: () => golpesDaPlanilhaDaMega,
    golpesDaPlanilhaDoOutland: () => golpesDaPlanilhaDoOutland,
    golpesDoOutlandFechados: () => golpesDoOutlandFechados
  });
  var GOLPES_INICIAIS = {};
  var GOLPES_PSEUDO_LENDARIOS = {};
  var GOLPES_MENOS_DE_10 = {
    217: [
      ["Bind", "NORMAL", "PHYSICAL", 15],
      ["Fury Attack", "NORMAL", "PHYSICAL", 15],
      ["Fury Swipes", "NORMAL", "PHYSICAL", 18],
      ["Scratch", "NORMAL", "PHYSICAL", 40],
      ["Snore", "NORMAL", "SPECIAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Slash", "NORMAL", "PHYSICAL", 70],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ]
  };
  var GOLPES_REWORK_2026_09 = {
    57: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Upper Hand", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Superpower", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ]
  };
  var GOLPES_PRE_EVOLUCOES_KANTO = {};
  var GOLPES_REWORK_2026_09_28 = {};
  var GOLPES_REWORK_2026_10_03 = {};
  var GOLPES_REWORK_2026_10_04 = {
    292: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Shadow Punch", "GHOST", "PHYSICAL", 55],
      ["Team Slice", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Night Shade", "GHOST", "SPECIAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 140],
      ["Sinister Arrow Raid", "GHOST", "PHYSICAL", 180],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ]
  };
  var MEGA = "MEGA";
  var GOLPES_MEGAS_2026_10_03 = {};
  var GOLPES_LENDARIOS_2026_10_11 = {};
  var GOLPES_REWORK_2026_10_13 = {
    625: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Wicked Blow", "DARK", "PHYSICAL", 600],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ]
  };
  var GOLPES_OUTLAND_2026_10_13 = {
    2020: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ]
  };
  var GOLPES_REWORK_2026_10_15 = {};
  var GOLPES_SEGUNDA_EVO_2026_10_15 = {
    2: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Trop Kick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    5: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    8: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    11: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    14: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    17: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    25: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    30: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    33: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    35: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    39: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    42: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    44: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    61: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    64: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    67: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    70: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    75: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    82: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    93: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    112: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    113: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    117: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    125: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    126: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    148: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    153: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Trop Kick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    156: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    159: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    176: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    180: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    183: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    188: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    221: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    233: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    247: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    253: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Trop Kick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    256: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    259: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    266: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    268: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    271: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    274: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    281: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    288: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    294: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    305: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ],
    315: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    329: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    356: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul-Stealing 7-Star Strike", "GHOST", "PHYSICAL", 600]
    ],
    364: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    372: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    375: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ],
    388: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Trop Kick", "GRASS", "PHYSICAL", 70],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    391: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Wake-Up Slap", "FIGHTING", "PHYSICAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    394: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    397: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    404: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Bolt Beak", "ELECTRIC", "PHYSICAL", 85],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    444: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    496: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Trop Kick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    499: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Temper Flare", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600]
    ],
    502: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    520: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    536: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    541: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    544: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    552: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    575: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    578: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    603: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    611: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    634: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    662: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600]
    ],
    665: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    680: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ],
    705: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    723: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    726: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    729: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    732: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    737: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    762: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    783: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    814: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Temper Flare", "FIRE", "PHYSICAL", 75],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600]
    ],
    958: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600]
    ]
  };
  var GOLPES_OUTLAND_2026_10_15 = {
    2010: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    2011: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    2015: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    2032: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    2033: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ]
  };
  var GOLPES_ARTE_NOVA = {};
  var GOLPES_CONTRATO_2026_10_16 = {
    507: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Crush Claw", "NORMAL", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    583: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Freezy Frost", "ICE", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    600: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Iron Head", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600]
    ],
    651: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    654: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    657: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    811: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    816: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    817: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    822: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    825: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    838: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    857: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    860: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    886: [
      ["Shadow Punch", "GHOST", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Order Up", "DRAGON", "PHYSICAL", 80],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    891: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120]
    ],
    907: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    910: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    912: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120]
    ],
    913: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    922: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Zing Zap", "ELECTRIC", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    929: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    933: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    997: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Order Up", "DRAGON", "PHYSICAL", 80],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    1011: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120]
    ],
    4075: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    5122: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    5264: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    6705: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600]
    ]
  };
  var GOLPES_MEGAS_CONTRATO_2026_10_16 = {};
  var GOLPES_MEGAS_2026_10_21 = {};
  var GOLPES_MEGAS_2026_10_22 = {};
  var GOLPES_REWORK_2026_10_23 = {};
  var GOLPES_MEGAS_2026_10_23 = {};
  var GOLPES_REWORK_2026_10_26 = {
    3: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Pledge", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    6: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Burst", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    15: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    26: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 72],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    36: [
      ["Pixie Dust", "FAIRY", "SPECIAL", 30],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Disarming Voice", "FAIRY", "SPECIAL", 120],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    65: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Zen Headbutt", "PSYCHIC", "SPECIAL", 80],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    80: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Psybeam", "PSYCHIC", "SPECIAL", 70],
      ["Expanding Force", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    94: [
      ["Shadow Punch", "GHOST", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Toxic Deluge", "POISON", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    115: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Fake Out", "NORMAL", "PHYSICAL", 40],
      ["Pound", "NORMAL", "PHYSICAL", 50],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Headbutt", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Skull Bash", "NORMAL", "PHYSICAL", 120],
      ["Last Resort", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    121: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Brine", "WATER", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    127: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Revenge", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Bug Buzz", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Megahorn", "BUG", "PHYSICAL", 600]
    ],
    130: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Dive", "WATER", "PHYSICAL", 65],
      ["Bounce", "FLYING", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    142: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Throw", "ROCK", "PHYSICAL", 45],
      ["Rock Tomb", "ROCK", "PHYSICAL", 55],
      ["Smack Down", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Edge", "ROCK", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    149: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 55],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Wing Attack", "FLYING", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Aerial Ace", "FLYING", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    154: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Magical Leaf", "GRASS", "SPECIAL", 60],
      ["Seed Bomb", "GRASS", "PHYSICAL", 75],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 85],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Blade", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    160: [
      ["Aqua Jet", "WATER", "PHYSICAL", 35],
      ["Flip Turn", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Waterfall", "WATER", "PHYSICAL", 65],
      ["Liquidation", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Tidal Surge", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    181: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Electroweb", "ELECTRIC", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    208: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bone Club", "GROUND", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Iron Head", "STEEL", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    212: [
      ["Twineedle", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Steamroller", "BUG", "PHYSICAL", 65],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    214: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Counter", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Collision Course", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Megahorn", "BUG", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    227: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Sky Drop", "FLYING", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    229: [
      ["Payback", "DARK", "SPECIAL", 35],
      ["Thief", "DARK", "SPECIAL", 45],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    248: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Throw", "ROCK", "PHYSICAL", 45],
      ["Rock Tomb", "ROCK", "PHYSICAL", 55],
      ["Bite", "DARK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Stone Edge", "ROCK", "PHYSICAL", 100],
      ["Fling", "DARK", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    254: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Grass Knot", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Magical Leaf", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Pledge", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    260: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Yawn", "WATER", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 50],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Liquidation", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Frost Power", "WATER", "PHYSICAL", 150],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    282: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Lumina Crash", "PSYCHIC", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    302: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Shadow Claw", "GHOST", "PHYSICAL", 55],
      ["Last Respects", "GHOST", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    303: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Spirit Break", "FAIRY", "PHYSICAL", 65],
      ["Metal Burst", "STEEL", "PHYSICAL", 75],
      ["Dazzling Gleam", "FAIRY", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    306: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 35],
      ["Gear Grind", "STEEL", "PHYSICAL", 45],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Smart Strike", "STEEL", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    308: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Counter", "FIGHTING", "PHYSICAL", 40],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 50],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Psybeam", "PSYCHIC", "SPECIAL", 70],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Aura Burst", "FIGHTING", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "SPECIAL", 600]
    ],
    310: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    319: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Flip Turn", "WATER", "PHYSICAL", 55],
      ["Waterfall", "WATER", "PHYSICAL", 65],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    334: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Air Cutter", "FLYING", "SPECIAL", 70],
      ["Fly", "FLYING", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    354: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Rage Fist", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    358: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mega Mindbreak", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    359: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Bite", "DARK", "PHYSICAL", 45],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Thief", "DARK", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Throat Chop", "DARK", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Baddy Bad", "DARK", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    362: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Frost Breath", "ICE", "SPECIAL", 60],
      ["Sheer Cold", "ICE", "SPECIAL", 70],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Ice Spinner", "ICE", "PHYSICAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 120],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    373: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Fly", "FLYING", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    376: [
      ["Confusion", "PSYCHIC", "PHYSICAL", 35],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Zen Headbutt", "PSYCHIC", "PHYSICAL", 80],
      ["Psystrike", "PSYCHIC", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    398: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 28],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Pluck", "FLYING", "PHYSICAL", 70],
      ["Take Down", "NORMAL", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    428: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Cut", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Headbutt", "NORMAL", "PHYSICAL", 70],
      ["Strength", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    445: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    460: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Frost Breath", "ICE", "SPECIAL", 60],
      ["Razor Leaf", "GRASS", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    475: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Psyshock", "PSYCHIC", "PHYSICAL", 80],
      ["Psychic", "PSYCHIC", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    478: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Frost Breath", "ICE", "SPECIAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Icicle Crash", "ICE", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    500: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Heat Crash", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Temper Flare", "FIRE", "PHYSICAL", 90],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Superpower", "FIGHTING", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    530: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ],
    531: [
      ["Tackle", "NORMAL", "PHYSICAL", 35],
      ["Pound", "NORMAL", "PHYSICAL", 40],
      ["Covet", "NORMAL", "PHYSICAL", 55],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Tri Attack", "NORMAL", "SPECIAL", 75],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    545: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Mega Swarm", "BUG", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    560: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Brick Break", "FIGHTING", "PHYSICAL", 65],
      ["Low Kick", "FIGHTING", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Beat Up", "DARK", "PHYSICAL", 120],
      ["High Jump Kick", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    609: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Burning Jealousy", "FIRE", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Heat Wave", "FIRE", "SPECIAL", 95],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    623: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bulldoze", "GROUND", "PHYSICAL", 45],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 65],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Soul-Stealing 7-Star Strike", "GHOST", "PHYSICAL", 600]
    ],
    652: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Timber Crash", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    655: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Psychic", "PSYCHIC", "SPECIAL", 85],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    668: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    670: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    678: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    687: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    689: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Smack Down", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    691: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid", "POISON", "SPECIAL", 40],
      ["Acid Spray", "POISON", "SPECIAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 75],
      ["Sludge Wave", "POISON", "SPECIAL", 85],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    701: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Acrobatics", "FLYING", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["High Jump Kick", "FIGHTING", "PHYSICAL", 120],
      ["Sky Attack", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    740: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    768: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    780: [
      ["Weather Ball", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Mega Cataclysm", "DRAGON", "SPECIAL", 600],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    870: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    952: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    978: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dragon Breath", "DRAGON", "SPECIAL", 45],
      ["Dragon Darts", "DRAGON", "SPECIAL", 50],
      ["Fickle Beam", "DRAGON", "SPECIAL", 65],
      ["Snipe Shot", "WATER", "SPECIAL", 75],
      ["Core Enforcer", "DRAGON", "SPECIAL", 85],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    998: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Icicle Crash", "ICE", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ]
  };
  var GOLPES_MEGAS_2026_10_26 = {};
  var GOLPES_REWORK_2026_10_27 = {
    12: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    4020: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Comeuppance", "DARK", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    20: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Cut", "NORMAL", "PHYSICAL", 50],
      ["Facade", "NORMAL", "PHYSICAL", 65],
      ["Strength", "NORMAL", "PHYSICAL", 75],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    22: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 30],
      ["Peck", "FLYING", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Wing Attack", "FLYING", "PHYSICAL", 70],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    4028: [
      ["Ice Shard", "ICE", "PHYSICAL", 35],
      ["Icicle Spear", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Icicle Crash", "ICE", "PHYSICAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    28: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Precipice Blades", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    31: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    34: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Precipice Blades", "GROUND", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    4038: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Aurora Beam", "ICE", "SPECIAL", 55],
      ["Icy Wind", "ICE", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Time", "ICE", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    40: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 45],
      ["Round", "NORMAL", "SPECIAL", 55],
      ["Tera Blast", "NORMAL", "SPECIAL", 65],
      ["Swift", "NORMAL", "SPECIAL", 70],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Disarming Voice", "FAIRY", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    45: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Grass Knot", "GRASS", "SPECIAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Magical Leaf", "GRASS", "SPECIAL", 96],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    47: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fell Stinger", "BUG", "PHYSICAL", 45],
      ["Fury Cutter", "BUG", "PHYSICAL", 55],
      ["X-Scissor", "BUG", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    49: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Struggle Bug", "BUG", "SPECIAL", 45],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Bug Bite", "BUG", "SPECIAL", 75],
      ["Sludge Bomb", "POISON", "SPECIAL", 85],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    4051: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    51: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 50],
      ["Bone Club", "GROUND", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Precipice Blades", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    4053: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Fling", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Night Slash", "DARK", "SPECIAL", 70],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Pursuit", "DARK", "SPECIAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    55: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Surf", "WATER", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    6059: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Temper Flare", "FIRE", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Fire Fang", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    62: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    76: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Smack Down", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    5078: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Mirror Coat", "PSYCHIC", "PHYSICAL", 55],
      ["Spirit Break", "FAIRY", "PHYSICAL", 65],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    78: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Pyro Ball", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    5080: [
      ["Acid Spray", "POISON", "SPECIAL", 35],
      ["Acid", "POISON", "SPECIAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Psyshock", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Toxic Torrent", "POISON", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    87: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    4089: [
      ["Poison Fang", "POISON", "PHYSICAL", 35],
      ["Mortal Spin", "POISON", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    91: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Razor Shell", "WATER", "PHYSICAL", 65],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    99: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    101: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    6101: [
      ["Charge Beam", "ELECTRIC", "SPECIAL", 35],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    4103: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Knot", "GRASS", "SPECIAL", 85],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    103: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Leaf Tornado", "GRASS", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    4105: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Fire Punch", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    105: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bone Club", "GROUND", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    122: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Confusion", "PSYCHIC", "SPECIAL", 45],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Disarming Voice", "FAIRY", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    7128: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    9128: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    8128: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    131: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Waterfall", "WATER", "PHYSICAL", 65],
      ["Avalanche", "ICE", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    132: [
      ["Tail Slap", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    139: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Rollout", "ROCK", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Rock Slide", "ROCK", "SPECIAL", 80],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    141: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Rock Slide", "ROCK", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    143: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    6157: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    162: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Facade", "NORMAL", "PHYSICAL", 55],
      ["Super Fang", "NORMAL", "PHYSICAL", 65],
      ["Body Slam", "NORMAL", "PHYSICAL", 75],
      ["Slam", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    164: [
      ["Weather Ball", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    166: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    168: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Mega Swarm", "BUG", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    171: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    178: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Zen Headbutt", "PSYCHIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    184: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Surf", "WATER", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    185: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rollout", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Meteor Beam", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 600]
    ],
    186: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Surf", "WATER", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    189: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    192: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 85],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    195: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    5199: [
      ["Acid", "POISON", "SPECIAL", 35],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Venoshock", "POISON", "SPECIAL", 70],
      ["Sludge Wave", "POISON", "SPECIAL", 85],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Toxic Torrent", "POISON", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    199: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Scald", "WATER", "SPECIAL", 75],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    205: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Mega Forge", "STEEL", "PHYSICAL", 600],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    210: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Dazzling Gleam", "FAIRY", "PHYSICAL", 65],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    213: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Struggle Bug", "BUG", "SPECIAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    219: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    224: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    225: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Ice Beam", "ICE", "SPECIAL", 85],
      ["Blizzard", "ICE", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    226: [
      ["Bubble", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    232: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Bulldoze", "GROUND", "PHYSICAL", 45],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bone Club", "GROUND", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Precipice Blades", "GROUND", "PHYSICAL", 600]
    ],
    235: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Scratch", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    241: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Headbutt", "NORMAL", "PHYSICAL", 55],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Strength", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    242: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Tera Blast", "NORMAL", "SPECIAL", 75],
      ["Hyper Voice", "NORMAL", "SPECIAL", 85],
      ["Swift", "NORMAL", "SPECIAL", 100],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Tera Starstorm", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Giga Impact", "NORMAL", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    262: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Baddy Bad", "DARK", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    264: [
      ["Fury Swipes", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Cut", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Headbutt", "NORMAL", "PHYSICAL", 70],
      ["Slash", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Flail", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600]
    ],
    267: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    269: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Venoshock", "POISON", "SPECIAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    272: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    279: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    284: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    286: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    289: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Scratch", "NORMAL", "PHYSICAL", 40],
      ["Slash", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Flail", "NORMAL", "PHYSICAL", 120],
      ["Mega Kick", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    291: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Mega Swarm", "BUG", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    295: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Uproar", "NORMAL", "SPECIAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    311: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Electroweb", "ELECTRIC", "SPECIAL", 45],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunder", "ELECTRIC", "SPECIAL", 100],
      ["Electro Shot", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    312: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    313: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Bug Buzz", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Megahorn", "BUG", "PHYSICAL", 600]
    ],
    314: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "SPECIAL", 120],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mega Swarm", "BUG", "SPECIAL", 600]
    ],
    321: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    324: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    326: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mega Mindbreak", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    330: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    337: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Salt Cure", "ROCK", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    338: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ],
    342: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    344: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Mud-Slap", "GROUND", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Scorching Sands", "GROUND", "SPECIAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Seismic Blast", "GROUND", "SPECIAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    348: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    351: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Weather Ball", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    8351: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Water Pulse", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Scald", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    9351: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    11351: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Fire Blast", "FIRE", "SPECIAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    352: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    365: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 85],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "SPECIAL", 600]
    ],
    367: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    368: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mega Maelstrom", "WATER", "SPECIAL", 600]
    ],
    369: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    370: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mega Maelstrom", "WATER", "SPECIAL", 600]
    ],
    402: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Megahorn", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    405: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Bolt Beak", "ELECTRIC", "PHYSICAL", 85],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    409: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Mega Landslide", "ROCK", "PHYSICAL", 600]
    ],
    413: [
      ["Struggle Bug", "BUG", "SPECIAL", 35],
      ["Infestation", "BUG", "SPECIAL", 40],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Energy Ball", "GRASS", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "SPECIAL", 120],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    8413: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    9413: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Struggle Bug", "BUG", "SPECIAL", 45],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Flash Cannon", "STEEL", "SPECIAL", 65],
      ["Silver Wind", "BUG", "SPECIAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    414: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    416: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    417: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    419: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    423: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    424: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    429: [
      ["Lick", "GHOST", "SPECIAL", 30],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Mega Eclipse", "GHOST", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    430: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Thief", "DARK", "PHYSICAL", 45],
      ["Night Slash", "DARK", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Mega Abyss", "DARK", "PHYSICAL", 600]
    ],
    435: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    442: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Mega Abyss", "DARK", "SPECIAL", 600],
      ["Soul-Stealing 7-Star Strike", "GHOST", "PHYSICAL", 600]
    ],
    450: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    452: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    454: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    457: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    461: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Blizzard", "ICE", "PHYSICAL", 100],
      ["Beat Up", "DARK", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    462: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    464: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    466: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 55],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Zing Zap", "ELECTRIC", "PHYSICAL", 80],
      ["Supercell Slam", "ELECTRIC", "PHYSICAL", 100],
      ["Aura Wheel", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    472: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    473: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    476: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Salt Cure", "ROCK", "SPECIAL", 40],
      ["Smack Down", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "SPECIAL", 75],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    12479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    11479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Ice Time", "ICE", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    8479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    1479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    9479: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    508: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    510: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Dark Pulse", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Mega Abyss", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    516: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    518: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mega Mindbreak", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    521: [
      ["Quick Attack", "NORMAL", "PHYSICAL", 35],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Fly", "FLYING", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Sky Attack", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    523: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Bolt Beak", "ELECTRIC", "PHYSICAL", 85],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    528: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    547: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Razor Leaf", "GRASS", "PHYSICAL", 60],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    6549: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    549: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Leaf Tornado", "GRASS", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Mega Bloom", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    553: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    555: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    8555: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    5555: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    9555: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Icicle Spear", "ICE", "PHYSICAL", 40],
      ["Ice Shard", "ICE", "PHYSICAL", 50],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 70],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Icicle Crash", "ICE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    561: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Chatter", "FLYING", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Tempest Gale", "FLYING", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    563: [
      ["Lick", "GHOST", "SPECIAL", 30],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Mega Eclipse", "GHOST", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    565: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    567: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Pluck", "FLYING", "PHYSICAL", 45],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    6571: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Round", "NORMAL", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Tera Blast", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    571: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Night Daze", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Mega Abyss", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    573: [
      ["Tail Slap", "NORMAL", "PHYSICAL", 25],
      ["Pound", "NORMAL", "PHYSICAL", 40],
      ["Super Fang", "NORMAL", "PHYSICAL", 55],
      ["Slam", "NORMAL", "PHYSICAL", 65],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Take Down", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    576: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mega Mindbreak", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    579: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mega Mindbreak", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    581: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    584: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 85],
      ["Freezy Frost", "ICE", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Mega Permafrost", "ICE", "SPECIAL", 600]
    ],
    587: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Wing Attack", "FLYING", "PHYSICAL", 70],
      ["Spark", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "PHYSICAL", 600]
    ],
    593: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Brine", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Scald", "WATER", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    594: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    596: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    606: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    614: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Mega Permafrost", "ICE", "PHYSICAL", 600]
    ],
    615: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Ice Burn", "ICE", "SPECIAL", 600]
    ],
    617: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "SPECIAL", 120],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mega Swarm", "BUG", "SPECIAL", 600]
    ],
    5618: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    618: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Discharge", "ELECTRIC", "SPECIAL", 75],
      ["Scorching Sands", "GROUND", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Land's Wrath", "GROUND", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    6628: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Esper Wing", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    632: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Bug Bite", "BUG", "PHYSICAL", 45],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    637: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Flamethrower", "FIRE", "SPECIAL", 75],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Heat Wave", "FIRE", "SPECIAL", 95],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    666: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    671: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Mega Radiance", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    675: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    676: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    681: [
      ["Shadow Punch", "GHOST", "PHYSICAL", 25],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Ominous Wind", "GHOST", "SPECIAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    8681: [
      ["Shadow Punch", "GHOST", "PHYSICAL", 25],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Ominous Wind", "GHOST", "SPECIAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    683: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Mega Radiance", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    693: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mega Maelstrom", "WATER", "SPECIAL", 600]
    ],
    695: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    697: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    699: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Ancient Power", "ROCK", "SPECIAL", 45],
      ["Rock Throw", "ROCK", "SPECIAL", 50],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Rock Slide", "ROCK", "SPECIAL", 75],
      ["Mighty Cleave", "ROCK", "SPECIAL", 85],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Ice Burn", "ICE", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    700: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Mega Radiance", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    702: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 75],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    703: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Smack Down", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Power Gem", "ROCK", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Meteor Beam", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600]
    ],
    707: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Flash Cannon", "STEEL", "SPECIAL", 65],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 75],
      ["Mirror Shot", "STEEL", "SPECIAL", 80],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Doom Desire", "STEEL", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    709: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Last Respects", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Soul-Stealing 7-Star Strike", "GHOST", "PHYSICAL", 600]
    ],
    711: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    713: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Mega Permafrost", "ICE", "PHYSICAL", 600]
    ],
    6713: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    715: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Oblivion Wing", "FLYING", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mega Cataclysm", "DRAGON", "SPECIAL", 600]
    ],
    6724: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Timber Crash", "GRASS", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    733: [
      ["Fury Attack", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Sky Attack", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    738: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Leech Life", "BUG", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600]
    ],
    741: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    9741: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    8741: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    11741: [
      ["Astonish", "GHOST", "SPECIAL", 30],
      ["Infernal Parade", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Hex", "GHOST", "SPECIAL", 80],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    743: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    745: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    9745: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    8745: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    746: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    8746: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Waterfall", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    748: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    750: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    752: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    754: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    756: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Leaf Tornado", "GRASS", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    758: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Sludge Bomb", "POISON", "SPECIAL", 85],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Toxic Torrent", "POISON", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    764: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Strange Steam", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    770: [
      ["Astonish", "GHOST", "SPECIAL", 30],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Mud Shot", "GROUND", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    771: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    776: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Heat Wave", "FIRE", "SPECIAL", 85],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    777: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Mega Forge", "STEEL", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    778: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Rage Fist", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Play Rough", "FAIRY", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600],
      ["Soul-Stealing 7-Star Strike", "GHOST", "PHYSICAL", 600]
    ],
    779: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ],
    781: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    812: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Timber Crash", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    818: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    820: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    823: [
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 35],
      ["Peck", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    826: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "SPECIAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    828: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Fling", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Night Slash", "DARK", "SPECIAL", 70],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Pursuit", "DARK", "SPECIAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    830: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Magical Leaf", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    832: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    834: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    836: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    841: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Grav Apple", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    842: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    844: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bone Club", "GROUND", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    845: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Air Cutter", "FLYING", "SPECIAL", 70],
      ["Air Slash", "FLYING", "SPECIAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tempest Gale", "FLYING", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    847: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    849: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    851: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Fire Fang", "FIRE", "PHYSICAL", 70],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    853: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    855: [
      ["Shadow Punch", "GHOST", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    858: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    861: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Spirit Break", "FAIRY", "PHYSICAL", 65],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    862: [
      ["Payback", "DARK", "PHYSICAL", 35],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Throat Chop", "DARK", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    863: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    864: [
      ["Shadow Punch", "GHOST", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    865: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    866: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Time", "ICE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    867: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Earthquake", "GROUND", "PHYSICAL", 85],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    869: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Mega Radiance", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    873: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Aurora Beam", "ICE", "SPECIAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    875: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    876: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Expanding Force", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    877: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Spark", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    879: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    880: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 55],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Bolt Beak", "ELECTRIC", "PHYSICAL", 85],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    882: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Fishious Rend", "WATER", "PHYSICAL", 85],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    899: [
      ["Tackle", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 65],
      ["Uproar", "NORMAL", "SPECIAL", 75],
      ["Tera Blast", "NORMAL", "SPECIAL", 80],
      ["Swift", "NORMAL", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    900: [
      ["Pounce", "BUG", "PHYSICAL", 35],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    8901: [
      ["Mud-Slap", "GROUND", "SPECIAL", 25],
      ["Mud Shot", "GROUND", "SPECIAL", 45],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Mud Bomb", "GROUND", "SPECIAL", 65],
      ["Scorching Sands", "GROUND", "SPECIAL", 70],
      ["Drill Run", "GROUND", "SPECIAL", 80],
      ["Thousand Waves", "GROUND", "SPECIAL", 90],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Seismic Blast", "GROUND", "SPECIAL", 150],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    901: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    902: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    8902: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Surf", "WATER", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    903: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Brick Break", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    904: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    908: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Timber Crash", "GRASS", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    911: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    914: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Frost Power", "WATER", "PHYSICAL", 150],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    916: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    918: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Bug Buzz", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Megahorn", "BUG", "PHYSICAL", 600]
    ],
    920: [
      ["Pounce", "BUG", "PHYSICAL", 35],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    923: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Spark", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    925: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    927: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Dazzling Gleam", "FAIRY", "PHYSICAL", 65],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    930: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Knot", "GRASS", "SPECIAL", 85],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    931: [
      ["Fury Attack", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Headbutt", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    934: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    936: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    939: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    941: [
      ["Charge Beam", "ELECTRIC", "SPECIAL", 35],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    943: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Baddy Bad", "DARK", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    945: [
      ["Poison Fang", "POISON", "PHYSICAL", 35],
      ["Mortal Spin", "POISON", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    947: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    950: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    954: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Pounce", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    956: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    959: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Spirit Break", "FAIRY", "PHYSICAL", 65],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    961: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    962: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    964: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    8964: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    966: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Iron Head", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    968: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    970: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Salt Cure", "ROCK", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "SPECIAL", 75],
      ["Sludge Wave", "POISON", "SPECIAL", 85],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    972: [
      ["Shadow Punch", "GHOST", "PHYSICAL", 25],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Last Respects", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    973: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Submission", "FIGHTING", "PHYSICAL", 75],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    975: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    976: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 65],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    977: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    980: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    981: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    982: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    983: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Kowtow Cleave", "DARK", "PHYSICAL", 85],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    984: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    985: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Spirit Break", "FAIRY", "PHYSICAL", 65],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    986: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    987: [
      ["Astonish", "GHOST", "SPECIAL", 30],
      ["Infernal Parade", "GHOST", "SPECIAL", 45],
      ["Hex", "GHOST", "SPECIAL", 55],
      ["Night Shade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    988: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    989: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Mud Bomb", "GROUND", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Sandsear Storm", "GROUND", "SPECIAL", 600]
    ],
    990: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["High Horsepower", "GROUND", "PHYSICAL", 85],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    991: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    992: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    993: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Fling", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Night Daze", "DARK", "SPECIAL", 75],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    994: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Sludge Bomb", "POISON", "SPECIAL", 85],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    995: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    1e3: [
      ["Bullet Punch", "STEEL", "SPECIAL", 35],
      ["Gear Grind", "STEEL", "SPECIAL", 45],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Shadow Ball", "GHOST", "SPECIAL", 75],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Meteor Mash", "STEEL", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Doom Desire", "STEEL", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    1005: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 75],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 85],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    1006: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    1013: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Matcha Gotcha", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    1018: [
      ["Metal Claw", "STEEL", "SPECIAL", 35],
      ["Gyro Ball", "STEEL", "SPECIAL", 45],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Flash Cannon", "STEEL", "SPECIAL", 75],
      ["Mirror Shot", "STEEL", "SPECIAL", 80],
      ["Meteor Mash", "STEEL", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    1019: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Knot", "GRASS", "SPECIAL", 85],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ]
  };
  var GOLPES_OUTLAND_2026_10_27 = {
    2008: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Spark", "ELECTRIC", "PHYSICAL", 70],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    2013: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    2012: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Razor Shell", "WATER", "PHYSICAL", 65],
      ["Ice Spinner", "ICE", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    2055: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Leaf Tornado", "GRASS", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    2039: [
      ["Surging Strikes", "WATER", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    2045: [
      ["Weather Ball", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Tera Blast", "NORMAL", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mega Onslaught", "NORMAL", "SPECIAL", 600]
    ],
    2036: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    2034: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Mega Forge", "STEEL", "PHYSICAL", 600]
    ],
    2043: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Dazzling Gleam", "FAIRY", "PHYSICAL", 65],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fae Hammer", "FAIRY", "PHYSICAL", 150],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    2053: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ],
    2040: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    2056: [
      ["Lick", "GHOST", "SPECIAL", 30],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Mega Eclipse", "GHOST", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    2054: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Low Kick", "FIGHTING", "PHYSICAL", 45],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600]
    ],
    2052: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    2057: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Burn", "ICE", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600]
    ]
  };
  var GOLPES_LENDARIOS_2026_10_27 = {
    9: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Dive", "WATER", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    257: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Heat Crash", "FIRE", "PHYSICAL", 60],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 70],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    489: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Riptide Slam", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Frost Power", "WATER", "PHYSICAL", 200],
      ["Aqua Crash", "WATER", "PHYSICAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    658: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Dive", "WATER", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Surf", "WATER", "SPECIAL", 150],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    772: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Judgment", "NORMAL", "SPECIAL", 100],
      ["Techno Blast", "NORMAL", "SPECIAL", 120]
    ],
    773: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    789: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120]
    ],
    790: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    803: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ]
  };
  var GOLPES_MEGAS_2026_10_27 = {};
  var GOLPES_REWORK_2026_10_29 = {
    4026: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Spark", "ELECTRIC", "PHYSICAL", 70],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    38: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    53: [
      ["Tail Slap", "NORMAL", "PHYSICAL", 25],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Super Fang", "NORMAL", "PHYSICAL", 50],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Tera Blast", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Skull Bash", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    59: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    73: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Liquidation", "WATER", "PHYSICAL", 85],
      ["Dive", "WATER", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    5110: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Toxic Torrent", "POISON", "SPECIAL", 150],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    134: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    136: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Temper Flare", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Pyro Ball", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    157: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    197: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Knock Off", "DARK", "PHYSICAL", 65],
      ["Night Daze", "DARK", "SPECIAL", 75],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    275: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Dark Pulse", "DARK", "SPECIAL", 75],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Solar Blade", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Mega Abyss", "DARK", "SPECIAL", 600]
    ],
    340: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    389: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 85],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Grove Rampage", "GRASS", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    392: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Heat Crash", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Flamethrower", "FIRE", "SPECIAL", 85],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "SPECIAL", 600]
    ],
    395: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Flash Cannon", "STEEL", "SPECIAL", 75],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    426: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Air Cutter", "FLYING", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Night Shade", "GHOST", "SPECIAL", 85],
      ["Shadow Ball", "GHOST", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    437: [
      ["Tachyon Cutter", "STEEL", "SPECIAL", 35],
      ["Gyro Ball", "STEEL", "PHYSICAL", 45],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Mirror Shot", "STEEL", "SPECIAL", 80],
      ["Flash Cannon", "STEEL", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    455: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    471: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Glaciate", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 85],
      ["Freezy Frost", "ICE", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    497: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Magical Leaf", "GRASS", "SPECIAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 85],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    6503: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    503: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    537: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600]
    ],
    631: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    635: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dragon Breath", "DRAGON", "SPECIAL", 45],
      ["Draco Slime", "DRAGON", "SPECIAL", 55],
      ["Snarl", "DARK", "SPECIAL", 60],
      ["Fickle Beam", "DRAGON", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Draco Deluge", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    660: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Scorching Sands", "GROUND", "SPECIAL", 70],
      ["Uproar", "NORMAL", "SPECIAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    673: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Apple Acid", "GRASS", "SPECIAL", 75],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    706: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Wyrm Lash", "DRAGON", "PHYSICAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Deluge", "DRAGON", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    6706: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 35],
      ["Gear Grind", "STEEL", "PHYSICAL", 45],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Flash Cannon", "STEEL", "SPECIAL", 75],
      ["Mirror Shot", "STEEL", "SPECIAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    724: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Grass Pledge", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    727: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Fling", "DARK", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    730: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Octazooka", "WATER", "SPECIAL", 70],
      ["Moonblast", "FAIRY", "SPECIAL", 85],
      ["Surf", "WATER", "SPECIAL", 90],
      ["Disarming Voice", "FAIRY", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    784: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 40],
      ["Final Gambit", "FIGHTING", "SPECIAL", 55],
      ["Draco Slime", "DRAGON", "SPECIAL", 65],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Draco Deluge", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "SPECIAL", 600]
    ],
    815: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Pyro Ball", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    871: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Double Shock", "ELECTRIC", "PHYSICAL", 120],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    881: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    883: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Brine", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    949: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Mud-Slap", "GROUND", "SPECIAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Seismic Blast", "GROUND", "SPECIAL", 150],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    967: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Tera Blast", "NORMAL", "SPECIAL", 75],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    18: [
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 35],
      ["Pluck", "FLYING", "PHYSICAL", 45],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Air Slash", "FLYING", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    71: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Leaf Tornado", "GRASS", "SPECIAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    323: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Flame Charge", "FIRE", "PHYSICAL", 60],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Temper Flare", "FIRE", "PHYSICAL", 80],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    448: [
      ["Vital Throw", "FIGHTING", "PHYSICAL", 30],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 50],
      ["Final Gambit", "FIGHTING", "SPECIAL", 60],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 70],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Aura Burst", "FIGHTING", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    604: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Mega Thunderstorm", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ]
  };
  var GOLPES_LENDARIOS_2026_10_29 = {
    144: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Ice Time", "ICE", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    5144: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600]
    ],
    5145: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    145: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Sky Dive", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600],
      ["Volt Surge", "ELECTRIC", "SPECIAL", 600]
    ],
    5146: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Night Daze", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    146: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Ember", "FIRE", "SPECIAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Sky Dive", "FLYING", "SPECIAL", 600],
      ["Solar Flare", "FIRE", "SPECIAL", 600]
    ],
    150: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Mind Pulse", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    151: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 65],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Zen Headbutt", "PSYCHIC", "PHYSICAL", 80],
      ["Freezing Glare", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Mind Pulse", "PSYCHIC", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    243: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Electro Drift", "ELECTRIC", "SPECIAL", 100],
      ["Electro Shot", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Volt Surge", "ELECTRIC", "SPECIAL", 600],
      ["Voltage Blast", "ELECTRIC", "SPECIAL", 600]
    ],
    244: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Temper Flare", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Pyro Ball", "FIRE", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Magma Impact", "FIRE", "PHYSICAL", 600],
      ["Solar Flare", "FIRE", "PHYSICAL", 600]
    ],
    245: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    249: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Sky Drop", "FLYING", "PHYSICAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Bleakwind Storm", "FLYING", "SPECIAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Mind Pulse", "PSYCHIC", "SPECIAL", 600],
      ["Sky Dive", "FLYING", "SPECIAL", 600]
    ],
    250: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Magma Impact", "FIRE", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    251: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Heart Stamp", "PSYCHIC", "PHYSICAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Astral Burst", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    377: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Geo Pulse", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    378: [
      ["Ice Ball", "ICE", "SPECIAL", 30],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Glaciate", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 85],
      ["Freezy Frost", "ICE", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 110],
      ["Absolute Zero", "ICE", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Ice Burn", "ICE", "SPECIAL", 600],
      ["Permafrost", "ICE", "SPECIAL", 600]
    ],
    379: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Sunsteel Strike", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Make It Rain", "STEEL", "PHYSICAL", 600]
    ],
    380: [
      ["Scale Shot", "DRAGON", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    381: [
      ["Scale Shot", "DRAGON", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    382: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    383: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Earthshock", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Sandsear Storm", "GROUND", "PHYSICAL", 600]
    ],
    384: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Dragon Strike", "DRAGON", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Sky Dive", "FLYING", "SPECIAL", 600]
    ],
    385: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    483: [
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 45],
      ["Gyro Ball", "STEEL", "SPECIAL", 55],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Flash Cannon", "STEEL", "SPECIAL", 90],
      ["Behemoth Bash", "STEEL", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    8483: [
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 45],
      ["Gyro Ball", "STEEL", "SPECIAL", 55],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Flash Cannon", "STEEL", "SPECIAL", 90],
      ["Behemoth Bash", "STEEL", "SPECIAL", 100],
      ["Doom Desire", "STEEL", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600],
      ["Steel Beam", "STEEL", "SPECIAL", 600]
    ],
    484: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    8484: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    485: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 45],
      ["Ember", "FIRE", "SPECIAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mirror Shot", "STEEL", "SPECIAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Heat Wave", "FIRE", "SPECIAL", 95],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Solar Flare", "FIRE", "SPECIAL", 600]
    ],
    486: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Hold Back", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Mega Kick", "NORMAL", "PHYSICAL", 120],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    487: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Ominous Wind", "GHOST", "SPECIAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spectral Thief", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 110],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    490: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    491: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Fling", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Lash Out", "DARK", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hyperspace Fury", "DARK", "SPECIAL", 100],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Malicious Moonsault", "DARK", "SPECIAL", 180],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Shadow Burst", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    492: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 90],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "PHYSICAL", 600],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    8492: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600]
    ],
    493: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Judgment", "NORMAL", "SPECIAL", 100],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    494: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Heart Stamp", "PSYCHIC", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 65],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Astral Burst", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Solar Flare", "FIRE", "SPECIAL", 600]
    ],
    638: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 40],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Double Iron Bash", "STEEL", "PHYSICAL", 60],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 80],
      ["Flash Cannon", "STEEL", "SPECIAL", 90],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Focus Blast", "FIGHTING", "SPECIAL", 600]
    ],
    639: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Geo Pulse", "ROCK", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    640: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Seed Flare", "GRASS", "SPECIAL", 120],
      ["Flora Burst", "GRASS", "SPECIAL", 600],
      ["Focus Blast", "FIGHTING", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    641: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Chatter", "FLYING", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Beak Blast", "FLYING", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Bleakwind Storm", "FLYING", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Sky Dive", "FLYING", "PHYSICAL", 600]
    ],
    8641: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Chatter", "FLYING", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Beak Blast", "FLYING", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Bleakwind Storm", "FLYING", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Sky Dive", "FLYING", "PHYSICAL", 600]
    ],
    642: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Plasma Fists", "ELECTRIC", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    8642: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Electro Drift", "ELECTRIC", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    643: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Dragon Darts", "DRAGON", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Torch Song", "FIRE", "SPECIAL", 80],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Dragon Strike", "DRAGON", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Solar Flare", "FIRE", "SPECIAL", 600]
    ],
    644: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Zing Zap", "ELECTRIC", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Dragon Smash", "DRAGON", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    645: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Mud Bomb", "GROUND", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 80],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    8645: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bone Club", "GROUND", "PHYSICAL", 65],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    9646: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    646: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Dragon Strike", "DRAGON", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Permafrost", "ICE", "SPECIAL", 600]
    ],
    8646: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Powder Snow", "ICE", "SPECIAL", 40],
      ["Dragon Darts", "DRAGON", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Glacial Lance", "ICE", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    647: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Final Gambit", "FIGHTING", "SPECIAL", 70],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 90],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Focus Blast", "FIGHTING", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Meteor Assault", "FIGHTING", "SPECIAL", 600]
    ],
    8647: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Final Gambit", "FIGHTING", "SPECIAL", 70],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 90],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Focus Blast", "FIGHTING", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Meteor Assault", "FIGHTING", "SPECIAL", 600]
    ],
    648: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Snore", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Revelation Dance", "NORMAL", "SPECIAL", 90],
      ["Swift", "NORMAL", "SPECIAL", 100],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Tera Starstorm", "NORMAL", "SPECIAL", 120],
      ["Blood Moon", "NORMAL", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    649: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Shredder Team", "BUG", "PHYSICAL", 55],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Signal Beam", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Bug Impact", "BUG", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    717: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 80],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    718: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    8718: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    9718: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Mud Bomb", "GROUND", "SPECIAL", 70],
      ["Scorching Sands", "GROUND", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    719: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    720: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Night Shade", "GHOST", "SPECIAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    8720: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 65],
      ["Comeuppance", "DARK", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    721: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    785: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Supercell Slam", "ELECTRIC", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    786: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    787: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    788: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600]
    ],
    791: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "PHYSICAL", 90],
      ["Psystrike", "PSYCHIC", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    792: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Night Shade", "GHOST", "SPECIAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    793: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Tomb", "ROCK", "SPECIAL", 60],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Mighty Cleave", "ROCK", "SPECIAL", 95],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Meteor Beam", "ROCK", "SPECIAL", 600],
      ["Noxious Torque", "POISON", "SPECIAL", 600]
    ],
    794: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Sky Uppercut", "FIGHTING", "PHYSICAL", 85],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Megahorn", "BUG", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    795: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 80],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Secret Sword", "FIGHTING", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Megahorn", "BUG", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    796: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Thunder", "ELECTRIC", "SPECIAL", 110],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Plasma Fists", "ELECTRIC", "SPECIAL", 600],
      ["Volt Surge", "ELECTRIC", "SPECIAL", 600]
    ],
    797: [
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Steel Beam", "STEEL", "SPECIAL", 600]
    ],
    798: [
      ["Snap Trap", "GRASS", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Make It Rain", "STEEL", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Vine Smash", "GRASS", "PHYSICAL", 600]
    ],
    799: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Night Daze", "DARK", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    800: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 600]
    ],
    801: [
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Gear Grind", "STEEL", "SPECIAL", 50],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Behemoth Bash", "STEEL", "SPECIAL", 100],
      ["Doom Desire", "STEEL", "SPECIAL", 120],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Steel Beam", "STEEL", "SPECIAL", 600]
    ],
    802: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    804: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600],
      ["Venom Burst", "POISON", "SPECIAL", 600]
    ],
    805: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    806: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    807: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 80],
      ["Discharge", "ELECTRIC", "SPECIAL", 90],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Plasma Fists", "ELECTRIC", "PHYSICAL", 600],
      ["Volt Surge", "ELECTRIC", "SPECIAL", 600]
    ],
    808: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 130],
      ["Alloy Surge", "STEEL", "PHYSICAL", 600],
      ["Make It Rain", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    809: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 130],
      ["Alloy Surge", "STEEL", "PHYSICAL", 600],
      ["Make It Rain", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    888: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Sparkly Swirl", "FAIRY", "PHYSICAL", 90],
      ["Misty Explosion", "FAIRY", "PHYSICAL", 100],
      ["Springtide Storm", "FAIRY", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fleur Cannon", "FAIRY", "PHYSICAL", 600],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600]
    ],
    8888: [
      ["Disarming Voice", "FAIRY", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Draining Kiss", "FAIRY", "PHYSICAL", 50],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Misty Explosion", "FAIRY", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    889: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Sky Uppercut", "FIGHTING", "PHYSICAL", 85],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Combat Torque", "FIGHTING", "PHYSICAL", 600],
      ["Focus Blast", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    8889: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    890: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Noxious Torque", "POISON", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    892: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    893: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    894: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Electro Drift", "ELECTRIC", "SPECIAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Plasma Fists", "ELECTRIC", "PHYSICAL", 600],
      ["Volt Surge", "ELECTRIC", "SPECIAL", 600]
    ],
    895: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 60],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Dragon Strike", "DRAGON", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    896: [
      ["Triple Axel", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Blizzard", "ICE", "PHYSICAL", 110],
      ["Permafrost Smash", "ICE", "PHYSICAL", 120],
      ["Freeze Shock", "ICE", "PHYSICAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Permafrost", "ICE", "PHYSICAL", 600]
    ],
    897: [
      ["Shadow Punch", "GHOST", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Force", "GHOST", "SPECIAL", 90],
      ["Spectral Thief", "GHOST", "SPECIAL", 90],
      ["Poltergeist", "GHOST", "SPECIAL", 110],
      ["Phantom Wail", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Moongeist Beam", "GHOST", "SPECIAL", 600],
      ["Soul-Stealing 7-Star Strike", "GHOST", "SPECIAL", 600]
    ],
    898: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    8905: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    1001: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    1002: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 65],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    1003: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Brutal Swing", "DARK", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 85],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Land's Wrath", "GROUND", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    1004: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Night Daze", "DARK", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    1007: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    1008: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    1009: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    1010: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "PHYSICAL", 90],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    1014: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sky Uppercut", "FIGHTING", "PHYSICAL", 85],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    1015: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Noxious Torque", "POISON", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    1016: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    1017: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "PHYSICAL", 600],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    1020: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    1021: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    1022: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "PHYSICAL", 90],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    1023: [
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Gear Grind", "STEEL", "SPECIAL", 50],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Behemoth Bash", "STEEL", "SPECIAL", 100],
      ["Doom Desire", "STEEL", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Steel Beam", "STEEL", "SPECIAL", 600]
    ],
    1024: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Judgment", "NORMAL", "SPECIAL", 100],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    1025: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Shell Side Arm", "POISON", "SPECIAL", 85],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ]
  };
  var GOLPES_MEGAS_2026_10_29 = {
    9150: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Eerie Spell", "PSYCHIC", "PHYSICAL", 80],
      ["Mist Ball", "PSYCHIC", "PHYSICAL", 95],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3150: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Astral Burst", "PSYCHIC", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    3380: [
      ["Scale Shot", "DRAGON", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    3381: [
      ["Scale Shot", "DRAGON", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Spacial Rend", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    3382: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Tidal Vortex", "WATER", "SPECIAL", 600]
    ],
    3383: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Sand Tomb", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    3384: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Sky Dive", "FLYING", "PHYSICAL", 600]
    ],
    3485: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 45],
      ["Ember", "FIRE", "SPECIAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mirror Shot", "STEEL", "SPECIAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Heat Wave", "FIRE", "SPECIAL", 95],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Alloy Surge", "STEEL", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    3491: [
      ["Power Trip", "DARK", "SPECIAL", 25],
      ["Fling", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Dark Pulse", "DARK", "SPECIAL", 65],
      ["Lash Out", "DARK", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hyperspace Fury", "DARK", "SPECIAL", 100],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Malicious Moonsault", "DARK", "SPECIAL", 180],
      ["Dark Impact", "DARK", "SPECIAL", 600],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    3718: [
      ["Mud-Slap", "GROUND", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dragon Breath", "DRAGON", "SPECIAL", 55],
      ["Fickle Beam", "DRAGON", "SPECIAL", 65],
      ["Scorching Sands", "GROUND", "SPECIAL", 70],
      ["Mud Bomb", "GROUND", "SPECIAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Land's Wrath", "GROUND", "SPECIAL", 600]
    ],
    3719: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    3801: [
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Gear Grind", "STEEL", "SPECIAL", 50],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 50],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Behemoth Bash", "STEEL", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    3807: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 80],
      ["Discharge", "ELECTRIC", "SPECIAL", 90],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Plasma Fists", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    3003: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Grass Pledge", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    9006: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 85],
      ["Heat Crash", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Dragon Smash", "DRAGON", "PHYSICAL", 600]
    ],
    3006: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Burst", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    3009: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Brine", "WATER", "SPECIAL", 65],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Hydro Cannon", "WATER", "SPECIAL", 600]
    ],
    3015: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    3018: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Tempest Gale", "FLYING", "SPECIAL", 150],
      ["Blood Moon", "NORMAL", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    9026: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Thunder Shock", "ELECTRIC", "PHYSICAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 85],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Aura Wheel", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    3026: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Electro Drift", "ELECTRIC", "SPECIAL", 100],
      ["Electro Shot", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    3036: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Chatter", "FLYING", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    3065: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Zen Headbutt", "PSYCHIC", "SPECIAL", 80],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    3071: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Leaf Tornado", "GRASS", "SPECIAL", 55],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Razor Leaf", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    3080: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    3094: [
      ["Shadow Punch", "GHOST", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Phantom Wail", "GHOST", "SPECIAL", 150],
      ["Toxic Deluge", "POISON", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    3115: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Crush Claw", "NORMAL", "PHYSICAL", 75],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    3121: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Flip Turn", "WATER", "PHYSICAL", 55],
      ["Dive", "WATER", "PHYSICAL", 65],
      ["Psybeam", "PSYCHIC", "SPECIAL", 70],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    3127: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Megahorn", "BUG", "PHYSICAL", 600],
      ["Sky Attack", "FLYING", "PHYSICAL", 600]
    ],
    3130: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bite", "DARK", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    3142: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Throw", "ROCK", "PHYSICAL", 45],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    3149: [
      ["Scale Shot", "DRAGON", "SPECIAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 55],
      ["Fickle Beam", "DRAGON", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Core Enforcer", "DRAGON", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    3154: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Matcha Gotcha", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Verdant Storm", "GRASS", "SPECIAL", 150],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    3160: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    3181: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    3208: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Iron Head", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    3212: [
      ["Twineedle", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Steamroller", "BUG", "PHYSICAL", 65],
      ["U-turn", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    3214: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Pounce", "BUG", "PHYSICAL", 50],
      ["Steamroller", "BUG", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Megahorn", "BUG", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3227: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Sky Drop", "FLYING", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    3229: [
      ["Payback", "DARK", "SPECIAL", 35],
      ["Beat Up", "DARK", "SPECIAL", 45],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Fiery Wrath", "DARK", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Dark Pulse", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    3248: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Throw", "ROCK", "PHYSICAL", 45],
      ["Rock Tomb", "ROCK", "PHYSICAL", 55],
      ["Bite", "DARK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Stone Edge", "ROCK", "PHYSICAL", 100],
      ["Fling", "DARK", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    3254: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    3257: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Heat Crash", "FIRE", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    3260: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Yawn", "WATER", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 50],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Liquidation", "WATER", "PHYSICAL", 75],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Frost Power", "WATER", "PHYSICAL", 150],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    3282: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Lumina Crash", "PSYCHIC", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    3302: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Sucker Punch", "DARK", "PHYSICAL", 70],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Umbral Blast", "DARK", "SPECIAL", 150],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "SPECIAL", 600]
    ],
    3303: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    3306: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Iron Head", "STEEL", "PHYSICAL", 65],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    3308: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Counter", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Brick Break", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3310: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Electro Shot", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    3319: [
      ["Clamp", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Fishious Rend", "WATER", "PHYSICAL", 85],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    3323: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Cinder Barrage", "FIRE", "SPECIAL", 100],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    3334: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Breath", "DRAGON", "SPECIAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600]
    ],
    3354: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Last Respects", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Spectral Thief", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    3358: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    3359: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["False Surrender", "DARK", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Baddy Bad", "DARK", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Wicked Blow", "DARK", "PHYSICAL", 600]
    ],
    3362: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Glaciate", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 150],
      ["Glacial Lance", "ICE", "PHYSICAL", 600],
      ["Ice Burn", "ICE", "SPECIAL", 600]
    ],
    3373: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Fly", "FLYING", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    3376: [
      ["Confusion", "PSYCHIC", "PHYSICAL", 35],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Hard Press", "STEEL", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Zen Headbutt", "PSYCHIC", "PHYSICAL", 80],
      ["Psystrike", "PSYCHIC", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    3398: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Brick Break", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3428: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Headbutt", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    3445: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600]
    ],
    9445: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Fickle Beam", "DRAGON", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 75],
      ["Core Enforcer", "DRAGON", "SPECIAL", 85],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "SPECIAL", 600]
    ],
    3448: [
      ["Vital Throw", "FIGHTING", "PHYSICAL", 30],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Low Kick", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Meteor Mash", "STEEL", "PHYSICAL", 85],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    9448: [
      ["Arm Thrust", "FIGHTING", "SPECIAL", 25],
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 40],
      ["Final Gambit", "FIGHTING", "SPECIAL", 55],
      ["Mirror Shot", "STEEL", "SPECIAL", 65],
      ["Submission", "FIGHTING", "SPECIAL", 75],
      ["Sky Uppercut", "FIGHTING", "SPECIAL", 85],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 90],
      ["Focus Blast", "FIGHTING", "SPECIAL", 120],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Aura Burst", "FIGHTING", "SPECIAL", 150],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600],
      ["Meteor Assault", "FIGHTING", "SPECIAL", 600]
    ],
    3460: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    3475: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Twin Beam", "PSYCHIC", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Psyshock", "PSYCHIC", "PHYSICAL", 80],
      ["Psychic", "PSYCHIC", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3478: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Ice Burn", "ICE", "SPECIAL", 600]
    ],
    3500: [
      ["Fire Spin", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Heat Crash", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Temper Flare", "FIRE", "PHYSICAL", 90],
      ["Raging Fury", "FIRE", "PHYSICAL", 120],
      ["Superpower", "FIGHTING", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["V-create", "FIRE", "PHYSICAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3530: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    3531: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Hidden Power", "NORMAL", "SPECIAL", 45],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Tri Attack", "NORMAL", "SPECIAL", 75],
      ["Uproar", "NORMAL", "SPECIAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    3545: [
      ["Twineedle", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Bug Bite", "BUG", "PHYSICAL", 55],
      ["Steamroller", "BUG", "PHYSICAL", 65],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    3560: [
      ["Payback", "DARK", "PHYSICAL", 35],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Darkest Lariat", "DARK", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3604: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Volt Breaker", "ELECTRIC", "PHYSICAL", 150],
      ["Bolt Strike", "ELECTRIC", "PHYSICAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    3609: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Burning Jealousy", "FIRE", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Heat Wave", "FIRE", "SPECIAL", 95],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    3623: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Tectonic Slam", "GROUND", "PHYSICAL", 150],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    3652: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Horn Leech", "GRASS", "PHYSICAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Timber Crash", "GRASS", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    3655: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Mystical Fire", "FIRE", "SPECIAL", 75],
      ["Psychic", "PSYCHIC", "SPECIAL", 85],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Mind Blown", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    3658: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Dive", "WATER", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Liquidation", "WATER", "PHYSICAL", 95],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    3668: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Burning Jealousy", "FIRE", "SPECIAL", 65],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Overheat", "FIRE", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    3670: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 65],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    3678: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    3687: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Feint Attack", "DARK", "PHYSICAL", 60],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Dark Pulse", "DARK", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    3689: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    3691: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid", "POISON", "SPECIAL", 40],
      ["Acid Spray", "POISON", "SPECIAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 75],
      ["Sludge Wave", "POISON", "SPECIAL", 85],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    3701: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Acrobatics", "FLYING", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["High Jump Kick", "FIGHTING", "PHYSICAL", 120],
      ["Sky Attack", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3740: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Ice Time", "ICE", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3768: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Pin Missile", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Steel Wing", "STEEL", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    3780: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    3870: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    3952: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Giga Drain", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    3978: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dragon Breath", "DRAGON", "SPECIAL", 45],
      ["Dragon Darts", "DRAGON", "SPECIAL", 50],
      ["Fickle Beam", "DRAGON", "SPECIAL", 65],
      ["Snipe Shot", "WATER", "SPECIAL", 75],
      ["Core Enforcer", "DRAGON", "SPECIAL", 85],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 90],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    3998: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Icicle Crash", "ICE", "PHYSICAL", 75],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ]
  };
  var GOLPES_ARTE_NOVA_2026_10_30 = {
    874: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Stone Axe", "ROCK", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Meteor Beam", "ROCK", "PHYSICAL", 600]
    ],
    905: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Light of Ruin", "FAIRY", "SPECIAL", 600],
      ["Sky Attack", "FLYING", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    8487: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Twister", "DRAGON", "SPECIAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Ominous Wind", "GHOST", "SPECIAL", 60],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Spectral Thief", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 110],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    8648: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Headbutt", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    8898: [
      ["Stored Power", "PSYCHIC", "PHYSICAL", 25],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Psychic", "PSYCHIC", "PHYSICAL", 90],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Permafrost Smash", "ICE", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Glacial Lance", "ICE", "PHYSICAL", 600]
    ],
    9898: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Ominous Wind", "GHOST", "SPECIAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Astral Barrage", "GHOST", "SPECIAL", 600]
    ],
    9017: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Liquidation", "WATER", "PHYSICAL", 85],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    8017: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    12017: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ]
  };
  var GOLPES_MEGAS_2026_10_30 = {
    3970: [
      ["Rock Blast", "ROCK", "SPECIAL", 25],
      ["Salt Cure", "ROCK", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "SPECIAL", 75],
      ["Sludge Wave", "POISON", "SPECIAL", 85],
      ["Diamond Storm", "ROCK", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ]
  };
  var GOLPES_REWORK_2026_11_02 = {
    24: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    68: [
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 50],
      ["Storm Throw", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    85: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Endeavor", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    89: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    97: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ],
    106: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Low Kick", "FIGHTING", "PHYSICAL", 45],
      ["Reversal", "FIGHTING", "PHYSICAL", 55],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Brick Break", "FIGHTING", "PHYSICAL", 80],
      ["Collision Course", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    107: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 75],
      ["Low Kick", "FIGHTING", "PHYSICAL", 80],
      ["Brick Break", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    110: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Dire Claw", "POISON", "PHYSICAL", 80],
      ["Poison Jab", "POISON", "PHYSICAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    119: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Waterfall", "WATER", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Frost Power", "WATER", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Hydro Cannon", "WATER", "PHYSICAL", 600]
    ],
    128: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Horn Attack", "NORMAL", "PHYSICAL", 65],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Raging Bull", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    169: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Aerial Ace", "FLYING", "PHYSICAL", 120],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    182: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Grass Knot", "GRASS", "SPECIAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Magical Leaf", "GRASS", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    201: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ],
    202: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Freezing Glare", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    230: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Draconic Soul", "DRAGON", "SPECIAL", 300],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Eternal Dragon", "DRAGON", "SPECIAL", 600]
    ],
    237: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Collision Course", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    277: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    297: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Kick", "FIGHTING", "PHYSICAL", 80],
      ["Reversal", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    301: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Fake Out", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Strength", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    317: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Venoshock", "POISON", "SPECIAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    327: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Strength", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    332: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Dark Pulse", "DARK", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Fling", "DARK", "PHYSICAL", 120],
      ["Magical Leaf", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    335: [
      ["Quick Attack", "NORMAL", "PHYSICAL", 35],
      ["False Swipe", "NORMAL", "PHYSICAL", 40],
      ["Scratch", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Headbutt", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    336: [
      ["Poison Tail", "POISON", "PHYSICAL", 35],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    346: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600]
    ],
    350: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Tidal Cascade", "WATER", "SPECIAL", 120],
      ["Water Spout", "WATER", "SPECIAL", 150],
      ["Hydro Cannon", "WATER", "SPECIAL", 600],
      ["Mystic Maelstrom", "WATER", "SPECIAL", 600]
    ],
    357: [
      ["Magical Leaf", "GRASS", "SPECIAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Razor Leaf", "GRASS", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    386: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Psycho Boost", "PSYCHIC", "PHYSICAL", 600]
    ],
    8386: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Psycho Boost", "PSYCHIC", "PHYSICAL", 600]
    ],
    9386: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Psycho Boost", "PSYCHIC", "PHYSICAL", 600]
    ],
    11386: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 55],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600],
      ["Psycho Boost", "PSYCHIC", "PHYSICAL", 600]
    ],
    400: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    407: [
      ["Magical Leaf", "GRASS", "SPECIAL", 25],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Petal Bloom", "GRASS", "SPECIAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    411: [
      ["Pebble Burst", "ROCK", "SPECIAL", 35],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Rock Tomb", "ROCK", "PHYSICAL", 70],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Rock Slide", "ROCK", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Meteor Beam", "ROCK", "SPECIAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600]
    ],
    421: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Seed Flare", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    432: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Slash", "NORMAL", "PHYSICAL", 65],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    441: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Chatter", "FLYING", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Tempest Gale", "FLYING", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    463: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    465: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    467: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Burning Jealousy", "FIRE", "SPECIAL", 65],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Fire Blast", "FIRE", "SPECIAL", 120],
      ["Eruption", "FIRE", "SPECIAL", 150],
      ["Blast Burn", "FIRE", "SPECIAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    468: [
      ["Fairy Wind", "FAIRY", "SPECIAL", 35],
      ["Pixie Dust", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Alluring Voice", "FAIRY", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    469: [
      ["Struggle Bug", "BUG", "SPECIAL", 35],
      ["Infestation", "BUG", "SPECIAL", 40],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Swarm Beam", "BUG", "SPECIAL", 120],
      ["Swarm Pulse", "BUG", "SPECIAL", 150],
      ["Hive Crush", "BUG", "SPECIAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    474: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Weather Ball", "NORMAL", "SPECIAL", 45],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Swift", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Tera Starstorm", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Blood Moon", "NORMAL", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    477: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Rage Fist", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Soul Reaper", "GHOST", "PHYSICAL", 150],
      ["Astral Barrage", "GHOST", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    480: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Mind Pulse", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    481: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Mind Pulse", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    482: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600],
      ["Mind Pulse", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "PHYSICAL", 600]
    ],
    488: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 65],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Zen Headbutt", "PSYCHIC", "PHYSICAL", 80],
      ["Freezing Glare", "PSYCHIC", "SPECIAL", 90],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Astral Burst", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ],
    505: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Take Down", "NORMAL", "PHYSICAL", 75],
      ["Bide", "NORMAL", "PHYSICAL", 80],
      ["Super Fang", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    512: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Solar Blade", "GRASS", "PHYSICAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    514: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Heat Wave", "FIRE", "SPECIAL", 85],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Fire Blast", "FIRE", "SPECIAL", 120],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Blast Burn", "FIRE", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    526: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Head Smash", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 600]
    ],
    534: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    538: [
      ["Vital Throw", "FIGHTING", "PHYSICAL", 35],
      ["Revenge", "FIGHTING", "PHYSICAL", 45],
      ["Storm Throw", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Reversal", "FIGHTING", "PHYSICAL", 120],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    539: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 50],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Body Press", "FIGHTING", "PHYSICAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Counter", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    542: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Razor Leaf", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Hive Crush", "BUG", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    556: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Chloroblast", "GRASS", "SPECIAL", 150],
      ["Frenzy Plant", "GRASS", "SPECIAL", 600],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    558: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Stone Edge", "ROCK", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Rock Wrecker", "ROCK", "PHYSICAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    569: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Venom Crash", "POISON", "PHYSICAL", 150],
      ["Noxious Torque", "POISON", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    586: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    589: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Pounce", "BUG", "PHYSICAL", 45],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["X-Scissor", "BUG", "PHYSICAL", 65],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Bee Swarm", "BUG", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    591: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Leaf Storm", "GRASS", "SPECIAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    598: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Iron Head", "STEEL", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    601: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 35],
      ["Metal Claw", "STEEL", "PHYSICAL", 45],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Gear Grind", "STEEL", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Steel Roller", "STEEL", "PHYSICAL", 120],
      ["Gigaton Hammer", "STEEL", "PHYSICAL", 150],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600],
      ["Steel Beam", "STEEL", "PHYSICAL", 600]
    ],
    612: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 55],
      ["Wyrm Lash", "DRAGON", "PHYSICAL", 65],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    620: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Reversal", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 80],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    621: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Wyrm Lash", "DRAGON", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Roar of Time", "DRAGON", "PHYSICAL", 600]
    ],
    626: [
      ["Fury Attack", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Horn Attack", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    628: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 30],
      ["Peck", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Slash", "NORMAL", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Sky Attack", "FLYING", "PHYSICAL", 150],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    630: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Comeuppance", "DARK", "PHYSICAL", 80],
      ["Aerial Ace", "FLYING", "PHYSICAL", 96],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Sky Attack", "FLYING", "PHYSICAL", 150],
      ["Endless Hollow", "DARK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    663: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Skyfall Dive", "FLYING", "PHYSICAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    685: [
      ["Pixie Jab", "FAIRY", "PHYSICAL", 35],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Charm Strike", "FAIRY", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Lunar Nova", "FAIRY", "SPECIAL", 150],
      ["Mega Radiance", "FAIRY", "SPECIAL", 600],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    716: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Charm Strike", "FAIRY", "PHYSICAL", 50],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Misty Explosion", "FAIRY", "SPECIAL", 100],
      ["Springtide Storm", "FAIRY", "SPECIAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 600],
      ["Let's Snuggle Forever", "FAIRY", "PHYSICAL", 600],
      ["Light of Ruin", "FAIRY", "PHYSICAL", 600]
    ],
    735: [
      ["Tackle", "NORMAL", "PHYSICAL", 35],
      ["Super Fang", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 150],
      ["Blood Moon", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    760: [
      ["Bind", "NORMAL", "PHYSICAL", 25],
      ["Flail", "NORMAL", "PHYSICAL", 40],
      ["Tackle", "NORMAL", "PHYSICAL", 50],
      ["Strength", "NORMAL", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Superpower", "FIGHTING", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    763: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Razor Leaf", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    766: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Low Kick", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Reversal", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 80],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    774: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    8774: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    839: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Gem Storm", "ROCK", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    887: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 25],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Outrage", "DRAGON", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Draconic Soul", "DRAGON", "PHYSICAL", 300],
      ["Eternal Dragon", "DRAGON", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    979: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 50],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 65],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Counter", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Focus Punch", "FIGHTING", "PHYSICAL", 150],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    124: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 120],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Absolute Zero", "ICE", "SPECIAL", 150],
      ["Ice Time", "ICE", "SPECIAL", 600],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    135: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 120],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Ion Cannon", "ELECTRIC", "SPECIAL", 150],
      ["Bolt Strike", "ELECTRIC", "SPECIAL", 600],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    196: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Heart Stamp", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Mist Ball", "PSYCHIC", "SPECIAL", 95],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Synchronoise", "PSYCHIC", "SPECIAL", 120],
      ["Psycho Boost", "PSYCHIC", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Prismatic Laser", "PSYCHIC", "SPECIAL", 600]
    ],
    470: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Wood Hammer", "GRASS", "PHYSICAL", 120],
      ["Bramble Crush", "GRASS", "PHYSICAL", 150],
      ["Frenzy Plant", "GRASS", "PHYSICAL", 600],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    937: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Poltergeist", "GHOST", "PHYSICAL", 120],
      ["Blazing Charge", "FIRE", "PHYSICAL", 150],
      ["Ignition Point", "FIRE", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ]
  };
  var GOLPES_OUTLAND_2026_11_02 = {
    2038: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mind Crusher", "PSYCHIC", "PHYSICAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Psychic Fangs", "PSYCHIC", "PHYSICAL", 600]
    ]
  };
  var GOLPES_ARTE_NOVA_2026_11_05 = {
    775: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ]
  };
  var GOLPES_PRIMEIRO_ESTAGIO_2026_11_05 = {
    1: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120]
    ],
    4: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Overheat", "FIRE", "SPECIAL", 120]
    ],
    7: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    10: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Fell Stinger", "BUG", "PHYSICAL", 45],
      ["Bug Bite", "BUG", "PHYSICAL", 55],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["First Impression", "BUG", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    13: [
      ["Pin Missile", "BUG", "PHYSICAL", 30],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    16: [
      ["Quick Attack", "NORMAL", "PHYSICAL", 35],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Tackle", "NORMAL", "PHYSICAL", 50],
      ["Wing Attack", "FLYING", "PHYSICAL", 70],
      ["Raging Bull", "NORMAL", "PHYSICAL", 90],
      ["Floaty Fall", "FLYING", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    29: [
      ["Poison Sting", "POISON", "PHYSICAL", 30],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120]
    ],
    32: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Dire Claw", "POISON", "PHYSICAL", 90],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120]
    ],
    41: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120]
    ],
    43: [
      ["Absorb", "GRASS", "SPECIAL", 30],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Acid Spray", "POISON", "SPECIAL", 50],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    56: [
      ["Rock Smash", "FIGHTING", "PHYSICAL", 35],
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120]
    ],
    60: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120]
    ],
    63: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    66: [
      ["Power-Up Punch", "FIGHTING", "PHYSICAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 50],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 90],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120]
    ],
    69: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    4074: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120]
    ],
    74: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Smack Down", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 70],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120]
    ],
    81: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 30],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Chrome Beam", "STEEL", "SPECIAL", 100],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120]
    ],
    92: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Infernal Parade", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Bitter Malice", "GHOST", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120]
    ],
    111: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bulldoze", "GROUND", "PHYSICAL", 45],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120]
    ],
    116: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 100],
      ["Origin Pulse", "WATER", "SPECIAL", 120]
    ],
    137: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Weather Ball", "NORMAL", "SPECIAL", 45],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Judgment", "NORMAL", "SPECIAL", 100],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120]
    ],
    147: [
      ["Dual Chop", "DRAGON", "PHYSICAL", 35],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 45],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 55],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 70],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120]
    ],
    152: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Leafage", "GRASS", "PHYSICAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Solar Beam", "GRASS", "SPECIAL", 120]
    ],
    155: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120]
    ],
    158: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Liquidation", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120]
    ],
    172: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 30],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 70],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Thunder", "ELECTRIC", "SPECIAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120]
    ],
    173: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 30],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Moonblast", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120]
    ],
    174: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 45],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Springtide Storm", "FAIRY", "SPECIAL", 100],
      ["Swift", "NORMAL", "SPECIAL", 120]
    ],
    175: [
      ["Pixie Dust", "FAIRY", "SPECIAL", 30],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 90],
      ["Moonblast", "FAIRY", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120]
    ],
    179: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 30],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 55],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Electro Drift", "ELECTRIC", "SPECIAL", 100],
      ["Thunder", "ELECTRIC", "SPECIAL", 120]
    ],
    187: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Bounce", "FLYING", "PHYSICAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    216: [
      ["Fury Swipes", "NORMAL", "PHYSICAL", 30],
      ["Scratch", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Slash", "NORMAL", "PHYSICAL", 70],
      ["Raging Bull", "NORMAL", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Thrash", "NORMAL", "PHYSICAL", 120]
    ],
    220: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 70],
      ["Ice Hammer", "ICE", "PHYSICAL", 95],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120]
    ],
    239: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 30],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120]
    ],
    240: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Wheel", "FIRE", "PHYSICAL", 55],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Cinder Barrage", "FIRE", "SPECIAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120]
    ],
    246: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Smack Down", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120]
    ],
    252: [
      ["Absorb", "GRASS", "SPECIAL", 30],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Leaf Storm", "GRASS", "SPECIAL", 120]
    ],
    255: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Cinder Barrage", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120]
    ],
    258: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120]
    ],
    5263: [
      ["Power Trip", "DARK", "PHYSICAL", 30],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Baddy Bad", "DARK", "SPECIAL", 120]
    ],
    263: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Headbutt", "NORMAL", "PHYSICAL", 55],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120]
    ],
    265: [
      ["Twineedle", "BUG", "PHYSICAL", 30],
      ["Fell Stinger", "BUG", "PHYSICAL", 45],
      ["Fury Cutter", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 72],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["First Impression", "BUG", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    270: [
      ["Absorb", "GRASS", "SPECIAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Water Gun", "WATER", "SPECIAL", 50],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    273: [
      ["Snap Trap", "GRASS", "PHYSICAL", 35],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    280: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Springtide Storm", "FAIRY", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    287: [
      ["Scratch", "NORMAL", "PHYSICAL", 35],
      ["False Swipe", "NORMAL", "PHYSICAL", 40],
      ["Covet", "NORMAL", "PHYSICAL", 55],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    293: [
      ["Pound", "NORMAL", "PHYSICAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Stomp", "NORMAL", "PHYSICAL", 70],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Uproar", "NORMAL", "SPECIAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    298: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Glimmer Crash", "FAIRY", "PHYSICAL", 100],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120]
    ],
    304: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 35],
      ["Heavy Slam", "STEEL", "PHYSICAL", 40],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Iron Head", "STEEL", "PHYSICAL", 90],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Steel Roller", "STEEL", "PHYSICAL", 120]
    ],
    328: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 55],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120]
    ],
    355: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Poltergeist", "GHOST", "PHYSICAL", 100],
      ["Shadow Force", "GHOST", "PHYSICAL", 120]
    ],
    363: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Freezy Frost", "ICE", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Blizzard", "ICE", "SPECIAL", 120]
    ],
    371: [
      ["Dual Chop", "DRAGON", "PHYSICAL", 35],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 45],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 55],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120]
    ],
    374: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 55],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Psionic Smash", "PSYCHIC", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120]
    ],
    387: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    390: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Heat Wave", "FIRE", "SPECIAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120]
    ],
    393: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    396: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Tackle", "NORMAL", "PHYSICAL", 50],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Floaty Fall", "FLYING", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    403: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 30],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120]
    ],
    406: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Malignant Chain", "POISON", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    439: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Springtide Storm", "FAIRY", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    440: [
      ["Weather Ball", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Swift", "NORMAL", "SPECIAL", 100],
      ["Techno Blast", "NORMAL", "SPECIAL", 120]
    ],
    443: [
      ["Dual Chop", "DRAGON", "PHYSICAL", 35],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 45],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120]
    ],
    495: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Leaf Storm", "GRASS", "SPECIAL", 120]
    ],
    498: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 30],
      ["Flame Charge", "FIRE", "PHYSICAL", 45],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 70],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Heat Crash", "FIRE", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120]
    ],
    501: [
      ["Water Gun", "WATER", "SPECIAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    506: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    519: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120]
    ],
    524: [
      ["Rock Blast", "ROCK", "PHYSICAL", 30],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Stone Edge", "ROCK", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120]
    ],
    532: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Low Kick", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Hammer Arm", "FIGHTING", "PHYSICAL", 95],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120]
    ],
    535: [
      ["Whirlpool", "WATER", "SPECIAL", 30],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Surf", "WATER", "SPECIAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120]
    ],
    540: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Fell Stinger", "BUG", "PHYSICAL", 45],
      ["Pounce", "BUG", "PHYSICAL", 50],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    543: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 95],
      ["First Impression", "BUG", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120]
    ],
    551: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bulldoze", "GROUND", "PHYSICAL", 55],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120]
    ],
    574: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Expanding Force", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    577: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Photon Geyser", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    582: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Blizzard", "ICE", "SPECIAL", 100],
      ["Sheer Cold", "ICE", "SPECIAL", 120]
    ],
    599: [
      ["Bullet Punch", "STEEL", "PHYSICAL", 35],
      ["Gear Grind", "STEEL", "PHYSICAL", 45],
      ["Gyro Ball", "STEEL", "PHYSICAL", 55],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Steel Roller", "STEEL", "PHYSICAL", 120]
    ],
    602: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 30],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120]
    ],
    607: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Infernal Parade", "GHOST", "SPECIAL", 45],
      ["Night Shade", "GHOST", "SPECIAL", 50],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Phantom Pulse", "GHOST", "SPECIAL", 95],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120]
    ],
    610: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 30],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Breaking Swipe", "DRAGON", "PHYSICAL", 55],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120]
    ],
    624: [
      ["Power Trip", "DARK", "PHYSICAL", 30],
      ["Assurance", "DARK", "PHYSICAL", 45],
      ["Metal Claw", "STEEL", "PHYSICAL", 50],
      ["Fling", "DARK", "PHYSICAL", 70],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120]
    ],
    633: [
      ["Fling", "DARK", "PHYSICAL", 35],
      ["Bite", "DARK", "PHYSICAL", 45],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120]
    ],
    650: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    653: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120]
    ],
    656: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Snipe Shot", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    661: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 30],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120]
    ],
    664: [
      ["Fury Cutter", "BUG", "PHYSICAL", 35],
      ["Fell Stinger", "BUG", "PHYSICAL", 45],
      ["Pounce", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["First Impression", "BUG", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    669: [
      ["Pixie Dust", "FAIRY", "SPECIAL", 30],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Springtide Storm", "FAIRY", "SPECIAL", 100],
      ["Disarming Voice", "FAIRY", "SPECIAL", 120]
    ],
    679: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Shadow Claw", "GHOST", "PHYSICAL", 55],
      ["Gyro Ball", "STEEL", "PHYSICAL", 70],
      ["Magnet Bomb", "STEEL", "PHYSICAL", 95],
      ["Phantom Force", "GHOST", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120]
    ],
    704: [
      ["Twister", "DRAGON", "SPECIAL", 35],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Breath", "DRAGON", "SPECIAL", 55],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Draco Deluge", "DRAGON", "SPECIAL", 120]
    ],
    722: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Absorb", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    725: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Fire Fang", "FIRE", "PHYSICAL", 70],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Heat Wave", "FIRE", "SPECIAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120]
    ],
    728: [
      ["Water Gun", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 90],
      ["Torrent Volley", "WATER", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120]
    ],
    731: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Raging Bull", "NORMAL", "PHYSICAL", 90],
      ["Floaty Fall", "FLYING", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120]
    ],
    736: [
      ["Infestation", "BUG", "SPECIAL", 30],
      ["Struggle Bug", "BUG", "SPECIAL", 45],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Chitin Ray", "BUG", "SPECIAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120]
    ],
    761: [
      ["Magical Leaf", "GRASS", "SPECIAL", 30],
      ["Bullet Seed", "GRASS", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Leaf Blade", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Grass Knot", "GRASS", "SPECIAL", 120]
    ],
    782: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 30],
      ["Dragon Tail", "DRAGON", "PHYSICAL", 45],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Outrage", "DRAGON", "PHYSICAL", 120]
    ],
    810: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    813: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 30],
      ["Flame Wheel", "FIRE", "PHYSICAL", 45],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Blazing Torque", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Sacred Fire", "FIRE", "PHYSICAL", 100],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120]
    ],
    821: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 30],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Beak Blast", "FLYING", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120]
    ],
    824: [
      ["Infestation", "BUG", "SPECIAL", 30],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 90],
      ["Chitin Ray", "BUG", "SPECIAL", 100],
      ["Bug Buzz", "BUG", "SPECIAL", 120]
    ],
    837: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 70],
      ["Quartz Beam", "ROCK", "SPECIAL", 90],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Power Gem", "ROCK", "SPECIAL", 120]
    ],
    840: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Grassy Glide", "GRASS", "PHYSICAL", 45],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Fickle Beam", "DRAGON", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Dragon Rush", "DRAGON", "PHYSICAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    856: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psystrike", "PSYCHIC", "SPECIAL", 100],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120]
    ],
    859: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Alluring Voice", "FAIRY", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Sparkly Swirl", "FAIRY", "SPECIAL", 100],
      ["Baddy Bad", "DARK", "SPECIAL", 120]
    ],
    885: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 30],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Phantom Force", "GHOST", "PHYSICAL", 100],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120]
    ],
    906: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 30],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120]
    ],
    909: [
      ["Fire Spin", "FIRE", "SPECIAL", 30],
      ["Ember", "FIRE", "SPECIAL", 45],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Inferno", "FIRE", "SPECIAL", 100],
      ["Armor Cannon", "FIRE", "SPECIAL", 120]
    ],
    921: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 30],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Zing Zap", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Supercell Slam", "ELECTRIC", "PHYSICAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120]
    ],
    928: [
      ["Absorb", "GRASS", "SPECIAL", 30],
      ["Syrup Bomb", "GRASS", "SPECIAL", 45],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Judgment", "NORMAL", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120]
    ],
    932: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Stone Edge", "ROCK", "PHYSICAL", 120]
    ],
    957: [
      ["Pixie Jab", "FAIRY", "PHYSICAL", 35],
      ["Sprite Kick", "FAIRY", "PHYSICAL", 40],
      ["Charm Strike", "FAIRY", "PHYSICAL", 50],
      ["Anchor Shot", "STEEL", "PHYSICAL", 80],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Iron Tail", "STEEL", "PHYSICAL", 100],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120]
    ],
    996: [
      ["Scale Shot", "DRAGON", "PHYSICAL", 30],
      ["Dual Chop", "DRAGON", "PHYSICAL", 40],
      ["Dragon Darts", "DRAGON", "PHYSICAL", 50],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Dragon Hammer", "DRAGON", "PHYSICAL", 90],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120]
    ]
  };
  var GOLPES_DUAS_FORMAS_2026_11_05 = {
    4019: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    19: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Super Fang", "NORMAL", "PHYSICAL", 72],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    21: [
      ["Peck", "FLYING", "PHYSICAL", 35],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    23: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Dire Claw", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    4027: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    27: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bone Club", "GROUND", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    4037: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Sheer Cold", "ICE", "SPECIAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    37: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Burning Jealousy", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Fiery Dance", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    46: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    48: [
      ["Pounce", "BUG", "PHYSICAL", 35],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    4050: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    50: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    4052: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Umbral Wave", "DARK", "SPECIAL", 50],
      ["Snarl", "DARK", "SPECIAL", 60],
      ["Dark Pulse", "DARK", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    5052: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Gyro Ball", "STEEL", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600]
    ],
    52: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Fake Out", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    54: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    58: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Fang", "FIRE", "PHYSICAL", 70],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    6058: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flare Jab", "FIRE", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Flame Charge", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    72: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Water Gun", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Shell Side Arm", "POISON", "SPECIAL", 85],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    5077: [
      ["Mind Tap", "PSYCHIC", "PHYSICAL", 30],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 45],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 85],
      ["Psionic Smash", "PSYCHIC", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    77: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flare Jab", "FIRE", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    5079: [
      ["Mind Tap", "PSYCHIC", "PHYSICAL", 30],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 45],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 55],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 70],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 85],
      ["Psionic Smash", "PSYCHIC", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    79: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Zen Headbutt", "PSYCHIC", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    5083: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    84: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    86: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    4088: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    88: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Dire Claw", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    90: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    95: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Salt Cure", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    96: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Mind Strike", "PSYCHIC", "PHYSICAL", 45],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 70],
      ["Psyshield Bash", "PSYCHIC", "PHYSICAL", 80],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    98: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    6100: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    100: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Electro Ball", "ELECTRIC", "SPECIAL", 96],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    102: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    104: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Sand Tomb", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    108: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Blood Moon", "NORMAL", "SPECIAL", 600]
    ],
    109: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Dire Claw", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    114: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    118: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    120: [
      ["Water Gun", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Brine", "WATER", "SPECIAL", 55],
      ["Octazooka", "WATER", "SPECIAL", 65],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    123: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    129: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    133: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    138: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Water Pulse", "WATER", "SPECIAL", 70],
      ["Brine", "WATER", "SPECIAL", 80],
      ["Surf", "WATER", "SPECIAL", 90],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    140: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Liquidation", "WATER", "PHYSICAL", 85],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    161: [
      ["Fury Swipes", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Slam", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    163: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Air Slash", "FLYING", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    165: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    167: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    170: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    177: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 85],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    190: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Head Charge", "NORMAL", "PHYSICAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600]
    ],
    191: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Razor Leaf", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    193: [
      ["Struggle Bug", "BUG", "SPECIAL", 35],
      ["Infestation", "BUG", "SPECIAL", 40],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    7194: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    194: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    198: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Sucker Punch", "DARK", "PHYSICAL", 70],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    200: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Infernal Parade", "GHOST", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Night Shade", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Astral Barrage", "GHOST", "SPECIAL", 600]
    ],
    203: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    204: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Pounce", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    206: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 45],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Endeavor", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600]
    ],
    207: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bone Club", "GROUND", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Aerial Ace", "FLYING", "PHYSICAL", 70],
      ["Earthquake", "GROUND", "PHYSICAL", 85],
      ["High Horsepower", "GROUND", "PHYSICAL", 95],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    209: [
      ["Pixie Jab", "FAIRY", "PHYSICAL", 35],
      ["Sprite Kick", "FAIRY", "PHYSICAL", 40],
      ["Charm Strike", "FAIRY", "PHYSICAL", 50],
      ["Fae Strike", "FAIRY", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Glimmer Crash", "FAIRY", "PHYSICAL", 85],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    6211: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Beat Up", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    6215: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Cross Chop", "FIGHTING", "PHYSICAL", 100],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    215: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Beat Up", "DARK", "PHYSICAL", 45],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Fling", "DARK", "PHYSICAL", 72],
      ["Comeuppance", "DARK", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    218: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Burst", "FIRE", "SPECIAL", 55],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Flamethrower", "FIRE", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    5222: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    223: [
      ["Bubble", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    228: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Umbral Wave", "DARK", "SPECIAL", 60],
      ["Burning Jealousy", "FIRE", "SPECIAL", 70],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    231: [
      ["Bone Rush", "GROUND", "PHYSICAL", 25],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Bone Club", "GROUND", "PHYSICAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    234: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 45],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Stomp", "NORMAL", "PHYSICAL", 65],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120],
      ["Giga Impact", "NORMAL", "PHYSICAL", 600]
    ],
    236: [
      ["Vacuum Wave", "FIGHTING", "SPECIAL", 35],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Low Kick", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Final Gambit", "FIGHTING", "SPECIAL", 70],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 80],
      ["Collision Course", "FIGHTING", "PHYSICAL", 100],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "SPECIAL", 600]
    ],
    238: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Frost Breath", "ICE", "SPECIAL", 45],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    261: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Bite", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Sucker Punch", "DARK", "PHYSICAL", 70],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    276: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Drill Peck", "FLYING", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    278: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    283: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Signal Beam", "BUG", "SPECIAL", 75],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    285: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    290: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bone Club", "GROUND", "PHYSICAL", 65],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    296: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Counter", "FIGHTING", "PHYSICAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Low Kick", "FIGHTING", "PHYSICAL", 80],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Assault", "FIGHTING", "PHYSICAL", 600]
    ],
    299: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Pebble Burst", "ROCK", "SPECIAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Power Gem", "ROCK", "SPECIAL", 80],
      ["Geode Blast", "ROCK", "SPECIAL", 100],
      ["Meteor Beam", "ROCK", "SPECIAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    300: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Fake Out", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    307: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Final Gambit", "FIGHTING", "SPECIAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Aura Sphere", "FIGHTING", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Dynamic Punch", "FIGHTING", "PHYSICAL", 100],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "SPECIAL", 600]
    ],
    309: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Charge Beam", "ELECTRIC", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    316: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Sludge", "POISON", "SPECIAL", 65],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    318: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Flip Turn", "WATER", "PHYSICAL", 55],
      ["Jet Punch", "WATER", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    320: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Brine", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    322: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Cinder Barrage", "FIRE", "SPECIAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    325: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    331: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Grass Knot", "GRASS", "SPECIAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    333: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Aerial Ace", "FLYING", "PHYSICAL", 55],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    339: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    341: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Crabhammer", "WATER", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    343: [
      ["Mud-Slap", "GROUND", "SPECIAL", 25],
      ["Bonemerang", "GROUND", "PHYSICAL", 45],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earth Power", "GROUND", "SPECIAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600]
    ],
    345: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    347: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    349: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    353: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Rage Fist", "GHOST", "PHYSICAL", 60],
      ["Shadow Claw", "GHOST", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    360: [
      ["Mind Tap", "PSYCHIC", "PHYSICAL", 30],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Dream Eater", "PSYCHIC", "SPECIAL", 55],
      ["Heart Stamp", "PSYCHIC", "SPECIAL", 60],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 70],
      ["Psycho Cut", "PSYCHIC", "PHYSICAL", 80],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    361: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Frost Breath", "ICE", "SPECIAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    366: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    399: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    401: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Chitin Ray", "BUG", "SPECIAL", 100],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    408: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Rock Throw", "ROCK", "PHYSICAL", 60],
      ["Stone Axe", "ROCK", "PHYSICAL", 70],
      ["Rock Slide", "ROCK", "PHYSICAL", 80],
      ["Stone Edge", "ROCK", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    410: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Pebble Burst", "ROCK", "SPECIAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Quartz Beam", "ROCK", "SPECIAL", 75],
      ["Iron Head", "STEEL", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600]
    ],
    412: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Silver Wind", "BUG", "SPECIAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    415: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Lunge", "BUG", "PHYSICAL", 80],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    418: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Water Gun", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Liquidation", "WATER", "PHYSICAL", 85],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    420: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    422: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Origin Pulse", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    425: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Hex", "GHOST", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    427: [
      ["Double Hit", "NORMAL", "PHYSICAL", 35],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    431: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Slash", "NORMAL", "PHYSICAL", 65],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    433: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    434: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Bite", "DARK", "PHYSICAL", 60],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Sucker Punch", "DARK", "PHYSICAL", 80],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    436: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Kinetic Rush", "PSYCHIC", "PHYSICAL", 60],
      ["Psyshock", "PSYCHIC", "SPECIAL", 75],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 85],
      ["Heavy Slam", "STEEL", "PHYSICAL", 100],
      ["Steel Beam", "STEEL", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "PHYSICAL", 600]
    ],
    438: [
      ["Rollout", "ROCK", "PHYSICAL", 30],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Diamond Storm", "ROCK", "PHYSICAL", 85],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 95],
      ["Stone Edge", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    446: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Body Slam", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    447: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Rock Smash", "FIGHTING", "PHYSICAL", 40],
      ["Karate Chop", "FIGHTING", "PHYSICAL", 50],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Reversal", "FIGHTING", "PHYSICAL", 70],
      ["Counter", "FIGHTING", "PHYSICAL", 80],
      ["Brick Break", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    449: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Fissure", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Dig", "GROUND", "PHYSICAL", 80],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    451: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    453: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Shell Side Arm", "POISON", "SPECIAL", 85],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Secret Sword", "FIGHTING", "SPECIAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    456: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 50],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Water Pulse", "WATER", "SPECIAL", 70],
      ["Waterfall", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    458: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Chilling Water", "WATER", "SPECIAL", 55],
      ["Brine", "WATER", "SPECIAL", 65],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    459: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Icy Wind", "ICE", "SPECIAL", 55],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Razor Leaf", "GRASS", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Blizzard", "ICE", "SPECIAL", 100],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    504: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Super Fang", "NORMAL", "PHYSICAL", 55],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Hyper Fang", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    509: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Snarl", "DARK", "SPECIAL", 60],
      ["Dark Pulse", "DARK", "SPECIAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    511: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Grass Knot", "GRASS", "SPECIAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Vine Whip", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Leaf Storm", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    513: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Incinerate", "FIRE", "SPECIAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Flame Burst", "FIRE", "SPECIAL", 70],
      ["Fire Punch", "FIRE", "PHYSICAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "SPECIAL", 600]
    ],
    515: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Bubble Beam", "WATER", "SPECIAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Waterfall", "WATER", "PHYSICAL", 75],
      ["Scald", "WATER", "SPECIAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    517: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    522: [
      ["Nuzzle", "ELECTRIC", "PHYSICAL", 25],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 45],
      ["Spark", "ELECTRIC", "PHYSICAL", 55],
      ["Thunder Fang", "ELECTRIC", "PHYSICAL", 65],
      ["Thunder Punch", "ELECTRIC", "PHYSICAL", 75],
      ["Bolt Beak", "ELECTRIC", "PHYSICAL", 85],
      ["Fusion Bolt", "ELECTRIC", "PHYSICAL", 100],
      ["Volt Tackle", "ELECTRIC", "PHYSICAL", 120],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    527: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Air Cutter", "FLYING", "SPECIAL", 60],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Eerie Spell", "PSYCHIC", "SPECIAL", 80],
      ["Freezing Glare", "PSYCHIC", "SPECIAL", 90],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    529: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    546: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Glitter Beam", "FAIRY", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    548: [
      ["Magical Leaf", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    550: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    554: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flare Jab", "FIRE", "PHYSICAL", 40],
      ["Fire Fang", "FIRE", "PHYSICAL", 55],
      ["Flame Wheel", "FIRE", "PHYSICAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Blaze Kick", "FIRE", "PHYSICAL", 85],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    5554: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    557: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Smack Down", "ROCK", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    559: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    5562: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    562: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Infernal Parade", "GHOST", "SPECIAL", 55],
      ["Hex", "GHOST", "SPECIAL", 65],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    564: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    566: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Rock Tomb", "ROCK", "PHYSICAL", 45],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Stone Axe", "ROCK", "PHYSICAL", 65],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    568: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Fang", "POISON", "PHYSICAL", 45],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    6570: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Swift", "NORMAL", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    570: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Snarl", "DARK", "SPECIAL", 55],
      ["Umbral Wave", "DARK", "SPECIAL", 60],
      ["Night Daze", "DARK", "SPECIAL", 75],
      ["Dark Pulse", "DARK", "SPECIAL", 80],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    572: [
      ["Tail Slap", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Crush Grip", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Slam", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    580: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Gust", "FLYING", "SPECIAL", 40],
      ["Wing Attack", "FLYING", "PHYSICAL", 55],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Air Slash", "FLYING", "SPECIAL", 75],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    585: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Trailblaze", "GRASS", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Take Down", "NORMAL", "PHYSICAL", 85],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    588: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["X-Scissor", "BUG", "PHYSICAL", 80],
      ["Leech Life", "BUG", "PHYSICAL", 90],
      ["Megahorn", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    590: [
      ["Magical Leaf", "GRASS", "SPECIAL", 25],
      ["Mega Drain", "GRASS", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    592: [
      ["Whirlpool", "WATER", "SPECIAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Water Gun", "WATER", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    595: [
      ["Struggle Bug", "BUG", "SPECIAL", 35],
      ["Infestation", "BUG", "SPECIAL", 40],
      ["Silver Wind", "BUG", "SPECIAL", 55],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Electroweb", "ELECTRIC", "SPECIAL", 70],
      ["Pollen Puff", "BUG", "SPECIAL", 85],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    597: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Gyro Ball", "STEEL", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Drum Beating", "GRASS", "PHYSICAL", 80],
      ["Ivy Cudgel", "GRASS", "PHYSICAL", 100],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    605: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    613: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    616: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    619: [
      ["Arm Thrust", "FIGHTING", "PHYSICAL", 25],
      ["Low Kick", "FIGHTING", "PHYSICAL", 40],
      ["Reversal", "FIGHTING", "PHYSICAL", 55],
      ["Force Palm", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Drain Punch", "FIGHTING", "PHYSICAL", 80],
      ["Collision Course", "FIGHTING", "PHYSICAL", 100],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    622: [
      ["Astonish", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    627: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 30],
      ["Peck", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Wing Attack", "FLYING", "PHYSICAL", 60],
      ["Slash", "NORMAL", "PHYSICAL", 70],
      ["Bounce", "FLYING", "PHYSICAL", 85],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    629: [
      ["Aerial Ace", "FLYING", "PHYSICAL", 25],
      ["Dual Wingbeat", "FLYING", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Pluck", "FLYING", "PHYSICAL", 60],
      ["Drill Peck", "FLYING", "PHYSICAL", 75],
      ["Comeuppance", "DARK", "PHYSICAL", 80],
      ["Floaty Fall", "FLYING", "PHYSICAL", 90],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Massive Hurricane", "FLYING", "PHYSICAL", 600]
    ],
    636: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Flare Blitz", "FIRE", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    659: [
      ["Echoed Voice", "NORMAL", "SPECIAL", 35],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 45],
      ["Snore", "NORMAL", "SPECIAL", 50],
      ["Super Fang", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Headbutt", "NORMAL", "PHYSICAL", 80],
      ["Flail", "NORMAL", "PHYSICAL", 90],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    667: [
      ["Weather Ball", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    672: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    674: [
      ["Vital Throw", "FIGHTING", "PHYSICAL", 28],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Storm Throw", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Low Kick", "FIGHTING", "PHYSICAL", 70],
      ["Low Sweep", "FIGHTING", "PHYSICAL", 80],
      ["Brick Break", "FIGHTING", "PHYSICAL", 90],
      ["Superpower", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    677: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Confusion", "PSYCHIC", "SPECIAL", 50],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Psychic Noise", "PSYCHIC", "SPECIAL", 75],
      ["Expanding Force", "PSYCHIC", "SPECIAL", 80],
      ["Psychic", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    682: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Glitter Beam", "FAIRY", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    684: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Glitter Beam", "FAIRY", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    686: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Payback", "DARK", "PHYSICAL", 50],
      ["Knock Off", "DARK", "PHYSICAL", 65],
      ["Night Slash", "DARK", "PHYSICAL", 70],
      ["Mind Slam", "PSYCHIC", "PHYSICAL", 85],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    688: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Razor Shell", "WATER", "PHYSICAL", 75],
      ["Rock Slide", "ROCK", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    690: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Bubble", "WATER", "SPECIAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    692: [
      ["Water Gun", "WATER", "SPECIAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Water Pulse", "WATER", "SPECIAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Crabhammer", "WATER", "PHYSICAL", 85],
      ["Muddy Water", "WATER", "SPECIAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    694: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Terrain Pulse", "NORMAL", "SPECIAL", 50],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Volt Switch", "ELECTRIC", "SPECIAL", 70],
      ["Discharge", "ELECTRIC", "SPECIAL", 80],
      ["Thunderbolt", "ELECTRIC", "SPECIAL", 90],
      ["Hyper Roar", "NORMAL", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    696: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Wyrm Lash", "DRAGON", "PHYSICAL", 70],
      ["Dragon Claw", "DRAGON", "PHYSICAL", 80],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Glaive Rush", "DRAGON", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    698: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Avalanche", "ICE", "PHYSICAL", 55],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Aurora Beam", "ICE", "SPECIAL", 80],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    708: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Last Respects", "GHOST", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    710: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Spirit Shackle", "GHOST", "PHYSICAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    712: [
      ["Icicle Spear", "ICE", "PHYSICAL", 25],
      ["Ice Ball", "ICE", "PHYSICAL", 40],
      ["Ice Shard", "ICE", "PHYSICAL", 50],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Fang", "ICE", "PHYSICAL", 70],
      ["Ice Spinner", "ICE", "PHYSICAL", 80],
      ["Ice Hammer", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    714: [
      ["Gust", "FLYING", "SPECIAL", 35],
      ["Air Cutter", "FLYING", "SPECIAL", 45],
      ["Chatter", "FLYING", "SPECIAL", 55],
      ["Air Slash", "FLYING", "SPECIAL", 65],
      ["Draco Slime", "DRAGON", "SPECIAL", 70],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 85],
      ["Aeroblast", "FLYING", "SPECIAL", 100],
      ["Draco Deluge", "DRAGON", "SPECIAL", 120],
      ["Massive Hurricane", "FLYING", "SPECIAL", 600]
    ],
    734: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Super Fang", "NORMAL", "PHYSICAL", 50],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Facade", "NORMAL", "PHYSICAL", 70],
      ["Endeavor", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Double-Edge", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    739: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    742: [
      ["Infestation", "BUG", "SPECIAL", 25],
      ["Silver Wind", "BUG", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Signal Beam", "BUG", "SPECIAL", 65],
      ["Pollen Puff", "BUG", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Bug Buzz", "BUG", "SPECIAL", 90],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Hive Crush", "BUG", "SPECIAL", 600]
    ],
    744: [
      ["Rock Blast", "ROCK", "PHYSICAL", 25],
      ["Accelerock", "ROCK", "PHYSICAL", 40],
      ["Rock Throw", "ROCK", "PHYSICAL", 50],
      ["Rock Tomb", "ROCK", "PHYSICAL", 60],
      ["Rock Slide", "ROCK", "PHYSICAL", 75],
      ["Mighty Cleave", "ROCK", "PHYSICAL", 85],
      ["Diamond Storm", "ROCK", "PHYSICAL", 100],
      ["Boulder Rush", "ROCK", "PHYSICAL", 120],
      ["Crumbling Rain", "ROCK", "PHYSICAL", 600]
    ],
    747: [
      ["Poison Sting", "POISON", "PHYSICAL", 25],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Toxic Ram", "POISON", "PHYSICAL", 100],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    749: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["High Horsepower", "GROUND", "PHYSICAL", 85],
      ["Earthquake", "GROUND", "PHYSICAL", 100],
      ["Fissure", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    751: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Water Pulse", "WATER", "SPECIAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Bubble Beam", "WATER", "SPECIAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    753: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Petal Blizzard", "GRASS", "PHYSICAL", 90],
      ["Petal Dance", "GRASS", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    755: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Syrup Bomb", "GRASS", "SPECIAL", 55],
      ["Glitter Beam", "FAIRY", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    757: [
      ["Smog", "POISON", "SPECIAL", 30],
      ["Acid Spray", "POISON", "SPECIAL", 40],
      ["Clear Smog", "POISON", "SPECIAL", 50],
      ["Venoshock", "POISON", "SPECIAL", 65],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Fire Pledge", "FIRE", "SPECIAL", 80],
      ["Sludge Wave", "POISON", "SPECIAL", 95],
      ["Armor Cannon", "FIRE", "SPECIAL", 120],
      ["Toxic Deluge", "POISON", "SPECIAL", 600]
    ],
    759: [
      ["Barrage", "NORMAL", "PHYSICAL", 25],
      ["Tackle", "NORMAL", "PHYSICAL", 40],
      ["Flail", "NORMAL", "PHYSICAL", 50],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Axe Kick", "FIGHTING", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    767: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Waterfall", "WATER", "PHYSICAL", 65],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Lunge", "BUG", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    769: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Night Shade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Earth Power", "GROUND", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    819: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    827: [
      ["Dusk Needle", "DARK", "SPECIAL", 30],
      ["Gloom Pulse", "DARK", "SPECIAL", 40],
      ["Umbral Wave", "DARK", "SPECIAL", 50],
      ["Snarl", "DARK", "SPECIAL", 60],
      ["Dark Pulse", "DARK", "SPECIAL", 75],
      ["Night Daze", "DARK", "SPECIAL", 85],
      ["Fiery Wrath", "DARK", "SPECIAL", 90],
      ["Baddy Bad", "DARK", "SPECIAL", 120],
      ["Endless Hollow", "DARK", "SPECIAL", 600]
    ],
    829: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    831: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Hidden Power", "NORMAL", "SPECIAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ],
    833: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    835: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Zippy Zap", "ELECTRIC", "PHYSICAL", 50],
      ["Spark", "ELECTRIC", "PHYSICAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Zing Zap", "ELECTRIC", "PHYSICAL", 80],
      ["Wild Charge", "ELECTRIC", "PHYSICAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "PHYSICAL", 600]
    ],
    843: [
      ["Sand Tomb", "GROUND", "PHYSICAL", 35],
      ["Bone Rush", "GROUND", "PHYSICAL", 40],
      ["Bonemerang", "GROUND", "PHYSICAL", 50],
      ["Bulldoze", "GROUND", "PHYSICAL", 60],
      ["Stomping Tantrum", "GROUND", "PHYSICAL", 75],
      ["Drill Run", "GROUND", "PHYSICAL", 80],
      ["Thousand Waves", "GROUND", "PHYSICAL", 90],
      ["Headlong Rush", "GROUND", "PHYSICAL", 120],
      ["Crossing Fissure", "GROUND", "PHYSICAL", 600]
    ],
    846: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    848: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Sludge Bomb", "POISON", "SPECIAL", 90],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    850: [
      ["Cinder Tap", "FIRE", "PHYSICAL", 25],
      ["Flare Jab", "FIRE", "PHYSICAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 55],
      ["Fire Fang", "FIRE", "PHYSICAL", 65],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Fire Lash", "FIRE", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    852: [
      ["Double Kick", "FIGHTING", "PHYSICAL", 30],
      ["Mach Punch", "FIGHTING", "PHYSICAL", 40],
      ["Seismic Toss", "FIGHTING", "PHYSICAL", 55],
      ["Circle Throw", "FIGHTING", "PHYSICAL", 60],
      ["Brick Break", "FIGHTING", "PHYSICAL", 75],
      ["Submission", "FIGHTING", "PHYSICAL", 80],
      ["Sacred Sword", "FIGHTING", "PHYSICAL", 90],
      ["Close Combat", "FIGHTING", "PHYSICAL", 120],
      ["Meteor Fists", "FIGHTING", "PHYSICAL", 600]
    ],
    854: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    868: [
      ["Disarming Voice", "FAIRY", "SPECIAL", 25],
      ["Fairy Wind", "FAIRY", "SPECIAL", 40],
      ["Draining Kiss", "FAIRY", "SPECIAL", 50],
      ["Glitter Beam", "FAIRY", "SPECIAL", 65],
      ["Alluring Voice", "FAIRY", "SPECIAL", 75],
      ["Dazzling Gleam", "FAIRY", "SPECIAL", 80],
      ["Moonblast", "FAIRY", "SPECIAL", 95],
      ["Fleur Cannon", "FAIRY", "SPECIAL", 120],
      ["Starlight Charm", "FAIRY", "SPECIAL", 600]
    ],
    872: [
      ["Powder Snow", "ICE", "SPECIAL", 35],
      ["Icy Wind", "ICE", "SPECIAL", 45],
      ["Struggle Bug", "BUG", "SPECIAL", 50],
      ["Aurora Beam", "ICE", "SPECIAL", 65],
      ["Freeze-Dry", "ICE", "SPECIAL", 70],
      ["Freezy Frost", "ICE", "SPECIAL", 85],
      ["Ice Beam", "ICE", "SPECIAL", 90],
      ["Bug Buzz", "BUG", "SPECIAL", 120],
      ["Ice Time", "ICE", "SPECIAL", 600]
    ],
    878: [
      ["Metal Claw", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Gear Grind", "STEEL", "PHYSICAL", 50],
      ["Gyro Ball", "STEEL", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Meteor Mash", "STEEL", "PHYSICAL", 90],
      ["Heavy Slam", "STEEL", "PHYSICAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600]
    ],
    884: [
      ["Alloy Spark", "STEEL", "SPECIAL", 35],
      ["Tachyon Cutter", "STEEL", "SPECIAL", 45],
      ["Mirror Shot", "STEEL", "SPECIAL", 55],
      ["Draco Slime", "DRAGON", "SPECIAL", 65],
      ["Dragon Pulse", "DRAGON", "SPECIAL", 75],
      ["Flash Cannon", "STEEL", "SPECIAL", 80],
      ["Chrome Beam", "STEEL", "SPECIAL", 100],
      ["Draco Meteor", "DRAGON", "SPECIAL", 120],
      ["Alloy Breaker", "STEEL", "SPECIAL", 600]
    ],
    915: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    917: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    919: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    924: [
      ["Feint", "NORMAL", "PHYSICAL", 30],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Egg Bomb", "NORMAL", "PHYSICAL", 55],
      ["Bide", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    926: [
      ["Pixie Jab", "FAIRY", "PHYSICAL", 35],
      ["Sprite Kick", "FAIRY", "PHYSICAL", 40],
      ["Charm Strike", "FAIRY", "PHYSICAL", 50],
      ["Fae Strike", "FAIRY", "PHYSICAL", 60],
      ["Spirit Break", "FAIRY", "PHYSICAL", 75],
      ["Glimmer Crash", "FAIRY", "PHYSICAL", 85],
      ["Play Rough", "FAIRY", "PHYSICAL", 90],
      ["Magical Torque", "FAIRY", "PHYSICAL", 120],
      ["Starlight Charm", "FAIRY", "PHYSICAL", 600]
    ],
    935: [
      ["Fire Spin", "FIRE", "SPECIAL", 35],
      ["Ember", "FIRE", "SPECIAL", 40],
      ["Flame Charge", "FIRE", "PHYSICAL", 50],
      ["Incinerate", "FIRE", "SPECIAL", 60],
      ["Fire Punch", "FIRE", "PHYSICAL", 75],
      ["Lava Plume", "FIRE", "SPECIAL", 80],
      ["Bitter Blade", "FIRE", "PHYSICAL", 90],
      ["Fire Blast", "FIRE", "SPECIAL", 120],
      ["Ignition Point", "FIRE", "PHYSICAL", 600]
    ],
    938: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Overdrive", "ELECTRIC", "SPECIAL", 80],
      ["Buzzy Buzz", "ELECTRIC", "SPECIAL", 90],
      ["Zap Cannon", "ELECTRIC", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    940: [
      ["Shock Wave", "ELECTRIC", "SPECIAL", 25],
      ["Thunder Shock", "ELECTRIC", "SPECIAL", 40],
      ["Electroweb", "ELECTRIC", "SPECIAL", 55],
      ["Parabolic Charge", "ELECTRIC", "SPECIAL", 65],
      ["Rising Voltage", "ELECTRIC", "SPECIAL", 70],
      ["Oblivion Wing", "FLYING", "SPECIAL", 80],
      ["Wildbolt Storm", "ELECTRIC", "SPECIAL", 100],
      ["Hurricane", "FLYING", "SPECIAL", 120],
      ["Static Overload", "ELECTRIC", "SPECIAL", 600]
    ],
    942: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Crunch", "DARK", "PHYSICAL", 80],
      ["Hyperspace Fury", "DARK", "PHYSICAL", 100],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Endless Hollow", "DARK", "PHYSICAL", 600]
    ],
    944: [
      ["Mortal Spin", "POISON", "PHYSICAL", 30],
      ["Poison Tail", "POISON", "PHYSICAL", 45],
      ["Poison Fang", "POISON", "PHYSICAL", 50],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Cross Poison", "POISON", "PHYSICAL", 70],
      ["Poison Jab", "POISON", "PHYSICAL", 80],
      ["Take Down", "NORMAL", "PHYSICAL", 90],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    946: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Branch Poke", "GRASS", "PHYSICAL", 40],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Needle Arm", "GRASS", "PHYSICAL", 60],
      ["Flower Trick", "GRASS", "PHYSICAL", 70],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "PHYSICAL", 600]
    ],
    948: [
      ["Mud-Slap", "GROUND", "SPECIAL", 25],
      ["Sand Burst", "GROUND", "SPECIAL", 40],
      ["Mud Shot", "GROUND", "SPECIAL", 55],
      ["Mud Bomb", "GROUND", "SPECIAL", 65],
      ["Scorching Sands", "GROUND", "SPECIAL", 70],
      ["Energy Ball", "GRASS", "SPECIAL", 85],
      ["Earth Power", "GROUND", "SPECIAL", 90],
      ["Solar Beam", "GRASS", "SPECIAL", 120],
      ["Crossing Fissure", "GROUND", "SPECIAL", 600]
    ],
    951: [
      ["Bullet Seed", "GRASS", "PHYSICAL", 25],
      ["Vine Whip", "GRASS", "PHYSICAL", 45],
      ["Grassy Glide", "GRASS", "PHYSICAL", 55],
      ["Leaf Tornado", "GRASS", "SPECIAL", 65],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Seed Bomb", "GRASS", "PHYSICAL", 80],
      ["Energy Ball", "GRASS", "SPECIAL", 90],
      ["Power Whip", "GRASS", "PHYSICAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ],
    953: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Revenge", "BUG", "PHYSICAL", 55],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["First Impression", "BUG", "PHYSICAL", 90],
      ["Attack Order", "BUG", "PHYSICAL", 120],
      ["Hive Crush", "BUG", "PHYSICAL", 600]
    ],
    955: [
      ["Stored Power", "PSYCHIC", "SPECIAL", 25],
      ["Twin Beam", "PSYCHIC", "SPECIAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Psybeam", "PSYCHIC", "SPECIAL", 65],
      ["Mystical Power", "PSYCHIC", "SPECIAL", 70],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Glitzy Glow", "PSYCHIC", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600]
    ],
    960: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Flip Turn", "WATER", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600]
    ],
    963: [
      ["Triple Dive", "WATER", "PHYSICAL", 30],
      ["Aqua Jet", "WATER", "PHYSICAL", 45],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Bubble Beam", "WATER", "SPECIAL", 65],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Dive", "WATER", "PHYSICAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ],
    965: [
      ["Gear Grind", "STEEL", "PHYSICAL", 35],
      ["Bullet Punch", "STEEL", "PHYSICAL", 40],
      ["Poison Tail", "POISON", "PHYSICAL", 50],
      ["Gyro Ball", "STEEL", "PHYSICAL", 60],
      ["Smart Strike", "STEEL", "PHYSICAL", 70],
      ["Metal Burst", "STEEL", "PHYSICAL", 80],
      ["Behemoth Bash", "STEEL", "PHYSICAL", 100],
      ["Gunk Shot", "POISON", "PHYSICAL", 120],
      ["Alloy Breaker", "STEEL", "PHYSICAL", 600]
    ],
    969: [
      ["Grit Shot", "ROCK", "SPECIAL", 30],
      ["Pebble Burst", "ROCK", "SPECIAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Ancient Power", "ROCK", "SPECIAL", 60],
      ["Sludge", "POISON", "SPECIAL", 70],
      ["Quartz Beam", "ROCK", "SPECIAL", 85],
      ["Geode Blast", "ROCK", "SPECIAL", 100],
      ["Belch", "POISON", "SPECIAL", 120],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600]
    ],
    971: [
      ["Lick", "GHOST", "PHYSICAL", 30],
      ["Shadow Sneak", "GHOST", "PHYSICAL", 40],
      ["Rage Fist", "GHOST", "PHYSICAL", 50],
      ["Shadow Claw", "GHOST", "PHYSICAL", 65],
      ["Spirit Shackle", "GHOST", "PHYSICAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Phantom Force", "GHOST", "PHYSICAL", 90],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ],
    974: [
      ["Ice Ball", "ICE", "PHYSICAL", 30],
      ["Ice Shard", "ICE", "PHYSICAL", 40],
      ["Ice Fang", "ICE", "PHYSICAL", 55],
      ["Avalanche", "ICE", "PHYSICAL", 60],
      ["Ice Punch", "ICE", "PHYSICAL", 75],
      ["Icicle Crash", "ICE", "PHYSICAL", 85],
      ["Mountain Gale", "ICE", "PHYSICAL", 100],
      ["Freeze Shock", "ICE", "PHYSICAL", 120],
      ["Ice Time", "ICE", "PHYSICAL", 600]
    ],
    999: [
      ["Wisp Flicker", "GHOST", "SPECIAL", 30],
      ["Grave Whisper", "GHOST", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Infernal Parade", "GHOST", "SPECIAL", 60],
      ["Bitter Malice", "GHOST", "SPECIAL", 75],
      ["Shadow Ball", "GHOST", "SPECIAL", 80],
      ["Phantom Pulse", "GHOST", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Untold Nightmare", "GHOST", "SPECIAL", 600]
    ],
    1012: [
      ["Absorb", "GRASS", "SPECIAL", 25],
      ["Magical Leaf", "GRASS", "SPECIAL", 40],
      ["Night Shade", "GHOST", "SPECIAL", 55],
      ["Syrup Bomb", "GRASS", "SPECIAL", 60],
      ["Giga Drain", "GRASS", "SPECIAL", 75],
      ["Apple Acid", "GRASS", "SPECIAL", 80],
      ["Grass Knot", "GRASS", "SPECIAL", 100],
      ["Moongeist Beam", "GHOST", "SPECIAL", 120],
      ["Petal Bloom", "GRASS", "SPECIAL", 600]
    ]
  };
  var GOLPES_SEM_EVOLUCAO_2026_11_05 = {
    83: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Pay Day", "NORMAL", "PHYSICAL", 40],
      ["Acrobatics", "FLYING", "PHYSICAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Chip Away", "NORMAL", "PHYSICAL", 70],
      ["Mega Punch", "NORMAL", "PHYSICAL", 80],
      ["Hyper Drill", "NORMAL", "PHYSICAL", 100],
      ["Dragon Ascent", "FLYING", "PHYSICAL", 120],
      ["Thrash", "NORMAL", "PHYSICAL", 120],
      ["Comet Punch", "NORMAL", "PHYSICAL", 150],
      ["Sky Attack", "FLYING", "PHYSICAL", 600],
      ["Ultimate Force", "NORMAL", "PHYSICAL", 600]
    ],
    211: [
      ["Brine Cut", "WATER", "PHYSICAL", 35],
      ["Aqua Jet", "WATER", "PHYSICAL", 40],
      ["Yawn", "WATER", "PHYSICAL", 55],
      ["Barb Barrage", "POISON", "PHYSICAL", 60],
      ["Aqua Cutter", "WATER", "PHYSICAL", 70],
      ["Aqua Step", "WATER", "PHYSICAL", 80],
      ["Aqua Tail", "WATER", "PHYSICAL", 90],
      ["Caustic Slam", "POISON", "PHYSICAL", 120],
      ["Wave Crash", "WATER", "PHYSICAL", 120],
      ["Riptide Slam", "WATER", "PHYSICAL", 150],
      ["Cyclonic Tide", "WATER", "PHYSICAL", 600],
      ["Toxic Deluge", "POISON", "PHYSICAL", 600]
    ],
    222: [
      ["Water Shuriken", "WATER", "SPECIAL", 25],
      ["Water Gun", "WATER", "SPECIAL", 40],
      ["Crystal Spray", "ROCK", "SPECIAL", 50],
      ["Water Pulse", "WATER", "SPECIAL", 60],
      ["Brine", "WATER", "SPECIAL", 70],
      ["Hydro Steam", "WATER", "SPECIAL", 80],
      ["Bouncy Bubble", "WATER", "SPECIAL", 90],
      ["Hydro Pump", "WATER", "SPECIAL", 120],
      ["Power Gem", "ROCK", "SPECIAL", 120],
      ["Tidal Surge", "WATER", "SPECIAL", 150],
      ["Crumbling Rain", "ROCK", "SPECIAL", 600],
      ["Cyclonic Tide", "WATER", "SPECIAL", 600]
    ]
  };
  var GOLPES_OUTLAND_2026_11_05 = {
    2006: [
      ["Pin Missile", "BUG", "PHYSICAL", 25],
      ["Fury Cutter", "BUG", "PHYSICAL", 40],
      ["Fell Stinger", "BUG", "PHYSICAL", 50],
      ["Bug Bite", "BUG", "PHYSICAL", 60],
      ["Skitter Smack", "BUG", "PHYSICAL", 70],
      ["Leech Life", "BUG", "PHYSICAL", 80],
      ["Fly", "FLYING", "PHYSICAL", 90],
      ["Brave Bird", "FLYING", "PHYSICAL", 120],
      ["Mega Swarm", "BUG", "PHYSICAL", 600]
    ],
    2007: [
      ["Double Slap", "NORMAL", "PHYSICAL", 25],
      ["Quick Attack", "NORMAL", "PHYSICAL", 40],
      ["Mirror Coat", "PSYCHIC", "SPECIAL", 55],
      ["Covet", "NORMAL", "PHYSICAL", 60],
      ["Relic Song", "NORMAL", "SPECIAL", 75],
      ["Razor Wind", "NORMAL", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Psyblade", "PSYCHIC", "PHYSICAL", 120],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ]
  };
  var GOLPES_ARTE_NOVA_2026_11_15 = {
    765: [
      ["Terrain Pulse", "NORMAL", "SPECIAL", 35],
      ["Echoed Voice", "NORMAL", "SPECIAL", 40],
      ["Weather Ball", "NORMAL", "SPECIAL", 50],
      ["Round", "NORMAL", "SPECIAL", 60],
      ["Tri Attack", "NORMAL", "SPECIAL", 75],
      ["Psyshock", "PSYCHIC", "SPECIAL", 80],
      ["Hyper Voice", "NORMAL", "SPECIAL", 90],
      ["Future Sight", "PSYCHIC", "SPECIAL", 120],
      ["Techno Blast", "NORMAL", "SPECIAL", 120],
      ["Hyper Beam", "NORMAL", "SPECIAL", 150],
      ["Mental Singularity", "PSYCHIC", "SPECIAL", 600],
      ["Ultimate Force", "NORMAL", "SPECIAL", 600]
    ]
  };
  var GOLPES_MEGAS_2026_11_15 = {
    9359: [
      ["Power Trip", "DARK", "PHYSICAL", 25],
      ["Fling", "DARK", "PHYSICAL", 40],
      ["Beat Up", "DARK", "PHYSICAL", 55],
      ["Assurance", "DARK", "PHYSICAL", 60],
      ["Lash Out", "DARK", "PHYSICAL", 75],
      ["Shadow Bone", "GHOST", "PHYSICAL", 85],
      ["Foul Play", "DARK", "PHYSICAL", 95],
      ["Shadow Force", "GHOST", "PHYSICAL", 120],
      ["Pursuit", "DARK", "PHYSICAL", 120],
      ["Midnight Ravage", "DARK", "PHYSICAL", 150],
      ["Wicked Blow", "DARK", "PHYSICAL", 600],
      ["Untold Nightmare", "GHOST", "PHYSICAL", 600]
    ]
  };
  var TABELAS = [
    GOLPES_INICIAIS,
    GOLPES_PSEUDO_LENDARIOS,
    GOLPES_MENOS_DE_10,
    GOLPES_REWORK_2026_09,
    GOLPES_PRE_EVOLUCOES_KANTO,
    GOLPES_REWORK_2026_09_28,
    GOLPES_REWORK_2026_10_03,
    GOLPES_REWORK_2026_10_04,
    GOLPES_LENDARIOS_2026_10_11,
    GOLPES_REWORK_2026_10_13,
    GOLPES_REWORK_2026_10_15,
    GOLPES_SEGUNDA_EVO_2026_10_15,
    GOLPES_ARTE_NOVA,
    GOLPES_CONTRATO_2026_10_16,
    GOLPES_REWORK_2026_10_23,
    GOLPES_REWORK_2026_10_26,
    GOLPES_REWORK_2026_10_27,
    GOLPES_LENDARIOS_2026_10_27,
    GOLPES_REWORK_2026_10_29,
    GOLPES_LENDARIOS_2026_10_29,
    GOLPES_ARTE_NOVA_2026_10_30,
    GOLPES_REWORK_2026_11_02,
    GOLPES_ARTE_NOVA_2026_11_05,
    GOLPES_PRIMEIRO_ESTAGIO_2026_11_05,
    GOLPES_DUAS_FORMAS_2026_11_05,
    GOLPES_SEM_EVOLUCAO_2026_11_05,
    GOLPES_ARTE_NOVA_2026_11_15
  ];
  var TABELAS_FECHADAS = /* @__PURE__ */ new Set([
    GOLPES_SEGUNDA_EVO_2026_10_15,
    GOLPES_CONTRATO_2026_10_16,
    GOLPES_PRIMEIRO_ESTAGIO_2026_11_05,
    GOLPES_DUAS_FORMAS_2026_11_05
  ]);
  function golpeDaLinha([name, type, category, power, marca]) {
    if (marca === MEGA) {
      return { name, type, category, power, cooldownMs: COOLDOWN_MEGA_MS, learnLevel: 1, categoriaFixa: true, cdFixo: true, golpeMega: true };
    }
    return {
      name,
      type,
      category,
      power,
      cooldownMs: cooldownDoPoder(power),
      learnLevel: 1,
      ...power >= 600 ? { categoriaFixa: true } : {}
    };
  }
  function golpesDaPlanilhaDaMega(pokeId) {
    const linhas = GOLPES_MEGAS_2026_11_15[pokeId] ?? GOLPES_MEGAS_2026_10_30[pokeId] ?? GOLPES_MEGAS_2026_10_29[pokeId] ?? GOLPES_MEGAS_2026_10_27[pokeId] ?? GOLPES_MEGAS_2026_10_26[pokeId] ?? GOLPES_MEGAS_2026_10_23[pokeId] ?? GOLPES_MEGAS_2026_10_22[pokeId] ?? GOLPES_MEGAS_2026_10_21[pokeId] ?? GOLPES_MEGAS_CONTRATO_2026_10_16[pokeId] ?? GOLPES_MEGAS_2026_10_03[pokeId];
    return linhas ? linhas.map(golpeDaLinha) : null;
  }
  function golpesDaPlanilhaDoOutland(pokeId) {
    const linhas = GOLPES_OUTLAND_2026_11_05[pokeId] ?? GOLPES_OUTLAND_2026_11_02[pokeId] ?? GOLPES_OUTLAND_2026_10_27[pokeId] ?? GOLPES_OUTLAND_2026_10_15[pokeId] ?? GOLPES_OUTLAND_2026_10_13[pokeId];
    return linhas ? linhas.map(golpeDaLinha) : null;
  }
  function golpesDoOutlandFechados(pokeId) {
    return Object.hasOwn(GOLPES_OUTLAND_2026_10_15, pokeId) || Object.hasOwn(GOLPES_OUTLAND_2026_11_05, pokeId);
  }
  function aplicarGolpesDasPlanilhas(obter) {
    for (const tabela of TABELAS) {
      const fechada = TABELAS_FECHADAS.has(tabela);
      for (const [id, linhas] of Object.entries(tabela)) {
        for (const esp of obter(Number(id)) ?? []) {
          esp.attacks = linhas.map(golpeDaLinha);
          if (fechada) esp.golpesFechados = true;
          else delete esp.golpesFechados;
        }
      }
    }
  }

  // tests/.cache/shared/herdar-base-outland.mjs
  var herdar_base_outland_exports = {};
  __export(herdar_base_outland_exports, {
    herdarBaseOutland: () => herdarBaseOutland
  });

  // tests/.cache/shared/outland-sprite-dex.mjs
  var PREFIXOS_OUTLAND = [
    "Brave ",
    "Tribal ",
    "Ancient ",
    "War ",
    "Furious ",
    "Charged ",
    "Magnetic ",
    "Evil ",
    "Freezing ",
    "Psy ",
    "Heavy ",
    "Milch-",
    "Roll ",
    "Hard ",
    "Brute ",
    "Enraged ",
    "Dark ",
    "Trickmaster ",
    "Banshee ",
    "Taekwondo ",
    "Enigmatic ",
    "Magma ",
    "Toxic "
  ];
  var DEX_POR_NOME = /* @__PURE__ */ new Map([
    ["blastoise", 9],
    ["feraligatr", 160],
    ["meganium", 154],
    ["venusaur", 3],
    ["heracross", 214],
    ["scyther", 123],
    ["girafarig", 203],
    ["raichu", 26],
    ["ampharos", 181],
    ["electabuzz", 125],
    ["dragonair", 148],
    ["cloyster", 91],
    ["dewgong", 87],
    ["jynx", 124],
    ["piloswine", 221],
    ["miltank", 241],
    ["donphan", 232],
    ["sandslash", 28],
    ["golem", 76],
    ["rhydon", 112],
    ["charizard", 6],
    ["typhlosion", 157],
    ["nidoking", 34],
    ["nidoqueen", 31],
    ["crobat", 169],
    ["gengar", 94],
    ["misdreavus", 200],
    ["hitmonchan", 107],
    ["hitmonlee", 106],
    ["hitmontop", 237],
    ["arcanine", 59],
    ["magmar", 126],
    ["pupitar", 247],
    ["steelix", 208],
    ["wigglytuff", 40],
    ["xatu", 178],
    ["alakazam", 65],
    ["hypno", 97],
    ["gyarados", 130],
    ["mantine", 226],
    ["pinsir", 127],
    ["clefable", 36],
    ["granbull", 210],
    ["skarmory", 227],
    ["noctowl", 164],
    ["pidgeot", 18],
    ["marowak", 105],
    ["tyranitar", 248],
    ["aerodactyl", 142],
    ["scizor", 212],
    ["dragonite", 149],
    ["whimsicott", 547],
    ["magcargo", 219],
    ["toxicroak", 454],
    ["exeggutor", 103],
    ["mismagius", 429],
    ["aurorus", 699],
    ["scrafty", 560]
  ]);
  function dexSpriteBaseOutland(pokeId, nome = "") {
    if (!isOutlandPokeId(pokeId)) return null;
    let base = String(nome ?? "").trim();
    for (const p of PREFIXOS_OUTLAND) {
      if (base.startsWith(p)) {
        base = base.slice(p.length);
        break;
      }
    }
    return DEX_POR_NOME.get(base.toLowerCase()) ?? null;
  }

  // tests/.cache/shared/herdar-base-outland.mjs
  var CAMPOS_STAT = ["baseHp", "baseAtk", "baseDef", "baseSpAtk", "baseSpDef", "baseSpeed"];
  function herdarBaseOutland(lista) {
    const porId = new Map(lista.map((c) => [c.pokeId, c]));
    for (const esp of lista) {
      if (!isOutlandPokeId(esp.pokeId)) continue;
      const proprios = golpesDaPlanilhaDoOutland(esp.pokeId);
      if (proprios) esp.attacks = proprios;
      if (golpesDoOutlandFechados(esp.pokeId)) esp.golpesFechados = true;
      const baseDex = dexSpriteBaseOutland(esp.pokeId, esp.name);
      if (baseDex == null) continue;
      const base = porId.get(baseDex);
      if (!base) continue;
      for (const k of CAMPOS_STAT) {
        if (typeof base[k] === "number") esp[k] = base[k];
      }
      if (!proprios && Array.isArray(base.attacks)) esp.attacks = base.attacks.map((a) => ({ ...a }));
    }
  }

  // tests/.cache/shared/herdar-golpes-orre.mjs
  var herdar_golpes_orre_exports = {};
  __export(herdar_golpes_orre_exports, {
    herdarGolpesOrre: () => herdarGolpesOrre,
    nacionalDeOrre: () => nacionalDeOrre
  });
  var ORRE_MIN = 13e3;
  var ORRE_MAX = 14e3;
  var nacionalDeOrre = (pokeId) => pokeId >= ORRE_MIN && pokeId < ORRE_MAX ? pokeId - ORRE_MIN : null;
  function herdarGolpesOrre(lista) {
    const porId = new Map(lista.map((c) => [c.pokeId, c]));
    for (const esp of lista) {
      const baseId = nacionalDeOrre(esp?.pokeId ?? -1);
      if (baseId == null) continue;
      const base = porId.get(baseId);
      if (Array.isArray(base?.attacks)) esp.attacks = base.attacks.map((a) => ({ ...a }));
    }
  }

  // tests/.cache/shared/megas.mjs
  var megas_exports = {};
  __export(megas_exports, {
    GOLPE_MEGA_POR_TIPO: () => GOLPE_MEGA_POR_TIPO,
    MEGA2_LOOKTYPE_BASE: () => MEGA2_LOOKTYPE_BASE,
    MEGA2_POKE_BASE: () => MEGA2_POKE_BASE,
    MEGA2_SHINY_LOOKTYPE_BASE: () => MEGA2_SHINY_LOOKTYPE_BASE,
    MEGAS: () => MEGAS,
    MEGAS_SEGUNDAS: () => MEGAS_SEGUNDAS,
    MEGA_LOOKTYPE_BASE: () => MEGA_LOOKTYPE_BASE,
    MEGA_POKE_BASE: () => MEGA_POKE_BASE,
    MEGA_POKE_MAX: () => MEGA_POKE_MAX,
    MEGA_POR_DEX: () => MEGA_POR_DEX,
    MEGA_POR_POKEID: () => MEGA_POR_POKEID,
    MEGA_SEGUNDA_POR_DEX: () => MEGA_SEGUNDA_POR_DEX,
    MEGA_SHINY_LOOKTYPE_BASE: () => MEGA_SHINY_LOOKTYPE_BASE,
    TODAS_AS_MEGAS: () => TODAS_AS_MEGAS,
    criarEspeciesMega: () => criarEspeciesMega,
    dexDaMega: () => dexDaMega,
    elosMegaDaNota: () => elosMegaDaNota,
    especieBaseDaMega: () => especieBaseDaMega,
    golpeMegaDe: () => golpeMegaDe,
    isMegaPokeId: () => isMegaPokeId,
    looktypeDaMega: () => looktypeDaMega,
    looktypeMega: () => looktypeMega,
    looktypeMegaShiny: () => looktypeMegaShiny,
    looktypeShinyDaMega: () => looktypeShinyDaMega,
    megaDaEspecie: () => megaDaEspecie,
    megaPokeId: () => megaPokeId,
    megaPorPokeId: () => megaPorPokeId,
    megaTemShiny: () => megaTemShiny,
    megasDaEspecie: () => megasDaEspecie,
    pokeIdDaMega: () => pokeIdDaMega,
    totalBasesMega: () => totalBasesMega
  });

  // tests/.cache/shared/spawns-filtro.mjs
  var LENDARIO_DEX = /* @__PURE__ */ new Set([
    377,
    378,
    379,
    380,
    381,
    382,
    383,
    384,
    480,
    481,
    482,
    483,
    484,
    485,
    486,
    487,
    488,
    638,
    639,
    640,
    641,
    642,
    643,
    644,
    645,
    646,
    716,
    717,
    718,
    772,
    773,
    785,
    786,
    787,
    788,
    789,
    790,
    791,
    792,
    793,
    794,
    795,
    796,
    797,
    798,
    799,
    800,
    803,
    804,
    805,
    806,
    888,
    889,
    890,
    891,
    892,
    894,
    895,
    896,
    897,
    898,
    905,
    1001,
    1002,
    1003,
    1004,
    1007,
    1008,
    1009,
    1010,
    1014,
    1015,
    1016,
    1017,
    1020,
    1021,
    1022,
    1023,
    1024
  ]);
  var MITICO_DEX = /* @__PURE__ */ new Set([
    385,
    386,
    489,
    490,
    491,
    492,
    493,
    647,
    648,
    649,
    719,
    720,
    721,
    801,
    802,
    807,
    808,
    809,
    893,
    1025
  ]);

  // tests/.cache/shared/escala-hunt-level.mjs
  function dexDe2(pokeId) {
    const id = Number(pokeId);
    if (!Number.isFinite(id) || id < 1) return id;
    if (id < 1e3) return id;
    if (id >= 13e3) return id % 1e3;
    if (isOutlandPokeId(id)) return id;
    return id;
  }

  // tests/.cache/shared/megas.mjs
  var MEGA_POKE_BASE = 3e3;
  var MEGA_POKE_MAX = 4e3;
  var MEGA_LOOKTYPE_BASE = 8e4;
  var MEGA_SHINY_LOOKTYPE_BASE = 85e3;
  var looktypeMega = (dex) => MEGA_LOOKTYPE_BASE + Number(dex);
  var looktypeMegaShiny = (dex) => MEGA_SHINY_LOOKTYPE_BASE + Number(dex);
  var megaPokeId = (dex) => MEGA_POKE_BASE + Number(dex);
  function isMegaPokeId(pokeId) {
    const id = Number(pokeId);
    return id > MEGA_POKE_BASE && id < MEGA_POKE_MAX || MEGA_SEGUNDA_POR_POKEID.has(id);
  }
  var MEGAS = [
    {
      dex: 3,
      slug: "venusaur",
      nome: "Mega Venusaur",
      pedra: "Venusaurite",
      icone: "venusaurite",
      tipos: ["GRASS", "POISON"],
      bases: { hp: 80, atk: 100, def: 123, spAtk: 122, spDef: 120, speed: 80 }
    },
    {
      dex: 6,
      slug: "charizard",
      nome: "Mega Charizard Y",
      pedra: "Charizardite Y",
      icone: "charizardite-y",
      tipos: ["FIRE", "FLYING"],
      bases: { hp: 78, atk: 104, def: 78, spAtk: 159, spDef: 115, speed: 100 }
    },
    {
      dex: 9,
      slug: "blastoise",
      nome: "Mega Blastoise",
      pedra: "Blastoisinite",
      icone: "blastoisinite",
      tipos: ["WATER"],
      bases: { hp: 79, atk: 103, def: 120, spAtk: 135, spDef: 115, speed: 78 }
    },
    {
      dex: 15,
      slug: "beedrill",
      nome: "Mega Beedrill",
      pedra: "Beedrillite",
      icone: "beedrillite",
      tipos: ["BUG", "POISON"],
      bases: { hp: 65, atk: 150, def: 40, spAtk: 15, spDef: 80, speed: 145 }
    },
    {
      dex: 18,
      slug: "pidgeot",
      nome: "Mega Pidgeot",
      pedra: "Pidgeotite",
      icone: "pidgeotite",
      tipos: ["NORMAL", "FLYING"],
      bases: { hp: 83, atk: 80, def: 80, spAtk: 135, spDef: 80, speed: 121 }
    },
    {
      dex: 26,
      slug: "raichu_y",
      nome: "Mega Raichu Y",
      pedra: "Raichunite Y",
      icone: "raichunite-y",
      tipos: ["ELECTRIC"],
      bases: { hp: 60, atk: 100, def: 55, spAtk: 160, spDef: 80, speed: 130 }
    },
    {
      dex: 36,
      slug: "clefable",
      nome: "Mega Clefable",
      pedra: "Clefablite",
      icone: "clefablite",
      tipos: ["FAIRY", "FLYING"],
      bases: { hp: 95, atk: 80, def: 93, spAtk: 135, spDef: 110, speed: 70 }
    },
    {
      dex: 65,
      slug: "alakazam",
      nome: "Mega Alakazam",
      pedra: "Alakazite",
      icone: "alakazite",
      tipos: ["PSYCHIC"],
      bases: { hp: 55, atk: 50, def: 65, spAtk: 175, spDef: 105, speed: 150 }
    },
    {
      dex: 71,
      slug: "victreebel",
      nome: "Mega Victreebel",
      pedra: "Victreebelite",
      icone: "victreebelite",
      tipos: ["GRASS", "POISON"],
      bases: { hp: 80, atk: 125, def: 85, spAtk: 135, spDef: 95, speed: 70 }
    },
    {
      dex: 80,
      slug: "slowbro",
      nome: "Mega Slowbro",
      pedra: "Slowbronite",
      icone: "slowbronite",
      tipos: ["WATER", "PSYCHIC"],
      bases: { hp: 95, atk: 75, def: 180, spAtk: 130, spDef: 80, speed: 30 }
    },
    {
      dex: 94,
      slug: "gengar",
      nome: "Mega Gengar",
      pedra: "Gengarite",
      icone: "gengarite",
      tipos: ["GHOST", "POISON"],
      bases: { hp: 60, atk: 65, def: 80, spAtk: 170, spDef: 95, speed: 130 }
    },
    {
      dex: 115,
      slug: "kangaskhan",
      nome: "Mega Kangaskhan",
      pedra: "Kangaskhanite",
      icone: "kangaskhanite",
      tipos: ["NORMAL"],
      bases: { hp: 105, atk: 125, def: 100, spAtk: 60, spDef: 100, speed: 100 }
    },
    {
      dex: 121,
      slug: "starmie",
      nome: "Mega Starmie",
      pedra: "Starminite",
      icone: "starminite",
      tipos: ["WATER", "PSYCHIC"],
      bases: { hp: 60, atk: 140, def: 105, spAtk: 130, spDef: 105, speed: 120 }
    },
    {
      dex: 127,
      slug: "pinsir",
      nome: "Mega Pinsir",
      pedra: "Pinsirite",
      icone: "pinsirite",
      tipos: ["BUG", "FLYING"],
      bases: { hp: 65, atk: 155, def: 120, spAtk: 65, spDef: 90, speed: 105 }
    },
    {
      dex: 130,
      slug: "gyarados",
      nome: "Mega Gyarados",
      pedra: "Gyaradosite",
      icone: "gyaradosite",
      tipos: ["WATER", "DARK"],
      bases: { hp: 95, atk: 155, def: 109, spAtk: 70, spDef: 130, speed: 81 }
    },
    {
      dex: 142,
      slug: "aerodactyl",
      nome: "Mega Aerodactyl",
      pedra: "Aerodactylite",
      icone: "aerodactylite",
      tipos: ["ROCK", "FLYING"],
      bases: { hp: 80, atk: 135, def: 85, spAtk: 70, spDef: 95, speed: 150 }
    },
    {
      dex: 149,
      slug: "dragonite",
      nome: "Mega Dragonite",
      pedra: "Dragonitite",
      icone: "dragonitite",
      tipos: ["DRAGON", "FLYING"],
      bases: { hp: 91, atk: 124, def: 115, spAtk: 145, spDef: 125, speed: 100 }
    },
    {
      dex: 150,
      slug: "mewtwo_y",
      nome: "Mega Mewtwo Y",
      pedra: "Mewtwonite Y",
      icone: "mewtwonite-y",
      tipos: ["PSYCHIC"],
      bases: { hp: 106, atk: 150, def: 70, spAtk: 194, spDef: 120, speed: 140 }
    },
    {
      dex: 154,
      slug: "meganium",
      nome: "Mega Meganium",
      pedra: "Meganiumite",
      icone: "meganiumite",
      tipos: ["GRASS", "FAIRY"],
      bases: { hp: 80, atk: 92, def: 115, spAtk: 143, spDef: 115, speed: 80 }
    },
    {
      dex: 160,
      slug: "feraligatr",
      nome: "Mega Feraligatr",
      pedra: "Feraligite",
      icone: "feraligite",
      tipos: ["WATER", "DRAGON"],
      bases: { hp: 85, atk: 160, def: 125, spAtk: 89, spDef: 93, speed: 78 }
    },
    {
      dex: 181,
      slug: "ampharos",
      nome: "Mega Ampharos",
      pedra: "Ampharosite",
      icone: "ampharosite",
      tipos: ["ELECTRIC", "DRAGON"],
      bases: { hp: 90, atk: 95, def: 105, spAtk: 165, spDef: 110, speed: 45 }
    },
    {
      dex: 208,
      slug: "steelix",
      nome: "Mega Steelix",
      pedra: "Steelixite",
      icone: "steelixite",
      tipos: ["STEEL", "GROUND"],
      bases: { hp: 75, atk: 125, def: 230, spAtk: 55, spDef: 95, speed: 30 }
    },
    {
      dex: 212,
      slug: "scizor",
      nome: "Mega Scizor",
      pedra: "Scizorite",
      icone: "scizorite",
      tipos: ["BUG", "STEEL"],
      bases: { hp: 70, atk: 150, def: 140, spAtk: 65, spDef: 100, speed: 75 }
    },
    {
      dex: 214,
      slug: "heracross",
      nome: "Mega Heracross",
      pedra: "Heracronite",
      icone: "heracronite",
      tipos: ["BUG", "FIGHTING"],
      bases: { hp: 80, atk: 185, def: 115, spAtk: 40, spDef: 105, speed: 75 }
    },
    {
      dex: 227,
      slug: "skarmory",
      nome: "Mega Skarmory",
      pedra: "Skarmorite",
      icone: "skarmorite",
      tipos: ["STEEL", "FLYING"],
      bases: { hp: 65, atk: 140, def: 110, spAtk: 40, spDef: 100, speed: 110 }
    },
    {
      dex: 229,
      slug: "houndoom",
      nome: "Mega Houndoom",
      pedra: "Houndoominite",
      icone: "houndoominite",
      tipos: ["DARK", "FIRE"],
      bases: { hp: 75, atk: 90, def: 90, spAtk: 140, spDef: 90, speed: 115 }
    },
    {
      dex: 248,
      slug: "tyranitar",
      nome: "Mega Tyranitar",
      pedra: "Tyranitarite",
      icone: "tyranitarite",
      tipos: ["ROCK", "DARK"],
      bases: { hp: 100, atk: 164, def: 150, spAtk: 95, spDef: 120, speed: 71 }
    },
    {
      dex: 254,
      slug: "sceptile",
      nome: "Mega Sceptile",
      pedra: "Sceptilite",
      icone: "sceptilite",
      tipos: ["GRASS", "DRAGON"],
      bases: { hp: 70, atk: 110, def: 75, spAtk: 145, spDef: 85, speed: 145 }
    },
    {
      dex: 257,
      slug: "blaziken",
      nome: "Mega Blaziken",
      pedra: "Blazikenite",
      icone: "blazikenite",
      tipos: ["FIRE", "FIGHTING"],
      bases: { hp: 80, atk: 160, def: 80, spAtk: 130, spDef: 80, speed: 100 }
    },
    {
      dex: 260,
      slug: "swampert",
      nome: "Mega Swampert",
      pedra: "Swampertite",
      icone: "swampertite",
      tipos: ["WATER", "GROUND"],
      bases: { hp: 100, atk: 150, def: 110, spAtk: 95, spDef: 110, speed: 70 }
    },
    {
      dex: 282,
      slug: "gardevoir",
      nome: "Mega Gardevoir",
      pedra: "Gardevoirite",
      icone: "gardevoirite",
      tipos: ["PSYCHIC", "FAIRY"],
      bases: { hp: 68, atk: 85, def: 65, spAtk: 165, spDef: 135, speed: 100 }
    },
    {
      dex: 302,
      slug: "sableye",
      nome: "Mega Sableye",
      pedra: "Sablenite",
      icone: "sablenite",
      tipos: ["DARK", "GHOST"],
      bases: { hp: 50, atk: 85, def: 125, spAtk: 85, spDef: 115, speed: 20 }
    },
    {
      dex: 303,
      slug: "mawile",
      nome: "Mega Mawile",
      pedra: "Mawilite",
      icone: "mawilite",
      tipos: ["STEEL", "FAIRY"],
      bases: { hp: 50, atk: 105, def: 125, spAtk: 55, spDef: 95, speed: 50 }
    },
    {
      dex: 306,
      slug: "aggron",
      nome: "Mega Aggron",
      pedra: "Aggronite",
      icone: "aggronite",
      tipos: ["STEEL"],
      bases: { hp: 70, atk: 140, def: 230, spAtk: 60, spDef: 80, speed: 50 }
    },
    {
      dex: 308,
      slug: "medicham",
      nome: "Mega Medicham",
      pedra: "Medichamite",
      icone: "medichamite",
      tipos: ["FIGHTING", "PSYCHIC"],
      bases: { hp: 60, atk: 100, def: 85, spAtk: 80, spDef: 85, speed: 100 }
    },
    {
      dex: 310,
      slug: "manectric",
      nome: "Mega Manectric",
      pedra: "Manectite",
      icone: "manectite",
      tipos: ["ELECTRIC"],
      bases: { hp: 70, atk: 75, def: 80, spAtk: 135, spDef: 80, speed: 135 }
    },
    {
      dex: 319,
      slug: "sharpedo",
      nome: "Mega Sharpedo",
      pedra: "Sharpedonite",
      icone: "sharpedonite",
      tipos: ["WATER", "DARK"],
      bases: { hp: 70, atk: 140, def: 70, spAtk: 110, spDef: 65, speed: 105 }
    },
    {
      dex: 323,
      slug: "camerupt",
      nome: "Mega Camerupt",
      pedra: "Cameruptite",
      icone: "cameruptite",
      tipos: ["FIRE", "GROUND"],
      bases: { hp: 70, atk: 120, def: 100, spAtk: 145, spDef: 105, speed: 20 }
    },
    {
      dex: 334,
      slug: "altaria",
      nome: "Mega Altaria",
      pedra: "Altarianite",
      icone: "altarianite",
      tipos: ["DRAGON", "FAIRY"],
      bases: { hp: 75, atk: 110, def: 110, spAtk: 110, spDef: 105, speed: 80 }
    },
    {
      dex: 354,
      slug: "banette",
      nome: "Mega Banette",
      pedra: "Banettite",
      icone: "banettite",
      tipos: ["GHOST"],
      bases: { hp: 64, atk: 165, def: 75, spAtk: 93, spDef: 83, speed: 75 }
    },
    {
      dex: 358,
      slug: "chimecho",
      nome: "Mega Chimecho",
      pedra: "Chimechite",
      icone: "chimechite",
      tipos: ["PSYCHIC", "STEEL"],
      bases: { hp: 75, atk: 50, def: 110, spAtk: 135, spDef: 120, speed: 65 }
    },
    {
      dex: 359,
      slug: "absol",
      nome: "Mega Absol",
      pedra: "Absolite",
      icone: "absolite",
      tipos: ["DARK"],
      bases: { hp: 65, atk: 150, def: 60, spAtk: 115, spDef: 60, speed: 115 }
    },
    {
      dex: 362,
      slug: "glalie",
      nome: "Mega Glalie",
      pedra: "Glalitite",
      icone: "glalitite",
      tipos: ["ICE"],
      bases: { hp: 80, atk: 120, def: 80, spAtk: 120, spDef: 80, speed: 100 }
    },
    {
      dex: 373,
      slug: "salamence",
      nome: "Mega Salamence",
      pedra: "Salamencite",
      icone: "salamencite",
      tipos: ["DRAGON", "FLYING"],
      bases: { hp: 95, atk: 145, def: 130, spAtk: 120, spDef: 90, speed: 120 }
    },
    {
      dex: 376,
      slug: "metagross",
      nome: "Mega Metagross",
      pedra: "Metagrossite",
      icone: "metagrossite",
      tipos: ["STEEL", "PSYCHIC"],
      bases: { hp: 80, atk: 145, def: 150, spAtk: 105, spDef: 110, speed: 110 }
    },
    {
      dex: 380,
      slug: "latias",
      nome: "Mega Latias",
      pedra: "Latiasite",
      icone: "latiasite",
      tipos: ["DRAGON", "PSYCHIC"],
      bases: { hp: 80, atk: 100, def: 120, spAtk: 140, spDef: 150, speed: 110 }
    },
    {
      dex: 381,
      slug: "latios",
      nome: "Mega Latios",
      pedra: "Latiosite",
      icone: "latiosite",
      tipos: ["DRAGON", "PSYCHIC"],
      bases: { hp: 80, atk: 130, def: 100, spAtk: 160, spDef: 120, speed: 110 }
    },
    {
      dex: 382,
      slug: "kyogre_primal",
      nome: "Primal Kyogre",
      pedra: "Blue Orb",
      icone: "blue-orb",
      tipos: ["WATER"],
      bases: { hp: 100, atk: 150, def: 90, spAtk: 180, spDef: 160, speed: 90 }
    },
    {
      dex: 383,
      slug: "groudon_primal",
      nome: "Primal Groudon",
      pedra: "Red Orb",
      icone: "red-orb",
      tipos: ["GROUND", "FIRE"],
      bases: { hp: 100, atk: 180, def: 160, spAtk: 150, spDef: 90, speed: 90 }
    },
    {
      dex: 384,
      slug: "rayquaza",
      nome: "Mega Rayquaza",
      pedra: "Jade Orb",
      icone: "jade-orb",
      tipos: ["DRAGON", "FLYING"],
      bases: { hp: 105, atk: 180, def: 100, spAtk: 180, spDef: 100, speed: 115 }
    },
    {
      dex: 398,
      slug: "staraptor",
      nome: "Mega Staraptor",
      pedra: "Staraptite",
      icone: "staraptite",
      tipos: ["FIGHTING", "FLYING"],
      bases: { hp: 85, atk: 140, def: 100, spAtk: 60, spDef: 90, speed: 110 }
    },
    {
      dex: 428,
      slug: "lopunny",
      nome: "Mega Lopunny",
      pedra: "Lopunnite",
      icone: "lopunnite",
      tipos: ["NORMAL", "FIGHTING"],
      bases: { hp: 65, atk: 136, def: 94, spAtk: 54, spDef: 96, speed: 135 }
    },
    {
      dex: 445,
      slug: "garchomp",
      nome: "Mega Garchomp",
      pedra: "Garchompite",
      icone: "garchompite",
      tipos: ["DRAGON", "GROUND"],
      bases: { hp: 108, atk: 170, def: 115, spAtk: 120, spDef: 95, speed: 92 }
    },
    {
      dex: 448,
      slug: "lucario",
      nome: "Mega Lucario",
      pedra: "Lucarionite",
      icone: "lucarionite",
      tipos: ["FIGHTING", "STEEL"],
      bases: { hp: 70, atk: 145, def: 88, spAtk: 140, spDef: 70, speed: 112 }
    },
    {
      dex: 460,
      slug: "abomasnow",
      nome: "Mega Abomasnow",
      pedra: "Abomasite",
      icone: "abomasite",
      tipos: ["GRASS", "ICE"],
      bases: { hp: 90, atk: 132, def: 105, spAtk: 132, spDef: 105, speed: 30 }
    },
    {
      dex: 475,
      slug: "gallade",
      nome: "Mega Gallade",
      pedra: "Galladite",
      icone: "galladite",
      tipos: ["PSYCHIC", "FIGHTING"],
      bases: { hp: 68, atk: 165, def: 95, spAtk: 65, spDef: 115, speed: 110 }
    },
    {
      dex: 478,
      slug: "froslass",
      nome: "Mega Froslass",
      pedra: "Froslassite",
      icone: "froslassite",
      tipos: ["ICE", "GHOST"],
      bases: { hp: 70, atk: 80, def: 70, spAtk: 140, spDef: 100, speed: 120 }
    },
    {
      dex: 485,
      slug: "heatran",
      nome: "Mega Heatran",
      pedra: "Heatranite",
      icone: "heatranite",
      tipos: ["FIRE", "STEEL"],
      bases: { hp: 91, atk: 120, def: 106, spAtk: 175, spDef: 141, speed: 67 }
    },
    {
      dex: 491,
      slug: "darkrai",
      nome: "Mega Darkrai",
      pedra: "Darkranite",
      icone: "darkranite",
      tipos: ["DARK"],
      bases: { hp: 70, atk: 120, def: 130, spAtk: 165, spDef: 130, speed: 85 }
    },
    {
      dex: 500,
      slug: "emboar",
      nome: "Mega Emboar",
      pedra: "Emboarite",
      icone: "emboarite",
      tipos: ["FIRE", "FIGHTING"],
      bases: { hp: 110, atk: 148, def: 75, spAtk: 110, spDef: 110, speed: 75 }
    },
    {
      dex: 530,
      slug: "excadrill",
      nome: "Mega Excadrill",
      pedra: "Excadrite",
      icone: "excadrite",
      tipos: ["GROUND", "STEEL"],
      bases: { hp: 110, atk: 165, def: 100, spAtk: 65, spDef: 65, speed: 103 }
    },
    {
      dex: 531,
      slug: "audino",
      nome: "Mega Audino",
      pedra: "Audinite",
      icone: "audinite",
      tipos: ["NORMAL", "FAIRY"],
      bases: { hp: 103, atk: 60, def: 126, spAtk: 80, spDef: 126, speed: 50 }
    },
    {
      dex: 545,
      slug: "scolipede",
      nome: "Mega Scolipede",
      pedra: "Scolipite",
      icone: "scolipite",
      tipos: ["BUG", "POISON"],
      bases: { hp: 60, atk: 140, def: 149, spAtk: 75, spDef: 99, speed: 62 }
    },
    {
      dex: 560,
      slug: "scrafty",
      nome: "Mega Scrafty",
      pedra: "Scraftinite",
      icone: "scraftinite",
      tipos: ["DARK", "FIGHTING"],
      bases: { hp: 65, atk: 130, def: 135, spAtk: 55, spDef: 135, speed: 68 }
    },
    {
      dex: 604,
      slug: "eelektross",
      nome: "Mega Eelektross",
      pedra: "Eelektrossite",
      icone: "eelektrossite",
      tipos: ["ELECTRIC"],
      bases: { hp: 85, atk: 145, def: 80, spAtk: 135, spDef: 90, speed: 80 }
    },
    {
      dex: 609,
      slug: "chandelure",
      nome: "Mega Chandelure",
      pedra: "Chandelurite",
      icone: "chandelurite",
      tipos: ["GHOST", "FIRE"],
      bases: { hp: 60, atk: 75, def: 110, spAtk: 175, spDef: 110, speed: 90 }
    },
    {
      dex: 623,
      slug: "golurk",
      nome: "Mega Golurk",
      pedra: "Golurkite",
      icone: "golurkite",
      tipos: ["GROUND", "GHOST"],
      bases: { hp: 89, atk: 159, def: 105, spAtk: 70, spDef: 105, speed: 55 }
    },
    {
      dex: 652,
      slug: "chesnaught",
      nome: "Mega Chesnaught",
      pedra: "Chesnaughtite",
      icone: "chesnaughtite",
      tipos: ["GRASS", "FIGHTING"],
      bases: { hp: 88, atk: 137, def: 172, spAtk: 74, spDef: 115, speed: 44 }
    },
    {
      dex: 655,
      slug: "delphox",
      nome: "Mega Delphox",
      pedra: "Delphoxite",
      icone: "delphoxite",
      tipos: ["FIRE", "PSYCHIC"],
      bases: { hp: 75, atk: 69, def: 72, spAtk: 159, spDef: 125, speed: 134 }
    },
    {
      dex: 658,
      slug: "greninja",
      nome: "Mega Greninja",
      pedra: "Greninjite",
      icone: "greninjite",
      tipos: ["WATER", "DARK"],
      bases: { hp: 72, atk: 125, def: 77, spAtk: 133, spDef: 81, speed: 142 }
    },
    {
      dex: 668,
      slug: "pyroar",
      nome: "Mega Pyroar",
      pedra: "Pyroarite",
      icone: "pyroarite",
      tipos: ["FIRE", "NORMAL"],
      bases: { hp: 86, atk: 88, def: 92, spAtk: 129, spDef: 86, speed: 126 }
    },
    {
      dex: 670,
      slug: "floette",
      nome: "Mega Floette",
      pedra: "Floettite",
      icone: "floettite",
      tipos: ["FAIRY"],
      bases: { hp: 74, atk: 85, def: 87, spAtk: 155, spDef: 148, speed: 102 }
    },
    {
      dex: 678,
      slug: "meowstic",
      nome: "Mega Meowstic",
      pedra: "Meowsticite",
      icone: "meowsticite",
      tipos: ["PSYCHIC"],
      bases: { hp: 74, atk: 48, def: 76, spAtk: 143, spDef: 101, speed: 124 }
    },
    {
      dex: 687,
      slug: "malamar",
      nome: "Mega Malamar",
      pedra: "Malamarite",
      icone: "malamarite",
      tipos: ["DARK", "PSYCHIC"],
      bases: { hp: 86, atk: 102, def: 88, spAtk: 98, spDef: 120, speed: 88 }
    },
    {
      dex: 689,
      slug: "barbaracle",
      nome: "Mega Barbaracle",
      pedra: "Barbaracite",
      icone: "barbaracite",
      tipos: ["ROCK", "FIGHTING"],
      bases: { hp: 72, atk: 140, def: 130, spAtk: 64, spDef: 106, speed: 88 }
    },
    {
      dex: 691,
      slug: "dragalge",
      nome: "Mega Dragalge",
      pedra: "Dragalgite",
      icone: "dragalgite",
      tipos: ["POISON", "DRAGON"],
      bases: { hp: 65, atk: 85, def: 105, spAtk: 132, spDef: 163, speed: 44 }
    },
    {
      dex: 701,
      slug: "hawlucha",
      nome: "Mega Hawlucha",
      pedra: "Hawluchanite",
      icone: "hawluchanite",
      tipos: ["FIGHTING", "FLYING"],
      bases: { hp: 78, atk: 137, def: 100, spAtk: 74, spDef: 93, speed: 118 }
    },
    {
      dex: 718,
      base: 9718,
      slug: "zygarde",
      nome: "Mega Zygarde",
      pedra: "Zygardite",
      icone: "zygardite",
      tipos: ["DRAGON", "GROUND"],
      bases: { hp: 216, atk: 70, def: 91, spAtk: 216, spDef: 85, speed: 100 }
    },
    {
      dex: 719,
      slug: "diancie",
      nome: "Mega Diancie",
      pedra: "Diancite",
      icone: "diancite",
      tipos: ["ROCK", "FAIRY"],
      bases: { hp: 50, atk: 160, def: 110, spAtk: 160, spDef: 110, speed: 110 }
    },
    {
      dex: 740,
      slug: "crabominable",
      nome: "Mega Crabominable",
      pedra: "Crabominite",
      icone: "crabominite",
      tipos: ["FIGHTING", "ICE"],
      bases: { hp: 97, atk: 157, def: 122, spAtk: 62, spDef: 107, speed: 33 }
    },
    {
      dex: 768,
      slug: "golisopod",
      nome: "Mega Golisopod",
      pedra: "Golisopite",
      icone: "golisopite",
      tipos: ["BUG", "STEEL"],
      bases: { hp: 75, atk: 150, def: 175, spAtk: 70, spDef: 120, speed: 40 }
    },
    {
      dex: 780,
      slug: "drampa",
      nome: "Mega Drampa",
      pedra: "Drampanite",
      icone: "drampanite",
      tipos: ["NORMAL", "DRAGON"],
      bases: { hp: 78, atk: 85, def: 110, spAtk: 160, spDef: 116, speed: 36 }
    },
    {
      dex: 801,
      slug: "magearna",
      nome: "Mega Magearna",
      pedra: "Magearnite",
      icone: "magearnite",
      tipos: ["STEEL", "FAIRY"],
      bases: { hp: 80, atk: 125, def: 115, spAtk: 170, spDef: 115, speed: 95 }
    },
    {
      dex: 807,
      slug: "zeraora",
      nome: "Mega Zeraora",
      pedra: "Zeraorite",
      icone: "zeraorite",
      tipos: ["ELECTRIC"],
      bases: { hp: 88, atk: 157, def: 75, spAtk: 147, spDef: 80, speed: 153 }
    },
    {
      dex: 870,
      slug: "falinks",
      nome: "Mega Falinks",
      pedra: "Falinksite",
      icone: "falinksite",
      tipos: ["FIGHTING"],
      bases: { hp: 65, atk: 135, def: 135, spAtk: 70, spDef: 65, speed: 100 }
    },
    {
      dex: 952,
      slug: "scovillain",
      nome: "Mega Scovillain",
      pedra: "Scovillainite",
      icone: "scovillainite",
      tipos: ["GRASS", "FIRE"],
      bases: { hp: 65, atk: 138, def: 85, spAtk: 138, spDef: 85, speed: 75 }
    },
    {
      dex: 970,
      slug: "glimmora",
      nome: "Mega Glimmora",
      pedra: "Glimmoranite",
      icone: "glimmoranite",
      tipos: ["ROCK", "POISON"],
      bases: { hp: 83, atk: 90, def: 105, spAtk: 150, spDef: 96, speed: 101 }
    },
    {
      dex: 978,
      slug: "tatsugiri",
      nome: "Mega Tatsugiri",
      pedra: "Tatsugirinite",
      icone: "tatsugirinite",
      tipos: ["DRAGON", "WATER"],
      bases: { hp: 68, atk: 65, def: 90, spAtk: 135, spDef: 125, speed: 92 }
    },
    {
      dex: 998,
      slug: "baxcalibur",
      nome: "Mega Baxcalibur",
      pedra: "Baxcalibrite",
      icone: "baxcalibrite",
      tipos: ["DRAGON", "ICE"],
      bases: { hp: 115, atk: 175, def: 117, spAtk: 105, spDef: 101, speed: 87 }
    }
  ];
  var MEGAS_SEGUNDAS = [
    {
      dex: 6,
      segunda: true,
      slug: "charizard_x",
      nome: "Mega Charizard X",
      pedra: "Charizardite X",
      icone: "charizardite-x",
      tipos: ["FIRE", "DRAGON"],
      bases: { hp: 78, atk: 130, def: 111, spAtk: 130, spDef: 85, speed: 100 }
    },
    {
      dex: 26,
      segunda: true,
      slug: "raichu_x",
      nome: "Mega Raichu X",
      pedra: "Raichunite X",
      icone: "raichunite-x",
      tipos: ["ELECTRIC"],
      bases: { hp: 60, atk: 135, def: 95, spAtk: 90, spDef: 95, speed: 110 }
    },
    {
      dex: 150,
      segunda: true,
      slug: "mewtwo_x",
      nome: "Mega Mewtwo X",
      pedra: "Mewtwonite X",
      icone: "mewtwonite-x",
      tipos: ["PSYCHIC", "FIGHTING"],
      bases: { hp: 106, atk: 190, def: 100, spAtk: 154, spDef: 100, speed: 130 }
    },
    {
      dex: 359,
      segunda: true,
      slug: "absol_z",
      nome: "Mega Absol Z",
      pedra: "Absolite Z",
      icone: "absolite-z",
      tipos: ["DARK", "GHOST"],
      bases: { hp: 65, atk: 154, def: 60, spAtk: 75, spDef: 60, speed: 151 }
    },
    {
      dex: 445,
      segunda: true,
      slug: "garchomp_z",
      nome: "Mega Garchomp Z",
      pedra: "Garchompite Z",
      icone: "garchompite-z",
      tipos: ["DRAGON"],
      bases: { hp: 108, atk: 130, def: 85, spAtk: 141, spDef: 85, speed: 151 }
    },
    {
      dex: 448,
      segunda: true,
      slug: "lucario_z",
      nome: "Mega Lucario Z",
      pedra: "Lucarionite Z",
      icone: "lucarionite-z",
      tipos: ["FIGHTING", "STEEL"],
      bases: { hp: 70, atk: 100, def: 70, spAtk: 164, spDef: 70, speed: 151 }
    }
  ];
  var MEGA2_POKE_BASE = 9e3;
  var MEGA2_LOOKTYPE_BASE = 83e3;
  var MEGA2_SHINY_LOOKTYPE_BASE = 88e3;
  var TODAS_AS_MEGAS = [...MEGAS, ...MEGAS_SEGUNDAS];
  var pokeIdDaMega = (meta) => (meta.segunda ? MEGA2_POKE_BASE : MEGA_POKE_BASE) + Number(meta.dex);
  var looktypeDaMega = (meta) => (meta.segunda ? MEGA2_LOOKTYPE_BASE : MEGA_LOOKTYPE_BASE) + Number(meta.dex);
  var looktypeShinyDaMega = (meta) => (meta.segunda ? MEGA2_SHINY_LOOKTYPE_BASE : MEGA_SHINY_LOOKTYPE_BASE) + Number(meta.dex);
  var MEGA_POR_DEX = new Map(MEGAS.map((m) => [m.dex, m]));
  var MEGA_SEGUNDA_POR_DEX = new Map(MEGAS_SEGUNDAS.map((m) => [m.dex, m]));
  var MEGA_POR_POKEID = new Map(TODAS_AS_MEGAS.map((m) => [pokeIdDaMega(m), m]));
  var MEGA_SEGUNDA_POR_POKEID = new Map(MEGAS_SEGUNDAS.map((m) => [pokeIdDaMega(m), m]));
  var MEGA_POR_BASE = new Map(TODAS_AS_MEGAS.filter((m) => m.base != null).map((m) => [m.base, m]));
  var especieBaseDaMega = (meta) => meta ? meta.base ?? meta.dex : null;
  function dexDaMega(pokeId) {
    const id = Number(pokeId);
    if (!Number.isFinite(id) || isOutlandPokeId(id) || isMegaPokeId(id)) return null;
    const daBase = MEGA_POR_BASE.get(id);
    if (daBase) return daBase.dex;
    const dex = dexDe2(id);
    const meta = MEGA_POR_DEX.get(dex);
    return meta && meta.base == null ? dex : null;
  }
  function megaDaEspecie(pokeId, segunda = false) {
    const dex = dexDaMega(pokeId);
    if (dex == null) return null;
    return (segunda ? MEGA_SEGUNDA_POR_DEX.get(dex) : MEGA_POR_DEX.get(dex)) ?? null;
  }
  function megasDaEspecie(pokeId) {
    const dex = dexDaMega(pokeId);
    if (dex == null) return [];
    return [MEGA_POR_DEX.get(dex), MEGA_SEGUNDA_POR_DEX.get(dex)].filter(Boolean);
  }
  var megaPorPokeId = (pokeId) => MEGA_POR_POKEID.get(Number(pokeId)) ?? null;
  var megaTemShiny = (meta) => !!meta && !meta.semShiny;
  var totalBasesMega = (m) => m.bases.hp + m.bases.atk + m.bases.def + m.bases.spAtk + m.bases.spDef + m.bases.speed;
  var GOLPE_MEGA_POR_TIPO = {
    NORMAL: "Mega Onslaught",
    FIRE: "Mega Inferno",
    WATER: "Mega Maelstrom",
    GRASS: "Mega Bloom",
    ELECTRIC: "Mega Thunderstorm",
    ICE: "Mega Permafrost",
    FIGHTING: "Mega Rampage",
    POISON: "Mega Venom",
    GROUND: "Mega Earthshock",
    FLYING: "Mega Tempest",
    PSYCHIC: "Mega Mindbreak",
    BUG: "Mega Swarm",
    ROCK: "Mega Landslide",
    GHOST: "Mega Eclipse",
    DRAGON: "Mega Cataclysm",
    DARK: "Mega Abyss",
    STEEL: "Mega Forge",
    FAIRY: "Mega Radiance"
  };
  function golpeMegaDe(meta) {
    const tipo = meta?.tipos?.[0];
    const nome = GOLPE_MEGA_POR_TIPO[tipo];
    if (!nome) return null;
    return {
      name: nome,
      power: 600,
      type: tipo,
      category: (meta.bases.atk ?? 0) >= (meta.bases.spAtk ?? 0) ? "PHYSICAL" : "SPECIAL",
      cooldownMs: COOLDOWN_MEGA_MS,
      learnLevel: 1,
      cdFixo: true,
      golpeMega: true
    };
  }
  function criarEspeciesMega(lista) {
    const porId = new Map(lista.map((c) => [c.pokeId, c]));
    const saida = [];
    for (const m of TODAS_AS_MEGAS) {
      const base = porId.get(especieBaseDaMega(m));
      if (!base) continue;
      const pokeId = pokeIdDaMega(m);
      saida.push({
        ...base,
        pokeId,
        name: m.nome,
        looktype: looktypeDaMega(m),
        description: `a ${m.nome.toLowerCase()}`,
        type1: m.tipos[0],
        type2: m.tipos[1] ?? null,
        baseHp: m.bases.hp,
        baseAtk: m.bases.atk,
        baseDef: m.bases.def,
        baseSpAtk: m.bases.spAtk,
        baseSpDef: m.bases.spDef,
        baseSpeed: m.bases.speed,
        evolvesToId: 0,
        evolveLevel: 0,
        tetoCaptura: 100,
        loot: (base.loot ?? []).map((l) => ({ ...l })),
        attacks: golpesDaPlanilhaDaMega(pokeId) ?? [
          ...(base.attacks ?? []).map((a) => ({ ...a })),
          ...golpeMegaDe(m) ? [golpeMegaDe(m)] : []
        ],
        megaDeDex: m.dex,
        ...m.segunda ? { megaSegunda: true } : {}
      });
    }
    return saida;
  }
  function elosMegaDaNota(lista) {
    const existe = new Set(lista.map((c) => c.pokeId));
    const elos = [];
    for (const m of TODAS_AS_MEGAS) {
      const mega = pokeIdDaMega(m);
      const base = especieBaseDaMega(m);
      if (!existe.has(base) || !existe.has(mega)) continue;
      elos.push([base, mega]);
    }
    return elos;
  }

  // tests/.cache/shared/evolucoes-cruzadas.mjs
  var evolucoes_cruzadas_exports = {};
  __export(evolucoes_cruzadas_exports, {
    CADEIAS_TRUNCADAS: () => CADEIAS_TRUNCADAS,
    EVOLUCOES_ENTRE_GERACOES: () => EVOLUCOES_ENTRE_GERACOES,
    NIVEIS_POR_ONDE_O_ALVO_APARECE: () => NIVEIS_POR_ONDE_O_ALVO_APARECE,
    aplicarCadeiasTruncadas: () => aplicarCadeiasTruncadas,
    aplicarElosEvolutivos: () => aplicarElosEvolutivos,
    aplicarEvolucoesEntreGeracoes: () => aplicarEvolucoesEntreGeracoes,
    corrigirNiveisDeEvolucao: () => corrigirNiveisDeEvolucao,
    normalizarEvolveLevel600: () => normalizarEvolveLevel600
  });
  var CADEIAS_TRUNCADAS = {
    288: { para: 289, nivel: 1250 },
    13288: { para: 289, nivel: 1250 },
    372: { para: 373, nivel: 1250 },
    13372: { para: 373, nivel: 1250 },
    375: { para: 376, nivel: 1250 },
    13375: { para: 376, nivel: 1250 }
  };
  var EVOLUCOES_ENTRE_GERACOES = {
    57: { para: 979, nivel: 114800 },
    82: { para: 462, nivel: 1500 },
    108: { para: 463, nivel: 1500 },
    176: { para: 468, nivel: 1500 },
    190: { para: 424, nivel: 1250 },
    193: { para: 469, nivel: 1500 },
    198: { para: 430, nivel: 1500 },
    200: { para: 429, nivel: 1250 },
    207: { para: 472, nivel: 1500 },
    215: { para: 461, nivel: 1500 },
    217: { para: 901, nivel: 58900 },
    221: { para: 473, nivel: 1500 },
    233: { para: 474, nivel: 1500 },
    296: { para: 297, nivel: 550 },
    13296: { para: 297, nivel: 550 },
    203: { para: 981, nivel: 46150 },
    206: { para: 982, nivel: 46150 },
    234: { para: 899, nivel: 27500 },
    808: { para: 809, nivel: 108e3 },
    647: { para: 8647, nivel: 8600 },
    8718: { para: 718, nivel: 1e4 },
    718: { para: 9718, nivel: 21200 },
    746: { para: 8746, nivel: 84650 },
    483: { para: 8483, nivel: 3500 },
    484: { para: 8484, nivel: 3500 },
    492: { para: 8492, nivel: 3500 },
    641: { para: 8641, nivel: 8600 },
    642: { para: 8642, nivel: 8600 },
    645: { para: 8645, nivel: 8600 },
    646: { para: 8646, nivel: 8600 },
    720: { para: 8720, nivel: 21200 },
    774: { para: 8774, nivel: 84650 },
    888: { para: 8888, nivel: 35150 },
    889: { para: 8889, nivel: 35150 },
    905: { para: 8905, nivel: 35150 },
    964: { para: 8964, nivel: 53350 },
    487: { para: 8487, nivel: 3500 },
    648: { para: 8648, nivel: 8600 },
    898: { para: 8898, nivel: 64950 },
    1017: { para: 9017, nivel: 160300 }
  };
  function aplicarElosEvolutivos(lista, tabela) {
    const porId = new Map(lista.map((c) => [c.pokeId, c]));
    let ligados = 0;
    for (const [id, { para, nivel }] of Object.entries(tabela)) {
      const esp = porId.get(Number(id));
      if (!esp || esp.evolvesToId || !porId.has(para)) continue;
      esp.evolvesToId = para;
      esp.evolveLevel = nivel;
      ligados++;
    }
    return ligados;
  }
  function aplicarEvolucoesEntreGeracoes(lista) {
    return aplicarElosEvolutivos(lista, EVOLUCOES_ENTRE_GERACOES);
  }
  var NIVEIS_POR_ONDE_O_ALVO_APARECE = {
    82: 1500,
    108: 1500,
    112: 3e3,
    114: 3e3,
    125: 3e3,
    126: 3e3,
    176: 1500,
    190: 1250,
    193: 1500,
    198: 1500,
    200: 1250,
    207: 1500,
    215: 1500,
    221: 1500,
    233: 1500,
    299: 2e3,
    315: 3500,
    356: 3e3,
    387: 1750,
    388: 3500,
    390: 1750,
    391: 3500,
    393: 1750,
    394: 3500,
    396: 1750,
    397: 3500,
    399: 2e3,
    401: 2e3,
    403: 1750,
    404: 3500,
    408: 2e3,
    410: 3e3,
    415: 3e3,
    418: 2e3,
    420: 2e3,
    422: 2e3,
    425: 2e3,
    427: 3e3,
    431: 2e3,
    434: 2e3,
    436: 2e3,
    443: 1750,
    444: 3500,
    447: 2e3,
    449: 2e3,
    451: 2e3,
    453: 2e3,
    456: 2e3,
    459: 2e3,
    489: 2e3,
    13299: 2e3,
    13315: 3500,
    13447: 2e3,
    495: 6400,
    496: 8600,
    498: 6400,
    499: 8600,
    501: 6400,
    502: 8600,
    504: 6950,
    507: 8600,
    509: 6950,
    511: 6950,
    513: 6950,
    515: 6950,
    517: 6950,
    519: 6400,
    520: 8600,
    522: 6950,
    524: 6400,
    525: 8600,
    527: 6950,
    529: 6950,
    532: 6400,
    533: 8600,
    535: 6400,
    536: 8600,
    540: 6400,
    541: 8600,
    543: 6400,
    544: 8600,
    546: 6950,
    548: 6950,
    551: 6400,
    552: 8600,
    557: 6950,
    559: 6950,
    562: 6950,
    564: 6950,
    566: 8e3,
    568: 6950,
    570: 6950,
    572: 6950,
    574: 6400,
    575: 8600,
    577: 6400,
    578: 8600,
    580: 6950,
    583: 8600,
    585: 6950,
    588: 6950,
    590: 6950,
    592: 6950,
    595: 6950,
    597: 6950,
    600: 8600,
    602: 6400,
    603: 8600,
    607: 6400,
    608: 8600,
    610: 6400,
    611: 8600,
    613: 6950,
    616: 6950,
    619: 6950,
    622: 6950,
    624: 6400,
    627: 6950,
    629: 6950,
    633: 6400,
    634: 8600,
    636: 6950,
    651: 21200,
    654: 21200,
    659: 16e3,
    661: 14350,
    662: 21200,
    664: 14350,
    665: 21200,
    667: 16e3,
    669: 14350,
    670: 21200,
    674: 2e4,
    679: 14350,
    682: 16e3,
    684: 16e3,
    686: 16e3,
    688: 16e3,
    690: 2e4,
    692: 16e3,
    694: 16e3,
    698: 16e3,
    704: 14350,
    705: 21200,
    708: 16e3,
    712: 16e3,
    714: 16e3,
    722: 32e3,
    725: 32e3,
    726: 43100,
    728: 32e3,
    729: 43100,
    731: 32e3,
    732: 43100,
    734: 34650,
    736: 32e3,
    737: 43100,
    742: 34650,
    747: 34650,
    749: 34650,
    751: 34650,
    755: 34650,
    757: 34650,
    759: 34650,
    761: 32e3,
    762: 43100,
    767: 34650,
    782: 32e3,
    783: 43100,
    172: 60,
    173: 40,
    174: 40,
    238: 100,
    239: 100,
    240: 100,
    298: 20,
    360: 100,
    406: 650,
    433: 700,
    439: 80,
    446: 100,
    458: 100,
    13298: 20,
    13360: 100,
    113: 1125,
    137: 1125,
    349: 1125,
    375: 1250,
    803: 7500
  };
  function corrigirNiveisDeEvolucao(lista) {
    let corrigidos = 0;
    for (const c of lista) {
      const nivel = NIVEIS_POR_ONDE_O_ALVO_APARECE[c.pokeId];
      if (!nivel || !c.evolvesToId || c.evolveLevel === nivel) continue;
      c.evolveLevel = nivel;
      corrigidos++;
    }
    return corrigidos;
  }
  function normalizarEvolveLevel600(lista) {
    for (const c of lista) {
      if (c.evolveLevel === 600) c.evolveLevel = 100;
    }
  }
  function aplicarCadeiasTruncadas(lista) {
    return aplicarElosEvolutivos(lista, CADEIAS_TRUNCADAS);
  }

  // tests/.cache/shared/recompensa-hunt.mjs
  var recompensa_hunt_exports = {};
  __export(recompensa_hunt_exports, {
    EXPOENTE_RENDA: () => EXPOENTE_RENDA,
    FRACAO_BONUS_LOOT: () => FRACAO_BONUS_LOOT,
    alvoRendaPorKill: () => alvoRendaPorKill,
    ouroDoAbate: () => ouroDoAbate,
    ouroDoLootPorKill: () => ouroDoLootPorKill,
    ouroDoNivel: () => ouroDoNivel,
    ouroPorDerrotaHunt: () => ouroPorDerrotaHunt,
    xpDoNivel: () => xpDoNivel,
    xpPorDerrota: () => xpPorDerrota
  });

  // tests/.cache/shared/sell-value.mjs
  var NIVEL_ANCORA = 150;
  var OURO_ANCORA = 12e3;
  var XP_ANCORA = 0.6 * NIVEL_ANCORA ** 2;
  var xpDoNivel = (n) => n <= NIVEL_ANCORA ? Math.floor(6 * n * n / 10) + 8 : Math.round(XP_ANCORA * (n / NIVEL_ANCORA) ** 1.25);
  var ouroDoNivel = (n) => Math.round(OURO_ANCORA * (n / NIVEL_ANCORA) ** 0.6);
  var OURO_KILL_NIVEL_1 = 36;
  var OURO_KILL_ANCORA_NIVEL = 5e3;
  var OURO_KILL_ANCORA = 6e3;
  var EXPOENTE_OURO_KILL = Math.log(OURO_KILL_ANCORA / OURO_KILL_NIVEL_1) / Math.log(OURO_KILL_ANCORA_NIVEL);
  var NIVEL_TETO_OURO = 25e3;
  var TETO_OURO_KILL = Math.round(OURO_KILL_NIVEL_1 * NIVEL_TETO_OURO ** EXPOENTE_OURO_KILL);
  var ouroPorKillDoNivel = (n) => Math.min(
    TETO_OURO_KILL,
    Math.max(1, Math.round(OURO_KILL_NIVEL_1 * Math.max(1, Number(n) || 1) ** EXPOENTE_OURO_KILL))
  );
  var NIVEL_HUNT_TETO_SELL_POKEMON = 2500;
  var TETO_SELL_POKEMON = ouroDoNivel(NIVEL_HUNT_TETO_SELL_POKEMON);

  // tests/.cache/shared/recompensa-hunt.mjs
  function xpPorDerrota(hunt, nivelMob, especie) {
    return xpDoNivel(nivelMob);
  }
  var FRACAO_BONUS_LOOT = 0.15;
  var EXPOENTE_RENDA = 0.3;
  function alvoRendaPorKill(nivel) {
    const n = Math.max(1, Number(nivel) || 1);
    const base = n <= NIVEL_TETO_OURO ? ouroPorKillDoNivel(n) : TETO_OURO_KILL * (n / NIVEL_TETO_OURO) ** EXPOENTE_RENDA;
    return Math.round(base * (1 + FRACAO_BONUS_LOOT));
  }
  function ouroDoLootPorKill(nivel, bonusLootPct2 = 0) {
    const base = Math.max(0, alvoRendaPorKill(nivel) - ouroPorKillDoNivel(nivel));
    const bonus = Math.max(0, Number(bonusLootPct2) || 0);
    return Math.round(base * (1 + bonus / 100));
  }
  function ouroDoAbate(nivelMob, bonusLootPct2 = 0) {
    const base = ouroPorKillDoNivel(nivelMob);
    const loot = ouroDoLootPorKill(nivelMob, bonusLootPct2);
    return { base, loot, total: base + loot };
  }
  function ouroPorDerrotaHunt(hunt, nivelMob, especie, bonusLootPct2 = 0) {
    return ouroDoAbate(nivelMob, bonusLootPct2).total;
  }

  // tests/.cache/shared/ajustes-especie-espelho.mjs
  var ajustes_especie_espelho_exports = {};
  __export(ajustes_especie_espelho_exports, {
    AJUSTE_HUNT_LEVEL: () => AJUSTE_HUNT_LEVEL,
    AJUSTE_TIPOS: () => AJUSTE_TIPOS,
    aplicarAjustesHuntLevel: () => aplicarAjustesHuntLevel,
    aplicarAjustesTipos: () => aplicarAjustesTipos
  });
  var AJUSTE_HUNT_LEVEL = {
    112: 100,
    219: 100,
    13447: 1e3,
    13448: 1250,
    297: 700,
    13297: 700,
    235: 30,
    132: 50,
    461: 1500,
    468: 1500
  };
  function aplicarAjustesHuntLevel(obter) {
    for (const [id, nivel] of Object.entries(AJUSTE_HUNT_LEVEL)) {
      const esp = obter(Number(id));
      if (!esp) continue;
      esp.huntLevel = nivel;
      if (nivel <= NIVEL_ANCORA) {
        esp.experience = xpDoNivel(nivel);
        const ouro = ouroDoNivel(nivel);
        esp.sellValue = ouro;
        esp.priceNpc = ouro;
      }
    }
  }
  var AJUSTE_TIPOS = {
    448: ["FIGHTING", "STEEL"],
    13448: ["FIGHTING", "STEEL"]
  };
  function aplicarAjustesTipos(obter) {
    for (const [id, [type1, type2]] of Object.entries(AJUSTE_TIPOS)) {
      for (const esp of obter(Number(id)) ?? []) {
        esp.type1 = type1;
        esp.type2 = type2 ?? null;
      }
    }
  }

  // tests/.cache/raiz/hunt-analyser.mjs
  var hunt_analyser_exports = {};
  __export(hunt_analyser_exports, {
    CD_GOLPE_MS: () => CD_GOLPE_MS,
    CD_MOVIMENTO_MEDIO_MS: () => CD_MOVIMENTO_MEDIO_MS,
    MAX_MOBS: () => MAX_MOBS,
    MS_DESLOC_MS: () => MS_DESLOC_MS,
    MS_MINIMO_RITMO: () => MS_MINIMO_RITMO,
    MS_ONDA: () => MS_ONDA,
    TIPOS_ELEMENTAIS: () => TIPOS_ELEMENTAIS,
    VIP_MULT_XP: () => VIP_MULT_XP,
    analisarHunt: () => analisarHunt,
    bonusLootPct: () => bonusLootPct,
    efetividade: () => efetividade2,
    especiePassaFiltroMatchup: () => especiePassaFiltroMatchup,
    killsPorHora: () => killsPorHora,
    listaDropsEspecie: () => listaDropsEspecie,
    matchupDefensivo: () => matchupDefensivo,
    matchupTiposHunt: () => matchupTiposHunt,
    mediaPorKill: () => mediaPorKill,
    melhorEfetividadeContra: () => melhorEfetividadeContra,
    multXpPokemon: () => multXpPokemon,
    multXpTreinador: () => multXpTreinador,
    ritmoDaSessao: () => ritmoDaSessao
  });

  // tests/.cache/shared/tipo-efetividade.mjs
  var DIAGONAL_DE_TIPOS = Object.freeze({
    FIRE: 0.5,
    WATER: 0.5,
    ELECTRIC: 0.5,
    GRASS: 0.5,
    ICE: 0.5,
    POISON: 0.5,
    PSYCHIC: 0.5,
    DARK: 0.5,
    STEEL: 0.5,
    GHOST: 2,
    DRAGON: 2
  });
  function multAtaqueContraDefesa(atq, def, linha) {
    const a = String(atq).toUpperCase();
    const d = String(def).toUpperCase();
    if (d === a) return DIAGONAL_DE_TIPOS[a] ?? 1;
    return linha[d] ?? 1;
  }
  function efetividade(atq, def1, def2, tabela) {
    const linha = tabela[String(atq).toUpperCase()] ?? {};
    let v = multAtaqueContraDefesa(atq, def1, linha);
    if (def2 && def2 !== def1) v *= multAtaqueContraDefesa(atq, def2, linha);
    return v;
  }

  // tests/.cache/shared/guild-boost.mjs
  var BOOST_GUILD = Object.freeze({
    pct: 10,
    dias: 7,
    icone: "/img/itens/boost-guild.png",
    iconeMini: "/img/itens/boost-guild-32.png"
  });
  var BOOST_GUILD_MS = BOOST_GUILD.dias * 24 * 36e5;
  var BOOST_GUILD_MULT = 1 + BOOST_GUILD.pct / 100;
  var BANCO_GUILD = Object.freeze({
    meta: 500,
    ref: "guild_banco",
    atalhos: [10, 50, 100, 250],
    historico: 25,
    logMax: 5e3
  });
  var boostGuildAtivo = (ate, agora) => (Number(ate) || 0) > agora;
  var multBoostGuild = (ate, agora) => boostGuildAtivo(ate, agora) ? BOOST_GUILD_MULT : 1;

  // tests/.cache/raiz/hunt-analyser.mjs
  var MS_ONDA = 2600;
  var MAX_MOBS = 16;
  var CD_GOLPE_MS = 900;
  var MS_DESLOC_MS = 600;
  var CD_MOVIMENTO_MEDIO_MS = 2e3;
  var VIP_MULT_XP = 1.5;
  var TIPOS_ELEMENTAIS = [
    "NORMAL",
    "FIRE",
    "WATER",
    "GRASS",
    "ELECTRIC",
    "ICE",
    "FIGHTING",
    "POISON",
    "GROUND",
    "FLYING",
    "PSYCHIC",
    "BUG",
    "ROCK",
    "GHOST",
    "DRAGON",
    "DARK",
    "STEEL",
    "FAIRY"
  ];
  function efetividade2(atq, def1, def2, tabela) {
    return efetividade(atq, def1, def2, tabela);
  }
  function multBoost(loja, chave, agora, tiposBoost) {
    const ate = loja?.boosts?.[chave] ?? 0;
    if (agora >= ate) return 1;
    return tiposBoost.find((b) => b.chave === chave)?.mult ?? 1;
  }
  var multGuild = (p) => 1 + (Number(p?.guildBonusPct) || 0) / 100;
  var multBoostDaGuild = (p, agora) => multBoostGuild(p?.guild?.boostAte, agora);
  var vipAtivo = (loja, agora) => agora < (loja?.vipAte ?? 0);
  function multXpTreinador(p, agora, tiposBoost) {
    const l = p.loja ?? {};
    return multBoost(l, "xp", agora, tiposBoost) * (vipAtivo(l, agora) ? VIP_MULT_XP : 1) * multGuild(p) * multBoostDaGuild(p, agora);
  }
  function multXpPokemon(p, agora, tiposBoost) {
    const l = p.loja ?? {};
    return multBoost(l, "pokexp", agora, tiposBoost) * (vipAtivo(l, agora) ? VIP_MULT_XP : 1) * multGuild(p) * multBoostDaGuild(p, agora);
  }
  function bonusLootPct(p, agora, tiposBoost, farmEventoPct = 0) {
    const boost = (multBoost(p?.loja ?? {}, "loot", agora, tiposBoost) - 1) * 100;
    return boost + (Number(p?.guildBonusPct) || 0) + (Number(farmEventoPct) || 0);
  }
  function mediaPorKill(hunt, especies, bonusLoot = 0) {
    const total = hunt.especies.reduce((s, e) => s + e.pontos, 0) || 1;
    let xp = 0;
    let gold = 0;
    for (const e of hunt.especies) {
      const esp = especies.get(e.pokeId);
      const peso = e.pontos / total;
      const base = xpPorDerrota(hunt, hunt.nivel, esp);
      xp += base * peso;
      gold += ouroPorDerrotaHunt(hunt, hunt.nivel, esp, bonusLoot) * peso;
    }
    return { xp, gold };
  }
  function killsPorHora(hunt) {
    const pontos = hunt.especies.reduce((s, e) => s + e.pontos, 0) || 1;
    const porOnda = Math.min(MAX_MOBS, pontos);
    const msPorKill = CD_GOLPE_MS + MS_DESLOC_MS + CD_MOVIMENTO_MEDIO_MS;
    const segPorOnda = (porOnda * msPorKill + MS_ONDA) / 1e3;
    return porOnda / segPorOnda * 3600;
  }
  function melhorEfetividadeContra(tiposAtaque, defType1, defType2, tabela) {
    let melhor = 0;
    for (const atk of tiposAtaque) {
      const v = efetividade2(atk, defType1, defType2, tabela);
      if (v > melhor) melhor = v;
    }
    return melhor;
  }
  function especiePassaFiltroMatchup(esp, tiposSel, modo, tabela) {
    if (!esp || !tiposSel?.length || !modo) return false;
    const mult = melhorEfetividadeContra(tiposSel, esp.type1, esp.type2, tabela);
    if (modo === "fraco") return mult >= 2;
    if (modo === "forte") return mult <= 0.5;
    return false;
  }
  function matchupDefensivo(tiposDefensor, tabela) {
    const fracos = [];
    const fortes = [];
    const d1 = tiposDefensor[0];
    const d2 = tiposDefensor[1];
    if (!d1) return { fracos, fortes };
    for (const atk of TIPOS_ELEMENTAIS) {
      const mult = efetividade2(atk, d1, d2 ?? null, tabela);
      if (mult >= 2) fracos.push({ tipo: atk, mult });
      else if (mult <= 0.5) fortes.push({ tipo: atk, mult });
    }
    return { fracos, fortes };
  }
  function matchupTiposHunt(tiposAtaque, tabela) {
    const fortes = [];
    const fracos = [];
    for (const def of TIPOS_ELEMENTAIS) {
      let melhor = 0;
      for (const atk of tiposAtaque) {
        const v = efetividade2(atk, def, null, tabela);
        if (v > melhor) melhor = v;
      }
      if (melhor >= 2) fortes.push({ tipo: def, mult: melhor });
      else if (melhor <= 0.5) fracos.push({ tipo: def, mult: melhor });
    }
    return { fortes, fracos };
  }
  function listaDropsEspecie(especie) {
    return (especie?.loot ?? []).filter((l) => l.chance > 0).map((l) => ({
      name: l.name,
      pct: l.chance / 1e3,
      minCount: l.minCount,
      maxCount: l.maxCount
    })).sort((a, b) => b.pct - a.pct);
  }
  var MS_MINIMO_RITMO = 6e4;
  function ritmoDaSessao(sessao, agora = Date.now()) {
    if (!sessao?.inicio) return null;
    const horas = Math.max(agora - sessao.inicio, MS_MINIMO_RITMO) / 36e5;
    return {
      xpH: Math.round(((sessao.xpTreinador || 0) + (sessao.xpPokemon || 0)) / horas),
      xpTreinadorH: Math.round((sessao.xpTreinador || 0) / horas),
      xpPokemonH: Math.round((sessao.xpPokemon || 0) / horas),
      ouroH: Math.round((sessao.gold || 0) / horas),
      abatesH: Math.round((sessao.abates || 0) / horas),
      capturasH: Math.round((sessao.capturas || 0) / horas)
    };
  }
  function analisarHunt(hunt, ctx, tiposAtaque = []) {
    const { especies, tabelaTipos, eu, tiposBoost, farmEventoPct = 0 } = ctx;
    const agora = Date.now();
    const media = mediaPorKill(hunt, especies, bonusLootPct(eu, agora, tiposBoost, farmEventoPct));
    const kph = killsPorHora(hunt);
    const multTr = multXpTreinador(eu, agora, tiposBoost);
    const multPk = multXpPokemon(eu, agora, tiposBoost);
    const { fracos, fortes } = matchupDefensivo(tiposAtaque, tabelaTipos);
    return {
      hunt,
      xpTreinadorH: Math.round(media.xp * kph * multTr),
      xpPokemonH: Math.round(media.xp * kph * multPk),
      goldH: Math.round(media.gold * kph),
      killsH: Math.round(kph),
      tiposFracos: fracos,
      tiposResiste: fortes
    };
  }

  // tests/.cache/shared/ginasios.mjs
  var ginasios_exports = {};
  __export(ginasios_exports, {
    ARENA_EXPO_GINASIO: () => ARENA_EXPO_GINASIO,
    ARENA_EXPO_GUERRA: () => ARENA_EXPO_GUERRA,
    ARENA_NIVEL_CHEIO: () => ARENA_NIVEL_CHEIO,
    GINASIO_BUFF_MULT: () => GINASIO_BUFF_MULT,
    GINASIO_BUFF_PCT: () => GINASIO_BUFF_PCT,
    GINASIO_BUFF_PODIO_PCT: () => GINASIO_BUFF_PODIO_PCT,
    GINASIO_DESAFIO_COOLDOWN_MS: () => GINASIO_DESAFIO_COOLDOWN_MS,
    GINASIO_ESCALA_FORCA: () => GINASIO_ESCALA_FORCA,
    GINASIO_NIVEL_MIN: () => GINASIO_NIVEL_MIN,
    GINASIO_TIME_MAX: () => GINASIO_TIME_MAX,
    SLUG_ARENA_GINASIO: () => SLUG_ARENA_GINASIO,
    TIPOS_GINASIO: () => TIPOS_GINASIO,
    VARIACAO_DANO_MAX: () => VARIACAO_DANO_MAX,
    VARIACAO_DANO_MIN: () => VARIACAO_DANO_MIN,
    buffGinasioDoPokemon: () => buffGinasioDoPokemon,
    compararDuelo1v1: () => compararDuelo1v1,
    ginasioDeCadaPokemon: () => ginasioDeCadaPokemon,
    hpDeCombateGinasio: () => hpDeCombateGinasio,
    iconeDoGinasio: () => iconeDoGinasio,
    idsQueContamNoGinasio: () => idsQueContamNoGinasio,
    melhorGolpeDoGinasio: () => melhorGolpeDoGinasio,
    metricasDeCombate: () => metricasDeCombate,
    motivoForaDoGinasio: () => motivoForaDoGinasio,
    multBuffGinasio: () => multBuffGinasio,
    multDoLugarGinasio: () => multDoLugarGinasio,
    nivelDeArena: () => nivelDeArena,
    nivelNaGuerra: () => nivelNaGuerra,
    nivelNoGinasio: () => nivelNoGinasio,
    outroGinasioDoPokemon: () => outroGinasioDoPokemon,
    pctDoLugarGinasio: () => pctDoLugarGinasio,
    poderDoTimeGinasio: () => poderDoTimeGinasio,
    poderNaGuerra: () => poderNaGuerra,
    poderNoGinasio: () => poderNoGinasio,
    poderNoNivel: () => poderNoNivel,
    pokemonDoTipo: () => pokemonDoTipo,
    pokemonEmGinasioDosTimes: () => pokemonEmGinasioDosTimes,
    ratingDeCombate: () => ratingDeCombate,
    segundoETerceiro: () => segundoETerceiro,
    statsNoGinasio: () => statsNoGinasio,
    statsNoNivel: () => statsNoNivel,
    timeValidoDoGinasio: () => timeValidoDoGinasio,
    timesQueContam: () => timesQueContam,
    tipoDeGinasio: () => tipoDeGinasio,
    validarTimeGinasio: () => validarTimeGinasio
  });

  // tests/.cache/shared/refino-stats.mjs
  var STATS_REFINAVEIS = ["hp", "atk", "def", "spAtk", "spDef"];
  var REFINO_TETO_TECNICO = 9999;
  var REFINO_PASSO = 1;
  var inteiro = (v) => {
    const n = Math.floor(Number(v) || 0);
    return n > 0 ? Math.min(REFINO_TETO_TECNICO, n) : 0;
  };
  function normalizarRefino(bruto) {
    const cru = typeof bruto === "string" ? seguroJson(bruto) : bruto;
    const out = {};
    for (const k of STATS_REFINAVEIS) out[k] = inteiro(cru?.[k]);
    return out;
  }
  function seguroJson(txt) {
    try {
      return JSON.parse(txt);
    } catch {
      return null;
    }
  }
  function basesComRefino(especie, bonus) {
    const b = normalizarRefino(bonus);
    return {
      hp: (especie?.baseHp ?? 0) + b.hp * REFINO_PASSO,
      atk: (especie?.baseAtk ?? 0) + b.atk * REFINO_PASSO,
      def: (especie?.baseDef ?? 0) + b.def * REFINO_PASSO,
      spAtk: (especie?.baseSpAtk ?? 0) + b.spAtk * REFINO_PASSO,
      spDef: (especie?.baseSpDef ?? 0) + b.spDef * REFINO_PASSO,
      speed: especie?.baseSpeed ?? 0
    };
  }

  // tests/.cache/shared/formas.mjs
  var FORMAS = [
    { pokeId: 4019, dex: 19, nome: "Alolan Rattata", grupo: "alola", looktype: 64019, looktypeShiny: 74019 },
    { pokeId: 4020, dex: 20, nome: "Alolan Raticate", grupo: "alola", looktype: 64020, looktypeShiny: 74020 },
    { pokeId: 4026, dex: 26, nome: "Alolan Raichu", grupo: "alola", looktype: 64026, looktypeShiny: 74026 },
    { pokeId: 4027, dex: 27, nome: "Alolan Sandshrew", grupo: "alola", looktype: 64027, looktypeShiny: 74027 },
    { pokeId: 4028, dex: 28, nome: "Alolan Sandslash", grupo: "alola", looktype: 64028, looktypeShiny: 74028 },
    { pokeId: 4037, dex: 37, nome: "Alolan Vulpix", grupo: "alola", looktype: 64037, looktypeShiny: 74037 },
    { pokeId: 4038, dex: 38, nome: "Alolan Ninetales", grupo: "alola", looktype: 64038, looktypeShiny: 74038 },
    { pokeId: 4050, dex: 50, nome: "Alolan Diglett", grupo: "alola", looktype: 64050, looktypeShiny: 74050 },
    { pokeId: 4051, dex: 51, nome: "Alolan Dugtrio", grupo: "alola", looktype: 64051, looktypeShiny: 74051 },
    { pokeId: 4052, dex: 52, nome: "Alolan Meowth", grupo: "alola", looktype: 64052, looktypeShiny: 74052 },
    { pokeId: 5052, dex: 52, nome: "Galarian Meowth", grupo: "galar", looktype: 65052, looktypeShiny: 75052 },
    { pokeId: 4053, dex: 53, nome: "Alolan Persian", grupo: "alola", looktype: 64053, looktypeShiny: 74053 },
    { pokeId: 6058, dex: 58, nome: "Hisuian Growlithe", grupo: "hisui", looktype: 66058, looktypeShiny: 76058 },
    { pokeId: 6059, dex: 59, nome: "Hisuian Arcanine", grupo: "hisui", looktype: 66059, looktypeShiny: 76059 },
    { pokeId: 4074, dex: 74, nome: "Alolan Geodude", grupo: "alola", looktype: 64074, looktypeShiny: 74074 },
    { pokeId: 4075, dex: 75, nome: "Alolan Graveler", grupo: "alola", looktype: 64075, looktypeShiny: 74075 },
    { pokeId: 5077, dex: 77, nome: "Galarian Ponyta", grupo: "galar", looktype: 65077, looktypeShiny: 75077 },
    { pokeId: 5078, dex: 78, nome: "Galarian Rapidash", grupo: "galar", looktype: 65078, looktypeShiny: 75078 },
    { pokeId: 5079, dex: 79, nome: "Galarian Slowpoke", grupo: "galar", looktype: 65079, looktypeShiny: 75079 },
    { pokeId: 5080, dex: 80, nome: "Galarian Slowbro", grupo: "galar", looktype: 65080, looktypeShiny: 75080 },
    { pokeId: 5083, dex: 83, nome: "Galarian Farfetch'd", grupo: "galar", looktype: 65083, looktypeShiny: 75083 },
    { pokeId: 4088, dex: 88, nome: "Alolan Grimer", grupo: "alola", looktype: 64088, looktypeShiny: 74088 },
    { pokeId: 4089, dex: 89, nome: "Alolan Muk", grupo: "alola", looktype: 64089, looktypeShiny: 74089 },
    { pokeId: 6100, dex: 100, nome: "Hisuian Voltorb", grupo: "hisui", looktype: 66100, looktypeShiny: 76100 },
    { pokeId: 6101, dex: 101, nome: "Hisuian Electrode", grupo: "hisui", looktype: 66101, looktypeShiny: 76101 },
    { pokeId: 4103, dex: 103, nome: "Alolan Exeggutor", grupo: "alola", looktype: 64103, looktypeShiny: 74103 },
    { pokeId: 4105, dex: 105, nome: "Alolan Marowak", grupo: "alola", looktype: 64105, looktypeShiny: 74105 },
    { pokeId: 5110, dex: 110, nome: "Galarian Weezing", grupo: "galar", looktype: 65110, looktypeShiny: 75110 },
    { pokeId: 5122, dex: 122, nome: "Galarian Mr. Mime", grupo: "galar", looktype: 65122, looktypeShiny: 75122 },
    { pokeId: 7128, dex: 128, nome: "Paldean Tauros", grupo: "paldea", looktype: 67128, looktypeShiny: 77128 },
    { pokeId: 8128, dex: 128, nome: "Paldean Tauros Blaze", grupo: "forma", looktype: 68128, looktypeShiny: 78128 },
    { pokeId: 9128, dex: 128, nome: "Paldean Tauros Aqua", grupo: "forma", looktype: 69128, looktypeShiny: 79128 },
    { pokeId: 5144, dex: 144, nome: "Galarian Articuno", grupo: "galar", looktype: 65144, looktypeShiny: 75144 },
    { pokeId: 5145, dex: 145, nome: "Galarian Zapdos", grupo: "galar", looktype: 65145, looktypeShiny: 75145 },
    { pokeId: 5146, dex: 146, nome: "Galarian Moltres", grupo: "galar", looktype: 65146, looktypeShiny: 75146 },
    { pokeId: 6157, dex: 157, nome: "Hisuian Typhlosion", grupo: "hisui", looktype: 66157, looktypeShiny: 76157 },
    { pokeId: 7194, dex: 194, nome: "Paldean Wooper", grupo: "paldea", looktype: 67194, looktypeShiny: 77194 },
    { pokeId: 5199, dex: 199, nome: "Galarian Slowking", grupo: "galar", looktype: 65199, looktypeShiny: 75199 },
    { pokeId: 6211, dex: 211, nome: "Hisuian Qwilfish", grupo: "hisui", looktype: 66211, looktypeShiny: 76211 },
    { pokeId: 6215, dex: 215, nome: "Hisuian Sneasel", grupo: "hisui", looktype: 66215, looktypeShiny: 76215 },
    { pokeId: 5222, dex: 222, nome: "Galarian Corsola", grupo: "galar", looktype: 65222, looktypeShiny: 75222 },
    { pokeId: 5263, dex: 263, nome: "Galarian Zigzagoon", grupo: "galar", looktype: 65263, looktypeShiny: 75263 },
    { pokeId: 5264, dex: 264, nome: "Galarian Linoone", grupo: "galar", looktype: 65264, looktypeShiny: 75264 },
    { pokeId: 8351, dex: 351, nome: "Castform Rainy", grupo: "forma", looktype: 68351, looktypeShiny: 78351 },
    { pokeId: 9351, dex: 351, nome: "Castform Snowy", grupo: "forma", looktype: 69351, looktypeShiny: 79351 },
    { pokeId: 11351, dex: 351, nome: "Castform Sunny", grupo: "forma", looktype: 71351, looktypeShiny: 81351 },
    { pokeId: 8386, dex: 386, nome: "Deoxys Attack", grupo: "forma", looktype: 68386, looktypeShiny: 78386 },
    { pokeId: 9386, dex: 386, nome: "Deoxys Defense", grupo: "forma", looktype: 69386, looktypeShiny: 79386 },
    { pokeId: 11386, dex: 386, nome: "Deoxys Speed", grupo: "forma", looktype: 71386, looktypeShiny: 81386 },
    { pokeId: 8413, dex: 413, nome: "Wormadam Sandy", grupo: "forma", looktype: 68413, looktypeShiny: 78413 },
    { pokeId: 9413, dex: 413, nome: "Wormadam Trash", grupo: "forma", looktype: 69413, looktypeShiny: 79413 },
    { pokeId: 1479, dex: 479, nome: "Mow Rotom", grupo: "forma", looktype: 61479, looktypeShiny: 91479 },
    { pokeId: 8479, dex: 479, nome: "Heat Rotom", grupo: "forma", looktype: 68479, looktypeShiny: 78479 },
    { pokeId: 9479, dex: 479, nome: "Wash Rotom", grupo: "forma", looktype: 69479, looktypeShiny: 79479 },
    { pokeId: 11479, dex: 479, nome: "Frost Rotom", grupo: "forma", looktype: 71479, looktypeShiny: 81479 },
    { pokeId: 12479, dex: 479, nome: "Fan Rotom", grupo: "forma", looktype: 72479, looktypeShiny: 82479 },
    { pokeId: 8483, dex: 483, nome: "Dialga Origin", grupo: "forma", looktype: 68483, looktypeShiny: 78483 },
    { pokeId: 8484, dex: 484, nome: "Palkia Origin", grupo: "forma", looktype: 68484, looktypeShiny: 78484 },
    { pokeId: 8487, dex: 487, nome: "Giratina Origin", grupo: "forma", looktype: 68487, looktypeShiny: 78487 },
    { pokeId: 8492, dex: 492, nome: "Shaymin Sky", grupo: "forma", looktype: 68492, looktypeShiny: 78492 },
    { pokeId: 6503, dex: 503, nome: "Hisuian Samurott", grupo: "hisui", looktype: 66503, looktypeShiny: 76503 },
    { pokeId: 6549, dex: 549, nome: "Hisuian Lilligant", grupo: "hisui", looktype: 66549, looktypeShiny: 76549 },
    { pokeId: 5554, dex: 554, nome: "Galarian Darumaka", grupo: "galar", looktype: 65554, looktypeShiny: 75554 },
    { pokeId: 5555, dex: 555, nome: "Galarian Darmanitan", grupo: "galar", looktype: 65555, looktypeShiny: 75555 },
    { pokeId: 8555, dex: 555, nome: "Darmanitan Zen", grupo: "forma", looktype: 68555, looktypeShiny: 78555 },
    { pokeId: 9555, dex: 555, nome: "Galarian Darmanitan Zen", grupo: "forma", looktype: 69555, looktypeShiny: 79555 },
    { pokeId: 5562, dex: 562, nome: "Galarian Yamask", grupo: "galar", looktype: 65562, looktypeShiny: 75562 },
    { pokeId: 6570, dex: 570, nome: "Hisuian Zorua", grupo: "hisui", looktype: 66570, looktypeShiny: 76570 },
    { pokeId: 6571, dex: 571, nome: "Hisuian Zoroark", grupo: "hisui", looktype: 66571, looktypeShiny: 76571 },
    { pokeId: 5618, dex: 618, nome: "Galarian Stunfisk", grupo: "galar", looktype: 65618, looktypeShiny: 75618 },
    { pokeId: 6628, dex: 628, nome: "Hisuian Braviary", grupo: "hisui", looktype: 66628, looktypeShiny: 76628 },
    { pokeId: 8641, dex: 641, nome: "Tornadus Therian", grupo: "forma", looktype: 68641, looktypeShiny: 78641 },
    { pokeId: 8642, dex: 642, nome: "Thundurus Therian", grupo: "forma", looktype: 68642, looktypeShiny: 78642 },
    { pokeId: 8645, dex: 645, nome: "Landorus Therian", grupo: "forma", looktype: 68645, looktypeShiny: 78645 },
    { pokeId: 8646, dex: 646, nome: "White Kyurem", grupo: "forma", looktype: 68646, looktypeShiny: 78646 },
    { pokeId: 9646, dex: 646, nome: "Black Kyurem", grupo: "forma", looktype: 69646, looktypeShiny: 79646 },
    { pokeId: 8647, dex: 647, nome: "Keldeo Resolute", grupo: "forma", looktype: 68647, looktypeShiny: 78647 },
    { pokeId: 8648, dex: 648, nome: "Meloetta Pirouette", grupo: "forma", looktype: 68648, looktypeShiny: 78648 },
    { pokeId: 8681, dex: 681, nome: "Aegislash Blade", grupo: "forma", looktype: 68681, looktypeShiny: 78681 },
    { pokeId: 6705, dex: 705, nome: "Hisuian Sliggoo", grupo: "hisui", looktype: 66705, looktypeShiny: 76705 },
    { pokeId: 6706, dex: 706, nome: "Hisuian Goodra", grupo: "hisui", looktype: 66706, looktypeShiny: 76706 },
    { pokeId: 6713, dex: 713, nome: "Hisuian Avalugg", grupo: "hisui", looktype: 66713, looktypeShiny: 76713 },
    { pokeId: 8718, dex: 718, nome: "Zygarde 10%", grupo: "forma", looktype: 68718, looktypeShiny: 78718 },
    { pokeId: 9718, dex: 718, nome: "Zygarde Complete", grupo: "forma", looktype: 69718, looktypeShiny: 79718 },
    { pokeId: 8720, dex: 720, nome: "Hoopa Unbound", grupo: "forma", looktype: 68720, looktypeShiny: 78720 },
    { pokeId: 6724, dex: 724, nome: "Hisuian Decidueye", grupo: "hisui", looktype: 66724, looktypeShiny: 76724 },
    { pokeId: 8741, dex: 741, nome: "Oricorio Pom-Pom", grupo: "forma", looktype: 68741, looktypeShiny: 78741 },
    { pokeId: 9741, dex: 741, nome: "Oricorio Pa'u", grupo: "forma", looktype: 69741, looktypeShiny: 79741 },
    { pokeId: 11741, dex: 741, nome: "Oricorio Sensu", grupo: "forma", looktype: 71741, looktypeShiny: 81741 },
    { pokeId: 8745, dex: 745, nome: "Lycanroc Midnight", grupo: "forma", looktype: 68745, looktypeShiny: 78745 },
    { pokeId: 9745, dex: 745, nome: "Lycanroc Dusk", grupo: "forma", looktype: 69745, looktypeShiny: 79745 },
    { pokeId: 8746, dex: 746, nome: "Wishiwashi School", grupo: "forma", looktype: 68746, looktypeShiny: 78746 },
    { pokeId: 8774, dex: 774, nome: "Minior Core", grupo: "forma", looktype: 68774, looktypeShiny: 78774 },
    { pokeId: 8888, dex: 888, nome: "Zacian Crowned", grupo: "forma", looktype: 68888, looktypeShiny: 78888 },
    { pokeId: 8889, dex: 889, nome: "Zamazenta Crowned", grupo: "forma", looktype: 68889, looktypeShiny: 78889 },
    { pokeId: 8898, dex: 898, nome: "Calyrex Ice Rider", grupo: "forma", looktype: 68898, looktypeShiny: 78898 },
    { pokeId: 9898, dex: 898, nome: "Calyrex Shadow Rider", grupo: "forma", looktype: 69898, looktypeShiny: 79898 },
    { pokeId: 8901, dex: 901, nome: "Bloodmoon Ursaluna", grupo: "forma", looktype: 68901, looktypeShiny: 78901 },
    { pokeId: 8902, dex: 902, nome: "Basculegion Female", grupo: "forma", looktype: 68902, looktypeShiny: 78902 },
    { pokeId: 8905, dex: 905, nome: "Enamorus Therian", grupo: "forma", looktype: 68905, looktypeShiny: 78905 },
    { pokeId: 8964, dex: 964, nome: "Palafin Hero", grupo: "forma", looktype: 68964, looktypeShiny: 78964 },
    { pokeId: 9017, dex: 1017, nome: "Ogerpon Wellspring", grupo: "forma", looktype: 69017, looktypeShiny: 79017 },
    { pokeId: 8017, dex: 1017, nome: "Ogerpon Hearthflame", grupo: "forma", looktype: 68017, looktypeShiny: 78017 },
    { pokeId: 12017, dex: 1017, nome: "Ogerpon Cornerstone", grupo: "forma", looktype: 72017, looktypeShiny: 82017 }
  ];
  var FORMA_POR_POKEID = new Map(FORMAS.map((f) => [f.pokeId, f]));
  var dexBaseDaForma = (pokeId) => FORMA_POR_POKEID.get(Number(pokeId))?.dex ?? null;

  // tests/.cache/shared/mistico.mjs
  var CAPTURA_MISTICA_POR_BOLA = Object.freeze({
    1: 1e-3,
    2: 2e-3,
    3: 3e-3,
    4: 4e-3,
    5: 5e-3
  });
  var BOLAS_MISTICAS_DA_MELHOR = Object.freeze([5, 4, 3, 2, 1]);
  var LENDARIOS_KANTO_JOHTO = Object.freeze([144, 145, 146, 150, 243, 244, 245, 249, 250]);
  var MITICOS_KANTO_JOHTO = Object.freeze([151, 251]);
  var MITICOS_FORA_DO_FILTRO = Object.freeze([494]);
  var DEX_LENDARIO_OU_MITICO = /* @__PURE__ */ new Set([
    ...LENDARIOS_KANTO_JOHTO,
    ...MITICOS_KANTO_JOHTO,
    ...MITICOS_FORA_DO_FILTRO,
    ...LENDARIO_DEX,
    ...MITICO_DEX
  ]);
  var DEX_MITICO = /* @__PURE__ */ new Set([
    ...MITICOS_KANTO_JOHTO,
    ...MITICOS_FORA_DO_FILTRO,
    ...MITICO_DEX
  ]);
  var dexNacional = (id) => {
    if (id >= 13e3) return id % 1e3;
    if (isMegaPokeId(id)) return megaPorPokeId(id)?.dex ?? id - MEGA_POKE_BASE;
    return dexBaseDaForma(id) ?? id;
  };
  function ehLendarioOuMitico(pokeId) {
    const id = Number(pokeId);
    return Number.isInteger(id) && id > 0 && DEX_LENDARIO_OU_MITICO.has(dexNacional(id));
  }

  // tests/.cache/shared/nota-pokemon.mjs
  var IV_POR_STAT = { min: 1, max: 32 };
  var IV_STATS = 6;
  var IV_MIN = IV_STATS * IV_POR_STAT.min;
  var IV_MAX = IV_STATS * IV_POR_STAT.max;
  var BANDAS_QUALIDADE = [
    { min: 0.8, max: 0.9, chance: 5 },
    { min: 0.9, max: 1, chance: 5 },
    { min: 1, max: 1.1, chance: 34.03846 },
    { min: 1.1, max: 1.2, chance: 20 },
    { min: 1.2, max: 1.3, chance: 10 },
    { min: 1.3, max: 1.4, chance: 10 },
    { min: 1.4, max: 1.5, chance: 10 },
    { min: 1.5, max: 1.6, chance: 5 },
    { min: 1.7, max: 1.8, chance: 0.67308 },
    { min: 1.8, max: 1.8, chance: 0.28846 }
  ];
  var QUALIDADE_MIN = BANDAS_QUALIDADE[0].min;
  var QUALIDADE_MAX = BANDAS_QUALIDADE.at(-1).max;
  var EXPO_QUALIDADE = {
    hp: 0.95,
    atk: 0.8,
    def: 0.8,
    spAtk: 0.8,
    spDef: 0.8,
    speed: 0.95
  };
  var BONUS_POTENCIA = [0, 0.05, 0.1, 0.25, 1];
  var multPotencia = (n) => 1 + (BONUS_POTENCIA[(Math.round(n) || 1) - 1] ?? 0);
  var MULT_SHINY_STATS = 3;
  var MULT_LENDARIO_STATS = 4;
  var multDeNascenca = (potencia, shiny, lendario = false) => multPotencia(potencia) * (shiny ? MULT_SHINY_STATS : 1) * (lendario ? MULT_LENDARIO_STATS : 1);

  // tests/.cache/shared/tm-elemental.mjs
  var TM_ELEMENTAL_POWER = 2800;
  var TM_ELEMENTAL_POWER_PVP = 1800;
  var TM_ELEMENTAL_CD_MS = 6e4;
  var golpeTmElemental = (tipo, fisico = false, { pvp = false } = {}) => ({
    name: `Z-Move ${tipo}`,
    power: pvp === true ? TM_ELEMENTAL_POWER_PVP : TM_ELEMENTAL_POWER,
    type: tipo,
    category: fisico === true ? "PHYSICAL" : "SPECIAL",
    cooldownMs: TM_ELEMENTAL_CD_MS,
    tmElemental: true
  });
  var ZMOVE_TROCA_COOLDOWN_MS = 5 * 6e4;

  // tests/.cache/shared/pvp-tabuleiro.mjs
  var TABULEIRO_MAX = 5;
  var ARENA_TABULEIRO = Object.freeze({
    slug: "ginasio-duelo",
    mapa: "cerulean",
    box: Object.freeze([14, -27, 29, 24]),
    groundZ: 7
  });
  var FILEIRAS = Object.freeze([
    Object.freeze({ cy: 13, de: 12, ate: 17 }),
    Object.freeze({ cy: 14, de: 11, ate: 18 }),
    Object.freeze({ cy: 15, de: 11, ate: 18 }),
    Object.freeze({ cy: 16, de: 13, ate: 16 }),
    Object.freeze({ cy: 17, de: 13, ate: 16 })
  ]);
  var FILEIRAS_TABULEIRO = FILEIRAS.length;
  var TREINADOR_BAIXO = Object.freeze({ cx: 15, cy: 18 });
  var CASAS_TABULEIRO = Object.freeze((() => {
    const lista = [];
    FILEIRAS.forEach((f, fileira) => {
      for (let cx = f.de; cx <= f.ate; cx++) {
        lista.push(Object.freeze({ casa: lista.length, fileira, coluna: cx - f.de, cx, cy: f.cy }));
      }
    });
    return lista;
  })());
  var TOTAL_CASAS = CASAS_TABULEIRO.length;
  var ALCANCES_A_DISTANCIA = Object.freeze([2, 3, 4]);
  var F0 = [2, 3, 1, 4, 0, 5];
  var F1 = [9, 10, 8, 11, 7, 12, 6, 13];
  var F2_MIOLO = [17, 18, 16, 19];
  var F2_LADOS = [15, 20];
  var F2_PONTAS = [14, 21];
  var F2 = [...F2_MIOLO, ...F2_LADOS, ...F2_PONTAS];
  var F3 = [23, 24, 22, 25];
  var F4 = [27, 28, 26, 29];
  var PRIORIDADE_POR_ALCANCE = Object.freeze({
    1: Object.freeze([...F0, ...F1, ...F2, ...F3, ...F4]),
    2: Object.freeze([...F1, ...F2, ...F0, ...F3, ...F4]),
    3: Object.freeze([...F2_MIOLO, ...F3, ...F2_LADOS, ...F4, ...F2_PONTAS, ...F1, ...F0]),
    4: Object.freeze([...F3, ...F2, ...F4, ...F1, ...F0])
  });
  function casaValida(v) {
    if (typeof v === "string" && v.trim() !== "") v = Number(v);
    return Number.isInteger(v) && v >= 0 && v < TOTAL_CASAS ? v : null;
  }
  function normalizarMapaDeCasas(bruto, ids) {
    const saida = {};
    if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return saida;
    const usadas = /* @__PURE__ */ new Set();
    for (const id of (ids ?? []).slice(0, TABULEIRO_MAX)) {
      const chave = String(id);
      if (!Object.prototype.hasOwnProperty.call(bruto, chave)) continue;
      const c = casaValida(bruto[chave]);
      if (c == null || usadas.has(c)) continue;
      usadas.add(c);
      saida[chave] = c;
    }
    return saida;
  }

  // tests/.cache/shared/ginasios.mjs
  var TIPOS_GINASIO = [
    "NORMAL",
    "FIRE",
    "WATER",
    "GRASS",
    "ELECTRIC",
    "ICE",
    "FIGHTING",
    "POISON",
    "GROUND",
    "FLYING",
    "PSYCHIC",
    "BUG",
    "ROCK",
    "GHOST",
    "DRAGON",
    "DARK",
    "STEEL",
    "FAIRY"
  ];
  var TIPOS_VALIDOS = new Set(TIPOS_GINASIO);
  var iconeDoGinasio = (tipo) => `/img/tipos/${String(tipo).toLowerCase()}.svg`;
  var GINASIO_TIME_MAX = 5;
  var ARENA_NIVEL_CHEIO = 150;
  var ARENA_EXPO_GINASIO = 0.45;
  var ARENA_EXPO_GUERRA = 0.2;
  var GINASIO_NIVEL_MIN = 150;
  var GINASIO_BUFF_PODIO_PCT = Object.freeze([25, 10, 5]);
  var GINASIO_BUFF_PCT = GINASIO_BUFF_PODIO_PCT[0];
  var GINASIO_BUFF_MULT = 1 + GINASIO_BUFF_PCT / 100;
  function segundoETerceiro(times, liderId) {
    const resto = (times ?? []).filter((t) => Number(t.playerId) !== Number(liderId));
    return { segundoId: resto[0]?.playerId ?? null, terceiroId: resto[1]?.playerId ?? null };
  }
  var pctDoLugarGinasio = (lugar) => GINASIO_BUFF_PODIO_PCT[Math.floor(Number(lugar)) - 1] ?? 0;
  var multDoLugarGinasio = (lugar) => 1 + pctDoLugarGinasio(lugar) / 100;
  var GINASIO_DESAFIO_COOLDOWN_MS = 24 * 60 * 60 * 1e3;
  var SLUG_ARENA_GINASIO = "ginasio-duelo";
  function tipoDeGinasio(bruto) {
    const t = String(bruto ?? "").toUpperCase();
    return TIPOS_VALIDOS.has(t) ? t : null;
  }
  var pokemonDoTipo = (tipos, tipo) => (tipos ?? []).some((x) => String(x).toUpperCase() === String(tipo).toUpperCase());
  function nivelDeArena(level, expoente) {
    const n = Math.max(1, Math.floor(Number(level) || 1));
    if (n <= ARENA_NIVEL_CHEIO) return n;
    return Math.max(
      ARENA_NIVEL_CHEIO,
      Math.round(ARENA_NIVEL_CHEIO * (n / ARENA_NIVEL_CHEIO) ** expoente)
    );
  }
  var nivelNoGinasio = (level) => nivelDeArena(level, ARENA_EXPO_GINASIO);
  var nivelNaGuerra = (level) => nivelDeArena(level, ARENA_EXPO_GUERRA);
  var hpDeCombateGinasio = (hp) => Math.max(24, Math.round(hp * 12));
  function statsNoNivel(pk, esp, nivelBruto) {
    if (!esp || !pk?.ivs) return null;
    const nivel = Math.max(1, Math.floor(Number(nivelBruto) || 1));
    const mult = multDeNascenca(pk.potencia, pk.shiny, ehLendarioOuMitico(esp?.pokeId));
    const b = basesComRefino(esp, pk.refino);
    const um = (base, iv, k) => Math.round((base + 2 * (iv ?? 1)) * (nivel / 100) * (Math.pow(Number(pk.quality ?? pk.qualidade) || 1, EXPO_QUALIDADE[k]) * mult));
    return {
      hp: um(b.hp, pk.ivs.hp, "hp"),
      atk: um(b.atk, pk.ivs.atk, "atk"),
      def: um(b.def, pk.ivs.def, "def"),
      spAtk: um(b.spAtk, pk.ivs.spAtk, "spAtk"),
      spDef: um(b.spDef, pk.ivs.spDef, "spDef"),
      speed: um(b.speed, pk.ivs.speed, "speed")
    };
  }
  function statsNoGinasio(pk, esp) {
    return statsNoNivel(pk, esp, nivelNoGinasio(pk?.level));
  }
  var GOLPE_BASICO = { power: 30, cooldownMs: 2e3, category: "PHYSICAL" };
  function notaGolpeGinasio(g, nivel, stats, tipos) {
    const atk = g.category === "SPECIAL" ? stats.spAtk : stats.atk;
    const def = g.category === "SPECIAL" ? stats.spDef : stats.def;
    const stab = tipos.includes(g.type) ? 1.5 : 1;
    const base = (2 * nivel / 5 + 2) * (g.power ?? 0) * (atk / Math.max(1, def)) / 50 + 2;
    return base * stab;
  }
  function melhorGolpeDoGinasio(esp, nivel, stats = null, tmElemental = null, tmFisico = false, { pvp = false } = {}) {
    const golpes = (esp?.attacks ?? []).filter((a) => (a.learnLevel ?? 1) <= nivel);
    if (tmElemental) golpes.push(golpeTmElemental(tmElemental, tmFisico, { pvp }));
    if (!golpes.length) return GOLPE_BASICO;
    if (stats) {
      const tipos = [esp.type1, esp.type2].filter(Boolean);
      let melhor2 = GOLPE_BASICO;
      let melhorNota = -1;
      for (const g of golpes) {
        const nota2 = notaGolpeGinasio(g, nivel, stats, tipos);
        if (nota2 > melhorNota) {
          melhorNota = nota2;
          melhor2 = g;
        }
      }
      return melhor2;
    }
    let melhor = GOLPE_BASICO;
    let nota = GOLPE_BASICO.power / GOLPE_BASICO.cooldownMs;
    for (const a of golpes) {
      const n = (a.power ?? 0) / Math.max(1, a.cooldownMs ?? 1e4);
      if (n > nota) {
        nota = n;
        melhor = a;
      }
    }
    return melhor;
  }
  function ratingDeCombate(pk, esp) {
    return ratingNoNivel(pk, esp, nivelNoGinasio(pk?.level), true);
  }
  var poderNoNivel = (pk, esp, nivel, { pvp = false } = {}) => esp ? Math.max(1, Math.round(ratingNoNivel(pk, esp, nivel, pvp) / GINASIO_ESCALA_FORCA)) : 1;
  function ratingNoNivel(pk, esp, nivelBruto, pvp = false) {
    const st = statsNoNivel(pk, esp, nivelBruto);
    if (!st) return 0;
    const nivel = Math.max(1, Math.floor(Number(nivelBruto) || 1));
    const g = melhorGolpeDoGinasio(esp, nivel, st, pk.tmElemental, pk.tmFisico, { pvp });
    const atk = Math.max(st.atk, st.spAtk);
    const def = (st.def + st.spDef) / 2;
    const dps = (2 * nivel / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk / 50 / (Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1e3);
    return dps * hpDeCombateGinasio(st.hp) * def;
  }
  var VARIACAO_DANO_MIN = 0.85;
  var VARIACAO_DANO_MAX = 1;
  function metricasDeCombate(pk, esp) {
    const st = statsNoGinasio(pk, esp);
    if (!st) return null;
    const nivel = nivelNoGinasio(pk.level);
    const g = melhorGolpeDoGinasio(esp, nivel, st, pk.tmElemental, pk.tmFisico, { pvp: true });
    const atk = Math.max(st.atk, st.spAtk);
    const def = (st.def + st.spDef) / 2;
    const dps = (2 * nivel / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk / 50 / (Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1e3);
    const ehp = hpDeCombateGinasio(st.hp);
    const rating = dps * ehp * def;
    return {
      dps,
      ehp,
      def,
      rating,
      golpe: g,
      stats: st,
      nivel,
      nivelReal: Math.max(1, Math.floor(Number(pk.level) || 1)),
      tm: pk.tmElemental ?? null,
      golpeDaTm: !!g.tmElemental
    };
  }
  var tiposDeEspecie = (esp) => [esp?.type1, esp?.type2].filter(Boolean);
  function basicoContra(tipos, tiposDefensor, tabela) {
    for (const tipo of tipos.length ? tipos : ["NORMAL"]) {
      if (efetividade(tipo, tiposDefensor[0], tiposDefensor[1], tabela) > 0) {
        return { ...GOLPE_BASICO, type: tipo };
      }
    }
    return null;
  }
  function notaGolpeComMatchup(g, nivel, stats, tiposAtacante, tiposDefensor, defStats, tabela) {
    const ef = efetividade(g.type, tiposDefensor[0], tiposDefensor[1], tabela);
    if (ef === 0) return -1;
    const stab = tiposAtacante.includes(g.type) ? 1.5 : 1;
    const atk = g.category === "SPECIAL" ? stats.spAtk : stats.atk;
    const def = defStats ? g.category === "SPECIAL" ? defStats.spDef : defStats.def : atk;
    const base = (2 * nivel / 5 + 2) * (g.power ?? 0) * (atk / Math.max(1, def)) / 50 + 2;
    return base * stab * ef;
  }
  function melhorGolpeContra(esp, nivel, stats, tiposDefensor, defStats, tabela, tmElemental = null, tmFisico = false) {
    const tipos = tiposDeEspecie(esp);
    const golpes = (esp?.attacks ?? []).filter((a) => (a.learnLevel ?? 1) <= nivel);
    if (tmElemental) golpes.push(golpeTmElemental(tmElemental, tmFisico, { pvp: true }));
    let melhor = null;
    let melhorNota = -1;
    for (const g of golpes) {
      const nota = notaGolpeComMatchup(g, nivel, stats, tipos, tiposDefensor, defStats, tabela);
      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = g;
      }
    }
    if (melhor) return melhor;
    return basicoContra(tipos, tiposDefensor, tabela) ?? GOLPE_BASICO;
  }
  function metricasDeCombateContra(pk, esp, pkOpp, espOpp, tabela) {
    const st = statsNoGinasio(pk, esp);
    const stOpp = statsNoGinasio(pkOpp, espOpp);
    if (!st || !stOpp) return null;
    const nivel = nivelNoGinasio(pk.level);
    const tiposDef = tiposDeEspecie(espOpp);
    const tiposAtq = tiposDeEspecie(esp);
    const g = melhorGolpeContra(esp, nivel, st, tiposDef, stOpp, tabela, pk.tmElemental, pk.tmFisico);
    const atk = g.category === "SPECIAL" ? st.spAtk : st.atk;
    const defOpp = g.category === "SPECIAL" ? stOpp.spDef : stOpp.def;
    const ef = efetividade(g.type, tiposDef[0], tiposDef[1], tabela);
    const stab = tiposAtq.includes(g.type) ? 1.5 : 1;
    const base = (2 * nivel / 5 + 2) * (g.power ?? GOLPE_BASICO.power) * atk / Math.max(1, defOpp) / 50 + 2;
    const dano = base * stab * Math.max(0, ef);
    const cd = Math.max(400, g.cooldownMs ?? GOLPE_BASICO.cooldownMs) / 1e3;
    const dps = dano / cd;
    const ehp = hpDeCombateGinasio(st.hp);
    const defTank = (st.def + st.spDef) / 2;
    const rating = dps * ehp * defTank;
    return {
      dps,
      ehp,
      def: defTank,
      rating,
      golpe: g,
      stats: st,
      nivel,
      nivelReal: Math.max(1, Math.floor(Number(pk.level) || 1)),
      ef,
      stab: stab > 1,
      tm: pk.tmElemental ?? null,
      golpeDaTm: !!g.tmElemental
    };
  }
  function rngDeterministico(seed) {
    let s = seed >>> 0;
    return () => {
      s = Math.imul(s, 1664525) + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }
  function compararDuelo1v1(pkA, espA, pkB, espB, { amostras = 400, tabelaTipos = null } = {}) {
    const usaTipos = tabelaTipos && Object.keys(tabelaTipos).length > 0;
    const mA = usaTipos ? metricasDeCombateContra(pkA, espA, pkB, espB, tabelaTipos) : metricasDeCombate(pkA, espA);
    const mB = usaTipos ? metricasDeCombateContra(pkB, espB, pkA, espA, tabelaTipos) : metricasDeCombate(pkB, espB);
    if (!mA || !mB) return null;
    const scoreA = (mA2, v) => usaTipos ? mA2.dps * v * mA2.ehp : mA2.dps * v * mA2.ehp * mA2.def;
    const scoreB = (mB2, v) => usaTipos ? mB2.dps * v * mB2.ehp : mB2.dps * v * mB2.ehp * mB2.def;
    const rAmin = scoreA(mA, VARIACAO_DANO_MIN);
    const rAmax = scoreA(mA, VARIACAO_DANO_MAX);
    const rBmin = scoreB(mB, VARIACAO_DANO_MIN);
    const rBmax = scoreB(mB, VARIACAO_DANO_MAX);
    const baseA = scoreA(mA, 1);
    const baseB = scoreB(mB, 1);
    const espelho = Math.abs(baseA - baseB) / Math.max(baseA, baseB, 1) < 1e-6;
    let pctA;
    let pctB;
    if (espelho) {
      pctA = 0.5;
      pctB = 0.5;
    } else {
      const seed = (pkA.speciesId ?? 0) * 997 + (pkB.speciesId ?? 0) * 991 + Math.round(mA.rating) + Math.round(mB.rating * 3) >>> 0;
      const rnd = rngDeterministico(seed);
      let vitA = 0;
      for (let i = 0; i < amostras; i++) {
        const vA = VARIACAO_DANO_MIN + rnd() * (VARIACAO_DANO_MAX - VARIACAO_DANO_MIN);
        const vB = VARIACAO_DANO_MIN + rnd() * (VARIACAO_DANO_MAX - VARIACAO_DANO_MIN);
        const rA = scoreA(mA, vA);
        const rB = scoreB(mB, vB);
        if (rA > rB) vitA++;
        else if (rA === rB) vitA += 0.5;
      }
      pctA = vitA / amostras;
      pctB = 1 - pctA;
    }
    let pctMinA = pctA;
    let pctMaxA = pctA;
    if (rAmin > rBmax) {
      pctMinA = 1;
      pctMaxA = 1;
    } else if (rAmax < rBmin) {
      pctMinA = 0;
      pctMaxA = 0;
    } else {
      pctMinA = Math.min(pctA, rAmin / (rAmin + rBmax));
      pctMaxA = Math.max(pctA, rAmax / (rAmax + rBmin));
    }
    const favorito = mA.rating >= mB.rating ? "a" : "b";
    return {
      a: mA,
      b: mB,
      poderA: Math.max(1, Math.round(mA.rating / GINASIO_ESCALA_FORCA)),
      poderB: Math.max(1, Math.round(mB.rating / GINASIO_ESCALA_FORCA)),
      pctA,
      pctB,
      pctMinA: Math.max(0, Math.min(1, pctMinA)),
      pctMaxA: Math.max(0, Math.min(1, pctMaxA)),
      favorito,
      empate: espelho || Math.abs(mA.rating - mB.rating) / Math.max(mA.rating, mB.rating, 1) < 0.015
    };
  }
  var GINASIO_ESCALA_FORCA = 1e7;
  var poderNoGinasio = (pk, esp = null) => esp ? Math.max(1, Math.round(ratingDeCombate(pk, esp) / GINASIO_ESCALA_FORCA)) : 1;
  var poderDoTimeGinasio = (pokemons, esps = null) => (pokemons ?? []).reduce(
    (s, pk) => s + poderNoGinasio(pk, esps?.get?.(pk?.speciesId) ?? null),
    0
  );
  var poderNaGuerra = (pk, esp = null) => poderNoNivel(pk, esp, nivelNaGuerra(pk?.level), { pvp: true });
  function motivoForaDoGinasio(pk, tipo, escolhidos = [], emGinasio = null) {
    if (!pk) return "sumiu";
    if (!pokemonDoTipo(pk.tipos, tipo)) return "tipo";
    if (outroGinasioDoPokemon(pk, tipo, emGinasio)) return "outroGinasio";
    if (escolhidos.some((o) => o && o.id !== pk.id && o.speciesId === pk.speciesId)) return "especie";
    if (escolhidos.some((o) => o && o.id === pk.id)) return "repetido";
    if (escolhidos.length >= GINASIO_TIME_MAX) return "cheio";
    return null;
  }
  function timeValidoDoGinasio(pokemons, tipo) {
    const ok = [];
    for (const pk of pokemons ?? []) {
      if (!motivoForaDoGinasio(pk, tipo, ok)) ok.push(pk);
    }
    return ok;
  }
  function validarTimeGinasio(pokemons, tipo, emGinasio = null) {
    if (!tipoDeGinasio(tipo)) return { ok: false, motivo: "tipo" };
    const lista = pokemons ?? [];
    if (lista.length > GINASIO_TIME_MAX) return { ok: false, motivo: "cheio" };
    const ok = [];
    for (const pk of lista) {
      const motivo = motivoForaDoGinasio(pk, tipo, ok, emGinasio);
      if (motivo) {
        return {
          ok: false,
          motivo,
          pk: pk ?? null,
          ...motivo === "outroGinasio" ? { outroTipo: outroGinasioDoPokemon(pk, tipo, emGinasio) } : {}
        };
      }
      ok.push(pk);
    }
    return { ok: true, motivo: null };
  }
  var ORDEM_DOS_GINASIOS = new Map(TIPOS_GINASIO.map((t, i) => [t, i]));
  function ginasioDeCadaPokemon(linhas) {
    const melhor = /* @__PURE__ */ new Map();
    for (const l of linhas ?? []) {
      const tipo = tipoDeGinasio(l?.tipo);
      if (!tipo) continue;
      const dono = Number(l.playerId);
      const em = new Date(l.atualizadoEm ?? 0).getTime() || 0;
      const ordem = ORDEM_DOS_GINASIOS.get(tipo);
      let doDono = melhor.get(dono);
      if (!doDono) melhor.set(dono, doDono = /* @__PURE__ */ new Map());
      for (const bruto of l.ids ?? []) {
        const id = Number(bruto);
        if (!Number.isFinite(id)) continue;
        const atual = doDono.get(id);
        if (!atual || em > atual.em || em === atual.em && ordem < atual.ordem) doDono.set(id, { tipo, em, ordem });
      }
    }
    const saida = /* @__PURE__ */ new Map();
    for (const [dono, doDono] of melhor) saida.set(dono, new Map([...doDono].map(([id, v]) => [id, v.tipo])));
    return saida;
  }
  function idsQueContamNoGinasio(linha, ginasioDe) {
    const tipo = tipoDeGinasio(linha?.tipo);
    const doDono = ginasioDe?.get(Number(linha?.playerId));
    if (!tipo || !doDono) return [];
    const saida = [];
    for (const bruto of linha.ids ?? []) {
      const id = Number(bruto);
      if (Number.isFinite(id) && doDono.get(id) === tipo && !saida.includes(id)) saida.push(id);
    }
    return saida;
  }
  function timesQueContam(linhas, porId, ginasioDe = ginasioDeCadaPokemon(linhas)) {
    return (linhas ?? []).map((l) => {
      const dono = Number(l.playerId);
      const candidatos = [];
      for (const id of idsQueContamNoGinasio(l, ginasioDe)) {
        const pk = porId?.get(id);
        if (pk && Number(pk.donoId) === dono) candidatos.push(pk);
      }
      const validos = timeValidoDoGinasio(candidatos, l.tipo);
      const casas = normalizarMapaDeCasas(l.casas, validos.map((pk) => pk.id));
      const pokemons = validos.map((pk) => ({ ...pk, casa: casas[String(pk.id)] ?? null }));
      return { pokemons, casas };
    });
  }
  function pokemonEmGinasioDosTimes(times) {
    const saida = {};
    for (const time of times ?? []) {
      const tipo = tipoDeGinasio(time?.tipo);
      if (!tipo) continue;
      for (const pk of time.pokemons ?? []) if (pk?.id != null) saida[String(pk.id)] = tipo;
    }
    return saida;
  }
  function outroGinasioDoPokemon(pk, tipo, emGinasio) {
    if (!emGinasio || pk == null) return null;
    const id = typeof pk === "object" ? pk.id : pk;
    if (id == null) return null;
    const onde = emGinasio instanceof Map ? emGinasio.get(id) ?? emGinasio.get(Number(id)) ?? emGinasio.get(String(id)) : emGinasio[String(id)];
    const outro = tipoDeGinasio(onde);
    return outro && outro !== tipoDeGinasio(tipo) ? outro : null;
  }
  function lugarNoTipo(podio, tipo) {
    if (podio instanceof Map) return podio.get(tipo);
    if (podio instanceof Set) return podio.has(tipo) ? 1 : void 0;
    if (Array.isArray(podio)) return podio.includes(tipo) ? 1 : void 0;
    return podio[tipo];
  }
  function buffGinasioDoPokemon(tiposPokemon, podio) {
    if (!podio || !tiposPokemon?.length) return null;
    let melhor = 0;
    for (const tipo of tiposPokemon) {
      const lugar = Math.floor(Number(lugarNoTipo(podio, String(tipo).toUpperCase())) || 0);
      if (pctDoLugarGinasio(lugar) > 0 && (!melhor || lugar < melhor)) melhor = lugar;
    }
    return melhor ? { lugar: melhor, pct: pctDoLugarGinasio(melhor) } : null;
  }
  function multBuffGinasio(tiposPokemon, podio) {
    const b = buffGinasioDoPokemon(tiposPokemon, podio);
    return b ? multDoLugarGinasio(b.lugar) : 1;
  }

  // tests/.cache/shared/dia-sazonal.mjs
  var dia_sazonal_exports = {};
  __export(dia_sazonal_exports, {
    ANTECIPACAO_SAZONAL_MS: () => ANTECIPACAO_SAZONAL_MS,
    MULT_SAZONAL: () => MULT_SAZONAL,
    TIPOS_SAZONAIS: () => TIPOS_SAZONAIS,
    chaveDoDiaSazonal: () => chaveDoDiaSazonal,
    danoSazonal: () => danoSazonal,
    ehDoTipoSazonal: () => ehDoTipoSazonal,
    escudoSazonal: () => escudoSazonal,
    fimDoDiaSazonal: () => fimDoDiaSazonal,
    inicioDoDiaSazonal: () => inicioDoDiaSazonal,
    multDanoSazonal: () => multDanoSazonal
  });

  // tests/.cache/shared/fuso-brasilia.mjs
  var FUSO_BRASILIA_MS = 3 * 60 * 6e4;

  // tests/.cache/shared/dia-sazonal.mjs
  var TIPOS_SAZONAIS = Object.freeze([
    "NORMAL",
    "FIRE",
    "WATER",
    "GRASS",
    "ELECTRIC",
    "ICE",
    "FIGHTING",
    "POISON",
    "GROUND",
    "FLYING",
    "PSYCHIC",
    "BUG",
    "ROCK",
    "GHOST",
    "DRAGON",
    "DARK",
    "STEEL",
    "FAIRY"
  ]);
  var MULT_SAZONAL = 2;
  var DIA_MS = 864e5;
  var ANTECIPACAO_SAZONAL_MS = 6 * 36e5;
  var DESLOCAMENTO_MS = FUSO_BRASILIA_MS - ANTECIPACAO_SAZONAL_MS;
  var chaveDoDiaSazonal = (t) => new Date(Number(t) - DESLOCAMENTO_MS).toISOString().slice(0, 10);
  var inicioDoDiaSazonal = (t) => Math.floor((Number(t) - DESLOCAMENTO_MS) / DIA_MS) * DIA_MS + DESLOCAMENTO_MS;
  var fimDoDiaSazonal = (t) => inicioDoDiaSazonal(t) + DIA_MS;
  var ehDoTipoSazonal = (tipos, tipo) => !!tipo && Array.isArray(tipos) && tipos.includes(tipo);
  function multDanoSazonal(tipo, tiposAtacante, tiposDefensor) {
    if (!tipo) return 1;
    const ataca = ehDoTipoSazonal(tiposAtacante, tipo) ? MULT_SAZONAL : 1;
    const apanha = ehDoTipoSazonal(tiposDefensor, tipo) ? MULT_SAZONAL * MULT_SAZONAL : 1;
    return ataca / apanha;
  }
  var danoSazonal = (dano, mult) => mult === 1 ? dano : Math.max(dano > 0 ? 1 : 0, Math.round(dano * mult));
  function escudoSazonal(nivel, alvoAtrasados) {
    const alvo = Number(alvoAtrasados);
    const n = Number(nivel);
    return Number.isFinite(alvo) && alvo > 1 && Number.isFinite(n) && n < alvo;
  }

  // tests/.cache/shared/captura-degrau.mjs
  var captura_degrau_exports = {};
  __export(captura_degrau_exports, {
    FATOR_CAPTURA_DO_DEGRAU: () => FATOR_CAPTURA_DO_DEGRAU,
    capturaPeloDegrau: () => capturaPeloDegrau,
    chaveDeHunt: () => chaveDeHunt,
    chavesEmHunt: () => chavesEmHunt,
    fatorDeCaptura: () => fatorDeCaptura
  });
  var FATOR_CAPTURA_DO_DEGRAU = Object.freeze({ 20: 2.8669, 40: 3.5745, 100: 4.4681 });
  var chaveDeHunt = (pokeId) => dexDe2(Number(pokeId));
  function chavesEmHunt(hunts) {
    const chaves = /* @__PURE__ */ new Set();
    for (const h of hunts ?? []) for (const e of h.especies ?? []) chaves.add(chaveDeHunt(e.pokeId));
    return chaves;
  }
  var dexBase = (id) => id >= 13e3 ? id % 1e3 : dexBaseDaForma(id) ?? id;
  function capturaPeloDegrau(pokeId, chaves) {
    const id = Number(pokeId);
    if (!Number.isFinite(id) || !chaves?.has(chaveDeHunt(id))) return false;
    return !DEX_LENDARIO_OU_MITICO.has(dexBase(id));
  }
  function fatorDeCaptura({ tetoCaptura, peloDegrau, preco, raridadeDiv = 17, porDegrau = FATOR_CAPTURA_DO_DEGRAU }) {
    if (peloDegrau) {
      const f = Number(porDegrau?.[tetoCaptura]) || Number(porDegrau?.[100]);
      return f > 0 ? f : FATOR_CAPTURA_DO_DEGRAU[100];
    }
    const raridade = Math.log10(Math.max(100, Number(preco) || 0)) - 1;
    return 1 + raridade ** 3 / raridadeDiv;
  }

  // tests/.cache/shared/ovo-shiny.mjs
  var ovo_shiny_exports = {};
  __export(ovo_shiny_exports, {
    CHANCE_FRAGMENTO_OVO_SHINY_BASE: () => CHANCE_FRAGMENTO_OVO_SHINY_BASE,
    CHANCE_FRAGMENTO_OVO_SHINY_PASSO: () => CHANCE_FRAGMENTO_OVO_SHINY_PASSO,
    CUSTO_FRAGMENTOS_OVO_SHINY: () => CUSTO_FRAGMENTOS_OVO_SHINY,
    DEGRAUS_FRAGMENTO_OVO_SHINY: () => DEGRAUS_FRAGMENTO_OVO_SHINY,
    FRAGMENTO_OVO_SHINY_ID: () => FRAGMENTO_OVO_SHINY_ID,
    HORAS_OVO_SHINY: () => HORAS_OVO_SHINY,
    NIVEL_MIN_FRAGMENTO_OVO_SHINY: () => NIVEL_MIN_FRAGMENTO_OVO_SHINY,
    OVO_SHINY_ITEM_ID: () => OVO_SHINY_ITEM_ID,
    PASSO_RELATIVO_OVO_SHINY: () => PASSO_RELATIVO_OVO_SHINY,
    chanceDoDegrauOvoShiny: () => chanceDoDegrauOvoShiny,
    chanceFragmentoOvoShiny: () => chanceFragmentoOvoShiny,
    degrauFragmentoOvoShiny: () => degrauFragmentoOvoShiny,
    regiaoDoNivelOvoShiny: () => regiaoDoNivelOvoShiny,
    tabelaFragmentoOvoShiny: () => tabelaFragmentoOvoShiny
  });
  var FRAGMENTO_OVO_SHINY_ID = 70017;
  var OVO_SHINY_ITEM_ID = 70094;
  var CUSTO_FRAGMENTOS_OVO_SHINY = 10;
  var HORAS_OVO_SHINY = 48;
  var CHANCE_FRAGMENTO_OVO_SHINY_BASE = 1 / 15e4;
  var PASSO_RELATIVO_OVO_SHINY = 0.04;
  var CHANCE_FRAGMENTO_OVO_SHINY_PASSO = CHANCE_FRAGMENTO_OVO_SHINY_BASE * PASSO_RELATIVO_OVO_SHINY;
  var NIVEL_MIN_FRAGMENTO_OVO_SHINY = 5e3;
  var DEGRAUS_FRAGMENTO_OVO_SHINY = Object.freeze([
    5e3,
    5400,
    5900,
    6400,
    6950,
    8e3,
    8600,
    1e4,
    11250,
    12750,
    14350,
    16e3,
    2e4,
    21200,
    25e3,
    26150,
    27500,
    28950,
    30450,
    35150,
    4e4,
    42800,
    46150,
    49650,
    53350,
    64950,
    75e3,
    84650,
    95950,
    108e3,
    120550,
    160300
  ]);
  var PORTAS_REGIAO = Object.freeze([
    { regiao: "paldea", nivel: 75e3 },
    { regiao: "galar", nivel: 4e4 },
    { regiao: "alola", nivel: 25e3 },
    { regiao: "kalos", nivel: 1e4 },
    { regiao: "unova", nivel: NIVEL_MIN_FRAGMENTO_OVO_SHINY }
  ]);
  function degrauFragmentoOvoShiny(nivelHunt) {
    const n = Number(nivelHunt);
    if (!Number.isFinite(n) || n < NIVEL_MIN_FRAGMENTO_OVO_SHINY) return 0;
    let d = 0;
    for (const nivel of DEGRAUS_FRAGMENTO_OVO_SHINY) {
      if (nivel > n) break;
      d++;
    }
    return d;
  }
  function chanceFragmentoOvoShiny(hunt) {
    if (!hunt || hunt.area === "outland") return 0;
    return chanceDoDegrauOvoShiny(degrauFragmentoOvoShiny(hunt.nivel));
  }
  function chanceDoDegrauOvoShiny(degrau) {
    return degrau > 0 ? CHANCE_FRAGMENTO_OVO_SHINY_BASE + (degrau - 1) * CHANCE_FRAGMENTO_OVO_SHINY_PASSO : 0;
  }
  function regiaoDoNivelOvoShiny(nivelHunt) {
    const n = Number(nivelHunt);
    return PORTAS_REGIAO.find((p) => n >= p.nivel)?.regiao ?? null;
  }
  function tabelaFragmentoOvoShiny() {
    return DEGRAUS_FRAGMENTO_OVO_SHINY.map((nivel, i) => ({
      nivel,
      degrau: i + 1,
      chance: chanceDoDegrauOvoShiny(i + 1),
      regiao: regiaoDoNivelOvoShiny(nivel)
    }));
  }

  // tests/.cache/shared/prey.mjs
  var prey_exports = {};
  __export(prey_exports, {
    PREY_BONUS: () => PREY_BONUS,
    PREY_CARTELA2_DIAMANTES: () => PREY_CARTELA2_DIAMANTES,
    PREY_CARTELAS: () => PREY_CARTELAS,
    PREY_CATEGORIAS: () => PREY_CATEGORIAS,
    PREY_CHANCE_BONUS_MIL: () => PREY_CHANCE_BONUS_MIL,
    PREY_CHANCE_ESTRELAS_MIL: () => PREY_CHANCE_ESTRELAS_MIL,
    PREY_CUSTO_BASE: () => PREY_CUSTO_BASE,
    PREY_ESTRELAS_MAX: () => PREY_ESTRELAS_MAX,
    PREY_MAX_EXTRAS: () => PREY_MAX_EXTRAS,
    PREY_OPCOES: () => PREY_OPCOES,
    PREY_REGIOES: () => PREY_REGIOES,
    PREY_REGIOES_MIN: () => PREY_REGIOES_MIN,
    PREY_ROLETADA_INTEIRA: () => PREY_ROLETADA_INTEIRA,
    PREY_VALOR: () => PREY_VALOR,
    cartela2Liberada: () => cartela2Liberada,
    cartelaCompleta: () => cartelaCompleta,
    cartelaDepoisDaEscolha: () => cartelaDepoisDaEscolha,
    cartelaDepoisDaRoletada: () => cartelaDepoisDaRoletada,
    cartelaValida: () => cartelaValida,
    cartelasLiberadas: () => cartelasLiberadas,
    custoDaRoletada: () => custoDaRoletada,
    danoPve: () => danoPve,
    efeitosDoPrey: () => efeitosDoPrey,
    extrasDeSpawnPrey: () => extrasDeSpawnPrey,
    indiceDaCategoria: () => indiceDaCategoria,
    listaDaCartela: () => listaDaCartela,
    multCapturaPrey: () => multCapturaPrey,
    multDanoPrey: () => multDanoPrey,
    multDefesaPrey: () => multDefesaPrey,
    normalizarPrey: () => normalizarPrey,
    planoDaEscolha: () => planoDaEscolha,
    planoDaRoletada: () => planoDaRoletada,
    poolDasRegioes: () => poolDasRegioes,
    preyDoMomento: () => preyDoMomento,
    regioesDasCartelas: () => regioesDasCartelas,
    regioesDoPedido: () => regioesDoPedido,
    regioesGravadas: () => regioesGravadas,
    repartirExtras: () => repartirExtras,
    sortearBonus: () => sortearBonus,
    sortearEstrelas: () => sortearEstrelas,
    sortearLista: () => sortearLista,
    valorDoPrey: () => valorDoPrey
  });
  var PREY_CARTELAS = 2;
  var PREY_CARTELA2_DIAMANTES = 100;
  var PREY_OPCOES = 9;
  var PREY_REGIOES = Object.freeze(["kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "paldea"]);
  var PREY_REGIOES_MIN = 2;
  function regioesDoPedido(v) {
    if (!Array.isArray(v) || v.length > PREY_REGIOES.length) return null;
    if (!v.every((r) => typeof r === "string" && PREY_REGIOES.includes(r))) return null;
    if (new Set(v).size !== v.length || v.length < PREY_REGIOES_MIN) return null;
    return PREY_REGIOES.filter((r) => v.includes(r));
  }
  function regioesGravadas(v) {
    const r = regioesDoPedido(v);
    return r && r.length < PREY_REGIOES.length ? r : null;
  }
  function regioesDasCartelas(automation) {
    const bruto = Array.isArray(automation?.preyRegioes) ? automation.preyRegioes : [];
    return Array.from({ length: PREY_CARTELAS }, (_, i) => regioesGravadas(bruto[i]));
  }
  var poolDasRegioes = (pool, regioes) => regioes ? (pool ?? []).filter((e) => regioes.includes(e.regiao)) : pool ?? [];
  var PREY_BONUS = Object.freeze(["dano", "defesa", "captura", "spawn"]);
  var PREY_CATEGORIAS = Object.freeze(["pokemon", "bonus", "estrelas"]);
  var PREY_ROLETADA_INTEIRA = "tudo";
  var PREY_ESTRELAS_MAX = 5;
  var PREY_CHANCE_ESTRELAS_MIL = Object.freeze([550, 300, 100, 45, 5]);
  var PREY_CHANCE_BONUS_MIL = 250;
  var PREY_VALOR = Object.freeze({
    dano: Object.freeze([10, 20, 30, 40, 50]),
    defesa: Object.freeze([10, 20, 30, 40, 50]),
    captura: Object.freeze([2, 4, 6, 8, 10]),
    spawn: Object.freeze([1, 2, 3, 4, 5])
  });
  var PREY_MAX_EXTRAS = PREY_VALOR.spawn[PREY_ESTRELAS_MAX - 1];
  var PREY_CUSTO_BASE = 1e6;
  var EXPOENTE_MAX = 33;
  var N_MAX = 1e3;
  function custoDaRoletada(n) {
    const k = Math.max(0, Math.min(EXPOENTE_MAX, Math.floor(Number(n) || 0)));
    return PREY_CUSTO_BASE * 2 ** k;
  }
  var valorDoPrey = (bonus, est) => PREY_VALOR[bonus]?.[est - 1] ?? 0;
  function sortearEstrelas(aleatorioInt) {
    const r = aleatorioInt(1e3);
    let acumulado = 0;
    for (let i = 0; i < PREY_CHANCE_ESTRELAS_MIL.length; i++) {
      acumulado += PREY_CHANCE_ESTRELAS_MIL[i];
      if (r < acumulado) return i + 1;
    }
    return 1;
  }
  var sortearBonus = (aleatorioInt) => PREY_BONUS[aleatorioInt(PREY_BONUS.length)] ?? PREY_BONUS[0];
  function sortearLista(pool, excluir, aleatorioInt) {
    const fora = new Set((excluir ?? []).map(Number));
    const livres = [...new Set((pool ?? []).map(Number))].filter((id) => Number.isSafeInteger(id) && id > 0 && !fora.has(id));
    const out = [];
    for (let i = 0; i < livres.length && out.length < PREY_OPCOES; i++) {
      const resto = livres.length - i;
      const j = i + Math.min(resto - 1, Math.max(0, Math.floor(Number(aleatorioInt(resto))) || 0));
      [livres[i], livres[j]] = [livres[j], livres[i]];
      out.push(livres[i]);
    }
    return out;
  }
  var ehObjeto = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  var CHAVE_DIA_OK = /^\d{4}-\d{2}-\d{2}$/;
  function contador(v, max = N_MAX) {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
  }
  var idValido = (v) => {
    const n = typeof v === "number" || typeof v === "string" ? Number(v) : NaN;
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  };
  function cartelaValida(c) {
    if (!ehObjeto(c)) return null;
    let lista = null;
    if (Array.isArray(c.lista)) {
      const ids = [...new Set(c.lista.map(idValido))];
      if (ids.length && ids.length <= PREY_OPCOES && ids.every((id) => id != null)) lista = ids;
    }
    let pk = !lista || c.pk == null ? null : idValido(c.pk);
    if (pk != null && !lista.includes(pk)) pk = null;
    const est = Number(c.est);
    const temResultado = !!lista && PREY_BONUS.includes(c.bonus) && Number.isInteger(est) && est >= 1 && est <= PREY_ESTRELAS_MAX;
    const n = Array.isArray(c.n) ? c.n : [];
    const nLimpo = PREY_CATEGORIAS.map((_, i) => contador(n[i]));
    if (!lista && pk == null && !temResultado && nLimpo.every((x) => x === 0)) return null;
    return { lista, pk, bonus: temResultado ? c.bonus : null, est: temResultado ? est : null, n: nLimpo };
  }
  var cartelaCompleta = (c) => !!c && c.pk != null && !!c.bonus && !!c.est;
  var listaDaCartela = (c) => Array.isArray(c?.lista) ? c.lista : [];
  var cartela2Liberada = (automation) => Number(automation?.preyCartela2) > 0;
  var cartelasLiberadas = (automation) => cartela2Liberada(automation) ? PREY_CARTELAS : 1;
  function normalizarPrey(bruto, dia) {
    const vazio = { dia: String(dia ?? ""), cartelas: Array.from({ length: PREY_CARTELAS }, () => null) };
    if (!ehObjeto(bruto) || !CHAVE_DIA_OK.test(String(bruto.dia ?? "")) || bruto.dia !== dia) return vazio;
    const cartelas = Array.isArray(bruto.cartelas) ? bruto.cartelas : [];
    return { dia, cartelas: vazio.cartelas.map((_, i) => cartelaValida(cartelas[i])) };
  }
  var preyDoMomento = (automation, t) => normalizarPrey(automation?.prey, chaveDoDiaSazonal(t));
  function efeitosDoPrey(automation, dia) {
    const prey = normalizarPrey(automation?.prey, dia);
    const liberadas = cartelasLiberadas(automation);
    const out = [];
    prey.cartelas.forEach((c, cartela) => {
      if (!cartelaCompleta(c) || cartela >= liberadas) return;
      out.push({ cartela, pk: c.pk, bonus: c.bonus, est: c.est, valor: valorDoPrey(c.bonus, c.est) });
    });
    return out;
  }
  function multDanoPrey(efeitos, speciesId) {
    let m = 1;
    for (const e of efeitos ?? []) if (e.bonus === "dano" && e.pk === speciesId) m *= 1 + e.valor / 100;
    return m;
  }
  function multDefesaPrey(efeitos, speciesId) {
    let m = 1;
    for (const e of efeitos ?? []) if (e.bonus === "defesa" && e.pk === speciesId) m *= 1 - e.valor / 100;
    return m;
  }
  function multCapturaPrey(efeitos, speciesId) {
    let m = 1;
    for (const e of efeitos ?? []) if (e.bonus === "captura" && e.pk === speciesId) m *= 1 + e.valor / 100;
    return m;
  }
  function extrasDeSpawnPrey(efeitos, speciesId) {
    let n = 0;
    for (const e of efeitos ?? []) if (e.bonus === "spawn" && e.pk === speciesId) n += e.valor;
    return Math.min(PREY_MAX_EXTRAS, n);
  }
  function danoPve(dano, mult, aleatorio = Math.random) {
    if (mult === 1 || !(dano > 0) || !Number.isFinite(mult) || mult <= 0) return dano;
    const x = dano * mult;
    const chao = Math.floor(x);
    return Math.max(1, chao + (aleatorio() < x - chao ? 1 : 0));
  }
  var indiceDaCategoria = (categoria) => PREY_CATEGORIAS.indexOf(categoria);
  var CARTELA_NOVA = Object.freeze({ lista: null, pk: null, bonus: null, est: null, n: [0, 0, 0] });
  function cartelaDoPedido(prey, liberadas, pedido) {
    const cartela = Number(pedido?.cartela);
    if (!Number.isInteger(cartela) || cartela < 0 || cartela >= PREY_CARTELAS) return { erro: "prey.pedidoInvalido" };
    if (cartela >= liberadas) return { erro: "prey.cartelaBloqueada" };
    if (String(pedido?.dia ?? "") !== prey.dia) return { erro: "prey.diaVirou" };
    return { cartela, atual: prey.cartelas[cartela] };
  }
  function planoDaRoletada(prey, liberadas, pedido) {
    const base = cartelaDoPedido(prey, liberadas, pedido);
    if (base.erro) return base;
    const { atual } = base;
    if (pedido?.categoria === PREY_ROLETADA_INTEIRA) {
      if (atual?.bonus || atual?.lista) return { erro: "prey.jaRoletada" };
      return { custo: 0, i: -1 };
    }
    const i = indiceDaCategoria(pedido?.categoria);
    if (i < 0) return { erro: "prey.pedidoInvalido" };
    if (!atual?.bonus) return { erro: "prey.roleteAntes" };
    const n = atual?.n[i] ?? 0;
    if (Number(pedido?.n) !== n) return { erro: "prey.mudou" };
    return { custo: custoDaRoletada(n), i };
  }
  function cartelaDepoisDaRoletada(atual, i, sorteio) {
    const c = cartelaValida(atual) ?? CARTELA_NOVA;
    if (!Number.isInteger(i) || i < -1 || i >= PREY_CATEGORIAS.length) return null;
    const estOk = Number.isInteger(sorteio?.est) && sorteio.est >= 1 && sorteio.est <= PREY_ESTRELAS_MAX;
    if (i === -1) {
      if (!PREY_BONUS.includes(sorteio?.bonus) || !estOk) return null;
      if (!Array.isArray(sorteio?.lista) || !sorteio.lista.length) return null;
      const nova2 = cartelaValida({ ...c, lista: sorteio.lista, pk: null, bonus: sorteio.bonus, est: sorteio.est });
      return nova2?.lista && nova2.bonus && nova2.est ? nova2 : null;
    }
    const n = c.n.slice();
    n[i] = Math.min(N_MAX, n[i] + 1);
    if (i === 0) {
      if (!Array.isArray(sorteio?.lista) || !sorteio.lista.length) return null;
      const nova2 = cartelaValida({ ...c, lista: sorteio.lista, pk: null, n });
      return nova2?.lista ? nova2 : null;
    }
    const nova = i === 1 ? PREY_BONUS.includes(sorteio?.bonus) ? cartelaValida({ ...c, bonus: sorteio.bonus, n }) : null : estOk ? cartelaValida({ ...c, est: sorteio.est, n }) : null;
    return nova?.bonus && nova.est ? nova : null;
  }
  function planoDaEscolha(prey, liberadas, pedido) {
    const base = cartelaDoPedido(prey, liberadas, pedido);
    if (base.erro) return base;
    const pk = idValido(pedido?.pk);
    if (pk == null) return { erro: "prey.pedidoInvalido" };
    if (!listaDaCartela(base.atual).length) return { erro: "prey.roleteAntes" };
    if (base.atual?.pk != null) return { erro: "prey.jaEscolhido" };
    if (!listaDaCartela(base.atual).includes(pk)) return { erro: "prey.foraDaLista" };
    return { cartela: base.cartela, pk };
  }
  var cartelaDepoisDaEscolha = (atual, pk) => cartelaValida({ ...cartelaValida(atual) ?? CARTELA_NOVA, pk });
  function repartirExtras(n, k, aleatorio = Math.random) {
    const total = Math.max(0, Math.min(PREY_MAX_EXTRAS, Math.floor(Number(n) || 0)));
    const manadas = Math.max(0, Math.floor(Number(k) || 0));
    const out = new Array(manadas).fill(0);
    if (!total || !manadas) return out;
    const ordem = Array.from({ length: manadas }, (_, i) => i);
    for (let i = manadas - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    for (let i = 0; i < total; i++) out[ordem[i % manadas]]++;
    return out;
  }

  // tests/.cache/shared/bestiario.mjs
  var bestiario_exports = {};
  __export(bestiario_exports, {
    BESTIARIO_DEGRAUS: () => BESTIARIO_DEGRAUS,
    TIPOS_BESTIARIO: () => TIPOS_BESTIARIO,
    bonusPorTipo: () => bonusPorTipo,
    bpDaEspecie: () => bpDaEspecie,
    degrauDoBestiario: () => degrauDoBestiario,
    ehAbateDeDegrau: () => ehAbateDeDegrau,
    especiesDoBestiario: () => especiesDoBestiario,
    multBestiario: () => multBestiario,
    pctDoBp: () => pctDoBp,
    proximoDegrauDoBestiario: () => proximoDegrauDoBestiario
  });

  // tests/.cache/shared/chocadeira.mjs
  var OVOS = Object.freeze([
    Object.freeze({ id: "p2", itemId: 70091, potencia: 2, preco: 2e7, horas: 6, nome: "Mystery Egg P2" }),
    Object.freeze({ id: "p3", itemId: 70092, potencia: 3, preco: 12e7, horas: 12, nome: "Mystery Egg P3" }),
    Object.freeze({ id: "p4", itemId: 70093, potencia: 4, preco: 25e7, horas: 24, nome: "Mystery Egg P4" })
  ]);
  var OVO_SHINY = Object.freeze({
    id: "shiny",
    itemId: OVO_SHINY_ITEM_ID,
    potencia: null,
    horas: HORAS_OVO_SHINY,
    nome: "Shiny Egg",
    shiny: true
  });
  var TODOS_OS_OVOS = Object.freeze([...OVOS, OVO_SHINY]);
  var OVO_POR_ID = new Map(TODOS_OS_OVOS.map((o) => [o.id, o]));
  var OVO_POR_ITEM = new Map(TODOS_OS_OVOS.map((o) => [o.itemId, o]));
  var dexBase2 = (id) => id >= 13e3 ? id % 1e3 : dexBaseDaForma(id) ?? id;
  function podeChocarDoOvo(id) {
    const n = Number(id);
    return !isOutlandPokeId(n) && !isMegaPokeId(n) && !DEX_LENDARIO_OU_MITICO.has(dexBase2(n));
  }
  function especiesDoOvo(huntsJogaveis) {
    const ids = /* @__PURE__ */ new Set();
    for (const h of huntsJogaveis ?? []) {
      if (h?.area === "outland") continue;
      for (const e of h.especies ?? []) ids.add(Number(e.pokeId));
    }
    return [...ids].filter((id) => Number.isInteger(id) && id > 0 && podeChocarDoOvo(id)).sort((a, b) => a - b);
  }

  // tests/.cache/shared/pokedex.mjs
  var OUTLAND_DEX_MAX_LEGADO = OUTLAND_DEX_BASE + 47;
  function chavePokedex(pokeId) {
    const id = Number(pokeId);
    if (!Number.isFinite(id) || id < 1) return null;
    if (isOutlandPokeIdLegado(id)) return remapOutlandPokeId(id);
    if (isOutlandPokeId(id)) return dexChaveOutland(id);
    return dexDe2(id);
  }

  // tests/.cache/shared/bestiario.mjs
  var BESTIARIO_DEGRAUS = Object.freeze([
    Object.freeze({ abates: 25e3, bp: 5 }),
    Object.freeze({ abates: 15e4, bp: 15 }),
    Object.freeze({ abates: 5e5, bp: 50 })
  ]);
  var TIPOS_BESTIARIO = TIPOS_SAZONAIS;
  function degrauDoBestiario(k) {
    const n = Number(k) || 0;
    let d = 0;
    for (const g of BESTIARIO_DEGRAUS) if (n >= g.abates) d++;
    return d;
  }
  var bpDaEspecie = (k) => BESTIARIO_DEGRAUS[degrauDoBestiario(k) - 1]?.bp ?? 0;
  var proximoDegrauDoBestiario = (k) => BESTIARIO_DEGRAUS.find((g) => (Number(k) || 0) < g.abates) ?? null;
  var ehAbateDeDegrau = (k) => BESTIARIO_DEGRAUS.some((g) => g.abates === k);
  var pctDoBp = (bp) => (Number(bp) || 0) / 100;
  function especiesDoBestiario(huntsJogaveis, especiePorId) {
    const nivelDe = /* @__PURE__ */ new Map();
    for (const h of huntsJogaveis ?? []) {
      for (const e of h?.especies ?? []) {
        const id = Number(e?.pokeId);
        const nv = Number(h?.nivel) || 0;
        if (!nivelDe.has(id) || nv < nivelDe.get(id)) nivelDe.set(id, nv);
      }
    }
    const vistas = /* @__PURE__ */ new Set();
    const out = [];
    for (const pokeId of especiesDoOvo(huntsJogaveis)) {
      const chave = chavePokedex(pokeId);
      if (chave == null || vistas.has(chave)) continue;
      const esp = especiePorId?.(pokeId);
      if (!esp) continue;
      const tipos = [...new Set([esp.type1, esp.type2].map((t) => String(t ?? "").toUpperCase()))].filter((t) => TIPOS_BESTIARIO.includes(t));
      if (!tipos.length) continue;
      vistas.add(chave);
      out.push({ chave, pokeId, tipos, nivel: nivelDe.get(pokeId) ?? 0 });
    }
    return out;
  }
  function bonusPorTipo(lista, abatesDe) {
    const out = Object.fromEntries(TIPOS_BESTIARIO.map((t) => [t, 0]));
    for (const e of lista ?? []) {
      const bp = bpDaEspecie(abatesDe?.(e.chave));
      if (!bp) continue;
      for (const t of e.tipos) if (t in out) out[t] += bp;
    }
    return out;
  }
  function multBestiario(bpPorTipo, tipos) {
    if (!bpPorTipo || !Array.isArray(tipos)) return 1;
    let bp = 0;
    for (let i = 0; i < tipos.length; i++) {
      const t = tipos[i];
      if (tipos.indexOf(t) === i) bp += Number(bpPorTipo[t]) || 0;
    }
    return bp > 0 ? 1 + bp / 1e4 : 1;
  }

  // tests/.cache/shared/estado-delta.mjs
  function criarMescladorDeEstado() {
    let campos = null;
    let pokemons = /* @__PURE__ */ new Map();
    return function mesclar(parcial) {
      if (!parcial) return campos ? montar() : null;
      const { cheio, pokemons: lista, pkMud, pkFora, dexMud, dexFora, ...resto } = parcial;
      if (cheio || !campos) {
        campos = resto;
        pokemons = new Map((lista ?? []).map((k) => [k.id, k]));
        return montar();
      }
      Object.assign(campos, resto);
      if (lista) pokemons = new Map(lista.map((k) => [k.id, k]));
      for (const k of pkMud ?? []) pokemons.set(k.id, k);
      for (const id of pkFora ?? []) pokemons.delete(id);
      if (dexMud || dexFora) {
        campos.pokedex = { ...campos.pokedex ?? {}, ...dexMud ?? {} };
        for (const chave of dexFora ?? []) delete campos.pokedex[chave];
      }
      return montar();
    };
    function montar() {
      return { ...campos, pokemons: [...pokemons.values()] };
    }
  }

  // <stdin>
  var mod = { cooldown: cooldown_golpes_exports, especiais: golpes_especiais_exports, planilhas: golpes_planilhas_exports, outland: outland_exports, baseOutland: herdar_base_outland_exports, golpesOrre: herdar_golpes_orre_exports, megas: megas_exports, evolucoes: evolucoes_cruzadas_exports, recompensa: recompensa_hunt_exports, ajustes: ajustes_especie_espelho_exports, analyser: hunt_analyser_exports, ginasios: ginasios_exports, sazonal: dia_sazonal_exports, captura: captura_degrau_exports, ovoShiny: ovo_shiny_exports, prey: prey_exports, bestiario: bestiario_exports };
  (globalThis.__pokeidleHunt ?? (globalThis.__pokeidleHunt = {})).definirModulosDoJogo?.(mod, criarMescladorDeEstado);
})();
