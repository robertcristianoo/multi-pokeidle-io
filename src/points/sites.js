// Constantes dos sites de pontos (Twitch e Kick): endereços, login, cadência de conferência e os bônus do PokeIdle.
// Só dados e textos de script; nada aqui roda sozinho.

const enc = encodeURIComponent;

// Bônus do jogo que cada conta pode resgatar com os pontos do canal. `word` casa com o título do bônus no canal.
const BONUSES = {
  xp: { label: '+15% XP', cost: 300, word: '\\bxp\\b' },
  captura: { label: 'Captura', cost: 500, word: 'captur' },
  shiny: { label: 'Shiny', cost: 1000, word: 'lure|shiny' },
};

const SITES = {
  twitch: {
    label: 'Twitch',
    intervalMs: 2 * 60 * 1000, // baixa rápido: o saldo sobe mais depressa na Twitch
    loginCookie: { url: 'https://www.twitch.tv', name: 'auth-token' },
    deviceCookie: { url: 'https://www.twitch.tv', name: 'unique_id' },
    loginUrl: 'https://www.twitch.tv/login',
    chatUrl: (ch) => `https://www.twitch.tv/popout/${enc(ch)}/chat?popout=`,
    pageUrl: (ch) => `https://www.twitch.tv/${enc(ch)}`,
  },
  kick: {
    label: 'Kick',
    intervalMs: 5 * 60 * 1000,
    loginCookie: { url: 'https://kick.com', name: 'session_token' },
    loginUrl: 'https://kick.com',
    chatUrl: (ch) => `https://kick.com/${enc(ch)}`,
    pageUrl: (ch) => `https://kick.com/${enc(ch)}`,
  },
};

// Cada conta tem a sua sessão por site (o login da Twitch/Kick fica nela, e só se faz uma vez).
const partitionOf = (site, acc) => `persist:pontos-${site}-conta${acc}`;

// Botões e campos do rodapé do chat, em ordem de preferência. Os seletores não foram validados contra o site ao vivo:
// se nada casar, o painel avisa e mostra a página inteira.
const POINTS_BUTTON_SELECTORS = [
  '[data-testid*="points" i]',
  '[data-test-selector*="points" i]',
  'button[aria-label*="ponto" i]',
  'button[aria-label*="point" i]',
  'button[title*="ponto" i]',
  'button[title*="point" i]',
  'button[aria-label*="bônus" i]',
  'button[aria-label*="bonus" i]',
];
const CHAT_INPUT_SELECTORS = ['textarea', '[contenteditable="true"]', 'input[type="text"]'];

// Script (texto) que deixa só o rodapé do chat visível: acha o botão dos pontos e o campo de mensagem, marca o
// ancestral comum dos dois e esconde os irmãos de cada nível até o body. Popups (fixed/absolute ou role de menu)
// não são escondidos. Roda de novo a cada 1,5 s, porque o site redesenha a página. Devolve 'ok' ou 'nao-achou'.
// Também serve para voltar à página inteira (mode 'full').
function footerScript(mode) {
  const arg = JSON.stringify({ mode, btn: POINTS_BUTTON_SELECTORS, input: CHAT_INPUT_SELECTORS });
  return `(() => {
    const cfg = ${arg};
    const HID = 'data-deck-hid';
    const restore = () => document.querySelectorAll('[' + HID + ']').forEach((e) => { e.style.display = ''; e.removeAttribute(HID); });
    const first = (list) => { for (const s of list) { const el = document.querySelector(s); if (el) return el; } return null; };
    const chain = (el) => { const r = []; for (let e = el; e; e = e.parentElement) r.push(e); return r; };
    const popup = (s) => /fixed|absolute/.test(getComputedStyle(s).position) || s.matches('[role=dialog],[role=menu],[role=listbox],[role=tooltip]');
    const apply = () => {
      restore();
      const btn = first(cfg.btn);
      const input = first(cfg.input);
      if (!btn || !input) return 'nao-achou';
      const inInput = chain(input);
      const common = chain(btn).find((e) => inInput.includes(e));
      if (!common) return 'nao-achou';
      const keep = new Set(chain(common));
      for (let e = common; e && e !== document.body; e = e.parentElement) {
        for (const s of Array.from(e.parentElement.children)) {
          if (keep.has(s) || popup(s)) continue;
          s.setAttribute(HID, ''); s.style.display = 'none';
        }
      }
      return 'ok';
    };
    clearInterval(window.__deckTimer);
    window.__deckMode = cfg.mode;
    if (cfg.mode !== 'footer') { restore(); return 'ok'; }
    const r = apply();
    window.__deckTimer = setInterval(apply, 1500);
    return r;
  })()`;
}

module.exports = { BONUSES, SITES, partitionOf, footerScript, POINTS_BUTTON_SELECTORS, CHAT_INPUT_SELECTORS };
