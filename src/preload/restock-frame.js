// Preload da auto-reposição. Roda em todos os frames, antes dos scripts do jogo, e instala no mundo principal da
// página a função `restockPage` (abaixo). Ela acompanha o socket do próprio jogo (o estado da conta fica dentro do
// módulo dele, fora do alcance da página), lê o `welcome` e os `estado`, e compra o que falta no Mercado do NPC pelo
// mesmo pedido do botão Comprar (`shop.buy`). A configuração e o resumo chegam/saem pelo main (src/restock.js).
//
// Adaptado da reposição do PokeIdleMulti (recompra.js, MIT, © artbruno35): https://github.com/artbruno35/PokeIdleMulti
// A lógica foi reescrita em JavaScript para o Electron, com ajustes (limites, pausa persistente e ordem de prioridade).
//
// O preload roda em sandbox, então só pode fazer `require('electron')`: a lógica inteira está dentro da função.
// Nada de variáveis de fora dela, porque ela é convertida em texto e executada na página.
const { webFrame } = require('electron');

function restockPage(opts) {
  'use strict';
  if (window.top !== window || window.__pkRestock) return;
  const o = opts || {};
  const GAP_MS = o.gapMs ?? 4000; // uma compra por conta a cada 4 s
  const MAX_QTY = 9999; // máximo por pedido (é o que o próprio jogo aceita por compra)
  const TIMEOUT_MS = o.timeoutMs ?? 15000; // sem resposta do jogo nesse prazo: conta como falha
  const REFUSAL_MS = o.refusalMs ?? 30000; // o jogo recusou o pedido: espera 30 s
  const PAUSE_MS = o.pauseMs ?? 120000; // 3 falhas seguidas: pausa de 2 min
  const MAX_FAILS = 3;
  const MAX_STOCK = 10000000;
  const GOLDEN_POTION = 70070; // cura por % do HP, com outra fórmula: fica de fora (nem conta, nem compra)
  const KEYS = ['gold', 'balls', 'items', 'automation', 'activeId', 'nick'];
  const WANTED = new Set(['welcome', 'estado', 'batalha', 'erro']);
  // Pausa, espera e falhas ficam no sessionStorage: um F5 na conta não zera os limites.
  const SS = { next: 'pkReposicao.proxima', pause: 'pkReposicao.pausaAte', fails: 'pkReposicao.falhas' };

  const salvo = (k) => {
    try { return Number(sessionStorage.getItem(k)) || 0; } catch { return 0; }
  };
  const guarda = (k, v) => {
    try { sessionStorage.setItem(k, String(v)); } catch { /* sem storage: vale só até o F5 */ }
  };

  let socket = null;
  let acc = null; // gold, balls, items, automation, activeId, nick (remontados dos deltas)
  let hp = new Map(); // id do pokémon -> HP máximo
  let ballCatalog = []; // catalogoBolas do welcome
  let ours = []; // itensNossos do welcome
  let mirror = null; // poções e revives de /assets/items.json
  let mirrorAt = 0;
  const paid = new Map(); // preço pago na última compra (vale mais que o do catálogo)
  let cfg = null;
  let pending = null; // a compra no ar
  let nextAt = salvo(SS.next);
  let pauseUntil = salvo(SS.pause);
  let failures = salvo(SS.fails);
  const filling = { balls: false, revives: false, potions: false };
  const log = [];
  const once = new Set();

  const fmt = (n) => Math.round(n).toLocaleString('pt-BR');
  const note = (texto) => {
    log.push(`${new Date().toLocaleTimeString('pt-BR')} ${texto}`);
    if (log.length > 40) log.shift();
  };
  const noteOnce = (chave, texto) => {
    if (once.has(chave)) return;
    once.add(chave);
    note(texto);
  };
  const setNext = (t) => { nextAt = t; guarda(SS.next, t); };
  const setPause = (t) => { pauseUntil = t; guarda(SS.pause, t); };
  const setFails = (n) => { failures = n; guarda(SS.fails, n); };

  // O socket do jogo é o que abre para o próprio site. O Proxy deixa a classe, o prototype e o instanceof como estavam.
  const Native = window.WebSocket;
  if (typeof Native === 'function') {
    window.WebSocket = new Proxy(Native, {
      construct(target, args, newTarget) {
        const ws = Reflect.construct(target, args, newTarget);
        try {
          if (new URL(String(args[0]), location.href).host === location.host) attach(ws);
        } catch { /* URL inválida: não é o socket do jogo */ }
        return ws;
      },
    });
  }

  function attach(ws) {
    socket = ws;
    acc = null;
    pending = null;
    ws.addEventListener('message', (e) => {
      if (ws === socket) receive(e.data);
    });
  }

  function receive(data) {
    if (typeof data !== 'string') return;
    // A batalha chega o tempo todo: só vale ler a que traz uma compra.
    const head = /^\{"t":"([^"]*)"/.exec(data);
    if (head && (!WANTED.has(head[1]) || (head[1] === 'batalha' && !data.includes('"k":"compra"')))) return;
    let m;
    try {
      m = JSON.parse(data);
    } catch {
      return;
    }
    if (m.t === 'welcome') {
      ballCatalog = Array.isArray(m.catalogoBolas) ? m.catalogoBolas : [];
      ours = Array.isArray(m.itensNossos) ? m.itensNossos : [];
      merge(m.estado, true);
      loadMirror();
    } else if (m.t === 'estado') {
      merge(m.estado, false);
    } else if (m.t === 'batalha') {
      for (const e of m.ev ?? []) if (e && e.k === 'compra') bought(e);
    } else if (m.t === 'erro') {
      refused(m);
    }
  }

  // Chave ausente quer dizer "não mudou"; `cheio` (welcome ou reconexão) recomeça do zero.
  function merge(estado, full) {
    if (!estado || typeof estado !== 'object') return;
    if (full || estado.cheio || !acc) {
      acc = {};
      hp = new Map();
    }
    for (const k of KEYS) if (k in estado) acc[k] = estado[k];
    if (Array.isArray(estado.pokemons)) hp = new Map(estado.pokemons.map((p) => [p.id, p.maxHp]));
    for (const p of estado.pkMud ?? []) hp.set(p.id, p.maxHp);
    for (const id of estado.pkFora ?? []) hp.delete(id);
  }

  function loadMirror() {
    if (mirror || Date.now() < mirrorAt) return;
    mirrorAt = Date.now() + 30000;
    fetch('/assets/items.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        mirror = (j.items ?? []).filter((i) => i.category === 'heal' || i.category === 'revive');
      })
      .catch(() => noteOnce('itens', 'não consegui ler a lista de itens do jogo; tento de novo em 30 s'));
  }

  // As poções (heal) ou os revives que o NPC vende, do mais barato ao mais caro.
  function shop(categoria) {
    const itens = new Map();
    for (const i of [...(mirror ?? []), ...ours]) {
      if (i?.category !== categoria || !(i.npcPrice > 0) || i.id === GOLDEN_POTION) continue;
      itens.set(i.id, {
        id: i.id,
        name: i.name,
        price: paid.get(i.id) ?? i.npcPrice,
        heal: Number(i.healAmount) || 0,
        healPct: Number(i.healPct) || 0,
      });
    }
    return [...itens.values()].sort((a, b) => a.price - b.price);
  }

  const gold = () => Number(acc?.gold) || 0;
  const have = (item) => Number(acc?.items?.[item.id]) || 0;
  const total = (itens) => itens.reduce((soma, item) => soma + have(item), 0);

  // Custo-benefício: ouro por HP que a poção cura DE VERDADE no pokémon ativo. A automação do jogo usa a poção abaixo
  // do limiar de vida, então o que ela pode curar é (100% - limiar) do HP máximo.
  function rate(potions) {
    const maxHp = hp.get(acc?.activeId);
    if (!(maxHp > 0)) return null;
    const limiar = Math.min(1, Math.max(0.1, Number(acc.automation?.hpLimiar) || 0.3));
    const folga = Math.max(0.1, 1 - limiar) * maxHp;
    for (const p of potions) {
      p.useful = Math.min(p.healPct > 0 ? p.healPct * maxHp : p.heal, folga);
      p.cost = p.useful > 0 ? p.price / p.useful : Infinity;
    }
    return { hp: maxHp, limiar };
  }

  function pickPotion(potions) {
    if (cfg?.potions?.id > 0) return potions.find((p) => p.id === cfg.potions.id) ?? null;
    if (!rate(potions)) return null;
    return potions.filter((p) => p.cost < Infinity).sort((a, b) => a.cost - b.cost || b.useful - a.useful)[0] ?? null;
  }

  // Abaixo de `below` começa a repor e só para em `keep` (pode levar várias compras).
  // Devolve { buy } com a compra, { blocked } quando o ouro não dá nem uma unidade (os tipos seguintes não compram),
  // ou { buy: false } quando não há nada a fazer.
  function plan(kind, regra, count, item) {
    if (!regra?.on) {
      filling[kind] = false;
      return { buy: false };
    }
    if (count >= regra.keep) {
      filling[kind] = false;
      return { buy: false };
    }
    if (!filling[kind] && count >= regra.below) return { buy: false };
    if (!item || !(item.price > 0)) return { buy: false }; // sem item para comprar (ex.: lista do jogo ainda não lida)
    filling[kind] = true;
    const floor = cfg.goldFloor;
    const qty = Math.min(MAX_QTY, regra.keep - count, Math.floor((gold() - floor) / item.price));
    if (qty < 1) {
      noteOnce(`ouro:${kind}`, `${item.name}: o ouro está no mínimo (${fmt(floor)}); compra quando passar de ${fmt(floor + item.price)}`);
      return { buy: false, blocked: true };
    }
    once.delete(`ouro:${kind}`);
    return { buy: true, kind, item, qty, before: count };
  }

  function countOf(kind, id) {
    if (kind === 'balls') return Number(acc?.balls?.[id]) || 0;
    return total(shop(kind === 'potions' ? 'heal' : 'revive'));
  }

  function tick() {
    if (!cfg?.on || !acc || socket?.readyState !== 1) return;
    const now = Date.now();
    if (pending) {
      // Sem o aviso da compra, o estoque que subiu também confirma.
      if (countOf(pending.kind, pending.item.id) - pending.before >= pending.qty / 2) done(`comprou ${pending.item.name} ×${fmt(pending.qty)}`);
      else if (now - pending.at < TIMEOUT_MS) return;
      else failed(`${pending.item.name}: o jogo não respondeu à compra`);
    }
    if (now < nextAt || now < pauseUntil) return;

    const potions = shop('heal');
    const revives = shop('revive');
    const potion = pickPotion(potions);
    const b = ballCatalog.find((x) => x.id === cfg.balls.id && x.compravel && x.priceGold > 0);
    const ball = b ? { id: b.id, name: b.nome, price: paid.get(`bola${b.id}`) ?? b.priceGold } : null;
    // Ordem de prioridade: poções, depois revives, depois bolas.
    const tiers = [
      ['potions', cfg.potions, total(potions), potion],
      ['revives', cfg.revives, total(revives), revives[0] ?? null],
      ['balls', cfg.balls, Number(acc.balls?.[cfg.balls.id]) || 0, ball],
    ];
    for (const [kind, regra, count, item] of tiers) {
      const r = plan(kind, regra, count, item);
      if (r.blocked) return; // o ouro não alcança o item prioritário: não gasta nos seguintes
      if (!r.buy) continue;
      pending = { ...r, at: now };
      setNext(now + GAP_MS);
      note(`pedi ${fmt(r.qty)}× ${r.item.name}`);
      try {
        // o mesmo pedido do botão Comprar do jogo (kind: 'item' para poções/revives, 'ball' para bolas)
        socket.send(JSON.stringify({ t: 'shop.buy', kind: kind === 'balls' ? 'ball' : 'item', id: r.item.id, qty: r.qty }));
      } catch {
        failed(`${r.item.name}: não consegui enviar o pedido ao jogo`);
      }
      return;
    }
  }

  function bought(e) {
    if (!pending || Number(e.qtd) !== pending.qty) return; // compra feita na mão: o próprio jogo avisa
    const spent = Number(e.gasto);
    if (spent > 0) paid.set(pending.kind === 'balls' ? `bola${pending.item.id}` : pending.item.id, spent / pending.qty);
    done(`comprou ${pending.item.name} ×${fmt(pending.qty)}${spent > 0 ? ` (−${fmt(spent)} ouro)` : ''}`);
  }

  function refused(m) {
    if (!pending || Date.now() - pending.at > 5000) return;
    failed(`${pending.item.name}: o jogo recusou a compra (${m.chave ?? m.msg ?? 'sem motivo'})`);
    setNext(Date.now() + REFUSAL_MS);
  }

  function done(texto) {
    note(texto);
    pending = null;
    setFails(0);
  }

  function failed(texto) {
    note(texto);
    pending = null;
    setFails(failures + 1);
    if (failures >= MAX_FAILS) {
      setFails(0);
      setPause(Date.now() + PAUSE_MS);
      note(`${MAX_FAILS} compras seguidas sem dar certo: pausa de ${Math.round(PAUSE_MS / 60000)} min`);
    }
  }

  // Valores vindos do main: número que não é número vira 0 (e 0 em "manter" ou "abaixo de" não compra nada).
  const clampInt = (x, max = MAX_STOCK) => Math.min(max, Math.max(0, Math.trunc(Number(x) || 0)));
  const regra = (r) => {
    const below = clampInt(r?.below);
    return { on: !!r?.on, below, keep: Math.max(below, clampInt(r?.keep)) };
  };

  // Só troca a configuração: pausa, espera e falhas continuam valendo (reconfigurar não zera o limite).
  function configure(c) {
    if (!c || typeof c !== 'object') return false;
    if (!!c.on !== !!cfg?.on) note(c.on ? 'reposição ligada' : 'reposição desligada');
    cfg = {
      on: !!c.on,
      goldFloor: clampInt(c.goldFloor, 1e12),
      balls: { ...regra(c.balls), id: clampInt(c.balls?.id, 9999) },
      revives: regra(c.revives),
      potions: { ...regra(c.potions), id: clampInt(c.potions?.id, 9999) },
    };
    for (const kind of Object.keys(filling)) if (!cfg[kind].on) filling[kind] = false;
    once.clear();
    return true;
  }

  // O que o main mostra: estoque, ouro, poção escolhida e registro.
  function summary() {
    const s = {
      configured: !!cfg,
      on: !!cfg?.on,
      connected: socket?.readyState === 1 && !!acc,
      paused: pauseUntil > Date.now(),
      log: log.slice(-30),
    };
    if (!acc) return s;
    const potions = shop('heal');
    const revives = shop('revive');
    const fit = rate(potions);
    const potion = pickPotion(potions);
    return Object.assign(s, {
      nick: acc.nick ?? null,
      gold: gold(),
      balls: ballCatalog
        .filter((b) => b.compravel && b.priceGold > 0)
        .map((b) => ({ id: b.id, name: b.nome, price: paid.get(`bola${b.id}`) ?? b.priceGold, have: Number(acc.balls?.[b.id]) || 0 })),
      revives: revives.map((r) => ({ id: r.id, name: r.name, price: r.price, have: have(r) })),
      potions: potions.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        have: have(p),
        useful: Number.isFinite(p.useful) ? Math.round(p.useful) : null,
        cost: fit && Number.isFinite(p.cost) ? p.cost : null,
      })),
      potionId: potion?.id ?? null,
      maxHp: fit?.hp ?? null,
      limiar: fit?.limiar ?? null,
    });
  }

  Object.defineProperty(window, '__pkRestock', { value: Object.freeze({ configure, summary }) });
  setInterval(tick, 1000);
}

if (webFrame) webFrame.executeJavaScript(`(${restockPage})()`).catch(() => {});
// Só para os testes (na main o `webFrame` não existe, então a função é exportada e injetada pelo teste)
if (typeof module === 'object' && module && module.exports) module.exports = restockPage;
