// Regras de versão do workflow de Release (tools/release-plan.js).
const { check, finish } = require('./helpers');
const { planRelease, latestVersion, parseVersion } = require('../tools/release-plan');

const tags = ['v1.0.0', 'v1.2.3', 'v1.10.0', 'v1.9.9', 'latest', 'v2', 'nightly-3'];
const plan = (title, labels = [], extra = {}) => planRelease({ title, labels, tags, ...extra });

check(latestVersion(tags).join('.') === '1.10.0', 'a maior tag vX.Y.Z (1.10.0 > 1.9.9; ignora tags fora do padrão)');
check(latestVersion([]).join('.') === '1.0.0', 'sem nenhuma tag, parte de 1.0.0');
check(parseVersion('v1.2.3').join('.') === '1.2.3' && parseVersion('1.2') === null, 'lê "v1.2.3" e recusa "1.2"');

let p = plan('feat: botão novo');
check(!p.skip && p.version === '1.11.0' && p.tag === 'v1.11.0', `feat -> minor: ${p.tag}`);
p = plan('fix: corrige o foco');
check(!p.skip && p.version === '1.10.1', `fix -> patch: ${p.tag}`);
p = plan('feat(barra)!: troca o contrato');
check(!p.skip && p.version === '2.0.0', `"!" -> major: ${p.tag}`);
p = plan('refactor: limpa o layout');
check(!p.skip && p.version === '1.10.1', `refactor -> patch: ${p.tag}`);
for (const t of ['docs: README', 'chore: dependabot', 'ci: workflow', 'test: mais um', 'style: espaços', 'build: electron']) {
  check(plan(t).skip === true, `"${t}" não lança versão`);
}
check(plan('ajusta uma coisa').skip === true, 'título sem prefixo não lança versão');
check(plan('wip: algo').skip === true, 'tipo desconhecido não lança versão');

check(plan('docs: README', ['release:patch']).version === '1.10.1', 'rótulo release:patch força o lançamento mesmo em "docs:"');
check(plan('feat: grande', ['release:major']).version === '2.0.0', 'rótulo release:major vale mais que o prefixo');
check(plan('feat: novo', ['release:skip']).skip === true, 'rótulo release:skip impede o lançamento');
check(plan('fix: x BREAKING CHANGE no corpo do título').version === '2.0.0', 'BREAKING CHANGE no título -> major');

p = planRelease({ tags, manualBump: 'minor' });
check(!p.skip && p.version === '1.11.0', `disparo manual (minor) ignora o PR: ${p.tag}`);
p = planRelease({ title: 'Merge pull request #9 from x/y', labels: [], tags: [] });
check(p.skip === true, 'título de merge commit (sem PR/prefixo) não lança versão');
p = planRelease({ title: 'feat: primeira', tags: [] });
check(p.version === '1.1.0', `sem tags + feat: ${p.tag}`);

finish();
