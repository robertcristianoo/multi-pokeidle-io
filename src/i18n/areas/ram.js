// Textos da barra de RAM (src/ram.js e src/ui/ram.html). Formato: ver ../core.js
(function (root, area) {
  if (typeof module !== 'undefined' && module.exports) module.exports = area;
  else (root.PKI18N_AREAS = root.PKI18N_AREAS || []).push(area);
})(typeof self !== 'undefined' ? self : this, {
  en: {
    'ram.page': 'Memory',
    'ram.total.title': 'Working memory of the whole app (sum of the processes)',
    'ram.other.label': 'app/other',
    'ram.other.title': 'Main process, GPU and the app\'s bars/notices',
    'ram.account.title': 'Position {pos} on the grid: game page process',
    'ram.hide.title': 'Hide the RAM bar (it comes back with Ctrl+M or through help F1)',
  },
  'pt-BR': {
    'ram.page': 'Memória',
    'ram.total.title': 'Memória de trabalho de todo o app (soma dos processos)',
    'ram.other.label': 'app/outros',
    'ram.other.title': 'Processo principal, GPU e barras/avisos do app',
    'ram.account.title': 'Posição {pos} na grade: processo da página do jogo',
    'ram.hide.title': 'Ocultar a barra de RAM (volta com Ctrl+M ou pela ajuda F1)',
  },
  es: {
    'ram.page': 'Memoria',
    'ram.total.title': 'Memoria de trabajo de toda la app (suma de los procesos)',
    'ram.other.label': 'app/otros',
    'ram.other.title': 'Proceso principal, GPU y barras/avisos de la app',
    'ram.account.title': 'Posición {pos} en la cuadrícula: proceso de la página del juego',
    'ram.hide.title': 'Ocultar la barra de RAM (vuelve con Ctrl+M o desde la ayuda F1)',
  },
});
