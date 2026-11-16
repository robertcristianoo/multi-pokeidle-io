// Catálogo Canônico Oficial do Mercado da Comunidade PokéIdle (74 Itens Negociáveis)
// Ordem de apresentação oficial:
// 1. Pedras (18 clássicas + 18 shiny stones)
// 2. TMs (AoE TM Disk, AoE TM Disk Piece, TM Disk Piece e 18 TMs Elementais)
// 3. Loots Raros (Shiny Stone Fragment, Key Fragment, Bronze Boss Token, Bicycle Fragment)
// 4. Beast Balls (Beast Ball)
// 5. Casas (Casas Comum, Incomum, Rara, Mítica, Lendária)
// 6. Boxes (Founder Box e Co-Founder Box)
// 7. Bicicletas (Bicicletas Comum, Incomum, Rara, Mítica, Lendária)
const POKEIDLE_ITEMS_DB = [{"id": 2, "name": "Ancient Stone", "icon": "/assets/stones/ancient_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "DRAGON", "npcPrice": 0}, {"id": 23, "name": "Cocoon Stone", "icon": "cocoon_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "BUG", "npcPrice": 0}, {"id": 28, "name": "Crystal Stone", "icon": "crystal_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "ICE", "npcPrice": 0}, {"id": 31, "name": "Darkness Stone", "icon": "darkness_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "DARK", "npcPrice": 0}, {"id": 40, "name": "Earth Stone", "icon": "earth_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "GROUND", "npcPrice": 0}, {"id": 45, "name": "Enigma Stone", "icon": "enigma_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "PSYCHIC", "npcPrice": 0}, {"id": 49, "name": "Feather Stone", "icon": "/assets/stones/feather_stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FLYING", "npcPrice": 0}, {"id": 53, "name": "Fire Stone", "icon": "fire_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "FIRE", "npcPrice": 0}, {"id": 66, "name": "Heart Stone", "icon": "heart_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "NORMAL", "npcPrice": 0}, {"id": 71, "name": "Ice Stone", "icon": "ice_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "ICE", "npcPrice": 0}, {"id": 76, "name": "Leaf Stone", "icon": "leaf_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "GRASS", "npcPrice": 0}, {"id": 87, "name": "Metal Stone", "icon": "/assets/stones/metal_stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "STEEL", "npcPrice": 0}, {"id": 106, "name": "Punch Stone", "icon": "punch_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "FIGHTING", "npcPrice": 0}, {"id": 109, "name": "Rock Stone", "icon": "rock_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "ROCK", "npcPrice": 0}, {"id": 209, "name": "Sun Stone", "icon": "/assets/stones/sun_stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FIRE", "npcPrice": 0}, {"id": 133, "name": "Thunder Stone", "icon": "thunder_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "ELECTRIC", "npcPrice": 0}, {"id": 139, "name": "Venom Stone", "icon": "venom_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "POISON", "npcPrice": 0}, {"id": 142, "name": "Water Stone", "icon": "water_stone.gif", "category": "stone", "categoryLabel": "Pedras", "type": "WATER", "npcPrice": 0}, {"id": 70031, "name": "Bug Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "BUG", "npcPrice": 0}, {"id": 70035, "name": "Dark Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "DARK", "npcPrice": 0}, {"id": 70034, "name": "Dragon Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "DRAGON", "npcPrice": 0}, {"id": 70024, "name": "Electric Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "ELECTRIC", "npcPrice": 0}, {"id": 70037, "name": "Fairy Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FAIRY", "npcPrice": 0}, {"id": 70026, "name": "Fighting Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FIGHTING", "npcPrice": 0}, {"id": 70021, "name": "Fire Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FIRE", "npcPrice": 0}, {"id": 70029, "name": "Flying Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "FLYING", "npcPrice": 0}, {"id": 70033, "name": "Ghost Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "GHOST", "npcPrice": 0}, {"id": 70023, "name": "Grass Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "GRASS", "npcPrice": 0}, {"id": 70028, "name": "Ground Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "GROUND", "npcPrice": 0}, {"id": 70025, "name": "Ice Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "ICE", "npcPrice": 0}, {"id": 70020, "name": "Normal Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "NORMAL", "npcPrice": 0}, {"id": 70027, "name": "Poison Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "POISON", "npcPrice": 0}, {"id": 70030, "name": "Psychic Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "PSYCHIC", "npcPrice": 0}, {"id": 70032, "name": "Rock Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "ROCK", "npcPrice": 0}, {"id": 70036, "name": "Steel Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "STEEL", "npcPrice": 0}, {"id": 70022, "name": "Water Shiny Stone", "icon": "/img/itens/shiny-stone.png", "category": "stone", "categoryLabel": "Pedras", "type": "WATER", "npcPrice": 0}, {"id": 40575, "name": "AoE TM Disk", "icon": "/assets/items/tm_disk_aoe.png", "category": "tm", "categoryLabel": "TMs", "type": null, "npcPrice": 0}, {"id": 40530, "name": "AoE TM Disk Piece", "icon": "/assets/items/tm_piece_aoe.png", "category": "tm", "categoryLabel": "TMs", "type": null, "npcPrice": 0}, {"id": 59194, "name": "TM Disk Piece", "icon": "/assets/items/tm_disk_piece.png", "category": "tm", "categoryLabel": "TMs", "type": null, "npcPrice": 0}, {"id": 59200, "name": "Normal-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "NORMAL", "npcPrice": 0}, {"id": 59201, "name": "Fire-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "FIRE", "npcPrice": 0}, {"id": 59202, "name": "Water-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "WATER", "npcPrice": 0}, {"id": 59203, "name": "Grass-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "GRASS", "npcPrice": 0}, {"id": 59204, "name": "Electric-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "ELECTRIC", "npcPrice": 0}, {"id": 59205, "name": "Ice-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "ICE", "npcPrice": 0}, {"id": 59206, "name": "Fighting-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "FIGHTING", "npcPrice": 0}, {"id": 59207, "name": "Poison-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "POISON", "npcPrice": 0}, {"id": 59208, "name": "Ground-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "GROUND", "npcPrice": 0}, {"id": 59209, "name": "Flying-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "FLYING", "npcPrice": 0}, {"id": 59210, "name": "Psychic-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "PSYCHIC", "npcPrice": 0}, {"id": 59211, "name": "Bug-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "BUG", "npcPrice": 0}, {"id": 59212, "name": "Rock-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "ROCK", "npcPrice": 0}, {"id": 59213, "name": "Ghost-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "GHOST", "npcPrice": 0}, {"id": 59214, "name": "Dragon-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "DRAGON", "npcPrice": 0}, {"id": 59215, "name": "Dark-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "DARK", "npcPrice": 0}, {"id": 59216, "name": "Steel-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "STEEL", "npcPrice": 0}, {"id": 59247, "name": "Fairy-Type TM Disk", "icon": "/assets/items/tm_disk_elemental.png", "category": "tm", "categoryLabel": "TMs", "type": "FAIRY", "npcPrice": 0}, {"id": 70012, "name": "Shiny Stone Fragment", "icon": "/img/itens/shiny-stone.png", "category": "rare_loot", "categoryLabel": "Loots Raros", "type": null, "npcPrice": 0}, {"id": 70011, "name": "Key Fragment", "icon": "/img/itens/fragmento-chave.png", "category": "rare_loot", "categoryLabel": "Loots Raros", "type": null, "npcPrice": 0}, {"id": 70000, "name": "Bronze Boss Token", "icon": "/assets/items/bronze_boss_token.png", "category": "rare_loot", "categoryLabel": "Loots Raros", "type": null, "npcPrice": 250000}, {"id": 70013, "name": "Bicycle Fragment", "icon": "/img/itens/fragmento-bicicleta.png", "category": "rare_loot", "categoryLabel": "Loots Raros", "type": null, "npcPrice": 0}, {"id": 5, "name": "Beast Ball", "icon": "/img/ball-beast.png", "category": "beast", "categoryLabel": "Beast Balls", "type": null, "npcPrice": 0}, {"id": 70040, "name": "Common House", "icon": "/img/itens/casa-comum.png", "category": "casa", "categoryLabel": "Casas", "type": null, "npcPrice": 0}, {"id": 70041, "name": "Uncommon House", "icon": "/img/itens/casa-incomum.png", "category": "casa", "categoryLabel": "Casas", "type": null, "npcPrice": 0}, {"id": 70042, "name": "Rare House", "icon": "/img/itens/casa-rara.png", "category": "casa", "categoryLabel": "Casas", "type": null, "npcPrice": 0}, {"id": 70043, "name": "Mythic House", "icon": "/img/itens/casa-mitica.png", "category": "casa", "categoryLabel": "Casas", "type": null, "npcPrice": 0}, {"id": 70044, "name": "Legendary House", "icon": "/img/itens/casa-lendaria.png", "category": "casa", "categoryLabel": "Casas", "type": null, "npcPrice": 0}, {"id": 70060, "name": "Founder Box", "icon": "/img/itens/caixa-fundador.png", "category": "box", "categoryLabel": "Boxes", "type": null, "npcPrice": 0}, {"id": 70061, "name": "Co-Founder Box", "icon": "/img/itens/caixa-cofundador.png", "category": "box", "categoryLabel": "Boxes", "type": null, "npcPrice": 0}, {"id": 70080, "name": "Common Bicycle", "icon": "/img/itens/bicicleta-comum.png", "category": "bicicleta", "categoryLabel": "Bicicletas", "type": null, "npcPrice": 0}, {"id": 70081, "name": "Uncommon Bicycle", "icon": "/img/itens/bicicleta-incomum.png", "category": "bicicleta", "categoryLabel": "Bicicletas", "type": null, "npcPrice": 0}, {"id": 70082, "name": "Rare Bicycle", "icon": "/img/itens/bicicleta-rara.png", "category": "bicicleta", "categoryLabel": "Bicicletas", "type": null, "npcPrice": 0}, {"id": 70083, "name": "Mythic Bicycle", "icon": "/img/itens/bicicleta-mitica.png", "category": "bicicleta", "categoryLabel": "Bicicletas", "type": null, "npcPrice": 0}, {"id": 70084, "name": "Legendary Bicycle", "icon": "/img/itens/bicicleta-lendaria.png", "category": "bicicleta", "categoryLabel": "Bicicletas", "type": null, "npcPrice": 0}];

