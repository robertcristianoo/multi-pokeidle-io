// Tradução das páginas de interface. Carregue depois de ../i18n/core.js e dos arquivos de ../i18n/areas/ que a página usa.
// O idioma vem da URL (?lang=, posto pelo main em loadPage). Expõe t(chave, params) e traduz o HTML marcado com:
//   data-i18n="chave"          troca o texto do elemento
//   data-i18n-title="chave"    troca o atributo title
//   data-i18n-placeholder="chave"
//   data-i18n-html="chave"     troca o innerHTML (para textos com <b>, <kbd>)
(function () {
  const asked = new URLSearchParams(location.search).get('lang');
  const lang = PKI18N.isLang(asked) ? asked : PKI18N.DEFAULT_LANG;
  const tr = PKI18N.createTranslator(window.PKI18N_AREAS || [], lang);
  window.t = tr.t;
  window.lang = lang;
  document.documentElement.lang = lang;
  function apply(root = document) {
    for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = tr.t(el.dataset.i18n);
    for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = tr.t(el.dataset.i18nHtml);
    for (const el of root.querySelectorAll('[data-i18n-title]')) el.title = tr.t(el.dataset.i18nTitle);
    for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.placeholder = tr.t(el.dataset.i18nPlaceholder);
    const title = document.querySelector('title[data-i18n]');
    if (title) document.title = tr.t(title.dataset.i18n);
  }
  window.applyI18n = apply;
  // roda assim que o DOM existir (os scripts da página ficam no fim do <body>, depois deste)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply());
  else apply();
})();
