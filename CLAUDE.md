# Project conventions

## Language
- **English everywhere** from now on: code identifiers, new comments, log and error messages meant for developers, commit messages, pull request titles and descriptions, documentation and issues.
- Existing Portuguese comments may stay until the file is touched for other reasons; do not rewrite them in bulk. When you edit a comment, write the new text in English.
- **User-facing text is never hard-coded.** Every string shown in the UI (windows, menus, toasts, dialogs, tooltips, help) goes through the i18n layer in `src/i18n/`: add the key to the matching file in `src/i18n/areas/` with all three languages (`en`, `pt-BR`, `es`) and use `t('key', { param })`. English is the default and the fallback. `test/i18n.test.js` fails when the languages drift apart.
- Pages in `src/ui/` load their pages with `loadPage()` (so they reload on language change) and use `data-i18n*` attributes or `t()`.

## Commits and pull requests
- Conventional Commits with a lowercase prefix (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`...). `tools/release-plan.js` decides the release version from it.
- Short, objective subject in the present tense (about 70 characters). Professional, formal tone, no slang.
- Body separated by a blank line, explaining what changed and why, in full sentences.
- Pull requests use the sections Context, Changes and Notes. Titles that target `main` must start with `feat:`, `fix:`, `perf:` or `refactor:` (never `release:`), or carry a `release:*` label.
- No `Co-Authored-By` trailer and no "Generated with" footer.

## Tests
- `npm test` runs a syntax check and every `test/*.test.js` under Electron with an isolated data folder.
- Tests that compare UI text pin the language with `require('../src/i18n').setLang('pt-BR')` at the top, or use `t()`.