const POKEIDLE_ITEMS_BY_ID = {};
POKEIDLE_ITEMS_DB.forEach(function(item) {
  POKEIDLE_ITEMS_BY_ID[item.id] = item;
});

// ── Itens novos, aprendidos do próprio jogo ──
//
// A lista acima é a curadoria; o jogo lança itens novos (Mega Shiny Stone, ...) que chegam no pacote
// `welcome` (`itensNossos`), na ficha de cada anúncio do Mercado e no catálogo `/assets/items.json`.
// O injected.js junta esses itens e os guarda no storage (`rotom_items_dynamic`); a página do jogo e o
// cockpit registram aqui, e o resto (busca, ícone, sniper) passa a enxergá-los sem atualizar a extensão.
var ROTOM_CATEGORIA_LABEL = {
  stone: 'Pedras', tm: 'TMs', rare_loot: 'Loots Raros', beast: 'Beast Balls', casa: 'Casas',
  box: 'Boxes', bicicleta: 'Bicicletas', skin: 'Skins', outros: 'Outros',
  fragment: 'Fragmentos', boss: 'Boss Tokens', ticket: 'Mystic Ticket'
};

function categoriaRotomItem(nome, categoria, id) {
  var n = String(nome || '').toLowerCase();
  // As pedras Mega têm nome próprio (Gengarite, Shiny Gengarite) e moram em 71xxx/72xxx no jogo.
  if (Number(id) >= 71000 && Number(id) < 73000) return 'stone';
  if (n.indexOf('skin') !== -1) return 'skin';
  if (n.indexOf('beast ball') !== -1) return 'beast';
  if (n.indexOf('stone') !== -1 && n.indexOf('fragment') === -1) return 'stone';
  if (/\btm\b|tm disk/.test(n)) return 'tm';
  if (n.indexOf('fragment') !== -1 || n.indexOf('token') !== -1) return 'rare_loot';
  if (n.indexOf('box') !== -1) return 'box';
  if (n.indexOf('house') !== -1) return 'casa';
  if (n.indexOf('bicycle') !== -1) return 'bicicleta';
  var c = String(categoria || '').toLowerCase();
  return ROTOM_CATEGORIA_LABEL[c] ? c : 'outros';
}

/** Registra itens do jogo que a curadoria não conhece. Devolve quantos entraram. */
function registerRotomItems(lista) {
  if (!Array.isArray(lista)) return 0;
  var novos = 0;
  for (var i = 0; i < lista.length; i++) {
    var it = lista[i];
    var id = Number(it && it.id);
    var nome = it && (it.name || it.nome);
    if (!id || !nome || POKEIDLE_ITEMS_BY_ID[id]) continue;
    var cat = categoriaRotomItem(nome, it.category || it.categoria, id);
    var item = {
      id: id, name: String(nome), icon: it.icon || it.icone || '', category: cat,
      categoryLabel: ROTOM_CATEGORIA_LABEL[cat] || 'Outros', type: '',
      npcPrice: Number(it.npcPrice) || 0, dinamico: true
    };
    POKEIDLE_ITEMS_DB.push(item);
    POKEIDLE_ITEMS_BY_ID[id] = item;
    novos++;
  }
  return novos;
}

