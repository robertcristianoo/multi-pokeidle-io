// Liga/desliga por conta. Uma conta desligada não tem WebContents do jogo: o processo de renderização é destruído,
// então ela não gasta CPU nem memória. A sessão continua em disco (partição `persist:contaN`), por isso o login
// volta ao ligar. No lugar do jogo entra uma página de "Conta desligada" com o botão para ligar.
// O estado (ids desligados) fica em config.json, na chave `offAccounts`, e vale na próxima abertura.
//
// Este módulo guarda o estado e cria a página de "desligada". Quem troca a view do quadrante é o main.js
// (setAccountPower), porque é ele que conhece a grade, o foco e a criação das views do jogo.
const path = require('path');
const { WebContentsView, ipcMain } = require('electron');

const OFF_KEY = 'offAccounts';
const MAX_ID = 4;
const MIN_MS = 60000;

function createPower({ loadConfig, saveConfig, shortcut, setPower }) {
  let off = null; // Set de ids desligados (carregado sob demanda, para não ler o arquivo antes do app estar pronto)
  const since = new Map(); // id -> instante (ms) em que a conta foi ligada, para o "rodando há X min"
  const placeholders = new Map(); // webContents.id da página de desligada -> id da conta

  const offSet = () => {
    if (!off) {
      const raw = loadConfig()[OFF_KEY];
      off = new Set(Array.isArray(raw) ? raw.filter((id) => Number.isInteger(id) && id >= 1 && id <= MAX_ID) : []);
    }
    return off;
  };

  const isOff = (id) => offSet().has(id);

  // Persiste o estado e marca o instante de ligar (ou apaga ao desligar)
  function setOff(id, value) {
    if (value) {
      offSet().add(id);
      since.delete(id);
    } else {
      offSet().delete(id);
      since.set(id, Date.now());
    }
    saveConfig({ [OFF_KEY]: [...offSet()].sort((a, b) => a - b) });
  }

  // Conta ligada que acabou de ser criada (abertura do app ou troca de estado): começa a contar agora
  const markRunning = (id) => { if (!isOff(id)) since.set(id, Date.now()); };

  // Minutos desde que a conta foi ligada (null se estiver desligada)
  function uptimeMin(id) {
    if (isOff(id) || !since.has(id)) return null;
    return Math.floor((Date.now() - since.get(id)) / MIN_MS);
  }

  // Estado para a barra da conta (entra no snapshot de toolbar.js via getSlotState)
  const stateOf = (id) => ({ off: isOff(id), uptime: uptimeMin(id) });

  // Página mostrada no lugar do jogo quando a conta está desligada
  function placeholder(id) {
    const view = new WebContentsView({
      webPreferences: { preload: path.join(__dirname, 'preload', 'offline.js') },
    });
    view.setBackgroundColor('#15111a');
    view.webContents.loadFile(path.join(__dirname, 'ui', 'offline.html'), { query: { id: String(id) } });
    view.webContents.on('before-input-event', shortcut(id)); // os atalhos (Ctrl+1..4, F1...) valem também aqui
    placeholders.set(view.webContents.id, id);
    view.webContents.once('destroyed', () => placeholders.delete(view.webContents.id));
    return view;
  }

  // Botão "Ligar conta" da página de desligada
  ipcMain.on('power:on', (e) => {
    const id = placeholders.get(e.sender.id);
    if (id !== undefined && isOff(id)) setPower(id, true);
  });

  return { isOff, setOff, markRunning, stateOf, placeholder };
}

module.exports = { createPower, OFF_KEY };
