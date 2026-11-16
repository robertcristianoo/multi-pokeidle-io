// PokéIdle Auto-Sniper — Cockpit Controller v1.4.0
// Interface Standalone baseada 100% no Design System Oficial do PokéIdle

document.addEventListener('DOMContentLoaded', () => {
  console.log('[PokéIdle Cockpit]: Inicializando Cockpit oficial...');

  // Tratador global seguro e em conformidade estrita com CSP (Manifest V3) para fallback de imagens
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      const img = e.target;
      if (img.dataset.hasFallback) {
        img.style.display = 'none';
        return;
      }
      img.dataset.hasFallback = 'true';
      if (img.classList.contains('log-item-icon')) {
        img.style.display = 'none';
      } else if (img.classList.contains('hunt-poke-sprite')) {
        img.src = 'https://pokeidle.io/assets/site/assets/ui/ball-poke.png';
      } else if (img.classList.contains('stat-drop-icon')) {
        img.src = 'icons/ouro.png';
      } else {
        img.src = 'https://pokeidle.io/assets/site/assets/ui/ball-poke.png';
      }
    }
  }, true);

  // Top Bar & Telemetria
  const valCoins = document.getElementById('val-coins');
  const valGemas = document.getElementById('val-gemas');
  const valDiamantes = document.getElementById('val-diamantes');
  const valSlots = document.getElementById('val-slots');
  const toggleMasterSniper = document.getElementById('toggle-master-sniper');
  const footerStatus = document.getElementById('footer-status');


  // Filtros de Categoria & Formulário de Nova Regra
  const chipButtons = document.querySelectorAll('.rule-cat-btn');
  const inputSearchItem = document.getElementById('input-search-item');
  const dropdownSuggestions = document.getElementById('dropdown-suggestions');
  const boxSelectedPreview = document.getElementById('box-selected-preview');
  const imgSelectedItem = document.getElementById('img-selected-item');
  const lblSelectedName = document.getElementById('lbl-selected-name');
  const lblSelectedCat = document.getElementById('lbl-selected-cat');
  const btnClearSelection = document.getElementById('btn-clear-selection');

  const inputRuleCoins = document.getElementById('input-rule-coins');
  const inputRuleGemas = document.getElementById('input-rule-gemas');
  const inputRuleQty = document.getElementById('input-rule-qty');
  const btnAddRule = document.getElementById('btn-add-rule');

  // Radar Global de Pokémon
  const chkGlobalShiny = document.getElementById('chk-global-shiny');
  const cfgShinyCoins = document.getElementById('cfg-shiny-coins');
  const cfgShinyGemas = document.getElementById('cfg-shiny-gemas');

  const chkGlobalP5 = document.getElementById('chk-global-p5');
  const cfgP5Coins = document.getElementById('cfg-p5-coins');
  const cfgP5Gemas = document.getElementById('cfg-p5-gemas');

  const chkGlobalNote = document.getElementById('chk-global-note');
  const cfgNoteVal = document.getElementById('cfg-note-val');
  const cfgNoteCoins = document.getElementById('cfg-note-coins');
  const cfgNoteGemas = document.getElementById('cfg-note-gemas');
  const chkGlobalIgnoreOutland = document.getElementById('chk-global-ignore-outland');

  const lblRadarSlotBadge = document.getElementById('lbl-radar-slot-badge');
  const lblRadarSlotStatus = document.getElementById('lbl-radar-slot-status');
  const badgeVipStatus = document.getElementById('badge-vip-status');

  // Quantidade Infinita
  const btnToggleInfiniteNew = document.getElementById('btn-toggle-infinite-new');
  const btnToggleInfiniteEdit = document.getElementById('btn-toggle-infinite-edit');
  const lblInputQtyTitle = document.getElementById('lbl-input-qty-title');
  const lblEditQtyTitle = document.getElementById('lbl-edit-qty-title');

  // Lista de Regras & Contadores
  const containerRulesList = document.getElementById('container-rules-list');
  const lblRulesCount = document.getElementById('lbl-rules-count');

  // Terminal de Logs
  const containerLogsList = document.getElementById('container-logs-list');
  const btnClearLogs = document.getElementById('btn-clear-logs');

  // Modal de Edição
  const modalEditRule = document.getElementById('modal-edit-rule');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnSaveModal = document.getElementById('btn-save-modal');
  const editRuleName = document.getElementById('edit-rule-name');
  const editRuleCoins = document.getElementById('edit-rule-coins');
  const editRuleGemas = document.getElementById('edit-rule-gemas');
  const editRuleQty = document.getElementById('edit-rule-qty');
  const editRuleActive = document.getElementById('edit-rule-active');
  const lblEditBought = document.getElementById('lbl-edit-bought');
  const btnResetBought = document.getElementById('btn-reset-bought');

  // Constantes de Slots
  const MAX_BASIC_SLOTS = 5;
  const MAX_VIP_SLOTS = 15;
  const MAX_BASIC_QTY = 20;

  // Estado VIP e Infinito
  let isPlayerVip = false;
  let newRuleIsInfinite = false;
  let editRuleIsInfinite = false;

  function getMaxSlots() {
    return isPlayerVip ? MAX_VIP_SLOTS : MAX_BASIC_SLOTS;
  }

  // Estado Local
  let isSniperEnabled = true;
  let sniperRules = [];
  let sniperLogs = [];
  let selectedItemObj = null;
  let currentFilterCat = 'all';
  let editingRuleId = null;

  // Estado do Mercado da Comunidade
  let myListings = [];
  let communityCatalog = {};
  let currentItemOffersData = null;
  let currentMarketFilterCat = 'all';
  let currentOffersMoeda = 'gold';
  let selectedMarketItem = null;

  let globalConfig = {
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
    autoMaxAffordable: true
  };

  // Helpers de Slots da Versão Basic (Cada Auto-Snipe no Radar = 1 Slot)
  function getRadarSlotsCount() {
    let count = 0;
    const shinyOn = chkGlobalShiny ? chkGlobalShiny.checked : Boolean(globalConfig && globalConfig.snipeAnyShiny);
    const p5On = chkGlobalP5 ? chkGlobalP5.checked : Boolean(globalConfig && globalConfig.snipeAnyP5);
    const noteOn = chkGlobalNote ? chkGlobalNote.checked : Boolean(globalConfig && globalConfig.snipeByNote);

    if (shinyOn) count++;
    if (p5On) count++;
    if (noteOn) count++;
    return count;
  }

  function isRadarActive() {
    return getRadarSlotsCount() > 0;
  }

  function getActiveRulesCount() {
    return sniperRules.filter(r => r.active).length;
  }

  function getUsedSlotsCount() {
    return getActiveRulesCount() + getRadarSlotsCount();
  }

  function updateSlotsDisplay() {
    const maxSlots = getMaxSlots();
    const activeRules = getActiveRulesCount();
    const radarSlots = getRadarSlotsCount();
    const totalUsed = activeRules + radarSlots;

    if (badgeVipStatus) {
      badgeVipStatus.style.display = isPlayerVip ? 'inline-block' : 'none';
    }

    if (valSlots) {
      valSlots.textContent = `${totalUsed} / ${maxSlots} SLOTS ATIVOS${isPlayerVip ? ' (VIP)' : ''}`;
      if (totalUsed >= maxSlots) {
        valSlots.style.color = '#ffd166';
      } else {
        valSlots.style.color = 'var(--rx-luz)';
      }
    }

    if (lblRulesCount) {
      lblRulesCount.textContent = `${totalUsed} de ${maxSlots} slots utilizados`;
      if (totalUsed >= maxSlots) {
        lblRulesCount.style.color = 'var(--ouro)';
        lblRulesCount.style.fontWeight = '700';
      } else {
        lblRulesCount.style.color = 'var(--sobre-mad-dim)';
        lblRulesCount.style.fontWeight = '400';
      }
    }

    if (lblRadarSlotBadge) {
      lblRadarSlotBadge.textContent = `${radarSlots} / 3 Slots Usados`;
      lblRadarSlotBadge.style.color = radarSlots > 0 ? 'var(--ouro)' : 'var(--sobre-mad-dim)';
    }

    if (lblRadarSlotStatus) {
      if (radarSlots > 0) {
        lblRadarSlotStatus.textContent = `Ativo (${radarSlots} slot${radarSlots > 1 ? 's' : ''} em uso)`;
        lblRadarSlotStatus.style.color = 'var(--ouro)';
      } else {
        lblRadarSlotStatus.textContent = 'Inativo (0 slots)';
        lblRadarSlotStatus.style.color = 'var(--sobre-mad-dim)';
      }
    }

    // Atualiza botões infinitos conforme status VIP
    if (btnToggleInfiniteNew) {
      if (newRuleIsInfinite) {
        btnToggleInfiniteNew.classList.remove('apagado');
        btnToggleInfiniteNew.classList.add('btn-roxo', 'on');
        btnToggleInfiniteNew.textContent = '✓ ∞ Ativo';
      } else {
        btnToggleInfiniteNew.classList.remove('btn-roxo', 'on');
        btnToggleInfiniteNew.classList.add('apagado');
        btnToggleInfiniteNew.textContent = isPlayerVip ? '∞ Infinito' : '🔒 ∞';
      }
    }

    if (btnToggleInfiniteEdit) {
      if (editRuleIsInfinite) {
        btnToggleInfiniteEdit.classList.remove('apagado');
        btnToggleInfiniteEdit.classList.add('btn-roxo', 'on');
        btnToggleInfiniteEdit.textContent = '✓ ∞ Ativo';
      } else {
        btnToggleInfiniteEdit.classList.remove('btn-roxo', 'on');
        btnToggleInfiniteEdit.classList.add('apagado');
        btnToggleInfiniteEdit.textContent = isPlayerVip ? '∞ Infinito' : '🔒 ∞';
      }
    }

    if (lblInputQtyTitle) {
      lblInputQtyTitle.textContent = isPlayerVip
        ? (newRuleIsInfinite ? 'Quantidade: Infinita (Sem limite)' : 'Quantidade Máxima:')
        : 'Quantidade Máxima (Máx 20 un):';
    }

    if (lblEditQtyTitle) {
      lblEditQtyTitle.textContent = isPlayerVip
        ? (editRuleIsInfinite ? 'Quantidade: Infinita (Sem limite)' : 'Quantidade Máxima:')
        : 'Quantidade Máxima (Máx 20 un):';
    }
  }

  function setInfiniteNew(infinite) {
    if (infinite && !isPlayerVip) {
      alert('Benefício VIP PokéIdle!\n\nA compra de quantidade infinita é exclusiva para treinadores com VIP ativo no PokéIdle.\n\nNa versão Básica, o limite é de até 20 unidades por regra.');
      return;
    }
    newRuleIsInfinite = Boolean(infinite);
    if (inputRuleQty) {
      if (newRuleIsInfinite) {
        inputRuleQty.value = '99999';
        inputRuleQty.disabled = true;
        inputRuleQty.style.opacity = '0.5';
      } else {
        inputRuleQty.disabled = false;
        inputRuleQty.style.opacity = '1';
        if (inputRuleQty.value === '99999' || (!isPlayerVip && Number(inputRuleQty.value) > 20)) {
          inputRuleQty.value = '20';
        }
      }
    }
    updateSlotsDisplay();
  }

  function setInfiniteEdit(infinite) {
    if (infinite && !isPlayerVip) {
      alert('Benefício VIP PokéIdle!\n\nA compra de quantidade infinita é exclusiva para treinadores com VIP ativo no PokéIdle.\n\nNa versão Básica, o limite é de até 20 unidades por regra.');
      return;
    }
    editRuleIsInfinite = Boolean(infinite);
    if (editRuleQty) {
      if (editRuleIsInfinite) {
        editRuleQty.value = '99999';
        editRuleQty.disabled = true;
        editRuleQty.style.opacity = '0.5';
      } else {
        editRuleQty.disabled = false;
        editRuleQty.style.opacity = '1';
        if (editRuleQty.value === '99999' || (!isPlayerVip && Number(editRuleQty.value) > 20)) {
          editRuleQty.value = '20';
        }
      }
    }
    updateSlotsDisplay();
  }

  if (btnToggleInfiniteNew) {
    btnToggleInfiniteNew.addEventListener('click', () => {
      setInfiniteNew(!newRuleIsInfinite);
    });
  }

  if (btnToggleInfiniteEdit) {
    btnToggleInfiniteEdit.addEventListener('click', () => {
      setInfiniteEdit(!editRuleIsInfinite);
    });
  }

  // =========================================================================
  // 1. SALDO E CABEÇALHO
  // =========================================================================
  function updateBalanceDisplay(gold, gems, diamonds) {
    if (valCoins) {
      if (typeof gold === 'number' && gold >= 0) {
        valCoins.textContent = `${gold.toLocaleString()} GP`;
      } else {
        valCoins.textContent = '-- GP';
      }
    }
    if (valGemas) {
      if (typeof gems === 'number' && gems >= 0) {
        valGemas.textContent = `${gems.toLocaleString()} Gemas`;
      } else {
        valGemas.textContent = '-- Gemas';
      }
    }
    if (valDiamantes) {
      if (typeof diamonds === 'number' && diamonds >= 0) {
        valDiamantes.textContent = `${diamonds.toLocaleString()} Diamantes`;
      } else {
        valDiamantes.textContent = '-- Diamantes';
      }
    }
  }

  function updateFooter(msg) {
    if (footerStatus && msg) {
      footerStatus.textContent = msg;
    }
  }

  // =========================================================================
  // 2. FILTROS RÁPIDOS DE CATEGORIA & AUTOCOMPLETE
  // =========================================================================
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => {
        b.classList.remove('on');
        b.classList.add('apagado');
      });
      btn.classList.add('on');
      btn.classList.remove('apagado');
      currentFilterCat = btn.getAttribute('data-cat') || 'all';
      renderSuggestions(inputSearchItem ? inputSearchItem.value.trim() : '');
    });
  });

  function renderSuggestions(query) {
    if (!dropdownSuggestions) return;
    const q = (query || '').toLowerCase().trim();

    let items = [];
    if (typeof window.searchRotomItems === 'function') {
      items = window.searchRotomItems(q, currentFilterCat);
    }

    if (items.length === 0) {
      dropdownSuggestions.style.display = 'none';
      dropdownSuggestions.innerHTML = '';
      return;
    }

    dropdownSuggestions.innerHTML = '';
    items.slice(0, 80).forEach(it => {
      const row = document.createElement('div');
      row.className = 'sug-item';

      const iconUrl = typeof window.getItemIconUrl === 'function'
        ? window.getItemIconUrl(it)
        : (it.icon || '');

      row.innerHTML = `
        <img src="${iconUrl}" class="sug-img">
        <span class="sug-text">${it.name}</span>
        <span class="sug-cat">${it.categoryLabel || it.category || 'item'}</span>
      `;

      const sugImg = row.querySelector('.sug-img');
      if (sugImg) {
        sugImg.addEventListener('error', () => { sugImg.style.display = 'none'; });
      }

      row.addEventListener('click', () => {
        selectItem(it);
        dropdownSuggestions.style.display = 'none';
      });

      dropdownSuggestions.appendChild(row);
    });

    dropdownSuggestions.style.display = 'flex';
  }

  function selectItem(it) {
    selectedItemObj = it;
    if (inputSearchItem) inputSearchItem.value = it.name;
    if (boxSelectedPreview) boxSelectedPreview.style.display = 'flex';
    if (lblSelectedName) lblSelectedName.textContent = it.name;
    if (lblSelectedCat) lblSelectedCat.textContent = (it.categoryLabel || it.category || 'item').toUpperCase();

    if (imgSelectedItem) {
      imgSelectedItem.style.display = 'block';
      imgSelectedItem.src = typeof window.getItemIconUrl === 'function'
        ? window.getItemIconUrl(it)
        : (it.icon || '');
    }
  }

  if (btnClearSelection) {
    btnClearSelection.addEventListener('click', () => {
      selectedItemObj = null;
      if (inputSearchItem) inputSearchItem.value = '';
      if (boxSelectedPreview) boxSelectedPreview.style.display = 'none';
      if (dropdownSuggestions) dropdownSuggestions.style.display = 'none';
    });
  }

  if (inputSearchItem) {
    inputSearchItem.addEventListener('input', (e) => {
      renderSuggestions(e.target.value);
    });

    inputSearchItem.addEventListener('focus', (e) => {
      renderSuggestions(e.target.value);
    });

    document.addEventListener('click', (e) => {
      if (dropdownSuggestions && !dropdownSuggestions.contains(e.target) && e.target !== inputSearchItem) {
        dropdownSuggestions.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // 3. CADASTRO DE NOVA REGRA
  // =========================================================================
  if (btnAddRule) {
    btnAddRule.addEventListener('click', () => {
      const rawName = inputSearchItem ? inputSearchItem.value.trim() : '';
      if (!selectedItemObj && !rawName) {
        alert('Por favor, selecione ou digite um item para cadastrar.');
        return;
      }

      const coins = inputRuleCoins ? (Number(inputRuleCoins.value) || 0) : 0;
      const gemas = inputRuleGemas ? (Number(inputRuleGemas.value) || 0) : 0;
      const rawQty = inputRuleQty ? inputRuleQty.value.trim() : '1';
      const maxSlots = getMaxSlots();
      let qty = newRuleIsInfinite ? 99999 : (Number(rawQty) || 1);

      if (!isPlayerVip && !newRuleIsInfinite && (qty <= 0 || qty > MAX_BASIC_QTY)) {
        alert(`Na versão Basic, a quantidade máxima permitida é de 1 a ${MAX_BASIC_QTY} unidades por regra.`);
        qty = Math.min(Math.max(qty, 1), MAX_BASIC_QTY);
        if (inputRuleQty) inputRuleQty.value = String(qty);
        return;
      }

      if (coins <= 0 && gemas <= 0) {
        alert('Defina ao menos um teto de preço (Coins ou Gemas).');
        return;
      }

      const totalUsed = getUsedSlotsCount();
      let ruleActive = true;
      if (totalUsed >= maxSlots) {
        ruleActive = false;
        alert(`Regra cadastrada como PAUSADA!\n\nVocê já está usando o limite de ${maxSlots} slots ativos. Desative uma regra ou o Radar de Pokémon para ativá-la.`);
      }

      let targetId = selectedItemObj ? selectedItemObj.id : 0;
      let targetName = selectedItemObj ? selectedItemObj.name : rawName;
      const targetType = (selectedItemObj && selectedItemObj.category === 'pokemon') ? 'pokemon' : 'item';

      const matchedDbItem = selectedItemObj || (typeof window.getRotomItem === 'function' ? (window.getRotomItem(targetId) || window.getRotomItem(targetName)) : null);
      if (!targetId && matchedDbItem) {
        targetId = matchedDbItem.id;
        targetName = matchedDbItem.name;
      }
      const targetIcon = (matchedDbItem && matchedDbItem.icon) ? matchedDbItem.icon : '';

      const newRule = {
        id: 'rule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        targetType: targetType,
        targetId: targetId,
        targetName: targetName,
        icon: targetIcon,
        maxPriceGold: coins,
        maxPriceGems: gemas,
        maxPriceDiamonds: gemas, // Compatibilidade com pacotes legados
        infinite: Boolean(newRuleIsInfinite),
        maxQty: qty,
        totalBought: 0,
        active: ruleActive,
        createdAt: Date.now()
      };

      sniperRules.push(newRule);
      saveAndSyncRules();

      // Limpar campos
      setInfiniteNew(false);
      selectedItemObj = null;
      if (inputSearchItem) inputSearchItem.value = '';
      if (boxSelectedPreview) boxSelectedPreview.style.display = 'none';
      if (inputRuleCoins) inputRuleCoins.value = '';
      if (inputRuleGemas) inputRuleGemas.value = '';
      if (inputRuleQty) inputRuleQty.value = '1';
    });
  }

  // =========================================================================
  // 4. RENDERIZAÇÃO DA LISTA DE REGRAS
  // =========================================================================
  function renderRules() {
    if (!containerRulesList) return;
    updateSlotsDisplay();

    if (sniperRules.length === 0) {
      containerRulesList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--sobre-mad-dim);">
          Nenhuma regra cadastrada. Cadastre até 5 regras no painel à esquerda.
        </div>
      `;
      return;
    }

    containerRulesList.innerHTML = '';
    sniperRules.forEach(rule => {
      const card = document.createElement('div');
      card.className = 'vao rule-card';

      const iconUrl = typeof window.getItemIconUrl === 'function'
        ? window.getItemIconUrl(rule)
        : '';

      const coinsText = rule.maxPriceGold > 0 ? `${rule.maxPriceGold.toLocaleString('pt-BR')} GP` : '';
      const gemasText = (rule.maxPriceGems > 0 || rule.maxPriceDiamonds > 0)
        ? `${(rule.maxPriceGems || rule.maxPriceDiamonds).toLocaleString('pt-BR')} Gemas`
        : '';
      const prices = [coinsText, gemasText].filter(Boolean).join(' | ') || 'Sem teto';

      const bought = rule.totalBought || 0;
      const isInf = Boolean(rule.infinite || rule.maxQty >= 99999);
      let pct = 0;
      let qtyText = '';

      if (isInf) {
        pct = 100;
        qtyText = `${bought} / ∞`;
      } else {
        const maxQ = (rule.maxQty !== undefined && rule.maxQty > 0) ? (isPlayerVip ? rule.maxQty : Math.min(rule.maxQty, MAX_BASIC_QTY)) : MAX_BASIC_QTY;
        pct = Math.min(100, Math.round((bought / maxQ) * 100));
        qtyText = `${bought} / ${maxQ}`;
      }

      card.innerHTML = `
        <div class="rule-card-top">
          <div class="rule-target-info">
            <img src="${iconUrl}" class="rule-icon">
            <div class="rule-name-box">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="rule-name">${rule.targetName}</span>
                ${(rule.targetType !== 'pokemon' && typeof window.isRotomItemNoRmt === 'function' && rule.targetId && !window.isRotomItemNoRmt(rule.targetId))
                  ? '<span style="font-size: 7.5px; padding: 1px 4px; background: rgba(232,50,42,0.25); border: 1px solid #e8322a; color: #ff9b94; font-weight: 800; border-radius: 0px;" title="O jogo tirou este item do Mercado da Comunidade: a regra nunca vai encontrar anúncio.">FORA DO RMT</span>'
                  : ''}
              </div>
              <span class="rule-meta">${prices}</span>
            </div>
          </div>
          <div class="rule-actions-group">
            <label style="display: flex; align-items: center; cursor: pointer;" title="Ativar ou pausar regra">
              <input type="checkbox" class="chk-rule-toggle chk-mini" ${rule.active ? 'checked' : ''}>
            </label>
          </div>
        </div>

        <div class="rule-card-bottom">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <div class="rule-progress-bar">
              <div class="rule-progress-fill" style="width: ${pct}%; ${isInf ? 'background: linear-gradient(180deg, #9fe4ff, #2f8fc4);' : ''}"></div>
            </div>
            <span style="font-size: 9.5px; color: ${isInf ? 'var(--vip-luz, #9fe4ff)' : 'var(--sobre-mad-dim)'}; font-variant-numeric: tabular-nums; flex: none;">
              ${qtyText}
            </span>
          </div>

          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn apagado btn-mini btn-edit-rule">Editar</button>
            <button type="button" class="btn apagado btn-mini btn-del-rule">Excluir</button>
          </div>
        </div>
      `;

      const rImg = card.querySelector('.rule-icon');
      if (rImg) {
        rImg.addEventListener('error', () => { rImg.style.display = 'none'; });
      }

      // Toggle ativo com verificação estrita de slots
      const chkToggle = card.querySelector('.chk-rule-toggle');
      if (chkToggle) {
        chkToggle.addEventListener('change', (e) => {
          const maxSlots = getMaxSlots();
          if (e.target.checked) {
            if (getUsedSlotsCount() >= maxSlots) {
              e.target.checked = false;
              rule.active = false;
              alert(`Limite de ${maxSlots} slots ativos atingido!\n\nDesative outra regra ou o Radar de Pokémon para liberar um slot.`);
              return;
            }
            rule.active = true;
          } else {
            rule.active = false;
          }
          saveAndSyncRules();
          updateSlotsDisplay();
        });
      }

      // Editar
      const btnEdit = card.querySelector('.btn-edit-rule');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          openEditModal(rule);
        });
      }

      // Excluir
      const btnDel = card.querySelector('.btn-del-rule');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          if (confirm(`Excluir regra de compra de ${rule.targetName}?`)) {
            sniperRules = sniperRules.filter(r => r.id !== rule.id);
            saveAndSyncRules();
          }
        });
      }

      containerRulesList.appendChild(card);
    });
  }

  // =========================================================================
  // 5. MODAL DE EDIÇÃO DE REGRA
  // =========================================================================
  function openEditModal(rule) {
    if (!modalEditRule) return;
    editingRuleId = rule.id;

    if (editRuleName) editRuleName.value = rule.targetName || '';
    if (editRuleCoins) editRuleCoins.value = rule.maxPriceGold || '';
    if (editRuleGemas) editRuleGemas.value = rule.maxPriceGems || rule.maxPriceDiamonds || '';
    
    const isInf = Boolean(rule.infinite || rule.maxQty >= 99999);
    setInfiniteEdit(isInf);
    if (!isInf && editRuleQty) {
      editRuleQty.value = (rule.maxQty !== undefined && rule.maxQty > 0) ? (isPlayerVip ? rule.maxQty : Math.min(rule.maxQty, MAX_BASIC_QTY)) : 1;
    }

    if (lblEditBought) lblEditBought.textContent = `${rule.totalBought || 0} unidades`;
    if (editRuleActive) editRuleActive.checked = Boolean(rule.active);

    modalEditRule.classList.add('open');
  }

  function closeEditModal() {
    if (!modalEditRule) return;
    editingRuleId = null;
    modalEditRule.classList.remove('open');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeEditModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeEditModal);

  if (btnResetBought) {
    btnResetBought.addEventListener('click', () => {
      if (!editingRuleId) return;
      const rule = sniperRules.find(r => r.id === editingRuleId);
      if (rule) {
        rule.totalBought = 0;
        if (lblEditBought) lblEditBought.textContent = '0 unidades';
        saveAndSyncRules();
      }
    });
  }

  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', () => {
      if (!editingRuleId) return;
      const rule = sniperRules.find(r => r.id === editingRuleId);
      if (!rule) return;

      const coins = editRuleCoins ? (Number(editRuleCoins.value) || 0) : 0;
      const gemas = editRuleGemas ? (Number(editRuleGemas.value) || 0) : 0;
      const rawQty = editRuleQty ? editRuleQty.value.trim() : '1';
      let qty = editRuleIsInfinite ? 99999 : (Number(rawQty) || 1);

      if (!isPlayerVip && !editRuleIsInfinite && (qty <= 0 || qty > MAX_BASIC_QTY)) {
        alert(`Na versão Basic, a quantidade máxima permitida é de 1 a ${MAX_BASIC_QTY} unidades.`);
        qty = Math.min(Math.max(qty, 1), MAX_BASIC_QTY);
        if (editRuleQty) editRuleQty.value = String(qty);
        return;
      }

      if (coins <= 0 && gemas <= 0) {
        alert('Defina ao menos um teto de preço (Coins ou Gemas).');
        return;
      }

      const wantActive = editRuleActive ? editRuleActive.checked : rule.active;
      const maxSlots = getMaxSlots();
      if (wantActive && !rule.active) {
        if (getUsedSlotsCount() >= maxSlots) {
          alert(`Limite de ${maxSlots} slots ativos atingido!\n\nDesative outra regra ou o Radar de Pokémon para ativar esta.`);
          if (editRuleActive) editRuleActive.checked = false;
          return;
        }
      }

      rule.maxPriceGold = coins;
      rule.maxPriceGems = gemas;
      rule.maxPriceDiamonds = gemas;
      rule.infinite = Boolean(editRuleIsInfinite);
      rule.maxQty = qty;
      rule.active = wantActive;

      saveAndSyncRules();
      renderRules();
      closeEditModal();
    });
  }

  // =========================================================================
  // 6. TERMINAL DE LOGS DO MERCADO
  // =========================================================================
  function renderLogs() {
    if (!containerLogsList) return;

    if (sniperLogs.length === 0) {
      containerLogsList.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--vao-dim); font-size: 10px;">
          Aguardando anúncios do mercado...
        </div>
      `;
      return;
    }

    containerLogsList.innerHTML = '';
    sniperLogs.slice(0, 50).forEach(l => {
      const row = document.createElement('div');
      row.className = 'log-row';

      const st = (l.status || '').toLowerCase();
      let statusClass = 'sucesso';
      if (st.includes('disparado') || st.includes('comprando')) statusClass = 'disparado';
      else if (st.includes('agendado') || st.includes('limite') || st.includes('slot')) statusClass = 'aviso';
      else if (st.includes('erro') || st.includes('falhou') || st.includes('rejeitado') || st.includes('recusado')) statusClass = 'erro';

      const d = new Date(l.timestamp || Date.now());
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

      // 1. Resolução humanizada do nome do Item (corrige qualquer Item #ID legado se existir)
      let targetName = l.targetName || 'Item';
      if (targetName.startsWith('Item #')) {
        const matchId = targetName.match(/\d+/);
        if (matchId && typeof getRotomItem === 'function') {
          const found = getRotomItem(Number(matchId[0]));
          if (found && found.name) {
            targetName = found.name;
          }
        }
      }

      // 2. Extração do vendedor (campo seller direto ou parsing de log legado)
      let seller = String(l.seller || '').trim();
      if (!seller && l.details) {
        const sellerMatch = l.details.match(/de @([a-zA-Z0-9_-]+)/i) || l.details.match(/vendedor:?\s*@?([a-zA-Z0-9_-]+)/i);
        if (sellerMatch) seller = sellerMatch[1];
      }

      // 3. Formatação monetária limpa e humanizada
      const qtyNum = Number(l.qty || 1);
      const curr = String(l.currency || 'gold').toLowerCase();
      const isGemas = (curr === 'orb' || curr === 'orbs' || curr === 'gemas' || curr === 'gema');
      const currLabel = isGemas ? 'Gemas' : 'Coins';
      const unitPrice = Number(l.price || 0).toLocaleString('pt-BR');
      const totalPrice = (qtyNum * Number(l.price || 0)).toLocaleString('pt-BR');

      let priceSummary = '';
      if (l.price) {
        priceSummary = qtyNum > 1
          ? `${qtyNum}x a ${unitPrice} ${currLabel} (Total: ${totalPrice})`
          : `${unitPrice} ${currLabel}`;
      }

      // 4. Limpeza e humanização dos detalhes (remove jargões robóticos legados)
      let cleanDetails = String(l.details || '').trim();
      cleanDetails = cleanDetails.replace(/^Ordem enviada ao servidor via\s*/i, '');
      cleanDetails = cleanDetails.replace(/^Regra Item:\s*/i, 'Regra: ');
      cleanDetails = cleanDetails.replace(/^Regra Pokemon:\s*/i, 'Regra: ');

      // Ícone do item se existir no catálogo oficial
      let iconHtml = '';
      if (typeof getRotomItem === 'function') {
        const itemObj = getRotomItem(targetName);
        if (itemObj && typeof getItemIconUrl === 'function') {
          const iconUrl = getItemIconUrl(itemObj);
          if (iconUrl) {
            iconHtml = `<img src="${iconUrl}" class="log-item-icon" alt="">`;
          }
        }
      }

      row.innerHTML = `
        <div class="log-row-top">
          <div class="log-target-group">
            <span class="log-time">[${timeStr}]</span>
            ${iconHtml}
            <span class="log-target" title="${targetName}">${targetName}</span>
            ${seller ? `<span class="log-seller" title="Vendedor: ${seller}">de <b>@${seller}</b></span>` : ''}
          </div>
          <span class="log-status-tag ${statusClass}">${l.status || 'OK'}</span>
        </div>
        <div class="log-detail">
          ${priceSummary ? `<span class="log-price">${priceSummary}</span>` : ''}
          ${priceSummary && cleanDetails ? ' · ' : ''}
          <span class="log-desc">${cleanDetails}</span>
        </div>
      `;

      containerLogsList.appendChild(row);
    });
  }

  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      sniperLogs = [];
      renderLogs();
      sendToActiveTab({ action: 'CLEAR_SNIPER_LOGS' });
    });
  }

  // =========================================================================
  // 7. SINCRONIZAÇÃO COM CHROME STORAGE E ABA ATIVA
  // =========================================================================
  function saveAndSyncRules() {
    renderRules();
    sendToActiveTab({ action: 'UPDATE_SNIPER_RULES', rules: sniperRules });
  }

  function saveAndSyncConfig() {
    sendToActiveTab({ action: 'UPDATE_SNIPER_CONFIG', config: globalConfig });
  }

  function sendToActiveTab(message) {
    // 1. Salva imediatamente no chrome.storage.local (ativa reativamente o onChanged em todas as abas/janelas)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      if (message.action === 'UPDATE_SNIPER_RULES') {
        chrome.storage.local.set({ rotom_sniper_rules: message.rules });
      } else if (message.action === 'UPDATE_SNIPER_CONFIG') {
        chrome.storage.local.set({ rotom_sniper_config: message.config });
      } else if (message.action === 'SET_SNIPER_ENABLED') {
        chrome.storage.local.set({ rotom_sniper_enabled: message.enabled });
      } else if (message.action === 'CLEAR_SNIPER_LOGS') {
        chrome.storage.local.set({ rotom_sniper_logs: [] });
      }
    }

    // 2. Dispara mensagem diretamente para TODAS as abas abertas do PokéIdle (independente de janela)
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({}, (tabs) => {
        if (Array.isArray(tabs)) {
          tabs.forEach(t => {
            const isPokeidle = t && t.url && (t.url.includes('pokeidle.io') || t.url.includes('pokeidle'));
            if (isPokeidle && t.id) {
              chrome.tabs.sendMessage(t.id, message, () => {
                if (chrome.runtime && chrome.runtime.lastError) {}
              });
            }
          });
        }
      });
    }
  }

  // Master Toggle
  if (toggleMasterSniper) {
    toggleMasterSniper.addEventListener('change', (e) => {
      isSniperEnabled = e.target.checked;
      updateFooter(isSniperEnabled ? 'Varrendo mercado da comunidade automaticamente...' : 'Auto-Sniper pausado pelo usuário.');
      sendToActiveTab({ action: 'SET_SNIPER_ENABLED', enabled: isSniperEnabled });
    });
  }

  // Configuração Global de Pokémon
  function bindGlobalConfig() {
    const bindRadarCheck = (el, prop) => {
      if (el) {
        el.addEventListener('change', (e) => {
          const willBeActive = e.target.checked;

          if (willBeActive) {
            const maxSlots = getMaxSlots();
            globalConfig[prop] = true;
            const futureTotal = getActiveRulesCount() + getRadarSlotsCount();
            if (futureTotal > maxSlots) {
              e.target.checked = false;
              globalConfig[prop] = false;
              alert(`Limite de ${maxSlots} slots atingido!\n\nCada auto-snipe do Radar consome 1 slot. Desative uma regra de compra ou outro filtro do Radar para poder ativar este.`);
              updateSlotsDisplay();
              return;
            }
          } else {
            globalConfig[prop] = false;
          }

          saveAndSyncConfig();
          updateSlotsDisplay();
        });
      }
    };

    const bindNum = (el, prop, propCompat) => {
      if (el) {
        const update = (e) => {
          const raw = String(e.target.value || '').trim();
          const val = raw === '' ? 0 : (Number(raw) || 0);
          globalConfig[prop] = val;
          if (propCompat) globalConfig[propCompat] = val;
          saveAndSyncConfig();
        };
        el.addEventListener('input', update);
        el.addEventListener('change', update);
      }
    };

    bindRadarCheck(chkGlobalShiny, 'snipeAnyShiny');
    bindNum(cfgShinyCoins, 'maxPriceShinyGold');
    bindNum(cfgShinyGemas, 'maxPriceShinyGems', 'maxPriceShinyDiamonds');

    bindRadarCheck(chkGlobalP5, 'snipeAnyP5');
    bindNum(cfgP5Coins, 'maxPriceP5Gold');
    bindNum(cfgP5Gemas, 'maxPriceP5Gems', 'maxPriceP5Diamonds');

    bindRadarCheck(chkGlobalNote, 'snipeByNote');
    bindNum(cfgNoteVal, 'minNote');
    bindNum(cfgNoteCoins, 'maxPriceNoteGold');
    bindNum(cfgNoteGemas, 'maxPriceNoteGems', 'maxPriceNoteDiamonds');

    // Filtro (não consome slot): Radar ignora variantes Outland
    if (chkGlobalIgnoreOutland) {
      chkGlobalIgnoreOutland.addEventListener('change', (e) => {
        globalConfig.ignoreOutland = Boolean(e.target.checked);
        saveAndSyncConfig();
      });
    }
  }
  bindGlobalConfig();

  function applyConfigToUI(cfg) {
    if (!cfg) return;
    globalConfig = Object.assign(globalConfig, cfg);
    globalConfig.autoMaxAffordable = true; // Calibração nativa

    // Sanitização de migração de defaults legados (10 ou 25 gemas antigos herdados):
    if (globalConfig.maxPriceShinyGems === 10 && (!cfgShinyGemas || !cfgShinyGemas.value)) {
      globalConfig.maxPriceShinyGems = 0;
      globalConfig.maxPriceShinyDiamonds = 0;
    }
    if (globalConfig.maxPriceP5Gems === 25 && (!cfgP5Gemas || !cfgP5Gemas.value)) {
      globalConfig.maxPriceP5Gems = 0;
      globalConfig.maxPriceP5Diamonds = 0;
    }
    if (globalConfig.maxPriceNoteGems === 10 && (!cfgNoteGemas || !cfgNoteGemas.value)) {
      globalConfig.maxPriceNoteGems = 0;
      globalConfig.maxPriceNoteDiamonds = 0;
    }

    if (chkGlobalShiny) chkGlobalShiny.checked = Boolean(globalConfig.snipeAnyShiny);
    if (cfgShinyCoins) cfgShinyCoins.value = (globalConfig.maxPriceShinyGold > 0) ? globalConfig.maxPriceShinyGold : '';
    if (cfgShinyGemas) cfgShinyGemas.value = (globalConfig.maxPriceShinyGems > 0 ? globalConfig.maxPriceShinyGems : (globalConfig.maxPriceShinyDiamonds > 0 ? globalConfig.maxPriceShinyDiamonds : ''));

    if (chkGlobalP5) chkGlobalP5.checked = Boolean(globalConfig.snipeAnyP5);
    if (cfgP5Coins) cfgP5Coins.value = (globalConfig.maxPriceP5Gold > 0) ? globalConfig.maxPriceP5Gold : '';
    if (cfgP5Gemas) cfgP5Gemas.value = (globalConfig.maxPriceP5Gems > 0 ? globalConfig.maxPriceP5Gems : (globalConfig.maxPriceP5Diamonds > 0 ? globalConfig.maxPriceP5Diamonds : ''));

    if (chkGlobalNote) chkGlobalNote.checked = Boolean(globalConfig.snipeByNote);
    if (cfgNoteVal && globalConfig.minNote !== undefined) cfgNoteVal.value = globalConfig.minNote;
    if (cfgNoteCoins) cfgNoteCoins.value = (globalConfig.maxPriceNoteGold > 0) ? globalConfig.maxPriceNoteGold : '';
    if (cfgNoteGemas) cfgNoteGemas.value = (globalConfig.maxPriceNoteGems > 0 ? globalConfig.maxPriceNoteGems : (globalConfig.maxPriceNoteDiamonds > 0 ? globalConfig.maxPriceNoteDiamonds : ''));

    if (chkGlobalIgnoreOutland) chkGlobalIgnoreOutland.checked = Boolean(globalConfig.ignoreOutland);

    updateSlotsDisplay();
  }

  // Carregamento inicial do Storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([
      'rotom_sniper_enabled',
      'rotom_sniper_rules',
      'rotom_sniper_config',
      'rotom_sniper_logs',
      'rotom_player_gold',
      'rotom_player_orbs',
      'rotom_player_diamonds',
      'rotom_player_vip',
      'rotom_my_listings',
      'rotom_market_catalog',
      'rotom_item_offers',
      'rotom_items_dynamic',
      'rotom_items_names',
      'rotom_rmt_catalog'
    ], (result) => {
      // Itens novos do jogo aprendidos pela página (items_db.js só tem a curadoria)
      if (Array.isArray(result.rotom_items_dynamic) && typeof window.registerRotomItems === 'function') {
        window.registerRotomItems(result.rotom_items_dynamic);
      }
      // E o nome que o jogo mostra para cada um (tradução, Shiny Stone por tipo, casas, skins...)
      if (result.rotom_rmt_catalog && Array.isArray(result.rotom_rmt_catalog.items) && typeof window.registerRotomRmtCatalog === 'function') {
        window.registerRotomRmtCatalog(result.rotom_rmt_catalog.items);
      }
      if (result.rotom_items_names && typeof window.registerRotomNames === 'function') {
        window.registerRotomNames(result.rotom_items_names);
      }
      if (result.rotom_player_vip !== undefined) {
        isPlayerVip = Boolean(result.rotom_player_vip);
        updateSlotsDisplay();
      }
      if (result.rotom_sniper_enabled !== undefined) {
        isSniperEnabled = Boolean(result.rotom_sniper_enabled);
        if (toggleMasterSniper) toggleMasterSniper.checked = isSniperEnabled;
      }
      if (Array.isArray(result.rotom_sniper_rules)) {
        let needsSync = false;
        sniperRules = result.rotom_sniper_rules.map(r => {
          const isJunkIcon = !r.icon || r.icon.indexOf('icon16') !== -1 || r.icon.indexOf('icon48') !== -1 || r.icon.indexOf('icons/') !== -1;
          if (typeof window.getRotomItem === 'function') {
            const it = window.getRotomItem(r.targetId) || window.getRotomItem(r.targetName);
            if (it && it.icon && (isJunkIcon || r.icon !== it.icon)) {
              r.icon = it.icon;
              needsSync = true;
            }
          }

          // Garantia de separação estrita de moedas (Coins vs Gemas)
          if (r.maxPriceGold === undefined && r.maxPrice !== undefined) {
            const isLegacyOrb = (r.currency === 'orb' || r.currency === 'gemas' || r.currency === 'pontos');
            r.maxPriceGold = isLegacyOrb ? 0 : (Number(r.maxPrice) || 0);
            r.maxPriceGems = isLegacyOrb ? (Number(r.maxPrice) || 0) : 0;
            r.maxPriceDiamonds = r.maxPriceGems;
            needsSync = true;
          } else {
            r.maxPriceGold = Number(r.maxPriceGold) || 0;
            r.maxPriceGems = Number(r.maxPriceGems !== undefined ? r.maxPriceGems : (r.maxPriceDiamonds || 0));
            r.maxPriceDiamonds = r.maxPriceGems;
          }

          return r;
        });
        if (needsSync) {
          saveAndSyncRules();
        }
        renderRules();
      }
      if (result.rotom_sniper_config) {
        applyConfigToUI(result.rotom_sniper_config);
      }
      if (Array.isArray(result.rotom_sniper_logs)) {
        sniperLogs = result.rotom_sniper_logs;
        renderLogs();
      }
      const gold = result.rotom_player_gold;
      const gems = result.rotom_player_orbs !== undefined ? result.rotom_player_orbs : 0;
      const diamonds = result.rotom_player_diamonds !== undefined ? result.rotom_player_diamonds : 0;
      updateBalanceDisplay(gold, gems, diamonds);

      if (Array.isArray(result.rotom_my_listings)) {
        myListings = result.rotom_my_listings;
        renderMyListings();
      }
      if (result.rotom_market_catalog && typeof result.rotom_market_catalog === 'object') {
        communityCatalog = result.rotom_market_catalog;
        renderCommunityCatalog();
      }
      if (result.rotom_item_offers && typeof result.rotom_item_offers === 'object') {
        currentItemOffersData = result.rotom_item_offers;
        renderItemOffersModal();
      }
    });

    // Escuta alterações em tempo real no storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes.rotom_player_vip !== undefined) {
        isPlayerVip = Boolean(changes.rotom_player_vip.newValue);
        updateSlotsDisplay();
        renderRules();
      }
      if (changes.rotom_sniper_rules) {
        const raw = changes.rotom_sniper_rules.newValue || [];
        sniperRules = raw.map(r => {
          if (!r.icon && typeof window.getRotomItem === 'function') {
            const it = window.getRotomItem(r.targetId) || window.getRotomItem(r.targetName);
            if (it && it.icon) r.icon = it.icon;
          }
          return r;
        });
        renderRules();
      }
      if (changes.rotom_sniper_logs) {
        sniperLogs = changes.rotom_sniper_logs.newValue || [];
        renderLogs();
      }
      if (changes.rotom_player_gold || changes.rotom_player_orbs || changes.rotom_player_diamonds) {
        chrome.storage.local.get(['rotom_player_gold', 'rotom_player_orbs', 'rotom_player_diamonds'], (res) => {
          const gold = res.rotom_player_gold;
          const gems = res.rotom_player_orbs !== undefined ? res.rotom_player_orbs : 0;
          const diamonds = res.rotom_player_diamonds !== undefined ? res.rotom_player_diamonds : 0;
          updateBalanceDisplay(gold, gems, diamonds);
        });
      }
      if (changes.rotom_sniper_enabled && toggleMasterSniper) {
        isSniperEnabled = Boolean(changes.rotom_sniper_enabled.newValue);
        toggleMasterSniper.checked = isSniperEnabled;
      }
      if (changes.rotom_pix_config && changes.rotom_pix_config.newValue) {
        currentPixConfig = changes.rotom_pix_config.newValue;
        if (modalPix && modalPix.classList.contains('open')) {
          updatePixUI();
        }
      }
      if (changes.rotom_my_listings) {
        myListings = Array.isArray(changes.rotom_my_listings.newValue) ? changes.rotom_my_listings.newValue : [];
        renderMyListings();
      }
      if (changes.rotom_items_dynamic && typeof window.registerRotomItems === 'function') {
        if (window.registerRotomItems(changes.rotom_items_dynamic.newValue || []) > 0) {
          // O nome do jogo pode ter chegado antes do item: reaplica os nomes guardados.
          chrome.storage.local.get(['rotom_items_names'], (r) => {
            if (r.rotom_items_names && typeof window.registerRotomNames === 'function') window.registerRotomNames(r.rotom_items_names);
            renderCommunityCatalog();
          });
        }
      }
      if (changes.rotom_rmt_catalog && changes.rotom_rmt_catalog.newValue && typeof window.registerRotomRmtCatalog === 'function') {
        if (window.registerRotomRmtCatalog(changes.rotom_rmt_catalog.newValue.items || []) > 0) {
          chrome.storage.local.get(['rotom_items_names'], (r) => {
            if (r.rotom_items_names && typeof window.registerRotomNames === 'function') window.registerRotomNames(r.rotom_items_names);
            renderCommunityCatalog();
            renderRules();
            renderSuggestions(inputSearchItem ? inputSearchItem.value.trim() : '');
          });
        }
      }
      if (changes.rotom_items_names && typeof window.registerRotomNames === 'function') {
        if (window.registerRotomNames(changes.rotom_items_names.newValue || {}) > 0) {
          renderCommunityCatalog();
          renderRules();
        }
      }
      if (changes.rotom_market_catalog) {
        communityCatalog = (changes.rotom_market_catalog.newValue && typeof changes.rotom_market_catalog.newValue === 'object')
          ? changes.rotom_market_catalog.newValue
          : {};
        renderCommunityCatalog();
      }
      if (changes.rotom_item_offers) {
        currentItemOffersData = changes.rotom_item_offers.newValue || null;
        renderItemOffersModal();
      }
    });

  }

  // =========================================================================
  // 8. MODAL PIX (ME PAGUE UM CAFÉ & QR CODE NATIVO)
  // =========================================================================
  const btnOpenPix = document.getElementById('btn-open-pix');
  const modalPix = document.getElementById('modal-pix');
  const btnClosePix = document.getElementById('btn-close-pix');
  const btnPixFecharBottom = document.getElementById('btn-pix-fechar-bottom');
  const pixQrcodeContainer = document.getElementById('pix-qrcode-container');
  const pixKeyDisplay = document.getElementById('pix-key-display');
  const btnCopyPixKey = document.getElementById('btn-copy-pix-key');
  const btnCopyPixPayload = document.getElementById('btn-copy-pix-payload');

  const OFFICIAL_PIX_KEY = '46196ec9-a442-41d9-b350-d0d1123987a7';
  const currentPixConfig = {
    key: OFFICIAL_PIX_KEY,
    name: 'DEV POKEIDLE',
    city: 'BRASIL'
  };

  function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= (data.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function emvTlv(tag, value) {
    const val = String(value || '');
    const len = String(val.length).padStart(2, '0');
    return `${tag}${len}${val}`;
  }

  function generatePixPayload(key, name, city) {
    const cleanKey = String(key || OFFICIAL_PIX_KEY).trim();
    if (!cleanKey) return '';
    const cleanName = String(name || 'DEV POKEIDLE').trim().substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanCity = String(city || 'BRASIL').trim().substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const gui = emvTlv('00', 'br.gov.bcb.pix');
    const pixKey = emvTlv('01', cleanKey);
    const merchantAcc = emvTlv('26', gui + pixKey);
    const cat = emvTlv('52', '0000');
    const curr = emvTlv('53', '986');
    const country = emvTlv('58', 'BR');
    const mName = emvTlv('59', cleanName || 'DEV POKEIDLE');
    const mCity = emvTlv('60', cleanCity || 'BRASIL');
    const addData = emvTlv('62', emvTlv('05', '***'));

    const raw = emvTlv('00', '01') + emvTlv('01', '12') + merchantAcc + cat + curr + country + mName + mCity + addData + '6304';
    return raw + crc16(raw);
  }

  function updatePixUI() {
    const key = currentPixConfig.key || OFFICIAL_PIX_KEY;
    if (pixKeyDisplay) pixKeyDisplay.textContent = key;
    const payload = generatePixPayload(key, currentPixConfig.name, currentPixConfig.city);
    renderPixQrCode(payload || key);
  }

  function renderPixQrCode(payloadText) {
    if (!pixQrcodeContainer) return;
    if (!payloadText) return;

    try {
      if (typeof qrcode === 'function') {
        const qr = qrcode(0, 'M');
        qr.addData(payloadText);
        qr.make();
        const svgTag = qr.createSvgTag(4, 2);
        pixQrcodeContainer.innerHTML = svgTag;
        const svgEl = pixQrcodeContainer.querySelector('svg');
        if (svgEl) {
          svgEl.style.width = '170px';
          svgEl.style.height = '170px';
          svgEl.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('[Rotom Cockpit]: Erro ao gerar QR Code do Pix:', err);
      pixQrcodeContainer.innerHTML = '<span style="color: #c00; font-size: 10px;">Erro ao gerar QR Code</span>';
    }
  }

  function copyTextWithFeedback(btn, text) {
    if (!text) return;
    const oldText = btn.textContent;
    const restore = () => {
      setTimeout(() => { btn.textContent = oldText; }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copiado!';
        restore();
      }).catch(() => {
        fallbackCopy(text);
        btn.textContent = 'Copiado!';
        restore();
      });
    } else {
      fallbackCopy(text);
      btn.textContent = 'Copiado!';
      restore();
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function openPixModal() {
    if (modalPix) modalPix.classList.add('open');
    updatePixUI();
  }

  function closePixModal() {
    if (modalPix) modalPix.classList.remove('open');
  }

  if (btnOpenPix) btnOpenPix.addEventListener('click', openPixModal);
  if (btnClosePix) btnClosePix.addEventListener('click', closePixModal);
  if (btnPixFecharBottom) btnPixFecharBottom.addEventListener('click', closePixModal);

  if (modalPix) {
    modalPix.addEventListener('click', (e) => {
      if (e.target === modalPix) closePixModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalPix && modalPix.classList.contains('open')) {
      closePixModal();
    }
  });

  if (btnCopyPixKey) {
    btnCopyPixKey.addEventListener('click', () => {
      copyTextWithFeedback(btnCopyPixKey, currentPixConfig.key);
    });
  }

  if (btnCopyPixPayload) {
    btnCopyPixPayload.addEventListener('click', () => {
      const payload = generatePixPayload(currentPixConfig.key, currentPixConfig.name, currentPixConfig.city) || currentPixConfig.key;
      copyTextWithFeedback(btnCopyPixPayload, payload);
    });
  }

  // =========================================================================
  // 9. MERCADO DA COMUNIDADE & MEUS ANÚNCIOS (CENTRAL STANDALONE)
  // =========================================================================
  const viewSniper = document.getElementById('view-sniper');
  const viewMarket = document.getElementById('view-market');

  const tabNavSniper = document.getElementById('tab-nav-sniper');
  const tabNavMarket = document.getElementById('tab-nav-market');

  const subtabMyListings = document.getElementById('subtab-my-listings');
  const subtabCommunityItems = document.getElementById('subtab-community-items');
  const panelMyListings = document.getElementById('panel-my-listings');
  const panelCommunityItems = document.getElementById('panel-community-items');
  const btnRefreshMarket = document.getElementById('btn-refresh-market');

  const lblMyListingsSummary = document.getElementById('lbl-my-listings-summary');
  const containerMyListingsList = document.getElementById('container-my-listings-list');

  const inputSearchMarket = document.getElementById('input-search-market');
  const marketCatButtons = document.querySelectorAll('.market-cat-btn');
  const containerCommunityItemsList = document.getElementById('container-community-items-list');

  const modalItemOffers = document.getElementById('modal-item-offers');
  const offersModalIcon = document.getElementById('offers-modal-icon');
  const offersModalTitle = document.getElementById('offers-modal-title');
  const offersModalSub = document.getElementById('offers-modal-sub');
  const btnOffersGold = document.getElementById('btn-offers-gold');
  const btnOffersGems = document.getElementById('btn-offers-gems');
  const btnQuickCreateRule = document.getElementById('btn-quick-create-rule');
  const containerOffersSellers = document.getElementById('container-offers-sellers');
  const btnCloseOffersModal = document.getElementById('btn-close-offers-modal');
  const btnCloseOffersBottom = document.getElementById('btn-close-offers-bottom');

  // --- NAVEGAÇÃO PRINCIPAL ENTRE AS ABAS ---
  function switchMainView(view) {
    const tabs = [
      { id: 'sniper', btn: tabNavSniper, el: viewSniper, display: 'grid' },
      { id: 'market', btn: tabNavMarket, el: viewMarket, display: 'flex' }
    ];

    tabs.forEach(t => {
      const active = (t.id === view);
      if (t.btn) {
        t.btn.classList.toggle('on', active);
        t.btn.classList.toggle('apagado', !active);
      }
      if (t.el) {
        t.el.style.display = active ? t.display : 'none';
      }
    });

    if (view === 'market') {
      if (!myListings || myListings.length === 0) {
        sendToActiveTab({ action: 'FETCH_MY_LISTINGS' });
      }
      if (!communityCatalog || Object.keys(communityCatalog).length === 0) {
        sendToActiveTab({ action: 'FETCH_COMMUNITY_CATALOG' });
      }
    }
  }

  if (tabNavSniper) tabNavSniper.addEventListener('click', () => switchMainView('sniper'));
  if (tabNavMarket) tabNavMarket.addEventListener('click', () => switchMainView('market'));

  // --- SUB-NAVEGAÇÃO DO MERCADO ---
  function switchMarketSubtab(sub) {
    if (sub === 'catalog') {
      if (subtabMyListings) { subtabMyListings.classList.remove('on'); subtabMyListings.classList.add('apagado'); }
      if (subtabCommunityItems) { subtabCommunityItems.classList.add('on'); subtabCommunityItems.classList.remove('apagado'); }
      if (panelMyListings) panelMyListings.style.display = 'none';
      if (panelCommunityItems) panelCommunityItems.style.display = 'flex';
      renderCommunityCatalog();
    } else {
      if (subtabCommunityItems) { subtabCommunityItems.classList.remove('on'); subtabCommunityItems.classList.add('apagado'); }
      if (subtabMyListings) { subtabMyListings.classList.add('on'); subtabMyListings.classList.remove('apagado'); }
      if (panelCommunityItems) panelCommunityItems.style.display = 'none';
      if (panelMyListings) panelMyListings.style.display = 'flex';
      renderMyListings();
    }
  }

  if (subtabMyListings) subtabMyListings.addEventListener('click', () => switchMarketSubtab('my'));
  if (subtabCommunityItems) subtabCommunityItems.addEventListener('click', () => switchMarketSubtab('catalog'));

  if (btnRefreshMarket) {
    btnRefreshMarket.addEventListener('click', () => {
      const origText = btnRefreshMarket.textContent;
      btnRefreshMarket.textContent = '🔄 Atualizando...';
      btnRefreshMarket.disabled = true;

      sendToActiveTab({ action: 'FETCH_MY_LISTINGS' });
      sendToActiveTab({ action: 'FETCH_COMMUNITY_CATALOG' });

      setTimeout(() => {
        btnRefreshMarket.textContent = origText;
        btnRefreshMarket.disabled = false;
      }, 1200);
    });
  }

  // --- MEUS ANÚNCIOS À VENDA ---
  function renderMyListings() {
    if (!containerMyListingsList) return;

    if (lblMyListingsSummary) {
      const count = myListings ? myListings.length : 0;
      lblMyListingsSummary.textContent = `${count} anúncio${count === 1 ? '' : 's'} ativo${count === 1 ? '' : 's'}`;
    }

    if (!myListings || myListings.length === 0) {
      containerMyListingsList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--sobre-mad-dim);">
          <p style="font-size: 11px; margin: 0 0 6px 0;">Você não possui nenhum anúncio ativo no mercado da comunidade.</p>
          <span style="font-size: 9.5px; opacity: 0.75;">Quando colocar itens ou Pokémons à venda no jogo, eles aparecerão aqui organizados com opção de cancelamento imediato.</span>
        </div>
      `;
      return;
    }

    containerMyListingsList.innerHTML = '';
    myListings.forEach(an => {
      const card = document.createElement('div');
      card.className = 'my-listing-card';

      // Identificação inteligente: Pokémon vs Item vs Caixa Especial vs Diamante
      let itemName = 'Item Desconhecido';
      let itemIcon = 'icons/ouro.png';
      let badgeExtra = '';
      let categorySub = '';

      const f = an.ficha || an.poke || an.item || {};
      const isPoke = an.tipo === 'pokemon' || Boolean(f.speciesId || f.pokemonId || f.pId || f.level !== undefined || f.ivTotal || f.qualidade || f.quality);

      if (isPoke) {
        itemName = f.nome || f.name || an.nome || 'Pokémon';
        const isShiny = Boolean(f.shiny);
        itemIcon = (typeof window.getRotomPokemonSprite === 'function')
          ? window.getRotomPokemonSprite(f, isShiny)
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${f.speciesId || f.pokemonId || 1}.png`;

        if (isShiny) badgeExtra += '<span class="shiny-tag" style="font-size: 8px; padding: 1px 4px; background: #e6b800; color: #000; font-weight: 900; border-radius: 0px;">★ SHINY</span> ';
        if (f.level) categorySub += `Nv. ${f.level} `;

        // Atributos Oficiais do PokéIdle: P, Q, IV e N
        if (typeof window.getRotomPokemonAttributesHtml === 'function') {
          badgeExtra += window.getRotomPokemonAttributesHtml(f, { compacto: true });
        } else {
          if (f.potencia && f.potencia >= 5) badgeExtra += '<span class="p5-tag" style="font-size: 8px; padding: 1px 4px; background: #9b5de5; color: #fff; font-weight: 900; border-radius: 0px;">P5</span> ';
          else if (f.potencia) badgeExtra += `<span style="font-size: 8px; color: var(--rx-luz); font-weight: 700;">P${f.potencia}</span> `;
          if (f.nota) categorySub += `· Nota ${Number(f.nota).toFixed(1)}`;
        }
      } else {
        // Item ou Caixa
        const itemId = Number(an.itemId || f.id || 0);

        if (f.caixaTipo || f.caixaId) {
          itemName = f.caixaTipo === 'founder' ? 'Founder Box' : (f.caixaTipo === 'cofounder' ? 'Co-Founder Box' : (f.nome || 'Box Especial'));
          itemIcon = f.caixaTipo === 'founder' ? 'https://pokeidle.io/img/itens/caixa-fundador.png' : 'https://pokeidle.io/img/itens/caixa-cofundador.png';
          categorySub = 'Caixa Especial';
          if (f.serie) badgeExtra += `<span style="font-size: 8px; color: var(--ouro); font-weight: 700;">#${f.serie}</span>`;
        } else {
          let rotomIt = null;
          if (typeof window.getRotomItem === 'function') {
            rotomIt = window.getRotomItem(itemId) || window.getRotomItem(f.nome || an.itemNome);
          }
          if (rotomIt) {
            itemName = rotomIt.name;
            itemIcon = typeof window.getItemIconUrl === 'function' ? window.getItemIconUrl(rotomIt) : (rotomIt.icon || 'icons/ouro.png');
            categorySub = rotomIt.categoryLabel || rotomIt.category || 'Item';
            if (rotomIt.type) badgeExtra += `<span style="font-size: 7.5px; padding: 1px 4px; background: rgba(255,255,255,0.15); border-radius: 0px;">${rotomIt.type}</span>`;
          } else {
            itemName = f.nome || an.itemNome || `Item #${itemId || '?'}`;
            itemIcon = typeof window.getItemIconUrl === 'function' ? window.getItemIconUrl(itemId) : 'icons/ouro.png';
            categorySub = 'Item';
          }
        }
      }

      const isGemas = (an.moeda === 'orb' || an.moeda === 'gems' || an.moeda === 'diamonds');
      const moedaIcon = isGemas ? 'icons/orbe.png' : 'icons/ouro.png';
      const moedaNome = isGemas ? 'Gemas' : 'GP';
      const precoUnit = Number(an.preco || an.unitPrice || 0);
      const qtd = Number(an.qtd || an.quantidade || 1);
      const precoTotal = precoUnit * qtd;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="vao" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 2px; border-radius: 0px;">
            <img src="${itemIcon}" style="max-width: 40px; max-height: 40px; object-fit: contain;" alt="${itemName}">
          </div>
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
            <span style="color: #fff; font-weight: 700; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemName}">${itemName}</span>
            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
              ${categorySub ? `<span style="font-size: 8px; color: var(--sobre-mad-dim);">${categorySub}</span>` : ''}
              ${badgeExtra}
            </div>
            <span style="font-size: 8.5px; color: var(--sobre-mad);">Qtd: <b style="color: #fff;">${qtd.toLocaleString()}</b> un</span>
          </div>
        </div>

        <div class="vao" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 0px;">
          <div style="display: flex; flex-direction: column; gap: 1px;">
            <span style="font-size: 8px; color: var(--vao-dim); text-transform: uppercase;">Preço Unit / Total:</span>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 9.5px; color: ${isGemas ? 'var(--gemas)' : 'var(--coins)'}; font-variant-numeric: tabular-nums;">
              <img src="${moedaIcon}" style="width: 12px; height: 12px; object-fit: contain;">
              <b>${precoUnit.toLocaleString()}</b> ${moedaNome}
              <span style="color: var(--vao-dim); font-size: 8px;">(Total: ${precoTotal.toLocaleString()})</span>
            </div>
          </div>
          <button type="button" class="btn btn-cancelar btn-mini btn-cancel-listing" data-id="${an.id}" title="Cancelar anúncio e devolver para o inventário">
            Cancelar
          </button>
        </div>
      `;

      const btnCancel = card.querySelector('.btn-cancel-listing');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          const anId = btnCancel.getAttribute('data-id');
          if (!anId) return;

          btnCancel.textContent = 'Cancelando...';
          btnCancel.disabled = true;
          sendToActiveTab({ action: 'CANCEL_MARKET_OFFER', id: anId });
        });
      }

      containerMyListingsList.appendChild(card);
    });
  }

  // --- CATÁLOGO DA COMUNIDADE ---
  if (marketCatButtons) {
    marketCatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        marketCatButtons.forEach(b => {
          b.classList.remove('on');
          b.classList.add('apagado');
        });
        btn.classList.add('on');
        btn.classList.remove('apagado');
        currentMarketFilterCat = btn.getAttribute('data-cat') || 'all';
        renderCommunityCatalog();
      });
    });
  }

  if (inputSearchMarket) {
    inputSearchMarket.addEventListener('input', () => {
      renderCommunityCatalog();
    });
  }

  // Categorias da vitrine na ordem do jogo; categoria nova que o jogo criar cai em "Outros".
  const RMT_SECOES = [
    { id: 'stone', title: '💎 Pedras de Evolução' },
    { id: 'fragment', title: '🧩 Fragmentos' },
    { id: 'boss', title: '🏆 Boss Tokens' },
    { id: 'casa', title: '🏡 Casas' },
    { id: 'bicicleta', title: '🚲 Bicicletas' },
    { id: 'ticket', title: '🎫 Mystic Ticket' }
  ];
  const RMT_SECOES_IDS = RMT_SECOES.map(s => s.id);
  const secaoRmt = (it) => {
    const cat = String(it.category || '').toLowerCase();
    return RMT_SECOES_IDS.includes(cat) ? cat : 'outros';
  };

  function renderCommunityCatalog() {
    if (!containerCommunityItemsList) return;

    // Só o que o RMT aceita hoje (lista oficial do welcome; antes dele, o retrato do items_db.js)
    const allItems = typeof window.getRmtItems === 'function' ? window.getRmtItems() : (window.POKEIDLE_ITEMS_DB || []);

    // Chip de categoria sem nenhum item no RMT fica escondido
    const presentes = new Set(allItems.map(secaoRmt));
    marketCatButtons.forEach(btn => {
      const c = btn.getAttribute('data-cat');
      if (c && c !== 'all') btn.style.display = presentes.has(c) ? '' : 'none';
    });

    const filterText = (inputSearchMarket ? inputSearchMarket.value : '').toLowerCase().trim();

    // Filtra itens conforme categoria e busca
    let filtered = allItems.filter(it => {
      if (currentMarketFilterCat !== 'all' && secaoRmt(it) !== currentMarketFilterCat) return false;

      // Filtro de Texto
      if (filterText) {
        const nameMatch = [it.name || ''].concat(it.aliases || []).join('\n').toLowerCase().includes(filterText);
        const catMatch = (it.categoryLabel || it.category || '').toLowerCase().includes(filterText);
        const typeMatch = (it.type || it.rmtTipo || '').toLowerCase().includes(filterText);
        if (!nameMatch && !catMatch && !typeMatch) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      containerCommunityItemsList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--sobre-mad-dim);">
          Nenhum item encontrado com os filtros selecionados.
        </div>
      `;
      return;
    }

    containerCommunityItemsList.innerHTML = '';

    if (currentMarketFilterCat === 'all' && !filterText) {
      RMT_SECOES.concat([{ id: 'outros', title: '📦 Outros' }]).forEach(sec => {
        const sectionItems = filtered.filter(it => secaoRmt(it) === sec.id);
        if (sectionItems.length > 0) {
          const header = document.createElement('div');
          header.className = 'catalog-section-title';
          header.innerHTML = `<span>${sec.title}</span><span style="font-size: 8.5px; opacity: 0.75;">${sectionItems.length} itens</span>`;
          containerCommunityItemsList.appendChild(header);

          sectionItems.forEach(it => {
            containerCommunityItemsList.appendChild(createCommunityItemCard(it));
          });
        }
      });
    } else {
      // Ordenação: Itens que possuem dados no communityCatalog vêm primeiro
      filtered.sort((a, b) => {
        const dataA = communityCatalog[a.id];
        const dataB = communityCatalog[b.id];
        const hasA = dataA && (dataA.minGold || dataA.minOrb || dataA.total || dataA.anuncios);
        const hasB = dataB && (dataB.minGold || dataB.minOrb || dataB.total || dataB.anuncios);
        if (hasA && !hasB) return -1;
        if (!hasA && hasB) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      filtered.forEach(it => {
        containerCommunityItemsList.appendChild(createCommunityItemCard(it));
      });
    }
  }

  function createCommunityItemCard(it) {
    const card = document.createElement('div');
    card.className = 'community-item-card';

    const iconUrl = typeof window.getItemIconUrl === 'function'
      ? window.getItemIconUrl(it)
      : (it.icon || 'icons/ouro.png');

    const data = communityCatalog[it.id] || {};
    const minGold = Number(data.minGold || data.gold || 0);
    const minOrb = Number(data.minOrb || data.gems || data.orb || 0);
    const totalOffers = Number(data.anuncios || data.total || data.count || 0);

    const goldDisplay = minGold > 0 ? `${minGold.toLocaleString()} GP` : '—';
    const gemsDisplay = minOrb > 0 ? `${minOrb.toLocaleString()} Gemas` : '—';

    let typeTag = '';
    if (it.type) {
      typeTag = `<span style="font-size: 7.5px; padding: 1px 5px; background: rgba(0,0,0,0.35); border: 1px solid var(--mad-linha); color: var(--ouro); font-weight: 700;">${it.type}</span>`;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="vao" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 2px;">
          <img src="${iconUrl}" style="max-width: 34px; max-height: 34px; object-fit: contain;" alt="${it.name}">
        </div>
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <span style="color: #fff; font-weight: 700; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${it.name}">${it.name}</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 8px; color: var(--sobre-mad-dim);">${it.categoryLabel || it.category || 'Item'}</span>
            ${typeTag}
          </div>
        </div>
      </div>

      <div class="vao" style="padding: 5px 8px; display: flex; flex-direction: column; gap: 3px; border-radius: 0px;">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9px;">
          <span style="color: var(--vao-dim); display: flex; align-items: center; gap: 3px;">
            <img src="icons/ouro.png" style="width: 11px; height: 11px; object-fit: contain;"> Menor em Coins:
          </span>
          <b style="color: ${minGold > 0 ? 'var(--coins)' : 'var(--vao-dim)'}; font-variant-numeric: tabular-nums;">${goldDisplay}</b>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9px;">
          <span style="color: var(--vao-dim); display: flex; align-items: center; gap: 3px;">
            <img src="icons/orbe.png" style="width: 11px; height: 11px; object-fit: contain;"> Menor em Gemas:
          </span>
          <b style="color: ${minOrb > 0 ? 'var(--gemas)' : 'var(--vao-dim)'}; font-variant-numeric: tabular-nums;">${gemsDisplay}</b>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; padding-top: 2px;">
        <span style="font-size: 8.5px; ${totalOffers > 0 ? 'color: var(--verde); font-weight: 700;' : 'color: var(--sobre-mad-dim);'}">
          ${totalOffers > 0 ? `🟢 ${totalOffers} oferta${totalOffers > 1 ? 's' : ''}` : '⚪ Sem ofertas'}
        </span>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn btn-roxo btn-mini btn-open-item-offers" data-id="${it.id}" style="font-size: 8px; padding: 0 6px; height: 20px;" title="Ver ofertas deste item na comunidade">
            Ver Ofertas
          </button>
          <button type="button" class="btn apagado btn-mini btn-quick-sniper-rule" data-id="${it.id}" style="font-size: 8px; padding: 0 6px; height: 20px;" title="Criar regra de sniper no painel">
            + Sniper
          </button>
        </div>
      </div>
    `;

    const btnOffers = card.querySelector('.btn-open-item-offers');
    if (btnOffers) {
      btnOffers.addEventListener('click', (e) => {
        e.stopPropagation();
        openItemOffersModal(it);
      });
    }

    const btnQuick = card.querySelector('.btn-quick-sniper-rule');
    if (btnQuick) {
      btnQuick.addEventListener('click', (e) => {
        e.stopPropagation();
        configureSniperRuleFromItem(it, minGold, minOrb);
      });
    }

    return card;
  }

  // --- CONFIGURAR REGRA DE SNIPER A PARTIR DO ITEM DO CATÁLOGO ---
  function configureSniperRuleFromItem(it, minGold, minOrb) {
    if (!it) return;

    // Volta para o Painel Sniper
    switchMainView('sniper');

    // Seleciona o item no form
    if (typeof selectItemForNewRule === 'function') {
      selectItemForNewRule(it);
    } else {
      selectedItemObj = it;
      if (lblSelectedName) lblSelectedName.textContent = it.name;
      if (lblSelectedCat) lblSelectedCat.textContent = it.categoryLabel || it.category || 'item';
      if (imgSelectedItem) {
        imgSelectedItem.src = typeof window.getItemIconUrl === 'function' ? window.getItemIconUrl(it) : (it.icon || '');
      }
      if (boxSelectedPreview) boxSelectedPreview.style.display = 'flex';
      if (inputSearchItem) inputSearchItem.value = it.name;
    }

    // Preenche com o menor preço do mercado se disponível
    if (inputRuleCoins && minGold > 0) inputRuleCoins.value = minGold;
    if (inputRuleGemas && minOrb > 0) inputRuleGemas.value = minOrb;

    // Rola até o topo e foca o campo de quantidade
    if (inputRuleQty) inputRuleQty.focus();
  }

  // --- MODAL DE OFERTAS DO ITEM ESPECÍFICO ---
  function openItemOffersModal(it) {
    if (!it) return;
    if (!modalItemOffers) return;
    selectedMarketItem = it;

    if (offersModalIcon) {
      offersModalIcon.src = typeof window.getItemIconUrl === 'function' ? window.getItemIconUrl(it) : (it.icon || 'icons/ouro.png');
    }
    if (offersModalTitle) offersModalTitle.textContent = it.name;
    if (offersModalSub) offersModalSub.textContent = `Categoria: ${it.categoryLabel || it.category || 'Item'}`;

    currentOffersMoeda = 'gold';
    if (btnOffersGold) { btnOffersGold.classList.add('on'); btnOffersGold.classList.remove('apagado'); }
    if (btnOffersGems) { btnOffersGems.classList.remove('on'); btnOffersGems.classList.add('apagado'); }

    modalItemOffers.classList.add('open');

    // Busca ofertas de Coins de imediato
    fetchItemOffers(it.id, 'gold');
  }

  function closeItemOffersModal() {
    if (modalItemOffers) modalItemOffers.classList.remove('open');
  }

  if (btnCloseOffersModal) btnCloseOffersModal.addEventListener('click', closeItemOffersModal);
  if (btnCloseOffersBottom) btnCloseOffersBottom.addEventListener('click', closeItemOffersModal);

  if (modalItemOffers) {
    modalItemOffers.addEventListener('click', (e) => {
      if (e.target === modalItemOffers) closeItemOffersModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalItemOffers && modalItemOffers.classList.contains('open')) {
      closeItemOffersModal();
    }
  });

  if (btnOffersGold) {
    btnOffersGold.addEventListener('click', () => {
      currentOffersMoeda = 'gold';
      btnOffersGold.classList.add('on');
      btnOffersGold.classList.remove('apagado');
      if (btnOffersGems) {
        btnOffersGems.classList.remove('on');
        btnOffersGems.classList.add('apagado');
      }
      if (selectedMarketItem) fetchItemOffers(selectedMarketItem.id, 'gold');
    });
  }

  if (btnOffersGems) {
    btnOffersGems.addEventListener('click', () => {
      currentOffersMoeda = 'orb';
      btnOffersGems.classList.add('on');
      btnOffersGems.classList.remove('apagado');
      if (btnOffersGold) {
        btnOffersGold.classList.remove('on');
        btnOffersGold.classList.add('apagado');
      }
      if (selectedMarketItem) fetchItemOffers(selectedMarketItem.id, 'orb');
    });
  }

  if (btnQuickCreateRule) {
    btnQuickCreateRule.addEventListener('click', () => {
      if (!selectedMarketItem) return;
      closeItemOffersModal();
      configureSniperRuleFromItem(selectedMarketItem, 0, 0);
    });
  }

  function fetchItemOffers(itemId, moeda) {
    if (!containerOffersSellers) return;
    const cleanMoeda = (moeda === 'gems' || moeda === 'orb') ? 'orb' : 'gold';
    currentOffersMoeda = cleanMoeda;
    const moedaLabel = cleanMoeda === 'orb' ? 'Gemas' : 'Coins (GP)';

    containerOffersSellers.innerHTML = `<div style="text-align: center; padding: 25px; color: var(--vao-dim); font-size: 10px;">Buscando ofertas em ${moedaLabel}...</div>`;
    sendToActiveTab({ action: 'FETCH_ITEM_OFFERS', itemId: Number(itemId), moeda: cleanMoeda });
  }

  function renderItemOffersModal() {
    if (!containerOffersSellers || !modalItemOffers || !modalItemOffers.classList.contains('open')) return;
    if (!selectedMarketItem) return;

    if (!currentItemOffersData) {
      containerOffersSellers.innerHTML = '<div style="text-align: center; padding: 25px; color: var(--vao-dim); font-size: 10px;">Aguardando ofertas do mercado...</div>';
      return;
    }

    // Se as ofertas forem de outro item, aguarda o pacote do item atual
    if (currentItemOffersData.itemId && Number(currentItemOffersData.itemId) !== Number(selectedMarketItem.id)) {
      return;
    }

    const offers = currentItemOffersData.linhas || currentItemOffersData.offers || [];
    const isGemas = (currentOffersMoeda === 'gems' || currentOffersMoeda === 'orb');
    const moedaIcon = isGemas ? 'icons/orbe.png' : 'icons/ouro.png';
    const moedaLabel = isGemas ? 'Gemas' : 'GP';

    if (!Array.isArray(offers) || offers.length === 0) {
      containerOffersSellers.innerHTML = `
        <div style="text-align: center; padding: 25px; color: var(--vao-dim); font-size: 10px;">
          Nenhum vendedor ofertando este item em ${moedaLabel} no momento.
        </div>
      `;
      return;
    }

    containerOffersSellers.innerHTML = '';
    offers.forEach(off => {
      const row = document.createElement('div');
      row.className = 'vao';
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.padding = '6px 8px';
      row.style.borderRadius = '0px';

      const vendedor = off.vendedor || off.seller || 'Vendedor Anônimo';
      const qtd = Number(off.qtd || off.quantidade || 1);
      const preco = Number(off.preco || off.price || 0);
      const precoTotal = preco * qtd;

      row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #fff;">${vendedor}</span>
            <span style="font-size: 8px; color: var(--sobre-mad-dim);">Qtd: <b style="color: #fff;">${qtd.toLocaleString()}</b> un</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 9.5px; color: ${isGemas ? 'var(--gemas)' : 'var(--coins)'}; font-variant-numeric: tabular-nums;">
            <img src="${moedaIcon}" style="width: 12px; height: 12px; object-fit: contain;">
            <b>${preco.toLocaleString()}</b> ${moedaLabel} / un
            ${qtd > 1 ? `<span style="font-size: 8px; color: var(--vao-dim);">(Total: ${precoTotal.toLocaleString()})</span>` : ''}
          </div>
        </div>

        <button type="button" class="btn btn-roxo btn-mini btn-buy-offer" data-id="${off.id}" style="font-size: 8.5px; height: 24px; padding: 0 8px;">
          Comprar
        </button>
      `;

      const btnBuy = row.querySelector('.btn-buy-offer');
      if (btnBuy) {
        btnBuy.addEventListener('click', () => {
          btnBuy.textContent = 'Comprando...';
          btnBuy.disabled = true;

          sendToActiveTab({
            action: 'BUY_MANUAL_OFFER',
            offerId: off.id,
            qty: qtd,
            price: preco,
            moeda: currentOffersMoeda === 'orb' ? 'orb' : 'gold',
            targetName: selectedMarketItem ? selectedMarketItem.name : '',
            seller: vendedor
          });

          setTimeout(() => {
            btnBuy.textContent = 'Enviado!';
            if (selectedMarketItem) {
              fetchItemOffers(selectedMarketItem.id, currentOffersMoeda);
            }
          }, 1000);
        });
      }

      containerOffersSellers.appendChild(row);
    });
  }

  // Verifica se foi aberto com intenção de ir para uma aba específica (ex: URL ?tab=market ou storage)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const targetTab = urlParams.get('tab');
    if (targetTab && ['sniper', 'market'].includes(targetTab)) {
      switchMainView(targetTab);
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['rotom_pending_cockpit_tab'], (res) => {
        if (res && res.rotom_pending_cockpit_tab) {
          const tab = res.rotom_pending_cockpit_tab;
          chrome.storage.local.remove('rotom_pending_cockpit_tab');
          if (['sniper', 'market'].includes(tab)) {
            switchMainView(tab);
          }
        }
      });
    }
  } catch (e) {}
});