// ── Catálogo oficial do RMT (Mercado da Comunidade) ──
//
// Quem decide o que pode ser negociado é o servidor: a lista vem pronta no `welcome`
// (`mercado.catalogo`, cada linha {id, nome, icone, categoria, tipo, npc}) e o próprio cliente do jogo
// desenha a vitrine só com ela. O injected.js repassa essa lista (storage `rotom_rmt_catalog`) e aqui
// ela passa a ser a vitrine e o seletor de regras: item novo entra e item que saiu do RMT some, sem
// atualizar a extensão. Até o primeiro `welcome` chegar vale o retrato abaixo (curadoria de 26/10/2026:
// pedras de evolução, fragmentos — peças de TM entre eles —, Boss Token, casas, bicicletas).
var ROTOM_RMT_FALLBACK = {
  2: 'stone', 23: 'stone', 28: 'stone', 31: 'stone', 40: 'stone', 45: 'stone', 49: 'stone', 53: 'stone',
  66: 'stone', 71: 'stone', 76: 'stone', 87: 'stone', 106: 'stone', 109: 'stone', 133: 'stone',
  139: 'stone', 142: 'stone', 208: 'stone', 209: 'stone', 5200: 'stone',
  70011: 'fragment', 70012: 'fragment', 70013: 'fragment', 40530: 'fragment', 59194: 'fragment',
  70000: 'boss',
  70040: 'casa', 70041: 'casa', 70042: 'casa', 70043: 'casa', 70044: 'casa',
  70080: 'bicicleta', 70081: 'bicicleta', 70082: 'bicicleta', 70083: 'bicicleta', 70084: 'bicicleta'
};
var ROTOM_RMT_EXTRAS_FALLBACK = [
  { id: 208, name: 'Moon Stone', icon: 'moon_stone.png' },
  { id: 5200, name: 'Rough Gemstone', icon: '/assets/stones/rough_gemstone.png' }
];
var ROTOM_RMT_ORDEM = null;   // ids na ordem do jogo (null = ainda sem welcome)
var ROTOM_RMT_SET = null;

function aplicarCategoriaRmt(item, cat) {
  if (!item || !cat) return;
  item.category = cat;
  item.categoryLabel = ROTOM_CATEGORIA_LABEL[cat] || 'Outros';
}

(function iniciarFallbackRmt() {
  ROTOM_RMT_EXTRAS_FALLBACK.forEach(function(x) {
    if (POKEIDLE_ITEMS_BY_ID[x.id]) return;
    var item = { id: x.id, name: x.name, icon: x.icon, category: 'stone', categoryLabel: 'Pedras', type: 'EVOLUCAO', npcPrice: 0 };
    POKEIDLE_ITEMS_DB.push(item);
    POKEIDLE_ITEMS_BY_ID[x.id] = item;
  });
  for (var id in ROTOM_RMT_FALLBACK) aplicarCategoriaRmt(POKEIDLE_ITEMS_BY_ID[Number(id)], ROTOM_RMT_FALLBACK[id]);
})();

/** Recebe `welcome.mercado.catalogo` e passa a usá-lo como a lista do RMT. Devolve quantos itens. */
function registerRotomRmtCatalog(lista) {
  if (!Array.isArray(lista) || !lista.length) return 0;
  var ordem = [];
  for (var i = 0; i < lista.length; i++) {
    var c = lista[i];
    var id = Number(c && c.id);
    var nome = c && (c.nome || c.name);
    if (!id || ordem.indexOf(id) !== -1) continue;
    var cat = String((c.categoria || c.category || '')).toLowerCase() || categoriaRotomItem(nome, '', id);
    var item = POKEIDLE_ITEMS_BY_ID[id];
    if (!item) {
      item = { id: id, name: String(nome || ('Item #' + id)), icon: c.icone || c.icon || '', category: cat,
        categoryLabel: '', type: '', npcPrice: Number(c.npc || c.npcPrice) || 0, dinamico: true };
      POKEIDLE_ITEMS_DB.push(item);
      POKEIDLE_ITEMS_BY_ID[id] = item;
    } else if (!item.icon && (c.icone || c.icon)) {
      item.icon = c.icone || c.icon;
    }
    aplicarCategoriaRmt(item, cat);
    item.rmtTipo = c.tipo || null;
    ordem.push(id);
  }
  if (!ordem.length) return 0;
  ROTOM_RMT_ORDEM = ordem;
  ROTOM_RMT_SET = {};
  ordem.forEach(function(x) { ROTOM_RMT_SET[x] = true; });
  return ordem.length;
}

/** O item pode ser anunciado/comprado no RMT hoje? */
function isRotomItemNoRmt(idOrItem) {
  var id = Number(idOrItem && typeof idOrItem === 'object' ? (idOrItem.targetId || idOrItem.id) : idOrItem);
  if (!id) return false;
  return ROTOM_RMT_SET ? Boolean(ROTOM_RMT_SET[id]) : Object.prototype.hasOwnProperty.call(ROTOM_RMT_FALLBACK, id);
}

/** Lista do RMT na ordem do jogo (ou do retrato, antes do welcome). */
function getRmtItems() {
  var ids = ROTOM_RMT_ORDEM || Object.keys(ROTOM_RMT_FALLBACK).map(Number);
  var out = [];
  for (var i = 0; i < ids.length; i++) {
    var it = POKEIDLE_ITEMS_BY_ID[ids[i]];
    if (it) out.push(it);
  }
  return out;
}

/**
 * Troca o nome dos itens pelo nome que o JOGO mostra ({id: nome}), calculado na página com os módulos
 * do próprio jogo (tradução, Shiny Stone por tipo, casas, skins...). O nome antigo vira apelido: regra
 * de sniper salva com o nome em inglês continua achando o item, e a busca acha pelos dois.
 */
function registerRotomNames(mapa) {
  if (!mapa || typeof mapa !== 'object') return 0;
  var n = 0;
  for (var id in mapa) {
    var item = POKEIDLE_ITEMS_BY_ID[Number(id)];
    var nome = mapa[id];
    if (!item || !nome || item.name === nome) continue;
    item.aliases = item.aliases || [];
    if (item.aliases.indexOf(item.name) === -1) item.aliases.push(item.name);
    item.name = String(nome);
    n++;
  }
  return n;
}

function nomesDoItem(it) {
  return [it.name].concat(it.aliases || []);
}

function getRotomItem(idOrName) {
  if (idOrName == null) return null;
  if (typeof idOrName === 'number' || (!isNaN(Number(idOrName)) && String(idOrName).trim() !== '')) {
    return POKEIDLE_ITEMS_BY_ID[Number(idOrName)] || null;
  }
  var q = String(idOrName || '').toLowerCase().trim();
  for (var i = 0; i < POKEIDLE_ITEMS_DB.length; i++) {
    var nomes = nomesDoItem(POKEIDLE_ITEMS_DB[i]);
    for (var j = 0; j < nomes.length; j++) {
      if (String(nomes[j]).toLowerCase() === q) return POKEIDLE_ITEMS_DB[i];
    }
  }
  return null;
}

function searchRotomItems(query, category) {
  var q = String(query || '').toLowerCase().trim();
  var cat = String(category || 'all').toLowerCase().trim();
  var ALIAS = { pedras: 'stone', fragmentos: 'fragment', rare_loot: 'fragment', boss_token: 'boss', casas: 'casa', bicicletas: 'bicicleta' };
  if (ALIAS[cat]) cat = ALIAS[cat];
  var lista = getRmtItems();
  var results = [];
  for (var i = 0; i < lista.length; i++) {
    var it = lista[i];
    if (cat && cat !== 'all' && String(it.category || '').toLowerCase() !== cat) continue;
    if (!q || nomesDoItem(it).join('\n').toLowerCase().indexOf(q) !== -1 || String(it.id) === q) {
      results.push(it);
      if (results.length >= 100) break;
    }
  }
  return results;
}

