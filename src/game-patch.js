// Marca a arte dos pokémon do jogo, para a extensão /hunt saber de qual pokémon é cada card.
//
// O cliente do jogo desenha os cards do mercado, da coleção etc. com `spritePokemon(pk, px)`, mas guarda o pokémon só
// dentro do próprio código: nada no DOM diz de quem é o card. Este módulo serve o `app.js` do jogo com um trecho a
// mais que anota, em cada arte, o pokémon (`el.__pk`) e o tamanho (`data-pk-marca`), que a extensão usa para pôr o
// atalho "⚔?" sobre a arte. Nada é enviado, e o jogo continua igual: o trecho só lê o que a função já recebeu.
//
// Como: o protocolo do DevTools (Fetch) pausa SÓ a resposta de `https://pokeidle.io/app.js` e devolve a versão com o
// trecho; o restante do tráfego da conta não passa por aqui. Se o jogo mudar e o ponto de encaixe não for achado, o
// `app.js` original segue sem alteração e o atalho simplesmente não aparece (um aviso vai para o log).
//   createGamePatch({ isWanted(contaId), sendLog }) -> { attach(contaId, view) }

const PATTERN = 'https://pokeidle.io/app.js*';

// Renomeia a função original e põe, no lugar dela, uma que chama a original e anota o resultado.
const DECL = /(^|\n)function spritePokemon\(/;
const WRAPPER = `
// [multi-pokeidle-io] marca a arte com o pokémon (lido pela extensão /hunt)
globalThis.__pkMarcaAtiva = true;
function spritePokemon(...a) {
  const el = __spritePokemonOriginal(...a);
  try {
    const pk = a[0];
    if (el && typeof el === 'object' && pk && typeof pk === 'object' && el.setAttribute) {
      el.__pk = pk;
      el.setAttribute('data-pk-marca', String(Number(a[1]) || 40));
    }
  } catch {}
  return el;
}
`;

/** Devolve o app.js com a marcação, ou null se o ponto de encaixe não existir (jogo mudou) ou já estiver aplicado. */
function patchApp(source) {
  if (typeof source !== 'string' || source.includes('__spritePokemonOriginal')) return null;
  const m = DECL.exec(source);
  if (!m) return null;
  // só aceita se houver exatamente uma declaração
  if (source.slice(m.index + m[0].length).match(DECL)) return null;
  return source.replace(DECL, `$1function __spritePokemonOriginal(`) + WRAPPER;
}

function createGamePatch({ isWanted = () => true, sendLog = () => {} } = {}) {
  function attach(id, view) {
    const wc = view.webContents;
    let warned = false;

    const enable = () => {
      if (wc.isDestroyed()) return;
      try {
        const dbg = wc.debugger;
        if (!dbg.isAttached()) dbg.attach('1.3');
        dbg.sendCommand('Fetch.enable', { patterns: [{ urlPattern: PATTERN, resourceType: 'Script', requestStage: 'Response' }] }).catch((err) => {
          console.error('marca da arte: não consegui ativar a interceptação:', err?.message ?? err);
        });
      } catch (err) {
        console.error('marca da arte: depurador indisponível:', err?.message ?? err);
      }
    };

    wc.debugger.on('message', async (_e, method, p) => {
      if (method !== 'Fetch.requestPaused' || !p?.requestId) return;
      const dbg = wc.debugger;
      const pass = () => dbg.sendCommand('Fetch.continueResponse', { requestId: p.requestId }).catch(() => {});
      try {
        if (!isWanted(id) || p.responseStatusCode !== 200) return await pass();
        const { body, base64Encoded } = await dbg.sendCommand('Fetch.getResponseBody', { requestId: p.requestId });
        const source = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
        const patched = patchApp(source);
        if (!patched) {
          if (!warned) {
            warned = true;
            sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: '[hunt] não achei o ponto de encaixe no app.js (o jogo mudou?); o atalho ⚔? fica desligado nesta carga' });
          }
          return await pass();
        }
        const skip = new Set(['content-length', 'content-encoding', 'transfer-encoding', 'etag', 'content-md5']);
        const responseHeaders = (p.responseHeaders ?? []).filter((h) => !skip.has(String(h.name).toLowerCase()));
        await dbg.sendCommand('Fetch.fulfillRequest', {
          requestId: p.requestId,
          responseCode: 200,
          responseHeaders,
          body: Buffer.from(patched, 'utf8').toString('base64'),
        });
      } catch (err) {
        console.error('marca da arte: falha ao servir o app.js; seguindo com o original:', err?.message ?? err);
        await pass();
      }
    });

    wc.debugger.on('detach', () => setTimeout(enable, 0)); // o DevTools de outra parte soltou o depurador: religa
    enable();
    wc.on('did-start-navigation', (_e, _url, _inPlace, isMainFrame) => { if (isMainFrame) enable(); });
  }

  return { attach };
}

module.exports = { createGamePatch, patchApp };
