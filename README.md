# PokeIdle Multi: run multiple PokeIdle.io accounts in one window

[🇬🇧 English](README.md) · 🇧🇷 [Português](README.pt-BR.md)

**PokeIdle Multi is an unofficial, open-source Windows desktop app (Electron) that runs several [PokeIdle.io](https://pokeidle.io) accounts side by side in a single window, each with its own isolated session** (cookies, login and local data are never shared between accounts). It is made only for PokeIdle.io, not for similarly named games such as PokeIdle World.

<!-- IMAGE (to capture): docs/images/grid-4-accounts.png
     Alt text: "Grid of four PokeIdle.io accounts running side by side in one PokeIdle Multi window"
     Suggested markup: ![Grid of four PokeIdle.io accounts running side by side in one PokeIdle Multi window](docs/images/grid-4-accounts.png) -->

> Fan project, **unofficial** and not affiliated with PokeIdle, Nintendo, Game Freak, Creatures or The Pokémon Company.

## Download

Get the latest version from the [Releases page](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest) (Windows x64):

- `multi-pokeidle-io-Setup-<version>.exe`: installer (installs for your user, creates a shortcut and asks for the language).
- `multi-pokeidle-io-Portable-<version>.exe`: portable build, runs without installing.

The executables are **not code-signed**, so Windows SmartScreen may show a warning on first run ("More info" → "Run anyway"). Download only from the official Releases page of this repository.

## Features

- **2 or 4 accounts** in a grid inside one window, each with its own isolated session (a `persist:contaN` partition saved on disk, so you log in once per account).
- **Accounts named after the in-game player**, read from the game itself and stored only on your computer.
- Focus one account, reorder the grid, reload, hard-refresh or reset a single account with keyboard shortcuts (press `F1` in the app for the full list).
- **Turn an account off and on** to free CPU and memory without losing its login.
- **RAM bar** showing the total and per-account memory use (toggle with `Ctrl+M`).
- **ULTRA mode** button: turns on the game's own ULTRA economy mode in all accounts at once.
- **Reduced animations** to lower CPU use (the same "reduced motion" request a browser makes).
- **Twitch and Kick bonus lives**: lightweight, video-less viewing of live channels to keep the in-game bonus active, a channel priority list, per-account login, a redemption log, and a **points** panel to redeem by hand.
- **Optional auto-redeem** of channel points (off by default; it may violate Twitch/Kick rules, use at your own risk).
- **IdleHub vote** button per account, with the captcha and the vote itself completed by you.
- **Optional auto-restock** (off by default) that buys balls, revives and potions from the game's NPC market within limits you set. It spends real in-game gold.
- **Capture watchdog**: an alert when an account stops capturing.
- **Discord per account**: opens the community invite in a Discord session of its own for each account.
- **☕ Coffee window**: a PIX QR code for anyone who wants to support the project (optional, nothing is charged).
- Two bundled Chromium extensions, each switchable per account: **Rotom Sniper** and **/hunt for PokeIdle**.
- **Languages**: English (default), Brazilian Portuguese and Spanish, chosen in the installer and changeable in **⚙ Settings › Language**.
- Log window (method, status and URL only, never request bodies).

The detailed documentation of each feature is in [README.pt-BR.md](README.pt-BR.md) (Portuguese).

## Requirements

- Windows 10/11 (tested on Windows 11; Electron also runs on macOS and Linux, but this project has not been tested there).
- To run from source: [Node.js LTS](https://nodejs.org) 22.12 or newer (includes npm); [Git](https://git-scm.com) is optional.

## Quick start

1. Download and run the Setup (or Portable) executable from [Releases](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest).
2. The app opens full screen with **2 accounts** side by side. Log in once in each quadrant; the session is saved on disk.
3. Press **`Ctrl+Shift+0`** (or `Ctrl+Alt+Shift+0`) to switch between 2 and 4 accounts, `Ctrl+1…4` to focus an account, and `F1` for help.

To run from source:

```bash
git clone https://github.com/robertcristianoo/multi-pokeidle-io.git
cd multi-pokeidle-io
npm install
npm start
```

<!-- IMAGE (to capture): docs/images/focus-and-help.png
     Alt text: "PokeIdle Multi with one account focused and the F1 shortcut help open"
     Suggested markup: ![PokeIdle Multi with one account focused and the F1 shortcut help open](docs/images/focus-and-help.png) -->

## Safety and terms

- This is a fan project with no affiliation to PokeIdle or its owners. Use it in accordance with the [PokeIdle terms](https://pokeidle.io/terms); use is **at your own risk**, and the maintainers are not responsible for suspensions, bans or other penalties applied by the game or by Twitch/Kick.
- Optional automation features (auto-restock, auto-redeem) are off by default. Check the rules of the game and of the sites before enabling them.
- The code is public so anyone can audit it. For what the app does with your data and how to report a vulnerability, see [SECURITY.md](SECURITY.md) (written in Portuguese).

## FAQ

### What is PokeIdle Multi?
An unofficial, open-source Windows app that shows several PokeIdle.io (Poke Idle) accounts in one window, in a grid of 2 or 4 quadrants, each with a separate session.

### Does it work with PokeIdle World?
No. It is made only for PokeIdle.io (`pokeidle.io`).

### How do I run multiple accounts in one window?
Open the app, log in once in each quadrant, and use `Ctrl+Shift+0` (or `Ctrl+Alt+Shift+0`, as Windows may capture the first) to switch between 2 and 4 accounts. `Ctrl+1…4` focuses an account; press the same shortcut again to return to the grid.

### Are the accounts isolated from each other?
Yes. Each account uses its own Electron partition (`persist:conta1` … `persist:conta4`), with separate cookies and `localStorage`, saved on your computer.

### Which platforms are supported?
Releases are built for Windows x64 (Windows 10/11, tested on Windows 11). Electron also runs on macOS and Linux, but this project has not been tested there.

### Does the app send my data anywhere?
The app does not collect telemetry and does not send game data to third parties (see [SECURITY.md](SECURITY.md)). Release builds occasionally check GitHub's public releases API (`api.github.com`, no login, nothing of yours sent) to show an update notice; builds run with `npm start` do not. Features you use talk to the services they depend on: the Lives feature connects to Twitch and Kick, and the vote and Discord windows load the IdleHub and Discord pages with that account's own session.

### Does the app modify the game?
It embeds the official site and does not change the game's behaviour. Its features read data the game already sends to the page and use the game's own controls. The one local change is for the /hunt extension's shortcut: the app serves the game's `app.js` with a small addition that only annotates each Pokémon sprite, and nothing is sent anywhere. If the game changes and the insertion point is not found, the original script is used unmodified and a warning is written to the log.

## License activation and optional modules

**⚙ Settings › License** shows this computer's ID and lets you activate a per-machine license key. The app can also load optional modules that are **not part of the public source code**. Without a license nothing changes: every feature described above keeps working. The check is entirely offline and sends nothing anywhere.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