function getItemIconUrl(itemOrIcon) {
  if (!itemOrIcon) return '';
  var icon = '';

  // 1. Se for objeto (regra salva ou item), busca sempre a referência canônica oficial no catálogo do jogo
  if (typeof itemOrIcon === 'object') {
    var it = null;
    if (itemOrIcon.targetId) it = getRotomItem(itemOrIcon.targetId);
    if (!it && itemOrIcon.id) it = getRotomItem(itemOrIcon.id);
    if (!it && itemOrIcon.targetName) it = getRotomItem(itemOrIcon.targetName);
    if (!it && itemOrIcon.name) it = getRotomItem(itemOrIcon.name);

    if (it && it.icon) {
      icon = it.icon;
    } else if (itemOrIcon.icon) {
      icon = itemOrIcon.icon;
    }
  } else if (typeof itemOrIcon === 'number') {
    var it = getRotomItem(itemOrIcon);
    if (it && it.icon) icon = it.icon;
  } else if (typeof itemOrIcon === 'string') {
    if (itemOrIcon.indexOf('icon16') !== -1 || itemOrIcon.indexOf('icon48') !== -1 || itemOrIcon.indexOf('icons/') === 0) {
      return '';
    }
    var it = getRotomItem(itemOrIcon);
    if (it && it.icon) {
      icon = it.icon;
    } else if (itemOrIcon.indexOf('/') !== -1 || itemOrIcon.indexOf('.png') !== -1 || itemOrIcon.indexOf('.gif') !== -1) {
      icon = itemOrIcon;
    }
  }

  // 2. Rejeitar caminhos locais legados da extensão
  if (!icon || icon.indexOf('icon16') !== -1 || icon.indexOf('icon48') !== -1 || icon.indexOf('icons/') === 0) {
    return '';
  }

  if (icon.indexOf('http://') === 0 || icon.indexOf('https://') === 0) return icon;
  if (icon.indexOf('/assets/site/') === 0) return 'https://pokeidle.io' + icon;
  if (icon.indexOf('/img/') === 0) return 'https://pokeidle.io' + icon;
  if (icon.indexOf('img/') === 0 || icon.indexOf('site/') === 0) return 'https://pokeidle.io/' + icon;
  if (icon.indexOf('/assets/stones/') === 0) return 'https://pokeidle.io/assets/site' + icon;
  if (icon.indexOf('/assets/items/') === 0) return 'https://pokeidle.io/assets/site' + icon;
  if (icon.indexOf('/assets/cards/') === 0) return 'https://pokeidle.io' + icon;
  if (icon.indexOf('/assets/markitems/') === 0) {
    return 'https://pokeidle.io/assets/site/assets/markitems/' + icon.replace('/assets/markitems/', '');
  }

  var STONES_SPECIAL = ['ancient_stone.gif', 'feather_stone.png', 'metal_stone.png', 'rough_gemstone.png', 'sun_stone.png', 'moon_stone.png'];
  var base = icon.replace('/assets/stones/', '').replace('/assets/items/', '');
  if (base.charAt(0) === '/') base = base.substring(1);
  if (STONES_SPECIAL.indexOf(base) !== -1) {
    return 'https://pokeidle.io/assets/site/assets/stones/' + base;
  }
  return 'https://pokeidle.io/assets/site/assets/items/' + base;
}


