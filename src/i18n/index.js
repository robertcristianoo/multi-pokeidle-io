// Internacionalização do processo principal. Uso:
//   const { t } = require('./i18n');   t('chave', { param })
// O idioma é escolhido em init() (config.json > idioma do sistema > inglês) e pode mudar em tempo de execução
// com setLang(): as páginas registradas com loadPage() recarregam já no idioma novo.
// Os textos ficam em areas/*.js (um arquivo por área); chave ausente cai no inglês.
const fs = require('fs');
const path = require('path');
const core = require('./core');

const AREAS_DIR = path.join(__dirname, 'areas');
const areas = fs.readdirSync(AREAS_DIR).filter((f) => f.endsWith('.js')).sort().map((f) => require(path.join(AREAS_DIR, f)));
const tr = core.createTranslator(areas);

const pages = new Map(); // webContents -> arquivo .html (sem a query de idioma)
const listeners = new Set();

// Carrega uma página de interface (src/ui/*.html) passando o idioma na URL (?lang=): a página lê dali
// e usa os textos das áreas. Se o idioma mudar, a página é recarregada (com a mesma query, mais o idioma novo).
function loadPage(wc, file, query = {}) {
  pages.set(wc, { file, query });
  wc.once('destroyed', () => pages.delete(wc));
  return wc.loadFile(file, { query: { ...query, lang: tr.getLang() } });
}

function setLang(code) {
  if (!tr.setLang(code)) return false;
  for (const [wc, { file, query }] of pages) {
    if (wc.isDestroyed()) { pages.delete(wc); continue; }
    wc.loadFile(file, { query: { ...query, lang: code } }).catch(() => {});
  }
  for (const cb of listeners) { try { cb(code); } catch (err) { console.error('i18n:', err); } }
  return true;
}

// Escolhe o idioma inicial. `saved` = valor de config.json; `installLang` = o que o instalador gravou (se houver);
// `locale` = idioma do sistema (app.getLocale()). Não grava nada: o idioma só é salvo quando o usuário o escolhe.
function init({ saved, installLang, locale } = {}) {
  tr.setLang(core.resolveLang(saved, core.isLang(installLang) ? installLang : locale));
  return tr.getLang();
}

module.exports = {
  ...core,
  t: tr.t,
  has: tr.has,
  getLang: tr.getLang,
  setLang,
  init,
  loadPage,
  onChange: (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
  dicts: tr.dicts,
};
