// PokéIdle Rotom Sniper - Injected Script v1.4.3 (Executa no contexto real da página)
// Módulos: Interceptador WebSocket, Monitoramento Autônomo de Mercado, Auto-Snipe e HUD Toasts

(function() {
  console.log('[PokéIdle Rotom Sniper]: Inicializando Injected Engine v1.4.3...');

  let activeWebSocket = null;
  const OriginalWebSocket = window.WebSocket;
  const originalProtoSend = OriginalWebSocket.prototype.send;
  const originalProtoAddEventListener = OriginalWebSocket.prototype.addEventListener;


  function hookWebSocketInstance(ws) {
    if (!ws) return;
    activeWebSocket = ws;
    window.__activeGameWs = ws;
    if (ws.__rotomHooked) return;
    ws.__rotomHooked = true;

    try {
      ws.addEventListener('message', function(event) {
        if (typeof event.data === 'string') {
          try {
            const packet = JSON.parse(event.data);
            handleMarketPacket(packet);
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  // Hook no construtor WebSocket para capturar a conexão do jogo
  try {
    window.WebSocket = function(...args) {
      const ws = new OriginalWebSocket(...args);
      hookWebSocketInstance(ws);
      return ws;
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
  } catch (e) {}

  // Hook de segurança no prototype.send para capturar instâncias existentes
  try {
    OriginalWebSocket.prototype.send = function(...args) {
      hookWebSocketInstance(this);
      return originalProtoSend.apply(this, args);
    };
  } catch (e) {}

  // Hook de segurança no addEventListener
  try {
    OriginalWebSocket.prototype.addEventListener = function(type, listener, options) {
      if (type === 'message') {
        hookWebSocketInstance(this);
      }
      return originalProtoAddEventListener.call(this, type, listener, options);
    };
  } catch (e) {}

  function getGameWs() {
    if (activeWebSocket && activeWebSocket.readyState === WebSocket.OPEN) {
      hookWebSocketInstance(activeWebSocket);
      return activeWebSocket;
    }
    if (window.estado && window.estado.ws && window.estado.ws.readyState === WebSocket.OPEN) {
      activeWebSocket = window.estado.ws;
      hookWebSocketInstance(activeWebSocket);
      return activeWebSocket;
    }
    if (window.__activeGameWs && window.__activeGameWs.readyState === WebSocket.OPEN) {
      activeWebSocket = window.__activeGameWs;
      hookWebSocketInstance(activeWebSocket);
      return activeWebSocket;
    }
    return null;
  }

  function sendRaw(payloadObj) {
    const ws = getGameWs();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[Rotom Sniper]: WebSocket indisponível ou fechado.');
      return false;
    }
    const str = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);
    try {
      ws.send(str);
      return true;
    } catch (e) {
      try {
        originalProtoSend.call(ws, str);
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  // =========================================================================
  // 1. ROTOM IN-GAME HUD TOAST (Alertas Visuais Cyberdeck no Próprio Jogo)
  // =========================================================================
  function ensureRotomToastContainer() {
    let container = document.getElementById('rotom-hud-toasts');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rotom-hud-toasts';
      container.style.cssText = [
        'position: fixed',
        'top: 14px',
        'right: 14px',
        'z-index: 9999999',
        'display: flex',
        'flex-direction: column',
        'gap: 6px',
        'pointer-events: none',
        'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        'max-width: 330px',
        'width: 100%'
      ].join(';');
      document.body.appendChild(container);
    }
    return container;
  }

  // Dedupe do aviso de captura (o servidor pode repetir o evento)
  const recentCapturesMap = new Map();

  let lastToastKey = '';
  let lastToastTime = 0;

  function showRotomHudToast(title, message, type) {
    try {
      const now = Date.now();
      const toastKey = `${title}::${message}`;
      if (toastKey === lastToastKey && (now - lastToastTime) < 1500) {
        return; // Ignora toast idêntico disparado repetidamente
      }
      lastToastKey = toastKey;
      lastToastTime = now;

      const container = ensureRotomToastContainer();
      const toast = document.createElement('div');
      
      let badgeTag = '[SNIPER]';
      let tagBg = '#ba5ad1';
      let tagColor = '#fff';

      if (type === 'success' || type === 'confirmed') {
        badgeTag = '[SUCESSO]';
        tagBg = '#4e9c62';
      } else if (type === 'warning' || type === 'slot_limit' || type === 'scheduled') {
        badgeTag = '[AVISO]';
        tagBg = '#f0a03c';
        tagColor = '#4a3608';
      } else if (type === 'error' || type === 'rejected') {
        badgeTag = '[ERRO]';
        tagBg = '#d8574a';
      } else if (type === 'shiny') {
        badgeTag = '[SHINY]';
        tagBg = '#e2a93f';
        tagColor = '#4a3608';
      }

      toast.style.cssText = [
        'background: linear-gradient(180deg, #914850 0 8px, #bd6951 8px calc(100% - 8px), #df824c calc(100% - 8px) 100%)',
        'box-shadow: inset 0 0 0 2px #480e1e, inset 0 0 0 4px #f1d3b7, 0 4px 0 #722c3f, 0 10px 30px rgba(0, 0, 0, 0.75)',
        'color: #fff6ef',
        'padding: 8px 12px',
        'font-family: Tahoma, Verdana, "Segoe UI", sans-serif',
        'font-weight: 700',
        'font-size: 11px',
        'pointer-events: auto',
        'border-radius: 6px',
        'transition: all 0.2s ease',
        'display: flex',
        'flex-direction: column',
        'gap: 4px'
      ].join(';');

      toast.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(72,14,30,0.4); padding-bottom: 3px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="background: ${tagBg}; color: ${tagColor}; font-size: 8px; padding: 1px 4px; border-radius: 3px; box-shadow: inset 0 0 0 1px #480e1e; font-weight: 900; letter-spacing: 0.5px;">${badgeTag}</span>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; text-shadow: -1px -1px 0 #722c3f, 1px -1px 0 #722c3f, -1px 1px 0 #722c3f, 1px 1px 0 #722c3f;">${title}</span>
          </div>
          <span style="font-size: 8px; color: #f5cdb9; text-transform: uppercase; letter-spacing: 0.5px;">AUTO-SNIPER</span>
        </div>
        <div style="font-size: 10.5px; line-height: 1.35; color: #fff6ef; text-shadow: 0 1px 1px rgba(0,0,0,0.5);">
          ${message}
        </div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
        setTimeout(() => toast.remove(), 250);
      }, 4500);
    } catch (e) {
      console.error('[Rotom Toast Error]', e);
    }
  }

  // =========================================================================
  // 2. ESTADO E ENGINE DO AUTO-SNIPE
  // =========================================================================
  const sniperState = {
    enabled: false,
    rules: [],
    globalConfig: {
      snipeAnyShiny: false,
      maxPriceShinyGold: 50000,
      maxPriceShinyGems: 0,
      maxPriceShinyDiamonds: 0,
      snipeAnyP5: false,
      maxPriceP5Gold: 100000,
      maxPriceP5Gems: 0,
      maxPriceP5Diamonds: 0,
      snipeByNote: false,
      minNote: 7.0,
      maxPriceNoteGold: 50000,
      maxPriceNoteGems: 0,
      maxPriceNoteDiamonds: 0,
      ignoreOutland: false, // Radar global ignora variantes Outland (speciesId #2001+; legado 10501+)
      maxActiveSlots: 5,
      autoMaxAffordable: true // Calibração por Saldo (Eficiência Máxima de Coins)
    },
    playerGold: -1,
    playerDiamonds: -1,
    playerOrbs: -1,
    isPlayerVip: false,
    boughtOffers: {},      // offerId -> timestamp
    scheduledOffers: {},   // offerId -> timeoutId ou array de timers
    confirmedOffers: {},   // offerId -> bool (compra confirmada)
    knownItems: {},        // itemId -> itemObj
    lastBuyAttempt: null   // { offerId, targetName, timestamp }
  };

  // RELÓGIO DO SERVIDOR: o `compravelEm` dos anúncios é um instante do relógio do SERVIDOR.
  // Comparar com Date.now() (relógio do PC do jogador) atrasava o disparo exatamente o quanto o
  // relógio do Windows estivesse atrasado: com 10 s de atraso, o sniper comprava 10 s depois de o
  // selo "Retido" sumir, fora da janela de 3 s do sorteio, e recebia "anúncio não existe mais".
  // Mesma correção do cliente oficial (app.js: estado.desvioServidor / agoraDoServidor).
  let desvioServidor = 0; // Date.now() − servidorAgora do último estado recebido
  let desvioAvisado = false;
  const agoraDoServidor = () => Date.now() - desvioServidor;

  function atualizarRelogioServidor(servidorAgora) {
    const s = Number(servidorAgora);
    if (!s || isNaN(s)) return;
    desvioServidor = Date.now() - s;
    if (!desvioAvisado && Math.abs(desvioServidor) > 1500) {
      desvioAvisado = true;
      console.warn(`[Rotom Sniper]: Relógio do PC ${desvioServidor > 0 ? 'adiantado' : 'atrasado'} ${(Math.abs(desvioServidor) / 1000).toFixed(1)}s em relação ao servidor. O sniper usa o horário do servidor para disparar na liberação.`);
    }
  }

  function clearOfferTimers(offerId) {
    if (sniperState.scheduledOffers[offerId]) {
      const timers = Array.isArray(sniperState.scheduledOffers[offerId])
        ? sniperState.scheduledOffers[offerId]
        : [sniperState.scheduledOffers[offerId]];
      timers.forEach(t => clearTimeout(t));
      delete sniperState.scheduledOffers[offerId];
    }
  }

  // Carrega catálogo canônico
  if (typeof window.POKEIDLE_ITEMS_DB !== 'undefined' && Array.isArray(window.POKEIDLE_ITEMS_DB)) {
    window.POKEIDLE_ITEMS_DB.forEach(it => {
      sniperState.knownItems[it.id] = it;
    });
  }

  // ── Itens novos do jogo (nomeados dinamicamente) ──
  //
  // O jogo lança itens que o items_db.js não conhece (ex.: Mega Shiny Stone). Eles chegam no `welcome`
  // (`itensNossos`), na ficha de cada anúncio do Mercado e no catálogo base `/assets/items.json`.
  // Aqui eles entram no catálogo da página e vão para o storage (`rotom_items_dynamic`) via
  // content_script, de onde o cockpit os lê para o sniper poder escolhê-los.
  const itensDinamicos = {};
  let timerCatalogoItens = 0;
  let espelhoItens = null;
  const CATEGORIAS_SEM_MERCADO = ['heal', 'potion'];

  function aprenderItens(lista, soNegociaveis) {
    if (!Array.isArray(lista)) return;
    const novos = [];
    for (const it of lista) {
      const id = Number(it && it.id);
      const nome = it && (it.name || it.nome);
      if (!id || !nome || String(nome).startsWith('Item #')) continue;
      const categoria = String(it.category || it.categoria || '').toLowerCase();
      if (CATEGORIAS_SEM_MERCADO.includes(categoria)) continue;
      // Do welcome vêm também itens da Loja que não vão ao Mercado: só entram os que têm cara de negociáveis.
      if (soNegociaveis && typeof window.categoriaRotomItem === 'function' &&
          window.categoriaRotomItem(nome, categoria, id) === 'outros') continue;
      const icone = it.icon || it.icone || '';
      if (!sniperState.knownItems[id]) sniperState.knownItems[id] = { id, name: String(nome), icon: icone, category: categoria };
      const curado = window.POKEIDLE_ITEMS_BY_ID && window.POKEIDLE_ITEMS_BY_ID[id] && !window.POKEIDLE_ITEMS_BY_ID[id].dinamico;
      if (curado || itensDinamicos[id]) continue;
      itensDinamicos[id] = { id, name: String(nome), icon: icone, category: categoria, npcPrice: Number(it.npcPrice) || 0 };
      novos.push(itensDinamicos[id]);
    }
    if (!novos.length) return;
    if (typeof window.registerRotomItems === 'function') window.registerRotomItems(novos);
    clearTimeout(timerCatalogoItens);
    timerCatalogoItens = setTimeout(() => {
      try {
        window.postMessage({ source: 'ROTOM_SNIPER', type: 'ITEMS_CATALOG', items: Object.values(itensDinamicos) }, '*');
      } catch (e) {}
    }, 1500);
    publicarNomesDoJogo();
  }

  // ── O nome que o jogo MOSTRA ──
  //
  // O jogo não exibe o `name` cru do catálogo: a função `nomeItem` do cliente traduz os itens dele
  // (fragmentos, Name Tag, Exp. Share, caixas, ovos, Mystic Ticket), monta "Shiny Stone {tipo}",
  // "Casa Rara", "Bicicleta Lendária", "Skin {nome}", e só no resto acerta as maiúsculas do inglês.
  // Aqui a mesma regra roda com os MÓDULOS do próprio jogo (tradução no idioma do jogador), importados
  // pelo endereço do site: este script vem de chrome-extension://, e um caminho relativo iria para lá.
  let nomeadorDoJogo = null;
  let pedrasShinyDoJogo = [];
  let timerNomes = 0;
  const RAR_CASA = { 70040: 'comum', 70041: 'incomum', 70042: 'rara', 70043: 'mitica', 70044: 'lendaria' };
  const RAR_BICICLETA = { 70080: 'comum', 70081: 'incomum', 70082: 'rara', 70083: 'mitica', 70084: 'lendaria' };

  function carregarNomeadorDoJogo() {
    if (nomeadorDoJogo) return nomeadorDoJogo;
    const imp = (p) => import(location.origin + p).catch(() => null);
    nomeadorDoJogo = Promise.all([
      imp('/i18n.mjs'), imp('/shared/titulo-item.mjs'), imp('/shared/skins.mjs'),
      imp('/shared/mistico.mjs'), imp('/shared/chocadeira.mjs'), imp('/shared/ovo-shiny.mjs'),
    ]).then(([i18n, titulo, skins, mistico, chocadeira, ovoShiny]) => {
      if (!i18n || typeof i18n.t !== 'function') return null;
      // Espelho de NOSSOS_ITENS_I18N do cliente (app.js).
      const chaves = {
        70010: 'item.escapeRope', 70011: 'item.fragmentoChave', 70012: 'item.fragmentoShiny',
        70013: 'item.fragmentoBicicleta', 70014: 'item.fragmentoMega', 70015: 'item.fragmentoMegaShiny',
        70016: 'item.nameTag', 70050: 'item.xpShareHeld',
        70060: 'caixas.nome.fundador', 70061: 'caixas.nome.cofundador',
      };
      if (mistico && mistico.MYSTIC_TICKET_ID) chaves[mistico.MYSTIC_TICKET_ID] = 'item.mysticTicket';
      ((chocadeira && chocadeira.TODOS_OS_OVOS) || []).forEach(o => { chaves[o.itemId] = `item.ovo.${o.id}`; });
      if (ovoShiny && ovoShiny.FRAGMENTO_OVO_SHINY_ID) chaves[ovoShiny.FRAGMENTO_OVO_SHINY_ID] = 'item.fragmentoOvoShiny';
      return {
        t: i18n.t, chaves,
        titulo: (titulo && titulo.tituloInglesItem) || (s => s),
        skins: skins && skins.SKIN_POR_ITEM,
      };
    });
    return nomeadorDoJogo;
  }

  function nomeComoNoJogo(n, id, nomeCatalogo) {
    const tr = (k, p) => { const v = n.t(k, p); return v && v !== k ? v : null; };
    const skin = n.skins && typeof n.skins.get === 'function' ? n.skins.get(id) : null;
    if (skin) {
      let nomeSkin = tr('skin.nome', { especie: skin.especie, estilo: tr(`skin.estilo.${skin.estilo}`) || skin.estilo }) || skin.especie;
      if (skin.shiny) nomeSkin = tr('skin.nomeShiny', { nome: nomeSkin }) || nomeSkin;
      const v = tr('skin.itemNome', { nome: nomeSkin });
      if (v) return v;
    }
    if (RAR_CASA[id]) { const v = tr(`item.casa.${RAR_CASA[id]}`); if (v) return v; }
    if (RAR_BICICLETA[id]) { const v = tr(`item.bicicleta.${RAR_BICICLETA[id]}`); if (v) return v; }
    if (n.chaves[id]) { const v = tr(n.chaves[id]); if (v) return v; }
    const pedra = pedrasShinyDoJogo.find(p => Number(p.itemId) === id);
    if (pedra) { const v = tr('pedra.nome', { tipo: pedra.tipo }); if (v) return v; }
    return n.titulo(nomeCatalogo || '');
  }

  // Calcula o nome de todos os itens conhecidos, aplica na página e manda ao cockpit (storage).
  function publicarNomesDoJogo() {
    clearTimeout(timerNomes);
    timerNomes = setTimeout(() => {
      carregarNomeadorDoJogo().then(n => {
        if (!n) return;
        const mapa = {};
        const vistos = new Set();
        const lista = (window.POKEIDLE_ITEMS_DB || []).concat(Object.values(sniperState.knownItems));
        for (const it of lista) {
          const id = Number(it && it.id);
          if (!id || vistos.has(id)) continue;
          vistos.add(id);
          const original = (it.aliases && it.aliases[0]) || it.name || it.nome || '';
          const nome = nomeComoNoJogo(n, id, original);
          if (nome) mapa[id] = nome;
        }
        if (typeof window.registerRotomNames === 'function') window.registerRotomNames(mapa);
        try { window.postMessage({ source: 'ROTOM_SNIPER', type: 'ITEMS_NAMES', nomes: mapa }, '*'); } catch (e) {}
      });
    }, 2000);
  }

  // Ids à venda que ninguém nomeou ainda: o catálogo base do jogo dá o nome (baixado uma vez só).
  function nomearPeloCatalogoDoJogo(ids) {
    const faltam = ids.filter(id => id && !sniperState.knownItems[id]);
    if (!faltam.length) return;
    if (!espelhoItens) {
      espelhoItens = fetch('/assets/items.json').then(r => r.json()).then(d => d.items || []).catch(() => []);
    }
    espelhoItens.then(lista => {
      const porId = {};
      lista.forEach(i => { porId[i.id] = i; });
      aprenderItens(faltam.map(id => porId[id]).filter(Boolean), false);
    });
  }

  function updatePlayerBalance(gold, diamonds, orbs) {
    let changed = false;
    if (typeof gold === 'number' && !isNaN(gold) && gold >= 0 && gold !== sniperState.playerGold) {
      sniperState.playerGold = gold;
      changed = true;
    }
    if (typeof diamonds === 'number' && !isNaN(diamonds) && diamonds >= 0 && diamonds !== sniperState.playerDiamonds) {
      sniperState.playerDiamonds = diamonds;
      changed = true;
    }
    if (typeof orbs === 'number' && !isNaN(orbs) && orbs >= 0 && orbs !== sniperState.playerOrbs) {
      sniperState.playerOrbs = orbs;
      changed = true;
    }

    if (changed) {
      try {
        window.postMessage({
          source: 'ROTOM_SNIPER',
          type: 'BALANCE_UPDATE',
          gold: sniperState.playerGold,
          diamonds: sniperState.playerDiamonds,
          orbs: sniperState.playerOrbs,
          gems: sniperState.playerOrbs
        }, '*');
      } catch (e) {}
    }
  }

  function checkPlayerVip() {
    try {
      if (window.estado && window.estado.eu && window.estado.eu.loja) {
        const l = window.estado.eu.loja;
        if (l.vip) return true;
        if (l.vipAte && l.vipAte > Date.now()) return true;
      }
    } catch (e) {}
    try {
      if (document.querySelector('.loja-selo.vip, .pvp-auto-selo, .selo-vip')) return true;
    } catch (e) {}
    return false;
  }

  function updatePlayerVipStatus() {
    const isVip = checkPlayerVip();
    if (sniperState.isPlayerVip !== isVip) {
      sniperState.isPlayerVip = isVip;
      try {
        window.postMessage({
          source: 'ROTOM_SNIPER',
          type: 'VIP_STATUS_UPDATE',
          isVip: isVip
        }, '*');
      } catch (e) {}
      console.log('[Rotom Sniper]: Status VIP do PokéIdle atualizado:', isVip ? 'ATIVO (15 Slots)' : 'BÁSICO (5 Slots)');
    }
    return isVip;
  }

  function getPlayerGold() {
    // 1. Leitura direta no DOM do PokéIdle (#tr-gold)
    try {
      const el = document.getElementById('tr-gold') || document.querySelector('#tr-gold');
      if (el && el.textContent) {
        const clean = el.textContent.replace(/[^\d]/g, '');
        if (clean.length > 0) {
          const val = parseInt(clean, 10);
          if (!isNaN(val) && val >= 0) {
            if (val !== sniperState.playerGold) {
              sniperState.playerGold = val;
              updatePlayerBalance(val, sniperState.playerDiamonds, sniperState.playerOrbs);
            }
            return val;
          }
        }
      }
    } catch (e) {}

    // 2. Leitura via objeto de estado em memória
    try {
      if (typeof window !== 'undefined') {
        const est = window.estado || (window.__estado && window.__estado.eu) || null;
        if (est) {
          const g = (est.eu && typeof est.eu.gold === 'number') ? est.eu.gold : (typeof est.gold === 'number' ? est.gold : null);
          if (typeof g === 'number' && g >= 0) {
            sniperState.playerGold = g;
            return g;
          }
        }
      }
    } catch (e) {}

    // 3. Fallback do último valor recebido via WebSocket
    if (typeof sniperState.playerGold === 'number' && sniperState.playerGold >= 0) {
      return sniperState.playerGold;
    }
    return -1;
  }

  function getPlayerGems() {
    // 1. Leitura direta no DOM do PokéIdle (#tr-gemas)
    try {
      const el = document.getElementById('tr-gemas') || document.querySelector('#tr-gemas');
      if (el && el.textContent) {
        const clean = el.textContent.replace(/[^\d]/g, '');
        if (clean.length > 0) {
          const val = parseInt(clean, 10);
          if (!isNaN(val) && val >= 0) {
            if (val !== sniperState.playerOrbs) {
              sniperState.playerOrbs = val;
              updatePlayerBalance(sniperState.playerGold, sniperState.playerDiamonds, val);
            }
            return val;
          }
        }
      }
    } catch (e) {}

    // 2. Leitura via objeto de estado em memória
    try {
      if (typeof window !== 'undefined') {
        const est = window.estado || (window.__estado && window.__estado.eu) || null;
        if (est) {
          const o = (est.eu && typeof est.eu.orbs === 'number') ? est.eu.orbs : (typeof est.orbs === 'number' ? est.orbs : (est.eu && typeof est.eu.gemas === 'number' ? est.eu.gemas : null));
          if (typeof o === 'number' && o >= 0) {
            sniperState.playerOrbs = o;
            return o;
          }
        }
      }
    } catch (e) {}

    // 3. Fallback do último valor recebido via WebSocket
    if (typeof sniperState.playerOrbs === 'number' && sniperState.playerOrbs >= 0) {
      return sniperState.playerOrbs;
    }
    return -1;
  }

  function getPlayerDiamonds() {
    // 1. Leitura direta no DOM do PokéIdle (#tr-diamantes)
    try {
      const el = document.getElementById('tr-diamantes') || document.querySelector('#tr-diamantes');
      if (el && el.textContent) {
        const clean = el.textContent.replace(/[^\d]/g, '');
        if (clean.length > 0) {
          const val = parseInt(clean, 10);
          if (!isNaN(val) && val >= 0) {
            if (val !== sniperState.playerDiamonds) {
              sniperState.playerDiamonds = val;
              updatePlayerBalance(sniperState.playerGold, val, sniperState.playerOrbs);
            }
            return val;
          }
        }
      }
    } catch (e) {}

    // 2. Leitura via objeto de estado em memória
    try {
      if (typeof window !== 'undefined') {
        const est = window.estado || (window.__estado && window.__estado.eu) || null;
        if (est) {
          const d = (est.eu && typeof est.eu.diamonds === 'number') ? est.eu.diamonds : (typeof est.diamonds === 'number' ? est.diamonds : null);
          if (typeof d === 'number' && d >= 0) {
            sniperState.playerDiamonds = d;
            return d;
          }
        }
      }
    } catch (e) {}

    // 3. Fallback do último valor recebido via WebSocket
    if (typeof sniperState.playerDiamonds === 'number' && sniperState.playerDiamonds >= 0) {
      return sniperState.playerDiamonds;
    }
    return -1;
  }

  function hasSufficientBalance(preco, qty, moeda) {
    const unitPrice = Number(preco) || 0;
    const count = Number(qty) || 1;
    const totalCost = unitPrice * count;
    if (totalCost <= 0) return true;

    const mClean = String(moeda || 'gold').toLowerCase();
    const isGold = (mClean === 'gold' || mClean === 'coins' || mClean === 'coin');
    const isGems = (mClean === 'orb' || mClean === 'orbs' || mClean === 'gemas' || mClean === 'gema' || mClean === 'gems' || mClean === 'pontos');
    const isDiamonds = (mClean === 'diamante' || mClean === 'diamantes' || mClean === 'diamonds');

    let currentBalance = -1;
    if (isGold) currentBalance = getPlayerGold();
    else if (isGems) currentBalance = getPlayerGems();
    else if (isDiamonds) currentBalance = getPlayerDiamonds();

    // Se o saldo for conhecido e menor que o preço unitário (não paga nem 1), bloqueia imediatamente!
    if (currentBalance >= 0 && currentBalance < unitPrice) {
      return false;
    }
    return currentBalance >= 0 ? (currentBalance >= totalCost) : true;
  }

  function emitSniperLog(logObj) {
    try {
      window.postMessage({
        source: 'ROTOM_SNIPER',
        type: 'SNIPER_LOG',
        log: logObj
      }, '*');
    } catch (e) {}
  }

  function emitSniperBought(ruleId, offerId, qty) {
    try {
      window.postMessage({
        source: 'ROTOM_SNIPER',
        type: 'SNIPER_BOUGHT',
        ruleId,
        offerId,
        qty
      }, '*');
    } catch (e) {}
  }

  function executeBuyOrder(offerId, buyQty, preco, moeda, targetName, ruleId, ruleDesc, seller, isRetry = false) {
    if (!sniperState.enabled) {
      console.log(`[Rotom Sniper]: Compra cancelada para #${offerId} (${targetName}): Auto-Sniper está desativado.`);
      return;
    }
    if (sniperState.confirmedOffers[offerId]) return;

    // VALIDAÇÃO FINAL ESTREITA CONTRA GASTO INDEVIDO DE GEMAS:
    const mClean = String(moeda || 'gold').toLowerCase();
    const isOrderGems = (mClean === 'orb' || mClean === 'orbs' || mClean === 'gemas' || mClean === 'gema' || mClean === 'gems' || mClean === 'pontos' || mClean === 'diamante');
    if (isOrderGems) {
      let allowedGemsCeiling = 0;
      if (ruleId && sniperState.rules && sniperState.rules.length > 0) {
        const foundRule = sniperState.rules.find(r => String(r.id) === String(ruleId) || r.targetName === targetName);
        if (foundRule) {
          allowedGemsCeiling = Number(foundRule.maxPriceGems !== undefined ? foundRule.maxPriceGems : (foundRule.maxPriceDiamonds || 0));
        }
      } else {
        // Radar Global de Pokémon:
        const gCfg = sniperState.globalConfig;
        const shinyGems = gCfg.snipeAnyShiny ? Number(gCfg.maxPriceShinyGems !== undefined ? gCfg.maxPriceShinyGems : (gCfg.maxPriceShinyDiamonds || 0)) : 0;
        const p5Gems = gCfg.snipeAnyP5 ? Number(gCfg.maxPriceP5Gems !== undefined ? gCfg.maxPriceP5Gems : (gCfg.maxPriceP5Diamonds || 0)) : 0;
        const noteGems = gCfg.snipeByNote ? Number(gCfg.maxPriceNoteGems !== undefined ? gCfg.maxPriceNoteGems : (gCfg.maxPriceNoteDiamonds || 0)) : 0;
        allowedGemsCeiling = Math.max(shinyGems, p5Gems, noteGems);
      }

      if (allowedGemsCeiling <= 0 || preco > allowedGemsCeiling) {
        console.warn(`[Rotom Sniper]: 🛑 ORDEM DESCARTADA: Preço em Gemas (${preco}) excede teto configurado (${allowedGemsCeiling}) para #${offerId} (${targetName}).`);
        return;
      }
    }

    // REGRA DE PROTEÇÃO DE SALDO (Só envia se o jogador tiver a moeda suficiente):
    const unitPrice = Number(preco) || 0;
    let orderQty = Number(buyQty) || 1;
    let currentBalance = -1;
    let moedaLabel = 'Coins';

    if (isOrderGems) {
      currentBalance = getPlayerGems();
      moedaLabel = 'Gemas';
    } else if (mClean === 'gold' || mClean === 'coins' || mClean === 'coin') {
      currentBalance = getPlayerGold();
      moedaLabel = 'Coins';
    } else {
      currentBalance = getPlayerDiamonds();
      moedaLabel = 'Diamantes';
    }

    if (unitPrice > 0) {
      // Se o saldo for conhecido e menor que o preço unitário (não paga nem 1), cancela imediatamente!
      if (currentBalance >= 0 && currentBalance < unitPrice) {
        console.warn(`[Rotom Sniper]: 🛑 COMPRA ABORTADA: Saldo insuficiente em ${moedaLabel} (Saldo: ${currentBalance.toLocaleString('pt-BR')} / Preço Unitário: ${unitPrice.toLocaleString('pt-BR')}) para #${offerId} (${targetName}).`);
        showRotomHudToast(
          'SALDO INSUFICIENTE',
          `Snipe de ${targetName} abortado. Saldo: ${currentBalance.toLocaleString('pt-BR')} ${moedaLabel} (Preço: ${unitPrice.toLocaleString('pt-BR')}).`,
          'warning'
        );
        emitSniperLog({
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          timestamp: Date.now(),
          ruleId: ruleId || '',
          targetName: targetName,
          seller: seller || '',
          offerId: offerId,
          price: unitPrice,
          qty: orderQty,
          currency: moeda,
          status: 'SALDO_INSUFICIENTE',
          details: `Saldo insuficiente em ${moedaLabel}: ${currentBalance.toLocaleString('pt-BR')} (Preço: ${unitPrice.toLocaleString('pt-BR')})`
        });
        return;
      }

      // Se o total excede o saldo, calibra para o máximo que o saldo suporta
      if (currentBalance >= unitPrice && currentBalance < (unitPrice * orderQty)) {
        const maxAffordable = Math.floor(currentBalance / unitPrice);
        if (maxAffordable <= 0) return;
        orderQty = maxAffordable;
      }
    }
    buyQty = orderQty;

    if (ruleId && sniperState.rules && sniperState.rules.length > 0) {
      const foundRule = sniperState.rules.find(r => String(r.id) === String(ruleId) || r.targetName === targetName);
      if (foundRule && !foundRule.active) {
        console.log(`[Rotom Sniper]: Compra cancelada para #${offerId} (${targetName}): A regra está pausada.`);
        return;
      }
    }

    sniperState.boughtOffers[offerId] = Date.now();
    sniperState.lastBuyAttempt = {
      offerId: offerId,
      targetName: targetName,
      seller: seller || '',
      timestamp: Date.now()
    };

    const payload = {
      t: 'market.comprar',
      id: Number(offerId),
      qtd: Number(buyQty) || 1,
      preco: Number(preco),
      moeda: String(moeda || 'gold')
    };

    console.log(`[Rotom Sniper]: DISPARANDO COMPRA #${offerId} (${targetName}${seller ? ' de @' + seller : ''}):`, payload);
    const sent = sendRaw(payload);

    if (sent) {
      if (!isRetry) {
        // Otimização Preventiva de Saldo: decrementa preventivamente para evitar estouro em compras simultâneas apenas no primeiro disparo
        const mClean = String(moeda || 'gold').toLowerCase();
        if ((mClean === 'gold' || mClean === 'coins' || mClean === 'coin') && sniperState.playerGold >= 0) {
          sniperState.playerGold = Math.max(0, sniperState.playerGold - (Number(buyQty) * Number(preco)));
          updatePlayerBalance(sniperState.playerGold, sniperState.playerDiamonds, sniperState.playerOrbs);
        } else if ((mClean === 'orb' || mClean === 'orbs' || mClean === 'gemas' || mClean === 'gema' || mClean === 'gems' || mClean === 'pontos' || mClean === 'diamante') && sniperState.playerOrbs >= 0) {
          sniperState.playerOrbs = Math.max(0, sniperState.playerOrbs - (Number(buyQty) * Number(preco)));
          updatePlayerBalance(sniperState.playerGold, sniperState.playerDiamonds, sniperState.playerOrbs);
        }

        const sellerStr = seller ? ` de @${seller}` : '';
        const moedaNome = (mClean === 'orb' || mClean === 'orbs' || mClean === 'gemas' || mClean === 'gema') ? 'Gemas' : 'Coins';
        const precoFmt = Number(preco).toLocaleString('pt-BR');

        showRotomHudToast(
          'DISPARANDO COMPRA',
          `Comprando ${buyQty}x ${targetName}${sellerStr} por ${precoFmt} ${moedaNome} (#${offerId})`,
          'success'
        );

        const logEntry = {
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          timestamp: Date.now(),
          ruleId: ruleId || '',
          targetName: targetName,
          seller: seller || '',
          offerId: offerId,
          price: preco,
          qty: buyQty,
          currency: moeda,
          status: 'DISPARADO',
          details: ruleDesc || 'Ordem enviada'
        };

        emitSniperLog(logEntry);
        if (ruleId) {
          emitSniperBought(ruleId, offerId, buyQty);
        }
      } else {
        console.log(`[Rotom Sniper]: 🔁 Ordem de reforço #${offerId} enviada ao servidor dentro da janela de 3s.`);
      }
    } else {
      showRotomHudToast(
        'ERRO AO DISPARAR',
        `Não foi possível enviar a ordem de compra para #${offerId}. WebSocket desconectado.`,
        'error'
      );
    }
  }

  function processMarketAnuncios(anunciosList) {
    if (!sniperState.enabled || !Array.isArray(anunciosList) || anunciosList.length === 0) return;

    const now = Date.now();
    const activeRules = sniperState.rules.filter(r => r.active);
    const isVip = updatePlayerVipStatus();
    const maxSlots = isVip ? 15 : (sniperState.globalConfig.maxActiveSlots || 5);

    for (let i = 0; i < anunciosList.length; i++) {
      const an = anunciosList[i];
      if (!an) continue;

      const offerId = Number(an.id);
      if (!offerId || isNaN(offerId)) continue;

      // Evita compras duplicadas na mesma oferta se já confirmada, agendada ou comprada
      if (sniperState.confirmedOffers[offerId]) continue;
      if (sniperState.scheduledOffers[offerId]) continue;
      if (sniperState.boughtOffers[offerId] && (now - sniperState.boughtOffers[offerId] < 20000)) continue;
      if (an.estado && an.estado !== 'aberto') continue;
      // Blindagem estrita: Se o registro possui comprador ou data de liquidação 'em' sem preco ativo, é histórico
      if (an.comprador) continue;
      if (an.em && !an.preco && (an.bruto || an.valor)) continue;

      const seller = String(an.vendedor || an.vendedorNome || an.seller || an.dono || '').trim();
      const preco = Number(an.preco) || 0;
      const qtd = Number(an.qtd) || 1;
      const moeda = String(an.moeda || 'gold').toLowerCase();
      const isGold = (moeda === 'gold' || moeda === 'coins' || moeda === 'coin');
      const isGems = (moeda === 'orb' || moeda === 'orbs' || moeda === 'gemas' || moeda === 'gema' || moeda === 'gems' || moeda === 'pontos' || moeda === 'diamante');
      const ficha = an.ficha || null;

      // Identificação robusta do Item
      const itemId = Number(an.itemId || (ficha && ficha.itemId) || 0);
      const rotomDbItem = (typeof window.getRotomItem === 'function' && itemId > 0) ? window.getRotomItem(itemId) : null;
      let itemName = String(
        (rotomDbItem && rotomDbItem.name) ||
        (an.itemNome && !an.itemNome.startsWith('Item #') ? an.itemNome : '') ||
        (an.nome && !an.nome.startsWith('Item #') ? an.nome : '') ||
        (sniperState.knownItems[itemId] && sniperState.knownItems[itemId].name) ||
        ''
      );
      const isItem = Boolean(itemId > 0 || an.itemNome || an.tipo === 'item' || an.tipoItem === 'item');

      // Identificação robusta de Pokémon
      const isPokemon = !isItem && Boolean(an.pokemonNome || (ficha && ficha.speciesId) || an.tipo === 'pokemon' || an.tipoItem === 'pokemon');
      const pokeName = String(an.pokemonNome || (ficha && ficha.nome) || an.nome || '');

      let matched = false;
      let matchedRule = null;
      let matchedDesc = '';
      let targetDisplayName = '';

      // --- A. REGRAS CUSTOMIZADAS DE ITENS CONFIGURADAS PELO JOGADOR ---
      for (let r = 0; r < activeRules.length; r++) {
        const rule = activeRules[r];
        if (rule.maxQty > 0 && (rule.totalBought || 0) >= rule.maxQty) continue;

        if (rule.targetType === 'item' || !rule.targetType) {
          let itemMatches = false;
          if (rule.targetId && Number(rule.targetId) === itemId) {
            itemMatches = true;
          } else if (rule.targetName) {
            const tLower = rule.targetName.toLowerCase().trim();
            const iLower = itemName.toLowerCase().trim();
            if (iLower && (iLower === tLower || iLower.includes(tLower))) {
              itemMatches = true;
            }
          }

          if (itemMatches) {
            const maxGold = Number(rule.maxPriceGold || 0);
            const maxGems = Number(rule.maxPriceGems !== undefined ? rule.maxPriceGems : (rule.maxPriceDiamonds || 0));

            let priceOk = false;
            if (isGold && maxGold > 0 && preco <= maxGold) priceOk = true;
            else if (isGems && maxGems > 0 && preco <= maxGems) priceOk = true;

            if (priceOk) {
              matched = true;
              matchedRule = rule;
              targetDisplayName = (rotomDbItem && rotomDbItem.name) || rule.targetName || itemName || `Item #${itemId}`;
              const tetoStr = isGold
                ? maxGold.toLocaleString('pt-BR') + ' Coins'
                : maxGems.toLocaleString('pt-BR') + ' Gemas';
              matchedDesc = `Regra: ${rule.targetName} (Teto: ${tetoStr})`;
              break;
            }
          }
        }

        // Regra Customizada de Pokémon por Espécie
        if (rule.targetType === 'pokemon' && isPokemon) {
          let pokeMatches = false;
          if (rule.targetId && ficha && Number(ficha.speciesId) === Number(rule.targetId)) {
            pokeMatches = true;
          } else if (rule.targetName && pokeName) {
            const tLower = rule.targetName.toLowerCase().trim();
            const pLower = pokeName.toLowerCase().trim();
            if (pLower === tLower || pLower.includes(tLower)) {
              pokeMatches = true;
            }
          }

          if (pokeMatches) {
            const maxGold = Number(rule.maxPriceGold || 0);
            const maxGems = Number(rule.maxPriceGems !== undefined ? rule.maxPriceGems : (rule.maxPriceDiamonds || 0));

            let priceOk = false;
            if (isGold && maxGold > 0 && preco <= maxGold) priceOk = true;
            else if (isGems && maxGems > 0 && preco <= maxGems) priceOk = true;

            if (priceOk) {
              matched = true;
              matchedRule = rule;
              const tetoStr = isGold
                ? maxGold.toLocaleString('pt-BR') + ' Coins'
                : maxGems.toLocaleString('pt-BR') + ' Gemas';
              matchedDesc = `Regra: ${rule.targetName} (Teto: ${tetoStr})`;
              targetDisplayName = pokeName || rule.targetName;
              break;
            }
          }
        }
      }

      // --- B. REGRAS GLOBAIS DE POKÉMON (Shiny, P5 e Nota) ---
      // Filtro opcional: ignora variantes Outland
      const pokeSpeciesId = Number((ficha && (ficha.speciesId || ficha.pokeId)) || an.speciesId || an.pokeId || 0);
      // Mesma regra do jogo (shared/outland.mjs): variantes Outland são #2001+ (as Megas começam em #3001);
      // a faixa 10501+ é o id legado do espelho, de antes da migração v1.39.
      const isOutlandPoke = Boolean(ficha && (ficha.outland || ficha.isOutland)) ||
        (pokeSpeciesId >= 2001 && pokeSpeciesId < 3000) ||
        (pokeSpeciesId >= 10501 && pokeSpeciesId < 13000);
      if (!matched && isPokemon && pokeName && !(sniperState.globalConfig.ignoreOutland && isOutlandPoke)) {
        const isShiny = Boolean(
          an.shiny || an.isShiny || an.lookShiny ||
          (ficha && (ficha.shiny || ficha.isShiny || ficha.lookShiny)) ||
          pokeName.toLowerCase().includes('shiny')
        );

        let potencia = Number(an.potencia || (ficha && ficha.potencia) || 1);
        let nota = Number((ficha && ficha.nota) || an.nota || 0);

        const gCfg = sniperState.globalConfig;
        const maxShinyGold = Number(gCfg.maxPriceShinyGold || 0);
        const maxShinyGems = Number(gCfg.maxPriceShinyGems !== undefined ? gCfg.maxPriceShinyGems : (gCfg.maxPriceShinyDiamonds || 0));
        const maxP5Gold = Number(gCfg.maxPriceP5Gold || 0);
        const maxP5Gems = Number(gCfg.maxPriceP5Gems !== undefined ? gCfg.maxPriceP5Gems : (gCfg.maxPriceP5Diamonds || 0));
        const maxNoteGold = Number(gCfg.maxPriceNoteGold || 0);
        const maxNoteGems = Number(gCfg.maxPriceNoteGems !== undefined ? gCfg.maxPriceNoteGems : (gCfg.maxPriceNoteDiamonds || 0));

        // 1. Match Qualquer Shiny
        if (gCfg.snipeAnyShiny && isShiny) {
          let shinyPriceOk = false;
          if (isGold && maxShinyGold > 0 && preco <= maxShinyGold) shinyPriceOk = true;
          else if (isGems && maxShinyGems > 0 && preco <= maxShinyGems) shinyPriceOk = true;

          if (shinyPriceOk) {
            matched = true;
            const tetoStr = isGold ? maxShinyGold.toLocaleString('pt-BR') + ' Coins' : maxShinyGems.toLocaleString('pt-BR') + ' Gemas';
            matchedDesc = `Shiny Global (Teto: ${tetoStr})`;
            targetDisplayName = `✨ Shiny ${pokeName}`;
          }
        }

        // 2. Match Qualquer P5 (Potência 5)
        if (!matched && gCfg.snipeAnyP5 && potencia >= 5) {
          let p5PriceOk = false;
          if (isGold && maxP5Gold > 0 && preco <= maxP5Gold) p5PriceOk = true;
          else if (isGems && maxP5Gems > 0 && preco <= maxP5Gems) p5PriceOk = true;

          if (p5PriceOk) {
            matched = true;
            const tetoStr = isGold ? maxP5Gold.toLocaleString('pt-BR') + ' Coins' : maxP5Gems.toLocaleString('pt-BR') + ' Gemas';
            matchedDesc = `P5 Global (Teto: ${tetoStr})`;
            targetDisplayName = `⚡ P5 ${pokeName}`;
          }
        }

        // 3. Match Por Nota Mínima
        if (!matched && gCfg.snipeByNote && gCfg.minNote > 0 && nota >= gCfg.minNote) {
          let notePriceOk = false;
          if (isGold && maxNoteGold > 0 && preco <= maxNoteGold) notePriceOk = true;
          else if (isGems && maxNoteGems > 0 && preco <= maxNoteGems) notePriceOk = true;

          if (notePriceOk) {
            matched = true;
            const tetoStr = isGold ? Number(gCfg.maxPriceNoteGold).toLocaleString('pt-BR') + ' Coins' : Number(maxNoteGems).toLocaleString('pt-BR') + ' Gemas';
            matchedDesc = `Nota Oficial >= ${gCfg.minNote} (Teto: ${tetoStr})`;
            targetDisplayName = `★ Nota ${nota.toFixed(1)} ${pokeName}`;
          }
        }
      }

      // Se deu match, executa compra ou agenda pré-fire
      if (matched) {
        // Salvaguarda de slots de regras
        if (activeRules.length > maxSlots && matchedRule) {
          showRotomHudToast(
            'SLOTS LOTADOS',
            `${targetDisplayName} avistado por ${preco} ${moeda}, mas o limite de ${maxSlots} slots está ativo.`,
            'slot_limit'
          );
          emitSniperLog({
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            targetName: targetDisplayName,
            seller: seller || '',
            offerId: offerId,
            price: preco,
            qty: qtd,
            currency: moeda,
            status: 'SLOTS_LOTADOS',
            details: `Limite de ${maxSlots} slots atingido. Não comprado.`
          });
          continue;
        }

        // Limite de compra: VIP permite quantidade infinita ou customizada; Básico limita em 20
        let buyQty = qtd;
        if (matchedRule) {
          const isInfinite = Boolean(matchedRule.infinite || matchedRule.maxQty <= 0 || matchedRule.maxQty >= 99999);
          if (isVip && isInfinite) {
            buyQty = qtd; // Modo Infinito VIP: compra todo o estoque do anúncio (respeitando saldo)
          } else if (isVip && matchedRule.maxQty > 0) {
            const rem = Math.max(0, matchedRule.maxQty - (matchedRule.totalBought || 0));
            buyQty = Math.min(qtd, rem);
          } else {
            // Versão Basic: Máximo de 20 unidades por regra
            const effectiveRuleMax = (matchedRule.maxQty !== undefined && matchedRule.maxQty > 0)
              ? Math.min(matchedRule.maxQty, 20)
              : 20;
            const rem = Math.max(0, effectiveRuleMax - (matchedRule.totalBought || 0));
            buyQty = Math.min(qtd, rem);
          }
        } else {
          // Radar Global de Pokémon
          buyQty = 1;
        }

        if (buyQty <= 0) continue;

        // REGRA DE PROTEÇÃO DE SALDO E CALIBRAÇÃO (Só snipa se a pessoa tiver a moeda suficiente):
        if (preco > 0) {
          let currentBalance = -1;
          let moedaNome = 'Coins';
          if (isGold) {
            currentBalance = getPlayerGold();
            moedaNome = 'Coins';
          } else if (isGems) {
            currentBalance = getPlayerGems();
            moedaNome = 'Gemas';
          } else if (isDiamonds) {
            currentBalance = getPlayerDiamonds();
            moedaNome = 'Diamantes';
          }

          // Se o saldo for conhecido e menor que o preço unitário (não paga nem 1), descarta o snipe!
          if (currentBalance >= 0 && currentBalance < preco) {
            console.log(`[Rotom Sniper]: 🛑 Snipe descartado por saldo insuficiente em ${moedaNome} para #${offerId} (${targetDisplayName}): saldo ${currentBalance.toLocaleString('pt-BR')}, preço unitário ${preco.toLocaleString('pt-BR')}.`);
            continue; // Evita ordem rejeitada pelo servidor por falta de saldo
          }

          if (currentBalance >= preco) {
            const maxAffordable = Math.floor(currentBalance / preco);
            if (buyQty > maxAffordable) {
              console.log(`[Rotom Sniper]: Calibração por Saldo #${offerId} (${targetDisplayName}): ajustando compra de ${buyQty} para ${maxAffordable} unidades (Saldo: ${currentBalance.toLocaleString('pt-BR')} ${moedaNome}).`);
              buyQty = maxAffordable;
              matchedDesc += ` [Saldo máx: ${buyQty}x]`;
            }
          }
        }

        if (buyQty <= 0) continue;

        // Checa carência / cooldown antes de liberar o anúncio:
        const compravelEm = Number(an.compravelEm || an.compravelEmMs || 0);
        // Sempre no relógio do SERVIDOR (ver agoraDoServidor), nunca no Date.now() do PC.
        const agoraSrv = agoraDoServidor();
        const isFutureCooldown = compravelEm > (agoraSrv + 50);

        if (isFutureCooldown) {
          // O anúncio ainda está no cooldown ANTES de liberar.
          // NÃO DISPARAR ANTES! Quem tenta comprar antes cai em sorteio ou é recusado.
          // O disparo é agendado para LOGO APÓS A LIBERAÇÃO (+100ms) e mantido dentro dos 3s posteriores.
          const releaseDelayMs = Math.max(50, (compravelEm - agoraSrv) + 100);
          const waitSec = Math.ceil((compravelEm - agoraSrv) / 1000);
          const sellerStr = seller ? ` de @${seller}` : '';
          console.log(`[Rotom Sniper]: ⏳ Anúncio #${offerId} (${targetDisplayName}${sellerStr}) em cooldown. Disparo pós-liberação garantido em ${releaseDelayMs}ms.`);

          showRotomHudToast(
            'DISPARO AGENDADO',
            `${targetDisplayName}${sellerStr} agendado para compra logo após liberação (${waitSec}s)! (#${offerId})`,
            'scheduled'
          );

          emitSniperLog({
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            targetName: targetDisplayName,
            seller: seller || '',
            offerId: offerId,
            price: preco,
            qty: buyQty,
            currency: moeda,
            status: 'AGENDADO',
            details: `Cooldown ativo (${waitSec}s) · Disparo garantido após liberação · ${matchedDesc}`
          });

          const timers = [];

          // 1º Disparo: +100ms após a liberação (garante que o anúncio já está liberado no servidor e front)
          timers.push(setTimeout(() => {
            // Diagnóstico: quanto depois da liberação (no relógio do servidor) o disparo saiu.
            // Acima de ~1s indica aba em segundo plano com timers freados pelo navegador.
            const atrasoMs = agoraDoServidor() - compravelEm;
            console.log(`[Rotom Sniper]: Disparo #${offerId} ${atrasoMs}ms após a liberação (desvio do relógio do PC: ${desvioServidor}ms).`);
            executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, false);
          }, releaseDelayMs));

          // 2º Disparo (Garantia dentro dos 3s): +700ms após liberação se ainda não confirmado
          timers.push(setTimeout(() => {
            if (!sniperState.confirmedOffers[offerId]) {
              console.log(`[Rotom Sniper]: 🔄 Reforço de compra pós-liberação #${offerId} (+700ms)...`);
              executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, true);
            }
          }, releaseDelayMs + 600));

          // 3º Disparo (Reforço final dentro dos 3s): +1500ms após liberação se ainda não confirmado
          timers.push(setTimeout(() => {
            if (!sniperState.confirmedOffers[offerId]) {
              console.log(`[Rotom Sniper]: 🔄 Reforço final de compra pós-liberação #${offerId} (+1500ms)...`);
              executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, true);
            }
            clearOfferTimers(offerId);
          }, releaseDelayMs + 1400));

          sniperState.scheduledOffers[offerId] = timers;

        } else {
          // Anúncio JÁ ESTÁ LIBERADO! (compravelEm <= now ou sem carência)
          // Compra imediata e reforço de garantia dentro da janela de 3s
          executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, false);

          const timers = [];
          timers.push(setTimeout(() => {
            if (!sniperState.confirmedOffers[offerId]) {
              executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, true);
            }
          }, 700));
          timers.push(setTimeout(() => {
            if (!sniperState.confirmedOffers[offerId]) {
              executeBuyOrder(offerId, buyQty, preco, moeda, targetDisplayName, matchedRule ? matchedRule.id : '', matchedDesc, seller, true);
            }
            clearOfferTimers(offerId);
          }, 1500));

          sniperState.scheduledOffers[offerId] = timers;
        }
      }
    }
  }

  function handleMarketPacket(packet) {
    if (!packet || typeof packet !== 'object') return;
    const t = packet.t || '';

    // Atualiza saldo em tempo real a partir de qualquer pacote de estado ou envelope
    const est = packet.estado || (packet.payload && packet.payload.estado) || (t === 'estado' ? packet : null);
    // Relógio do servidor: `servidorAgora` vem no welcome (raiz) e nos estados.
    if (packet.servidorAgora) atualizarRelogioServidor(packet.servidorAgora);
    else if (est && est.servidorAgora) atualizarRelogioServidor(est.servidorAgora);
    if (est) {
      updatePlayerBalance(est.gold, est.diamonds, est.orbs);
    } else if (typeof packet.gold === 'number') {
      updatePlayerBalance(packet.gold, packet.diamonds, packet.orbs);
    }

    // 1. Catálogo inicial no Welcome
    if (t === 'welcome') {
      if (Array.isArray(packet.itensNossos)) {
        packet.itensNossos.forEach(it => {
          if (it && it.id) sniperState.knownItems[it.id] = it;
        });
      }
      if (packet.mercado && Array.isArray(packet.mercado.catalogo)) {
        packet.mercado.catalogo.forEach(it => {
          if (it && it.id) sniperState.knownItems[it.id] = it;
        });
      }
      // A tabela das Shiny Stones (itemId → tipo) vem no welcome; o nome delas sai dela.
      if (packet.shinyStone && Array.isArray(packet.shinyStone.pedras)) pedrasShinyDoJogo = packet.shinyStone.pedras;
      aprenderItens(packet.itensNossos, true);
      aprenderItens(packet.mercado && packet.mercado.catalogo, false);
      // Lista OFICIAL do RMT: o que o servidor aceita no Mercado hoje (vitrine e seletor de regras).
      if (packet.mercado && Array.isArray(packet.mercado.catalogo) && packet.mercado.catalogo.length) {
        const rmt = packet.mercado.catalogo.map(c => ({
          id: Number(c.id), nome: c.nome || c.name || '', icone: c.icone || c.icon || '',
          categoria: c.categoria || c.category || '', tipo: c.tipo || null, npc: Number(c.npc) || 0
        })).filter(c => c.id);
        if (typeof window.registerRotomRmtCatalog === 'function') window.registerRotomRmtCatalog(rmt);
        try { window.postMessage({ source: 'ROTOM_SNIPER', type: 'RMT_CATALOG', items: rmt }, '*'); } catch (e) {}
      }
      publicarNomesDoJogo();
      return;
    }

    // 2. Pacote market vindo do servidor
    if (t === 'market') {
      const aba = packet.aba || '';

      // Blindagem contra Histórico: Nunca processar históricoGlobal, historicoCompras ou historico como compras ativas
      if (aba.startsWith('historico') || aba === 'historico') {
        return;
      }

      // Meus Anúncios (o que o jogador botou pra vender)
      if (aba === 'meus') {
        const myList = Array.isArray(packet.linhas) ? packet.linhas : [];
        try {
          window.postMessage({
            source: 'ROTOM_SNIPER',
            type: 'MY_LISTINGS_UPDATE',
            listings: myList
          }, '*');
        } catch (e) {}
        return;
      }

      // Anúncio cancelado com sucesso
      if (aba === 'cancelado' || packet.cancelado) {
        showRotomHudToast('ANÚNCIO CANCELADO', 'Seu anúncio foi removido do mercado e devolvido ao depot.', 'confirmed');
        sendRaw({ t: 'market.meus' });
        return;
      }

      // Resumo de todos os itens do mercado
      if (aba === 'itens' && packet.resumo) {
        nomearPeloCatalogoDoJogo(Object.keys(packet.resumo).map(Number));
        try {
          window.postMessage({
            source: 'ROTOM_SNIPER',
            type: 'MARKET_CATALOG_UPDATE',
            resumo: packet.resumo
          }, '*');
        } catch (e) {}

        if (sniperState.enabled) {
        const activeRules = sniperState.rules.filter(r => r.active && (r.targetType === 'item' || !r.targetType));
        for (let r = 0; r < activeRules.length; r++) {
          const rule = activeRules[r];
          if (rule.maxQty > 0 && (rule.totalBought || 0) >= rule.maxQty) continue;

          let itId = Number(rule.targetId);
          if (!itId && rule.targetName && typeof window.getRotomItem === 'function') {
            const it = window.getRotomItem(rule.targetName);
            if (it && it.id) itId = it.id;
          }
          if (!itId) continue;

          const resumoItem = packet.resumo[itId] || packet.resumo[String(itId)];
          if (resumoItem) {
            const minGold = Number(resumoItem.minGold || 0);
            const minOrb = Number(resumoItem.minOrb || 0);

            let shouldFetch = false;
            let fetchMoeda = 'gold';

            const maxGold = Number(rule.maxPriceGold || 0);
            const maxGems = Number(rule.maxPriceGems !== undefined ? rule.maxPriceGems : (rule.maxPriceDiamonds || 0));

            if (maxGold > 0 && minGold > 0 && minGold <= maxGold) {
              shouldFetch = true;
              fetchMoeda = 'gold';
            } else if (maxGems > 0 && minOrb > 0 && minOrb <= maxGems) {
              shouldFetch = true;
              fetchMoeda = 'orb';
            }

            if (shouldFetch) {
              sendRaw({
                t: 'market.item',
                itemId: itId,
                moeda: fetchMoeda
              });
            }
          }
        }
        }
        return;
      }

      // Vendedores de um item específico (m.aba === 'item')
      if (aba === 'item' && Array.isArray(packet.linhas)) {
        const itemId = Number(packet.itemId || 0);
        const moeda = String(packet.moeda || 'gold');
        // A ficha do anúncio traz o nome oficial do item (vale para item que acabou de ser lançado).
        const fichaItem = (packet.linhas.find(l => l && l.ficha && l.ficha.nome) || {}).ficha;
        if (itemId && fichaItem) {
          aprenderItens([{ id: itemId, name: fichaItem.nome, icon: fichaItem.icone, category: fichaItem.categoria }], false);
        }
        const rotomItem = (typeof window.getRotomItem === 'function' && window.getRotomItem(itemId)) || sniperState.knownItems[itemId];
        const itemName = (rotomItem && rotomItem.name) || (sniperState.knownItems[itemId] && sniperState.knownItems[itemId].name) || `Item #${itemId}`;

        const enrichedLinhas = packet.linhas.map(line => ({
          ...line,
          itemId: itemId,
          itemNome: (rotomItem && rotomItem.name) || line.itemNome || itemName,
          moeda: line.moeda || moeda
        }));

        try {
          window.postMessage({
            source: 'ROTOM_SNIPER',
            type: 'ITEM_OFFERS_UPDATE',
            itemId: itemId,
            itemName: itemName,
            moeda: moeda,
            linhas: enrichedLinhas,
            offers: enrichedLinhas
          }, '*');
        } catch (e) {}

        processMarketAnuncios(enrichedLinhas);
        return;
      }

      // Lista geral (Pokémons ou listagem paginada)
      let list = [];
      if (Array.isArray(packet.anuncios)) list = list.concat(packet.anuncios);
      if (Array.isArray(packet.itens)) list = list.concat(packet.itens);
      if (Array.isArray(packet.linhas)) list = list.concat(packet.linhas);
      if (packet.anuncio && typeof packet.anuncio === 'object') list.push(packet.anuncio);

      if (list.length > 0) {
        processMarketAnuncios(list);
      }
      return;
    }

    // 3. Eventos de batalha: confirmação de compra do Mercado e aviso de captura
    if (t === 'batalha' && Array.isArray(packet.ev)) {
      for (const e of packet.ev) {
        if (!e) continue;
        const evKey = String(e.k || e.t || '');

        if (evKey === 'marketComprado') {
          const desc = e.descricao || 'Item entregue na mochila/depot!';
          if (sniperState.lastBuyAttempt && sniperState.lastBuyAttempt.offerId) {
            const offId = sniperState.lastBuyAttempt.offerId;
            sniperState.confirmedOffers[offId] = true;
            clearOfferTimers(offId);
          }
          showRotomHudToast('COMPRA CONFIRMADA!', desc, 'confirmed');
          emitSniperLog({
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            targetName: desc,
            status: 'CONFIRMADO',
            details: `✅ Confirmado pelo servidor: ${desc}`
          });
        }

        // Capturas de Pokémon (k: "capturado", k: "bola" com sucesso, ou k: "captura"/"catch")
        const isCapturado = (evKey === 'capturado');
        const isBolaSucesso = (evKey === 'bola' && (e.sucesso === true || e.sucesso === 1 || e.success));
        const isCatchKey = (evKey === 'captura' || evKey === 'catch');

        if (isCapturado || isBolaSucesso || isCatchKey) {
          const catchId = (e.pokemon && e.pokemon.id) ? 'pk_' + e.pokemon.id : (e.slot ? 'slot_' + e.slot : null);
          const now = Date.now();
          let duplicate = false;

          if (catchId) {
            const lastTs = recentCapturesMap.get(catchId);
            if (lastTs && (now - lastTs) < 4000) {
              duplicate = true;
            } else {
              recentCapturesMap.set(catchId, now);
              if (recentCapturesMap.size > 200) {
                for (const [k, ts] of recentCapturesMap.entries()) {
                  if (now - ts > 10000) recentCapturesMap.delete(k);
                }
              }
            }
          }

          if (!duplicate) {
            const isShiny = Boolean(e.shiny || e.isShiny || e.lookShiny || (e.pokemon && (e.pokemon.shiny || e.pokemon.isShiny)));
            const pokeNome = (e.pokemon && e.pokemon.nome) || e.nome || 'Pokémon';
            // Sem notificação de shiny (pedido da equipe); a captura comum continua avisando.
            if (!isShiny) {
              showRotomHudToast('🎯 CAPTURA REALIZADA!', `${pokeNome} capturado com sucesso!`, 'confirmed');
            }
          }
        }
      }
    }

    // 4. Tratamento de Erros e Recusas do Servidor
    if (t === 'erro') {
      const errMsg = packet.msg || packet.chave || 'Operação recusada pelo servidor';
      if (errMsg.includes('Devagar')) {
        showRotomHudToast('AVISO ANTI-FLOOD', 'O servidor pediu para desacelerar as mensagens.', 'warning');
      } else if (sniperState.lastBuyAttempt && (Date.now() - sniperState.lastBuyAttempt.timestamp < 12000)) {
        // Se houve uma tentativa de compra recente, reportar a recusa exata
        const last = sniperState.lastBuyAttempt;
        delete sniperState.boughtOffers[last.offerId];
        delete sniperState.confirmedOffers[last.offerId];
        showRotomHudToast('COMPRA RECUSADA', `${last.targetName}: ${errMsg}`, 'error');
        emitSniperLog({
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          timestamp: Date.now(),
          targetName: last.targetName,
          offerId: last.offerId,
          status: 'RECUSADO',
          details: `❌ Recusado pelo servidor: ${errMsg}`
        });
      }
    }
  }

  // =========================================================================
  // 3. LOOP DE MONITORAMENTO AUTÔNOMO EM SEGUNDO PLANO (SEM ABRIR JANELA)
  // =========================================================================
  let scanCycle = 0;
  setInterval(() => {
    if (!sniperState.enabled) return;
    const ws = getGameWs();
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    scanCycle++;

    // Mantém leitura de VIP e saldo atualizada continuamente
    updatePlayerVipStatus();
    getPlayerGold();
    getPlayerGems();
    getPlayerDiamonds();

    const activeRules = sniperState.rules.filter(r => r.active);
    const hasItemRules = activeRules.some(r => r.targetType === 'item' || !r.targetType);
    const gCfg = sniperState.globalConfig;
    const hasPokeRules = gCfg.snipeAnyShiny || gCfg.snipeAnyP5 || gCfg.snipeByNote || activeRules.some(r => r.targetType === 'pokemon');

    // 1. Varredura de Itens (a cada 3s)
    if (hasItemRules) {
      sendRaw({ t: 'market.itens' });
    }

    // 2. Varredura de Pokémons (alternando ordenações para pegar novidades)
    if (hasPokeRules) {
      setTimeout(() => {
        if (!sniperState.enabled) return;
        switch (scanCycle % 3) {
          case 0:
            sendRaw({ t: 'market.listar', tipo: 'pokemon', ordem: 'recentes', moeda: '', busca: '', criterios: [], elemento: '' });
            break;
          case 1:
            sendRaw({ t: 'market.listar', tipo: 'pokemon', ordem: 'menor_preco', moeda: 'gold', busca: '', criterios: [], elemento: '' });
            break;
          case 2:
            sendRaw({ t: 'market.listar', tipo: 'pokemon', ordem: 'menor_preco', moeda: 'orb', busca: '', criterios: [], elemento: '' });
            break;
        }
      }, 700);
    }
  }, 3000);

  // =========================================================================
  // 4. INTERCEPTAÇÃO DE WEBSOCKET
  // =========================================================================
  WebSocket.prototype.send = function(data) {
    hookWebSocketInstance(this);
    return originalProtoSend.apply(this, arguments);
  };

  window.WebSocket = function(url, protocols) {
    const ws = new OriginalWebSocket(url, protocols);
    hookWebSocketInstance(ws);
    console.log('[PokéIdle Rotom Sniper]: Conexão WebSocket interceptada:', url);
    return ws;
  };

  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  // =========================================================================
  // 5. ESCUTAR COMANDOS DO POPUP
  // =========================================================================
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'ROTOM_POPUP') return;

    if (event.data.type === 'INIT_SNIPER') {
      sniperState.enabled = Boolean(event.data.enabled);
      if (Array.isArray(event.data.rules)) sniperState.rules = event.data.rules;
      if (event.data.globalConfig) sniperState.globalConfig = Object.assign(sniperState.globalConfig, event.data.globalConfig);
      console.log('[Rotom Sniper]: Inicializado. Ativo:', sniperState.enabled, 'Regras:', sniperState.rules.length);
    } else if (event.data.type === 'SET_SNIPER_ENABLED') {
      const newEnabled = Boolean(event.data.enabled);
      if (sniperState.enabled === newEnabled) return; // Deduplicação: não repete se já estiver no mesmo estado
      sniperState.enabled = newEnabled;
      if (!sniperState.enabled) {
        // Cancela todos os disparos agendados e limpa a fila
        Object.keys(sniperState.scheduledOffers).forEach(clearOfferTimers);
        sniperState.scheduledOffers = {};
      }
      showRotomHudToast(
        sniperState.enabled ? 'AUTO-SNIPE ATIVADO' : 'AUTO-SNIPE PAUSADO',
        sniperState.enabled ? 'Varrendo mercado da comunidade automaticamente a cada 3s.' : 'Compras automáticas temporariamente suspensas.',
        sniperState.enabled ? 'success' : 'warning'
      );
    } else if (event.data.type === 'UPDATE_SNIPER_RULES') {
      sniperState.rules = Array.isArray(event.data.rules) ? event.data.rules : [];
      // Se não há regras ativas de itens, limpa agendamentos
      const activeRuleIds = new Set(sniperState.rules.filter(r => r.active).map(r => r.id));
      if (activeRuleIds.size === 0 && !sniperState.globalConfig.snipeAnyShiny && !sniperState.globalConfig.snipeAnyP5 && !sniperState.globalConfig.snipeByNote) {
        Object.keys(sniperState.scheduledOffers).forEach(clearOfferTimers);
        sniperState.scheduledOffers = {};
      }
      console.log('[Rotom Sniper]: Regras atualizadas:', sniperState.rules.length);
    } else if (event.data.type === 'UPDATE_SNIPER_CONFIG') {
      if (event.data.config) {
        sniperState.globalConfig = Object.assign(sniperState.globalConfig, event.data.config);
      }
    } else if (event.data.type === 'FETCH_MY_LISTINGS') {
      sendRaw({ t: 'market.meus' });
    } else if (event.data.type === 'CANCEL_MARKET_OFFER') {
      sendRaw({ t: 'market.cancelar', id: Number(event.data.offerId || event.data.id) });
    } else if (event.data.type === 'FETCH_COMMUNITY_CATALOG') {
      sendRaw({ t: 'market.itens', elemento: '', categoria: '' });
    } else if (event.data.type === 'FETCH_ITEM_OFFERS') {
      sendRaw({ t: 'market.item', itemId: Number(event.data.itemId), moeda: event.data.moeda || 'gold' });
    } else if (event.data.type === 'BUY_MANUAL_OFFER') {
      executeBuyOrder(event.data.offerId, event.data.qty || 1, event.data.price, event.data.moeda, event.data.targetName, '', 'Compra manual pelo Cockpit', event.data.seller);
    } else if (event.data.type === 'CREATE_MARKET_LISTING') {
      sendRaw({
        t: 'market.criar',
        tipo: event.data.tipo || 'item',
        itemId: event.data.itemId ? Number(event.data.itemId) : undefined,
        pokemonId: event.data.pokemonId ? Number(event.data.pokemonId) : undefined,
        qtd: Number(event.data.qtd) || 1,
        preco: Number(event.data.preco) || 1,
        moeda: event.data.moeda || 'gold',
        dias: event.data.dias ? Number(event.data.dias) : null
      });
      showRotomHudToast('ANÚNCIO PUBLICADO', 'Sua oferta foi enviada ao mercado da comunidade.', 'confirmed');
      setTimeout(() => { sendRaw({ t: 'market.meus' }); }, 600);
    }
  });

  console.log('[PokéIdle Rotom Sniper]: Motor de Auto-Snipe pronto!');
})();