// Dicionário Canônico National Dex (1025 Pokémons da Gen 1 a Gen 9)
const POKEMON_NAME_TO_DEX_ID = {"bulbasaur": 1, "ivysaur": 2, "venusaur": 3, "charmander": 4, "charmeleon": 5, "charizard": 6, "squirtle": 7, "wartortle": 8, "blastoise": 9, "caterpie": 10, "metapod": 11, "butterfree": 12, "weedle": 13, "kakuna": 14, "beedrill": 15, "pidgey": 16, "pidgeotto": 17, "pidgeot": 18, "rattata": 19, "raticate": 20, "spearow": 21, "fearow": 22, "ekans": 23, "arbok": 24, "pikachu": 25, "raichu": 26, "sandshrew": 27, "sandslash": 28, "nidoran f": 29, "nidoran-f": 29, "nidorina": 30, "nidoqueen": 31, "nidoran m": 32, "nidoran-m": 32, "nidorino": 33, "nidoking": 34, "clefairy": 35, "clefable": 36, "vulpix": 37, "ninetales": 38, "jigglypuff": 39, "wigglytuff": 40, "zubat": 41, "golbat": 42, "oddish": 43, "gloom": 44, "vileplume": 45, "paras": 46, "parasect": 47, "venonat": 48, "venomoth": 49, "diglett": 50, "dugtrio": 51, "meowth": 52, "persian": 53, "psyduck": 54, "golduck": 55, "mankey": 56, "primeape": 57, "growlithe": 58, "arcanine": 59, "poliwag": 60, "poliwhirl": 61, "poliwrath": 62, "abra": 63, "kadabra": 64, "alakazam": 65, "machop": 66, "machoke": 67, "machamp": 68, "bellsprout": 69, "weepinbell": 70, "victreebel": 71, "tentacool": 72, "tentacruel": 73, "geodude": 74, "graveler": 75, "golem": 76, "ponyta": 77, "rapidash": 78, "slowpoke": 79, "slowbro": 80, "magnemite": 81, "magneton": 82, "farfetchd": 83, "doduo": 84, "dodrio": 85, "seel": 86, "dewgong": 87, "grimer": 88, "muk": 89, "shellder": 90, "cloyster": 91, "gastly": 92, "haunter": 93, "gengar": 94, "onix": 95, "drowzee": 96, "hypno": 97, "krabby": 98, "kingler": 99, "voltorb": 100, "electrode": 101, "exeggcute": 102, "exeggutor": 103, "cubone": 104, "marowak": 105, "hitmonlee": 106, "hitmonchan": 107, "lickitung": 108, "koffing": 109, "weezing": 110, "rhyhorn": 111, "rhydon": 112, "chansey": 113, "tangela": 114, "kangaskhan": 115, "horsea": 116, "seadra": 117, "goldeen": 118, "seaking": 119, "staryu": 120, "starmie": 121, "mr mime": 122, "mr-mime": 122, "scyther": 123, "jynx": 124, "electabuzz": 125, "magmar": 126, "pinsir": 127, "tauros": 128, "magikarp": 129, "gyarados": 130, "lapras": 131, "ditto": 132, "eevee": 133, "vaporeon": 134, "jolteon": 135, "flareon": 136, "porygon": 137, "omanyte": 138, "omastar": 139, "kabuto": 140, "kabutops": 141, "aerodactyl": 142, "snorlax": 143, "articuno": 144, "zapdos": 145, "moltres": 146, "dratini": 147, "dragonair": 148, "dragonite": 149, "mewtwo": 150, "mew": 151, "chikorita": 152, "bayleef": 153, "meganium": 154, "cyndaquil": 155, "quilava": 156, "typhlosion": 157, "totodile": 158, "croconaw": 159, "feraligatr": 160, "sentret": 161, "furret": 162, "hoothoot": 163, "noctowl": 164, "ledyba": 165, "ledian": 166, "spinarak": 167, "ariados": 168, "crobat": 169, "chinchou": 170, "lanturn": 171, "pichu": 172, "cleffa": 173, "igglybuff": 174, "togepi": 175, "togetic": 176, "natu": 177, "xatu": 178, "mareep": 179, "flaaffy": 180, "ampharos": 181, "bellossom": 182, "marill": 183, "azumarill": 184, "sudowoodo": 185, "politoed": 186, "hoppip": 187, "skiploom": 188, "jumpluff": 189, "aipom": 190, "sunkern": 191, "sunflora": 192, "yanma": 193, "wooper": 194, "quagsire": 195, "espeon": 196, "umbreon": 197, "murkrow": 198, "slowking": 199, "misdreavus": 200, "unown": 201, "wobbuffet": 202, "girafarig": 203, "pineco": 204, "forretress": 205, "dunsparce": 206, "gligar": 207, "steelix": 208, "snubbull": 209, "granbull": 210, "qwilfish": 211, "scizor": 212, "shuckle": 213, "heracross": 214, "sneasel": 215, "teddiursa": 216, "ursaring": 217, "slugma": 218, "magcargo": 219, "swinub": 220, "piloswine": 221, "corsola": 222, "remoraid": 223, "octillery": 224, "delibird": 225, "mantine": 226, "skarmory": 227, "houndour": 228, "houndoom": 229, "kingdra": 230, "phanpy": 231, "donphan": 232, "porygon2": 233, "stantler": 234, "smeargle": 235, "tyrogue": 236, "hitmontop": 237, "smoochum": 238, "elekid": 239, "magby": 240, "miltank": 241, "blissey": 242, "raikou": 243, "entei": 244, "suicune": 245, "larvitar": 246, "pupitar": 247, "tyranitar": 248, "lugia": 249, "ho oh": 250, "ho-oh": 250, "celebi": 251, "treecko": 252, "grovyle": 253, "sceptile": 254, "torchic": 255, "combusken": 256, "blaziken": 257, "mudkip": 258, "marshtomp": 259, "swampert": 260, "poochyena": 261, "mightyena": 262, "zigzagoon": 263, "linoone": 264, "wurmple": 265, "silcoon": 266, "beautifly": 267, "cascoon": 268, "dustox": 269, "lotad": 270, "lombre": 271, "ludicolo": 272, "seedot": 273, "nuzleaf": 274, "shiftry": 275, "taillow": 276, "swellow": 277, "wingull": 278, "pelipper": 279, "ralts": 280, "kirlia": 281, "gardevoir": 282, "surskit": 283, "masquerain": 284, "shroomish": 285, "breloom": 286, "slakoth": 287, "vigoroth": 288, "slaking": 289, "nincada": 290, "ninjask": 291, "shedinja": 292, "whismur": 293, "loudred": 294, "exploud": 295, "makuhita": 296, "hariyama": 297, "azurill": 298, "nosepass": 299, "skitty": 300, "delcatty": 301, "sableye": 302, "mawile": 303, "aron": 304, "lairon": 305, "aggron": 306, "meditite": 307, "medicham": 308, "electrike": 309, "manectric": 310, "plusle": 311, "minun": 312, "volbeat": 313, "illumise": 314, "roselia": 315, "gulpin": 316, "swalot": 317, "carvanha": 318, "sharpedo": 319, "wailmer": 320, "wailord": 321, "numel": 322, "camerupt": 323, "torkoal": 324, "spoink": 325, "grumpig": 326, "spinda": 327, "trapinch": 328, "vibrava": 329, "flygon": 330, "cacnea": 331, "cacturne": 332, "swablu": 333, "altaria": 334, "zangoose": 335, "seviper": 336, "lunatone": 337, "solrock": 338, "barboach": 339, "whiscash": 340, "corphish": 341, "crawdaunt": 342, "baltoy": 343, "claydol": 344, "lileep": 345, "cradily": 346, "anorith": 347, "armaldo": 348, "feebas": 349, "milotic": 350, "castform": 351, "kecleon": 352, "shuppet": 353, "banette": 354, "duskull": 355, "dusclops": 356, "tropius": 357, "chimecho": 358, "absol": 359, "wynaut": 360, "snorunt": 361, "glalie": 362, "spheal": 363, "sealeo": 364, "walrein": 365, "clamperl": 366, "huntail": 367, "gorebyss": 368, "relicanth": 369, "luvdisc": 370, "bagon": 371, "shelgon": 372, "salamence": 373, "beldum": 374, "metang": 375, "metagross": 376, "regirock": 377, "regice": 378, "registeel": 379, "latias": 380, "latios": 381, "kyogre": 382, "groudon": 383, "rayquaza": 384, "jirachi": 385, "deoxys normal": 386, "deoxys-normal": 386, "turtwig": 387, "grotle": 388, "torterra": 389, "chimchar": 390, "monferno": 391, "infernape": 392, "piplup": 393, "prinplup": 394, "empoleon": 395, "starly": 396, "staravia": 397, "staraptor": 398, "bidoof": 399, "bibarel": 400, "kricketot": 401, "kricketune": 402, "shinx": 403, "luxio": 404, "luxray": 405, "budew": 406, "roserade": 407, "cranidos": 408, "rampardos": 409, "shieldon": 410, "bastiodon": 411, "burmy": 412, "wormadam plant": 413, "wormadam-plant": 413, "mothim": 414, "combee": 415, "vespiquen": 416, "pachirisu": 417, "buizel": 418, "floatzel": 419, "cherubi": 420, "cherrim": 421, "shellos": 422, "gastrodon": 423, "ambipom": 424, "drifloon": 425, "drifblim": 426, "buneary": 427, "lopunny": 428, "mismagius": 429, "honchkrow": 430, "glameow": 431, "purugly": 432, "chingling": 433, "stunky": 434, "skuntank": 435, "bronzor": 436, "bronzong": 437, "bonsly": 438, "mime jr": 439, "mime-jr": 439, "happiny": 440, "chatot": 441, "spiritomb": 442, "gible": 443, "gabite": 444, "garchomp": 445, "munchlax": 446, "riolu": 447, "lucario": 448, "hippopotas": 449, "hippowdon": 450, "skorupi": 451, "drapion": 452, "croagunk": 453, "toxicroak": 454, "carnivine": 455, "finneon": 456, "lumineon": 457, "mantyke": 458, "snover": 459, "abomasnow": 460, "weavile": 461, "magnezone": 462, "lickilicky": 463, "rhyperior": 464, "tangrowth": 465, "electivire": 466, "magmortar": 467, "togekiss": 468, "yanmega": 469, "leafeon": 470, "glaceon": 471, "gliscor": 472, "mamoswine": 473, "porygon z": 474, "porygon-z": 474, "gallade": 475, "probopass": 476, "dusknoir": 477, "froslass": 478, "rotom": 479, "uxie": 480, "mesprit": 481, "azelf": 482, "dialga": 483, "palkia": 484, "heatran": 485, "regigigas": 486, "giratina altered": 487, "giratina-altered": 487, "cresselia": 488, "phione": 489, "manaphy": 490, "darkrai": 491, "shaymin land": 492, "shaymin-land": 492, "arceus": 493, "victini": 494, "snivy": 495, "servine": 496, "serperior": 497, "tepig": 498, "pignite": 499, "emboar": 500, "oshawott": 501, "dewott": 502, "samurott": 503, "patrat": 504, "watchog": 505, "lillipup": 506, "herdier": 507, "stoutland": 508, "purrloin": 509, "liepard": 510, "pansage": 511, "simisage": 512, "pansear": 513, "simisear": 514, "panpour": 515, "simipour": 516, "munna": 517, "musharna": 518, "pidove": 519, "tranquill": 520, "unfezant": 521, "blitzle": 522, "zebstrika": 523, "roggenrola": 524, "boldore": 525, "gigalith": 526, "woobat": 527, "swoobat": 528, "drilbur": 529, "excadrill": 530, "audino": 531, "timburr": 532, "gurdurr": 533, "conkeldurr": 534, "tympole": 535, "palpitoad": 536, "seismitoad": 537, "throh": 538, "sawk": 539, "sewaddle": 540, "swadloon": 541, "leavanny": 542, "venipede": 543, "whirlipede": 544, "scolipede": 545, "cottonee": 546, "whimsicott": 547, "petilil": 548, "lilligant": 549, "basculin red striped": 550, "basculin-red-striped": 550, "sandile": 551, "krokorok": 552, "krookodile": 553, "darumaka": 554, "darmanitan standard": 555, "darmanitan-standard": 555, "maractus": 556, "dwebble": 557, "crustle": 558, "scraggy": 559, "scrafty": 560, "sigilyph": 561, "yamask": 562, "cofagrigus": 563, "tirtouga": 564, "carracosta": 565, "archen": 566, "archeops": 567, "trubbish": 568, "garbodor": 569, "zorua": 570, "zoroark": 571, "minccino": 572, "cinccino": 573, "gothita": 574, "gothorita": 575, "gothitelle": 576, "solosis": 577, "duosion": 578, "reuniclus": 579, "ducklett": 580, "swanna": 581, "vanillite": 582, "vanillish": 583, "vanilluxe": 584, "deerling": 585, "sawsbuck": 586, "emolga": 587, "karrablast": 588, "escavalier": 589, "foongus": 590, "amoonguss": 591, "frillish male": 592, "frillish-male": 592, "jellicent male": 593, "jellicent-male": 593, "alomomola": 594, "joltik": 595, "galvantula": 596, "ferroseed": 597, "ferrothorn": 598, "klink": 599, "klang": 600, "klinklang": 601, "tynamo": 602, "eelektrik": 603, "eelektross": 604, "elgyem": 605, "beheeyem": 606, "litwick": 607, "lampent": 608, "chandelure": 609, "axew": 610, "fraxure": 611, "haxorus": 612, "cubchoo": 613, "beartic": 614, "cryogonal": 615, "shelmet": 616, "accelgor": 617, "stunfisk": 618, "mienfoo": 619, "mienshao": 620, "druddigon": 621, "golett": 622, "golurk": 623, "pawniard": 624, "bisharp": 625, "bouffalant": 626, "rufflet": 627, "braviary": 628, "vullaby": 629, "mandibuzz": 630, "heatmor": 631, "durant": 632, "deino": 633, "zweilous": 634, "hydreigon": 635, "larvesta": 636, "volcarona": 637, "cobalion": 638, "terrakion": 639, "virizion": 640, "tornadus incarnate": 641, "tornadus-incarnate": 641, "thundurus incarnate": 642, "thundurus-incarnate": 642, "reshiram": 643, "zekrom": 644, "landorus incarnate": 645, "landorus-incarnate": 645, "kyurem": 646, "keldeo ordinary": 647, "keldeo-ordinary": 647, "meloetta aria": 648, "meloetta-aria": 648, "genesect": 649, "chespin": 650, "quilladin": 651, "chesnaught": 652, "fennekin": 653, "braixen": 654, "delphox": 655, "froakie": 656, "frogadier": 657, "greninja": 658, "bunnelby": 659, "diggersby": 660, "fletchling": 661, "fletchinder": 662, "talonflame": 663, "scatterbug": 664, "spewpa": 665, "vivillon": 666, "litleo": 667, "pyroar male": 668, "pyroar-male": 668, "flabebe": 669, "floette": 670, "florges": 671, "skiddo": 672, "gogoat": 673, "pancham": 674, "pangoro": 675, "furfrou": 676, "espurr": 677, "meowstic male": 678, "meowstic-male": 678, "honedge": 679, "doublade": 680, "aegislash shield": 681, "aegislash-shield": 681, "spritzee": 682, "aromatisse": 683, "swirlix": 684, "slurpuff": 685, "inkay": 686, "malamar": 687, "binacle": 688, "barbaracle": 689, "skrelp": 690, "dragalge": 691, "clauncher": 692, "clawitzer": 693, "helioptile": 694, "heliolisk": 695, "tyrunt": 696, "tyrantrum": 697, "amaura": 698, "aurorus": 699, "sylveon": 700, "hawlucha": 701, "dedenne": 702, "carbink": 703, "goomy": 704, "sliggoo": 705, "goodra": 706, "klefki": 707, "phantump": 708, "trevenant": 709, "pumpkaboo average": 710, "pumpkaboo-average": 710, "gourgeist average": 711, "gourgeist-average": 711, "bergmite": 712, "avalugg": 713, "noibat": 714, "noivern": 715, "xerneas": 716, "yveltal": 717, "zygarde 50": 718, "zygarde-50": 718, "diancie": 719, "hoopa": 720, "volcanion": 721, "rowlet": 722, "dartrix": 723, "decidueye": 724, "litten": 725, "torracat": 726, "incineroar": 727, "popplio": 728, "brionne": 729, "primarina": 730, "pikipek": 731, "trumbeak": 732, "toucannon": 733, "yungoos": 734, "gumshoos": 735, "grubbin": 736, "charjabug": 737, "vikavolt": 738, "crabrawler": 739, "crabominable": 740, "oricorio baile": 741, "oricorio-baile": 741, "cutiefly": 742, "ribombee": 743, "rockruff": 744, "lycanroc midday": 745, "lycanroc-midday": 745, "wishiwashi solo": 746, "wishiwashi-solo": 746, "mareanie": 747, "toxapex": 748, "mudbray": 749, "mudsdale": 750, "dewpider": 751, "araquanid": 752, "fomantis": 753, "lurantis": 754, "morelull": 755, "shiinotic": 756, "salandit": 757, "salazzle": 758, "stufful": 759, "bewear": 760, "bounsweet": 761, "steenee": 762, "tsareena": 763, "comfey": 764, "oranguru": 765, "passimian": 766, "wimpod": 767, "golisopod": 768, "sandygast": 769, "palossand": 770, "pyukumuku": 771, "type null": 772, "type-null": 772, "silvally": 773, "minior red meteor": 774, "minior-red-meteor": 774, "komala": 775, "turtonator": 776, "togedemaru": 777, "mimikyu disguised": 778, "mimikyu-disguised": 778, "bruxish": 779, "drampa": 780, "dhelmise": 781, "jangmo o": 782, "jangmo-o": 782, "hakamo o": 783, "hakamo-o": 783, "kommo o": 784, "kommo-o": 784, "tapu koko": 785, "tapu-koko": 785, "tapu lele": 786, "tapu-lele": 786, "tapu bulu": 787, "tapu-bulu": 787, "tapu fini": 788, "tapu-fini": 788, "cosmog": 789, "cosmoem": 790, "solgaleo": 791, "lunala": 792, "nihilego": 793, "buzzwole": 794, "pheromosa": 795, "xurkitree": 796, "celesteela": 797, "kartana": 798, "guzzlord": 799, "necrozma": 800, "magearna": 801, "marshadow": 802, "poipole": 803, "naganadel": 804, "stakataka": 805, "blacephalon": 806, "zeraora": 807, "meltan": 808, "melmetal": 809, "grookey": 810, "thwackey": 811, "rillaboom": 812, "scorbunny": 813, "raboot": 814, "cinderace": 815, "sobble": 816, "drizzile": 817, "inteleon": 818, "skwovet": 819, "greedent": 820, "rookidee": 821, "corvisquire": 822, "corviknight": 823, "blipbug": 824, "dottler": 825, "orbeetle": 826, "nickit": 827, "thievul": 828, "gossifleur": 829, "eldegoss": 830, "wooloo": 831, "dubwool": 832, "chewtle": 833, "drednaw": 834, "yamper": 835, "boltund": 836, "rolycoly": 837, "carkol": 838, "coalossal": 839, "applin": 840, "flapple": 841, "appletun": 842, "silicobra": 843, "sandaconda": 844, "cramorant": 845, "arrokuda": 846, "barraskewda": 847, "toxel": 848, "toxtricity amped": 849, "toxtricity-amped": 849, "sizzlipede": 850, "centiskorch": 851, "clobbopus": 852, "grapploct": 853, "sinistea": 854, "polteageist": 855, "hatenna": 856, "hattrem": 857, "hatterene": 858, "impidimp": 859, "morgrem": 860, "grimmsnarl": 861, "obstagoon": 862, "perrserker": 863, "cursola": 864, "sirfetchd": 865, "mr rime": 866, "mr-rime": 866, "runerigus": 867, "milcery": 868, "alcremie": 869, "falinks": 870, "pincurchin": 871, "snom": 872, "frosmoth": 873, "stonjourner": 874, "eiscue ice": 875, "eiscue-ice": 875, "indeedee male": 876, "indeedee-male": 876, "morpeko full belly": 877, "morpeko-full-belly": 877, "cufant": 878, "copperajah": 879, "dracozolt": 880, "arctozolt": 881, "dracovish": 882, "arctovish": 883, "duraludon": 884, "dreepy": 885, "drakloak": 886, "dragapult": 887, "zacian": 888, "zamazenta": 889, "eternatus": 890, "kubfu": 891, "urshifu single strike": 892, "urshifu-single-strike": 892, "zarude": 893, "regieleki": 894, "regidrago": 895, "glastrier": 896, "spectrier": 897, "calyrex": 898, "wyrdeer": 899, "kleavor": 900, "ursaluna": 901, "basculegion male": 902, "basculegion-male": 902, "sneasler": 903, "overqwil": 904, "enamorus incarnate": 905, "enamorus-incarnate": 905, "sprigatito": 906, "floragato": 907, "meowscarada": 908, "fuecoco": 909, "crocalor": 910, "skeledirge": 911, "quaxly": 912, "quaxwell": 913, "quaquaval": 914, "lechonk": 915, "oinkologne male": 916, "oinkologne-male": 916, "tarountula": 917, "spidops": 918, "nymble": 919, "lokix": 920, "pawmi": 921, "pawmo": 922, "pawmot": 923, "tandemaus": 924, "maushold family of four": 925, "maushold-family-of-four": 925, "fidough": 926, "dachsbun": 927, "smoliv": 928, "dolliv": 929, "arboliva": 930, "squawkabilly green plumage": 931, "squawkabilly-green-plumage": 931, "nacli": 932, "naclstack": 933, "garganacl": 934, "charcadet": 935, "armarouge": 936, "ceruledge": 937, "tadbulb": 938, "bellibolt": 939, "wattrel": 940, "kilowattrel": 941, "maschiff": 942, "mabosstiff": 943, "shroodle": 944, "grafaiai": 945, "bramblin": 946, "brambleghast": 947, "toedscool": 948, "toedscruel": 949, "klawf": 950, "capsakid": 951, "scovillain": 952, "rellor": 953, "rabsca": 954, "flittle": 955, "espathra": 956, "tinkatink": 957, "tinkatuff": 958, "tinkaton": 959, "wiglett": 960, "wugtrio": 961, "bombirdier": 962, "finizen": 963, "palafin zero": 964, "palafin-zero": 964, "varoom": 965, "revavroom": 966, "cyclizar": 967, "orthworm": 968, "glimmet": 969, "glimmora": 970, "greavard": 971, "houndstone": 972, "flamigo": 973, "cetoddle": 974, "cetitan": 975, "veluza": 976, "dondozo": 977, "tatsugiri curly": 978, "tatsugiri-curly": 978, "annihilape": 979, "clodsire": 980, "farigiraf": 981, "dudunsparce two segment": 982, "dudunsparce-two-segment": 982, "kingambit": 983, "great tusk": 984, "great-tusk": 984, "scream tail": 985, "scream-tail": 985, "brute bonnet": 986, "brute-bonnet": 986, "flutter mane": 987, "flutter-mane": 987, "slither wing": 988, "slither-wing": 988, "sandy shocks": 989, "sandy-shocks": 989, "iron treads": 990, "iron-treads": 990, "iron bundle": 991, "iron-bundle": 991, "iron hands": 992, "iron-hands": 992, "iron jugulis": 993, "iron-jugulis": 993, "iron moth": 994, "iron-moth": 994, "iron thorns": 995, "iron-thorns": 995, "frigibax": 996, "arctibax": 997, "baxcalibur": 998, "gimmighoul": 999, "gholdengo": 1000, "wo chien": 1001, "wo-chien": 1001, "chien pao": 1002, "chien-pao": 1002, "ting lu": 1003, "ting-lu": 1003, "chi yu": 1004, "chi-yu": 1004, "roaring moon": 1005, "roaring-moon": 1005, "iron valiant": 1006, "iron-valiant": 1006, "koraidon": 1007, "miraidon": 1008, "walking wake": 1009, "walking-wake": 1009, "iron leaves": 1010, "iron-leaves": 1010, "dipplin": 1011, "poltchageist": 1012, "sinistcha": 1013, "okidogi": 1014, "munkidori": 1015, "fezandipiti": 1016, "ogerpon": 1017, "archaludon": 1018, "hydrapple": 1019, "gouging fire": 1020, "gouging-fire": 1020, "raging bolt": 1021, "raging-bolt": 1021, "iron boulder": 1022, "iron-boulder": 1022, "iron crown": 1023, "iron-crown": 1023, "terapagos": 1024, "pecharunt": 1025};

