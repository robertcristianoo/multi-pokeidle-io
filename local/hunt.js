// "/hunt for PokeIdle": extensão da Chrome Web Store (pasta local/hunt-for-pokeidle) que mostra, acima do pokémon
// em campo, onde caçar (melhores hunts por XP/h e ouro/h). Só lê o jogo: escuta o WebSocket sem enviar nada e
// busca dados da própria origem do jogo e a lista pública da Shiny WishList. Não tem janela nem botão: basta
// estar carregada na sessão de cada conta antes de o jogo abrir (os content scripts só entram em páginas
// carregadas depois dela), por isso o `ready` é aguardado pelo main antes de criar as contas.
const path = require('path');
const { session } = require('electron');

const MAX_ACCOUNTS = 4;
// dentro do app empacotado a pasta fica fora do asar (ver asarUnpack no package.json)
const EXT_DIR = path.join(__dirname, 'hunt-for-pokeidle').replace('app.asar', 'app.asar.unpacked');

module.exports = function init({ sendLog }) {
  async function loadInto(id) {
    const ses = session.fromPartition(`persist:conta${id}`);
    const api = ses.extensions ?? ses; // API atual: session.extensions
    try {
      await api.loadExtension(EXT_DIR);
    } catch (err) {
      console.error(`hunt: não consegui carregar a extensão na conta ${id}:`, err);
      sendLog?.({ acc: `conta${id}`, kind: 'load', level: 'error', text: `[hunt] falha ao carregar a extensão: ${err.message}` });
    }
  }
  return {
    ready: () => Promise.all(Array.from({ length: MAX_ACCOUNTS }, (_v, i) => loadInto(i + 1))),
  };
};
