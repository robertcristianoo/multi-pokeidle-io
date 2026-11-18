// Extensões do Chromium que o app carrega nas contas (pasta `extensions/`, de fora do código do app):
//   - Rotom Sniper (mercado) e /hunt for PokeIdle (onde caçar).
// Cada conta tem a própria sessão (`persist:contaN`), então cada extensão é carregada uma vez por conta, ANTES de o
// jogo abrir (os content scripts só entram em páginas carregadas depois). Cada uma pode ser ligada ou desligada por
// conta (Configurações › Extensões); tudo vem ligado de fábrica. Mudar o estado recarrega a página da conta, para
// os scripts entrarem (ou saírem). O estado fica em config.json, só com o que foi DESLIGADO: `chromeExtOff: { rotom: [2] }`.
const path = require('path');
const { session } = require('electron');
const { t } = require('./i18n');

// dentro do app empacotado a pasta fica fora do asar (ver asarUnpack no package.json)
const dirOf = (name) => path.join(__dirname, '..', 'extensions', name).replace('app.asar', 'app.asar.unpacked');

const CATALOG = [
  {
    id: 'rotom',
    name: 'Rotom Sniper',
    get desc() { return t('ext.rotom.desc'); }, // avaliada no uso, para respeitar a troca de idioma
    dir: dirOf('rotom-sniper'),
  },
  {
    id: 'hunt',
    name: '/hunt for PokeIdle',
    get desc() { return t('ext.hunt.desc'); },
    dir: dirOf('hunt-for-pokeidle'),
  },
];

function createChromeExt({ maxAccounts, config, getSlots, sendLog }) {
  const loaded = new Map(); // "ext:conta" -> id da extensão naquela sessão
  const listeners = new Set();
  const key = (ext, acc) => `${ext}:${acc}`;
  const apiOf = (acc) => { const ses = session.fromPartition(`persist:conta${acc}`); return ses.extensions ?? ses; };
  const known = (ext) => CATALOG.some((c) => c.id === ext);
  const validAcc = (acc) => Number.isInteger(acc) && acc >= 1 && acc <= maxAccounts;

  const offList = (ext) => (Array.isArray(config.get()?.[ext]) ? config.get()[ext] : []);
  const isEnabled = (ext, acc) => !offList(ext).includes(acc);

  async function load(ext, acc) {
    if (loaded.has(key(ext, acc))) return;
    const item = CATALOG.find((c) => c.id === ext);
    try {
      const e = await apiOf(acc).loadExtension(item.dir);
      loaded.set(key(ext, acc), e.id);
    } catch (err) {
      console.error(`extensão ${ext}: não consegui carregar na conta ${acc}:`, err);
      sendLog?.({ acc: `conta${acc}`, kind: 'load', level: 'error', text: t('ext.loadFail', { ext, error: err.message }) });
    }
  }

  async function unload(ext, acc) {
    const id = loaded.get(key(ext, acc));
    if (!id) return;
    loaded.delete(key(ext, acc));
    try {
      await apiOf(acc).removeExtension(id);
    } catch (err) {
      console.error(`extensão ${ext}: não consegui remover da conta ${acc}:`, err);
    }
  }

  return {
    catalog: () => CATALOG.map(({ id, name, desc }) => ({ id, name, desc })),
    isEnabled,
    /** id da extensão carregada naquela conta (null se desligada ou com falha) */
    idOf: (ext, acc) => loaded.get(key(ext, acc)) ?? null,
    /** carrega, em todas as contas, o que está ligado; o main espera isto antes de criar as contas */
    ready: () => Promise.all(CATALOG.flatMap((c) => Array.from({ length: maxAccounts }, (_v, i) => (isEnabled(c.id, i + 1) ? load(c.id, i + 1) : null)))),
    state: () => ({
      max: maxAccounts,
      items: CATALOG.map((c) => ({
        id: c.id,
        name: c.name,
        desc: c.desc,
        accounts: Object.fromEntries(Array.from({ length: maxAccounts }, (_v, i) => [i + 1, isEnabled(c.id, i + 1)])),
      })),
    }),
    async setEnabled(ext, acc, on) {
      acc = Number(acc);
      if (!known(ext) || !validAcc(acc) || isEnabled(ext, acc) === !!on) return;
      const off = new Set(offList(ext));
      if (on) off.delete(acc); else off.add(acc);
      config.set({ ...(config.get() ?? {}), [ext]: [...off].sort() });
      if (on) await load(ext, acc); else await unload(ext, acc);
      listeners.forEach((fn) => { try { fn(ext, acc, !!on); } catch (err) { console.error(err); } });
      // os content scripts só valem em página nova: recarrega a conta (se estiver ligada)
      const slot = getSlots().find((s) => s.id === acc);
      if (slot && !slot.view.webContents.isDestroyed()) slot.view.webContents.reload();
    },
    /** avisa quando uma extensão é ligada/desligada em uma conta: fn(ext, conta, ligada) */
    onChange: (fn) => { listeners.add(fn); },
  };
}

module.exports = { createChromeExt };
