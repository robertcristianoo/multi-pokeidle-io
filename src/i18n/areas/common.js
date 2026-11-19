// Textos comuns (aparecem em mais de uma área). Formato: ver ../core.js
(function (root, area) {
  if (typeof module !== 'undefined' && module.exports) module.exports = area;
  else (root.PKI18N_AREAS = root.PKI18N_AREAS || []).push(area);
})(typeof self !== 'undefined' ? self : this, {
  en: {
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.on': 'On',
    'common.off': 'Off',
    'common.account': 'Account {id}',
  },
  'pt-BR': {
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
    'common.save': 'Salvar',
    'common.on': 'Ligado',
    'common.off': 'Desligado',
    'common.account': 'Conta {id}',
  },
  es: {
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.on': 'Activado',
    'common.off': 'Desactivado',
    'common.account': 'Cuenta {id}',
  },
});