function getRotomPokemonDexId(nameOrObj) {
  if (!nameOrObj) return 0;
  if (typeof nameOrObj === 'number') {
    if (nameOrObj > 0 && nameOrObj <= 1025) return nameOrObj;
    return 0;
  }
  if (typeof nameOrObj === 'object') {
    var numId = Number(nameOrObj.pokemonId || nameOrObj.speciesId || nameOrObj.pokeId || nameOrObj.dexId || nameOrObj.id || 0);
    if (numId > 0 && numId <= 1025) return numId;
    var name = String(nameOrObj.nome || nameOrObj.name || '').toLowerCase().trim();
    if (name && POKEMON_NAME_TO_DEX_ID[name]) return POKEMON_NAME_TO_DEX_ID[name];
    // Tenta sem caracteres especiais
    var clean = name.replace(/[^a-z0-9]/g, '');
    for (var k in POKEMON_NAME_TO_DEX_ID) {
      if (k.replace(/[^a-z0-9]/g, '') === clean) return POKEMON_NAME_TO_DEX_ID[k];
    }
    return 0;
  }
  var q = String(nameOrObj || '').toLowerCase().trim();
  if (POKEMON_NAME_TO_DEX_ID[q]) return POKEMON_NAME_TO_DEX_ID[q];
  var cleanQ = q.replace(/[^a-z0-9]/g, '');
  for (var k in POKEMON_NAME_TO_DEX_ID) {
    if (k.replace(/[^a-z0-9]/g, '') === cleanQ) return POKEMON_NAME_TO_DEX_ID[k];
  }
  return 0;
}

