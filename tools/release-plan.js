// Decide, a partir do PR que entrou na main, se sai uma versão nova e qual (major.minor.patch).
// Usado pelo workflow `.github/workflows/release.yml` e coberto por `test/release-plan.test.js`.
//
// Regras (a primeira que valer):
//   1. rótulo do PR: `release:skip` (não lança), `release:major`, `release:minor` ou `release:patch`;
//   2. prefixo do título no estilo "tipo: texto":
//        `tipo!:` ou "BREAKING CHANGE"  -> major
//        feat                           -> minor
//        fix, perf, refactor            -> patch
//        docs, chore, ci, test, style, build, revert -> não lança versão
//   3. título sem prefixo conhecido: não lança (use um rótulo `release:*` para forçar).

const BASE = '1.0.0'; // quando ainda não existe nenhuma tag v*

const VERSAO = /^v?(\d+)\.(\d+)\.(\d+)$/;

function parseVersion(tag) {
  const m = VERSAO.exec(String(tag ?? '').trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
}

// A maior versão entre as tags (ignora tags que não são vX.Y.Z)
function latestVersion(tags) {
  const vs = (tags ?? []).map(parseVersion).filter(Boolean).sort(compare);
  return vs.length ? vs[vs.length - 1] : parseVersion(BASE);
}

const POR_TIPO = {
  feat: 'minor',
  fix: 'patch',
  perf: 'patch',
  refactor: 'patch',
  docs: null,
  chore: null,
  ci: null,
  test: null,
  style: null,
  build: null,
  revert: null,
};

function bumpFromPr({ title = '', labels = [] }) {
  const rotulos = labels.map((l) => String(l).toLowerCase());
  if (rotulos.includes('release:skip')) return { bump: null, reason: 'rótulo release:skip' };
  for (const nivel of ['major', 'minor', 'patch']) {
    if (rotulos.includes(`release:${nivel}`)) return { bump: nivel, reason: `rótulo release:${nivel}` };
  }
  if (/BREAKING CHANGE/i.test(title)) return { bump: 'major', reason: 'BREAKING CHANGE no título' };
  const m = /^(\w+)(\([^)]*\))?(!)?:/.exec(title.trim());
  if (!m) return { bump: null, reason: 'título sem prefixo "tipo:" e sem rótulo release:*' };
  const tipo = m[1].toLowerCase();
  if (m[3]) return { bump: 'major', reason: `"${tipo}!" no título` };
  if (!(tipo in POR_TIPO)) return { bump: null, reason: `tipo "${tipo}" não é reconhecido` };
  return POR_TIPO[tipo]
    ? { bump: POR_TIPO[tipo], reason: `tipo "${tipo}"` }
    : { bump: null, reason: `tipo "${tipo}" não lança versão` };
}

function nextVersion(atual, bump) {
  const [M, m, p] = atual;
  if (bump === 'major') return [M + 1, 0, 0];
  if (bump === 'minor') return [M, m + 1, 0];
  return [M, m, p + 1];
}

// `manualBump` ('major' | 'minor' | 'patch') vem do disparo manual do workflow e ignora o PR.
function planRelease({ title, labels, tags, manualBump } = {}) {
  const atual = latestVersion(tags);
  const { bump, reason } = manualBump ? { bump: manualBump, reason: `disparo manual (${manualBump})` } : bumpFromPr({ title, labels });
  if (!bump) return { skip: true, reason, current: atual.join('.') };
  const v = nextVersion(atual, bump).join('.');
  return { skip: false, bump, reason, current: atual.join('.'), version: v, tag: `v${v}` };
}

module.exports = { planRelease, parseVersion, compare, latestVersion, bumpFromPr, nextVersion, BASE };
