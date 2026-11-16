// PokéIdle Rotom Sniper - Content Script v1.4.3
// Faz a ponte entre a página oficial (injected.js) e o Cockpit/Background

(function() {
  console.log('[PokéIdle Rotom Sniper]: Inicializando Content Script v1.4.3...');

  // Verifica com segurança se o contexto da extensão ainda está ativo no Chrome
  function isExtensionContextValid() {
    try {
      return Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  // Wrapper seguro para leitura do chrome.storage.local
  function safeStorageGet(keys, callback) {
    if (!isExtensionContextValid()) return;
    try {
      chrome.storage.local.get(keys, (res) => {
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime && chrome.runtime.lastError) return;
          if (callback) callback(res || {});
        } catch (err) {}
      });
    } catch (err) {}
  }

  // Wrapper seguro para escrita no chrome.storage.local
  function safeStorageSet(data, callback) {
    if (!isExtensionContextValid()) return;
    try {
      chrome.storage.local.set(data, () => {
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime && chrome.runtime.lastError) return;
          if (callback) callback();
        } catch (err) {}
      });
    } catch (err) {}
  }

  function injectScript(file, callback) {
    if (!isExtensionContextValid()) return;
    try {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL(file);
      s.onload = function() {
        if (callback) callback();
      };
      (document.head || document.documentElement).appendChild(s);
    } catch (err) {}
  }

  // Injeta items_db.js e imediatamente injected.js no contexto da página
  injectScript('items_db.js', () => {
    injectScript('injected.js', () => {
      safeStorageGet(['rotom_sniper_rules', 'rotom_sniper_config', 'rotom_sniper_enabled'], (res) => {
        window.postMessage({
          source: 'ROTOM_POPUP',
          type: 'INIT_SNIPER',
          enabled: res.rotom_sniper_enabled !== undefined ? Boolean(res.rotom_sniper_enabled) : true,
          rules: res.rotom_sniper_rules || [],
          globalConfig: res.rotom_sniper_config || {
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
            maxActiveSlots: 5
          }
        }, '*');
      });
    });
  });

  // Escuta mensagens do injected.js com auto-desvinculação quando o contexto for invalidado
  function handleWindowMessage(event) {
    if (event.source !== window || !event.data || event.data.source !== 'ROTOM_SNIPER') return;

    // Se o contexto da extensão foi descarregado/recarregado no Chrome, desvincula o listener imediatamente
    if (!isExtensionContextValid()) {
      window.removeEventListener('message', handleWindowMessage);
      return;
    }

    try {
      if (event.data.type === 'SNIPER_LOG') {
        safeStorageGet(['rotom_sniper_logs'], (res) => {
          const logs = res.rotom_sniper_logs || [];
          const updatedLogs = [event.data.log, ...logs].slice(0, 100);
          safeStorageSet({ rotom_sniper_logs: updatedLogs });
        });
      } else if (event.data.type === 'SNIPER_BOUGHT') {
        const { ruleId, offerId, qty } = event.data;
        safeStorageGet(['rotom_sniper_rules'], (res) => {
          const rules = res.rotom_sniper_rules || [];
          let changed = false;
          rules.forEach(r => {
            if (r.id === ruleId) {
              r.totalBought = (r.totalBought || 0) + (qty || 1);
              changed = true;
            }
          });
          if (changed) {
            safeStorageSet({ rotom_sniper_rules: rules });
          }
        });
      } else if (event.data.type === 'BALANCE_UPDATE') {
        const { gold, diamonds, orbs } = event.data;
        const patch = {};
        if (typeof gold === 'number' && gold >= 0) patch.rotom_player_gold = gold;
        if (typeof diamonds === 'number' && diamonds >= 0) patch.rotom_player_diamonds = diamonds;
        if (typeof orbs === 'number' && orbs >= 0) patch.rotom_player_orbs = orbs;
        safeStorageSet(patch);
      } else if (event.data.type === 'VIP_STATUS_UPDATE') {
        const isVip = Boolean(event.data.isVip);
        safeStorageSet({ rotom_player_vip: isVip });
      } else if (event.data.type === 'MY_LISTINGS_UPDATE') {
        safeStorageSet({ rotom_my_listings: event.data.listings || [] });
      } else if (event.data.type === 'MARKET_CATALOG_UPDATE') {
        safeStorageSet({ rotom_market_catalog: event.data.resumo || {} });
      } else if (event.data.type === 'RMT_CATALOG') {
        if (Array.isArray(event.data.items) && event.data.items.length) {
          safeStorageSet({ rotom_rmt_catalog: { items: event.data.items, timestamp: Date.now() } });
        }
      } else if (event.data.type === 'ITEMS_NAMES') {
        // Nome que o jogo mostra para cada item ({id: nome}), no idioma do jogador.
        safeStorageGet(['rotom_items_names'], (res) => {
          safeStorageSet({ rotom_items_names: Object.assign({}, res.rotom_items_names || {}, event.data.nomes || {}) });
        });
      } else if (event.data.type === 'ITEMS_CATALOG') {
        // Itens novos do jogo aprendidos na página: soma ao que já foi aprendido em sessões anteriores.
        safeStorageGet(['rotom_items_dynamic'], (res) => {
          const porId = {};
          (res.rotom_items_dynamic || []).forEach(it => { if (it && it.id) porId[it.id] = it; });
          (event.data.items || []).forEach(it => { if (it && it.id) porId[it.id] = it; });
          safeStorageSet({ rotom_items_dynamic: Object.values(porId) });
        });
      } else if (event.data.type === 'ITEM_OFFERS_UPDATE') {
        safeStorageSet({
          rotom_item_offers: {
            itemId: event.data.itemId,
            itemName: event.data.itemName,
            moeda: event.data.moeda,
            linhas: event.data.linhas || [],
            offers: event.data.linhas || [],
            timestamp: Date.now()
          }
        });
      }
    } catch (err) {
      if (!isExtensionContextValid()) {
        window.removeEventListener('message', handleWindowMessage);
      }
    }
  }

  window.addEventListener('message', handleWindowMessage);

  // Sincronização reativa instantânea via chrome.storage.onChanged (funciona entre todas as janelas/abas)
  if (isExtensionContextValid() && chrome.storage && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local' || !isExtensionContextValid()) return;

        if (changes.rotom_sniper_enabled !== undefined) {
          const enabled = Boolean(changes.rotom_sniper_enabled.newValue);
          window.postMessage({ source: 'ROTOM_POPUP', type: 'SET_SNIPER_ENABLED', enabled }, '*');
        }

        if (changes.rotom_sniper_rules !== undefined) {
          const rules = Array.isArray(changes.rotom_sniper_rules.newValue) ? changes.rotom_sniper_rules.newValue : [];
          window.postMessage({ source: 'ROTOM_POPUP', type: 'UPDATE_SNIPER_RULES', rules }, '*');
        }

        if (changes.rotom_sniper_config !== undefined) {
          const config = changes.rotom_sniper_config.newValue || {};
          window.postMessage({ source: 'ROTOM_POPUP', type: 'UPDATE_SNIPER_CONFIG', config }, '*');
        }
      });
    } catch (e) {}
  }

  // Escuta comandos diretos enviados via runtime.sendMessage / tabs.sendMessage
  if (isExtensionContextValid() && chrome.runtime && chrome.runtime.onMessage) {
    try {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!isExtensionContextValid()) return;
        try {
          if (request.action === 'SET_SNIPER_ENABLED') {
            safeStorageSet({ rotom_sniper_enabled: request.enabled });
            sendResponse({ ok: true });
          } else if (request.action === 'UPDATE_SNIPER_RULES') {
            safeStorageSet({ rotom_sniper_rules: request.rules });
            sendResponse({ ok: true });
          } else if (request.action === 'UPDATE_SNIPER_CONFIG') {
            safeStorageSet({ rotom_sniper_config: request.config });
            sendResponse({ ok: true });
          } else if (request.action === 'CLEAR_SNIPER_LOGS') {
            safeStorageSet({ rotom_sniper_logs: [] });
            sendResponse({ ok: true });
          } else if (request.action === 'FETCH_MY_LISTINGS') {
            window.postMessage({ source: 'ROTOM_POPUP', type: 'FETCH_MY_LISTINGS' }, '*');
            sendResponse({ ok: true });
          } else if (request.action === 'CANCEL_MARKET_OFFER') {
            window.postMessage({ source: 'ROTOM_POPUP', type: 'CANCEL_MARKET_OFFER', offerId: request.offerId }, '*');
            sendResponse({ ok: true });
          } else if (request.action === 'FETCH_COMMUNITY_CATALOG') {
            window.postMessage({ source: 'ROTOM_POPUP', type: 'FETCH_COMMUNITY_CATALOG' }, '*');
            sendResponse({ ok: true });
          } else if (request.action === 'FETCH_ITEM_OFFERS') {
            window.postMessage({ source: 'ROTOM_POPUP', type: 'FETCH_ITEM_OFFERS', itemId: request.itemId, moeda: request.moeda }, '*');
            sendResponse({ ok: true });
          } else if (request.action === 'BUY_MANUAL_OFFER') {
            window.postMessage({
              source: 'ROTOM_POPUP',
              type: 'BUY_MANUAL_OFFER',
              offerId: request.offerId,
              qty: request.qty,
              price: request.price,
              moeda: request.moeda,
              targetName: request.targetName,
              seller: request.seller
            }, '*');
            sendResponse({ ok: true });
          } else if (request.action === 'CREATE_MARKET_LISTING') {
            window.postMessage({
              source: 'ROTOM_POPUP',
              type: 'CREATE_MARKET_LISTING',
              tipo: request.tipo,
              itemId: request.itemId,
              pokemonId: request.pokemonId,
              qtd: request.qtd,
              preco: request.preco,
              moeda: request.moeda,
              dias: request.dias
            }, '*');
            sendResponse({ ok: true });
          }
        } catch (err) {}
        return true;
      });
    } catch (e) {}
  }
})();