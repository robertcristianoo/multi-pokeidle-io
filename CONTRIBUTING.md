# Contributing

Thanks for your interest in PokeIdle Multi. This is a small fan project; issues and pull requests are welcome. Project conventions (language, commits, translations) are summarised in [CLAUDE.md](CLAUDE.md).

## Setup

Requirements: [Node.js](https://nodejs.org) 22.12 or newer and npm.

```bash
npm install   # install dependencies
npm start     # run the app (Electron)
npm test      # syntax check and Electron tests (hidden window, temporary data folder)
```

`npm test` never touches your saved sessions. It also runs automatically before `npm run dist` and `npm run dist:release`, and a failing test blocks the build.

## Translations

The app is available in English (default), Brazilian Portuguese and Spanish. UI text lives in `src/i18n/areas/`, with all three languages side by side; a missing key falls back to English, and `test/i18n.test.js` fails when the languages drift apart.

## Pull requests

- Open the pull request against `main`, with a title in the `type: description` style, written in English.
- **The title decides whether a release is published:**

| PR title / label | Result |
|---|---|
| `feat: …` | minor release |
| `fix: …`, `perf: …`, `refactor: …` | patch release |
| `type!: …` or `BREAKING CHANGE` in the title | major release |
| `docs:`, `chore:`, `ci:`, `test:`, `style:`, `build:`, `revert:` | no release |
| label `release:major` / `release:minor` / `release:patch` | forces that bump |
| label `release:skip` | no release |

Without a recognised prefix or a `release:*` label, no version is published. The rules live in [`tools/release-plan.js`](tools/release-plan.js) and run from [`.github/workflows/release.yml`](.github/workflows/release.yml).

## Security

Do not open public issues for vulnerabilities; see [SECURITY.md](SECURITY.md).
