// Núcleo da internacionalização (sem dependência do Electron): roda no processo principal (require)
// e nas páginas de interface (<script src="../i18n/core.js">, que expõe `PKI18N`).
// Idiomas: inglês (padrão e fallback), português do Brasil e espanhol. Os textos ficam em `areas/*.js`,
// um arquivo por área, cada um no formato { en: {chave: texto}, 'pt-BR': {...}, es: {...} }.
// Interpolação: "{nome}" é trocado pelo valor de params.nome.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PKI18N = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULT_LANG = 'en';
  // code = valor salvo em config.json; native = nome do idioma nele mesmo (aparece no seletor)
  const LANGS = [
    { code: 'en', native: 'English' },
    { code: 'pt-BR', native: 'Português (Brasil)' },
    { code: 'es', native: 'Español' },
  ];
  const isLang = (code) => LANGS.some((l) => l.code === code);

  // Converte um código qualquer ("pt", "pt-PT", "es-MX", "en-US", "pt_BR") para um idioma suportado, ou null.
  function normalize(code) {
    if (typeof code !== 'string' || !code) return null;
    const c = code.replace('_', '-').toLowerCase();
    if (c === 'pt' || c.startsWith('pt-')) return 'pt-BR';
    if (c === 'es' || c.startsWith('es-')) return 'es';
    if (c === 'en' || c.startsWith('en-')) return 'en';
    return null;
  }

  // Idioma a usar: o salvo (se válido) > o do sistema > inglês
  function resolveLang(saved, systemLocale) {
    return (isLang(saved) ? saved : null) ?? normalize(systemLocale) ?? DEFAULT_LANG;
  }

  function interpolate(text, params) {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(params, k) ? String(params[k]) : m));
  }

  // areas: lista de { en, 'pt-BR', es }. Chave ausente no idioma → inglês → a própria chave.
  function createTranslator(areas, initial = DEFAULT_LANG) {
    let lang = isLang(initial) ? initial : DEFAULT_LANG;
    const dicts = { en: {}, 'pt-BR': {}, es: {} };
    for (const a of areas) for (const l of Object.keys(dicts)) Object.assign(dicts[l], a[l] ?? {});
    const lookup = (key) => dicts[lang][key] ?? dicts[DEFAULT_LANG][key] ?? key;
    return {
      t: (key, params) => interpolate(lookup(key), params),
      has: (key) => Object.hasOwn(dicts[lang], key),
      getLang: () => lang,
      setLang(code) {
        if (!isLang(code)) return false;
        lang = code;
        return true;
      },
      dicts,
    };
  }

  return { DEFAULT_LANG, LANGS, isLang, normalize, resolveLang, interpolate, createTranslator };
});
