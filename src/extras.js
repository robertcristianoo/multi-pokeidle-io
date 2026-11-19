// Carregador de módulos adicionais. Eles não fazem parte do código público: a pasta src/_x fica fora do repositório
// (ignorada pelo git) e, quando existe, é carregada aqui. Sem a pasta, este carregador não faz nada.
//
// Contrato: src/_x/index.js exporta `(host) => ext | ext[]`, em que `ext` segue o mesmo formato dos demais módulos
// do app (`features?()`, `onSlotCreated?(id, view)`, `onSlotRemoved?(id)`, `ready?()`). O `host` é montado em main.js
// e dá só o que os módulos precisam (ver a montagem em main.js, "montarHost").
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '_x');

function carregarExtras(host) {
  const entrada = path.join(DIR, 'index.js');
  if (!fs.existsSync(entrada)) return [];
  try {
    const r = require(entrada)(host);
    return Array.isArray(r) ? r.filter(Boolean) : r ? [r] : [];
  } catch (err) {
    console.error('falha ao carregar os módulos adicionais:', err);
    return [];
  }
}

module.exports = { carregarExtras, DIR };