function getRotomPokemonSprite(nameOrObj, isShiny) {
  var dexId = getRotomPokemonDexId(nameOrObj);
  if (dexId > 0) {
    if (isShiny) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/' + dexId + '.png';
    }
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + dexId + '.png';
  }
  return 'https://pokeidle.io/assets/site/assets/ui/ball-poke.png';
}

function getRotomPokemonAttributesHtml(pk, options) {
  if (!pk) return '';
  options = options || {};
  var compacto = Boolean(options.compacto);

  // 1. Potência (P1 a P5)
  var pot = Number(pk.potencia) || 1;
  var potClass = 't' + Math.min(5, Math.max(1, pot));
  var potBg = pot === 5 ? 'linear-gradient(180deg, #ff8a3c, #e8322a)' : (pot === 4 ? '#8a3a92' : (pot === 3 ? '#5aa93e' : (pot === 2 ? '#4a86e8' : '#5a5668')));
  var potHtml = '<span class="pk-selo ' + potClass + '" style="background: ' + potBg + '; color: #fff; font-weight: 800; padding: 1px 5px; border-radius: 0px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);" title="Potência P' + pot + '">P' + pot + '</span>';

  // 2. Qualidade (Q) - Número decimal (ex: 1.050, 1.250, 1.540, 1.789), NUNCA porcentagem
  var q = pk.quality !== undefined ? pk.quality : pk.qualidade;
  var qHtml = '';
  if (q !== undefined && q !== null && !isNaN(Number(q)) && Number(q) > 0) {
    var qNum = Number(q);
    if (qNum > 5) qNum = qNum / 100;
    var qStr = qNum.toFixed(3);
    var qVal = Number(qStr);
    var qBg = qVal >= 1.6 ? 'linear-gradient(180deg, #ff8a3c, #e8322a)' : (qVal >= 1.5 ? '#8a3a92' : (qVal >= 1.3 ? '#5aa93e' : (qVal >= 1.1 ? '#4a86e8' : '#5a5668')));
    qHtml = '<span class="pk-selo" style="background: ' + qBg + '; color: #fff; font-weight: 700; padding: 1px 5px; border-radius: 0px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);" title="Qualidade: ' + qStr + '">Q ' + qStr + '</span>';
  }

  // 3. IV Total
  var iv = pk.ivTotal !== undefined ? pk.ivTotal : pk.iv;
  if (iv == null && pk.ivs && typeof pk.ivs === 'object') {
    iv = Object.values(pk.ivs).reduce(function(s, v) { return s + (Number(v) || 0); }, 0);
  }
  var ivHtml = '';
  if (iv !== undefined && iv !== null && !isNaN(Number(iv))) {
    var ivVal = Math.round(Number(iv));
    var ivBg = ivVal >= 163 ? 'linear-gradient(180deg, #ff8a3c, #e8322a)' : (ivVal >= 134 ? '#8a3a92' : (ivVal >= 96 ? '#5aa93e' : (ivVal >= 70 ? '#4a86e8' : '#5a5668')));
    ivHtml = '<span class="pk-selo" style="background: ' + ivBg + '; color: #fff; font-weight: 700; padding: 1px 5px; border-radius: 0px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);" title="IV Total: ' + ivVal + ' / 192">IV ' + ivVal + '</span>';
  }

  // 4. Nota Oficial (N)
  var n = pk.nota;
  var nHtml = '';
  if (n !== undefined && n !== null && !isNaN(Number(n))) {
    var nNum = Number(n);
    var nStr = nNum.toFixed(2);
    var nBg = nNum >= 8.5 ? '#e2a93f' : (nNum >= 7.0 ? '#8a3a92' : (nNum >= 5.5 ? '#5aa93e' : (nNum >= 4.0 ? '#4a86e8' : '#5a5668')));
    var nColor = nNum >= 8.5 ? '#000' : '#fff';
    nHtml = '<span class="pk-selo" style="background: ' + nBg + '; color: ' + nColor + '; font-weight: 800; padding: 1px 5px; border-radius: 0px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);" title="Nota Oficial: ' + nStr + '">N ' + nStr + '</span>';
  }

  var gap = compacto ? '3px' : '4px';
  return '<div class="pk-selos" style="display: flex; flex-wrap: wrap; gap: ' + gap + '; align-items: center;">' +
    potHtml + qHtml + ivHtml + nHtml +
  '</div>';
}

if (typeof window !== 'undefined') {
  window.POKEMON_NAME_TO_DEX_ID = POKEMON_NAME_TO_DEX_ID;
  window.getRotomPokemonDexId = getRotomPokemonDexId;
  window.getRotomPokemonSprite = getRotomPokemonSprite;
  window.getRotomPokemonAttributesHtml = getRotomPokemonAttributesHtml;

  window.POKEIDLE_ITEMS_DB = POKEIDLE_ITEMS_DB;
  window.POKEIDLE_ITEMS_BY_ID = POKEIDLE_ITEMS_BY_ID;
  window.ROTOM_ITEMS_DB = POKEIDLE_ITEMS_DB;
  window.getAllRotomItems = function() { return POKEIDLE_ITEMS_DB; };
  window.registerRotomItems = registerRotomItems;
  window.categoriaRotomItem = categoriaRotomItem;
  window.registerRotomNames = registerRotomNames;
  window.registerRotomRmtCatalog = registerRotomRmtCatalog;
  window.isRotomItemNoRmt = isRotomItemNoRmt;
  window.getRmtItems = getRmtItems;
  window.getRotomItem = getRotomItem;
  window.searchRotomItems = searchRotomItems;
  window.getItemIconUrl = getItemIconUrl;
}
