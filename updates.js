// Avisa quando existe um Release mais novo no GitHub. Só LÊ a API pública (`releases/latest`, sem login e sem
// mandar nada do jogador) e compara com a versão do pacote; quem decide atualizar é a pessoa: o botão abre a
// página do Release no navegador, de onde se baixa o instalador ou o portátil.
// Só roda em pacote de Release (o workflow grava `release-info.json`); em desenvolvimento ou em build local
// `currentVersion` vem nulo e nada é consultado.
const { parseVersion, compare } = require('./tools/release-plan');

const REPO = 'robertcristianoo/multi-pokeidle-io';
const FIRST_CHECK_MS = 15 * 1000;
const EVERY_MS = 20 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000; // consultas pedidas (foco da janela) não passam de uma por minuto

function isNewer(latest, current) {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  return !!a && !!b && compare(a, b) > 0;
}

function createUpdater({ currentVersion, onAvailable, fetchImpl = globalThis.fetch, repo = REPO, timers = true }) {
  let state = { kind: 'none', current: currentVersion ?? null };
  let notified = null;

  let lastAt = 0;
  async function check({ force = true } = {}) {
    if (!currentVersion || typeof fetchImpl !== 'function') return state;
    if (!force && Date.now() - lastAt < MIN_GAP_MS) return state;
    lastAt = Date.now();
    try {
      const res = await fetchImpl(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'multi-pokeidle-io-update-check' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return state; // sem internet, limite da API etc.: tenta de novo na próxima
      const rel = await res.json();
      if (rel.draft || rel.prerelease) return state;
      const latest = String(rel.tag_name ?? '').replace(/^v/, '');
      if (isNewer(latest, currentVersion)) {
        state = { kind: 'available', current: currentVersion, latest, url: String(rel.html_url ?? `https://github.com/${repo}/releases/latest`) };
        if (notified !== latest) {
          notified = latest;
          onAvailable?.(state);
        }
      } else {
        state = { kind: 'none', current: currentVersion };
      }
    } catch {
      /* offline ou tempo esgotado: silêncio */
    }
    return state;
  }

  if (timers && currentVersion) {
    setTimeout(check, FIRST_CHECK_MS).unref?.();
    setInterval(() => check(), EVERY_MS).unref?.();
  }

  return { check, state: () => state };
}

module.exports = { createUpdater, isNewer, REPO };
