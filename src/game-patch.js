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
//
// Além das marcas, módulos adicionais podem registrar outros trechos para o mesmo `app.js` (`addPatch`); cada um é
// uma função `(source) => { src, cauda? } | null` e roda na ordem de registro.
//   createGamePatch({ isWanted(contaId), sendLog }) -> { attach(contaId, view), addPatch(fn) }

const PATTERN = 'https://pokeidle.io/app.js*';

// Cada ponto de encaixe renomeia a função original e põe, no lugar dela, uma que chama a original e anota o resultado.
//  - spritePokemon(pk, px): arte dos cards (mercado, coleção em lista etc.);
//  - atualizarTilePkCofre(tile, { pk }): os quadradinhos da coleção/depot no modo economia, que desenham a arte por
//    outro caminho (só com o looktype), então o pokémon é anotado na `.eco-pk-arte` do tile.
const HOOKS = [
  {
    name: 'spritePokemon',
    wrapper: `
// [multi-pokeidle-io] marca a arte com o pokémon (lido pela extensão /hunt)
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
`,
    required: true,
  },
  {
    name: 'atualizarTilePkCofre',
    wrapper: `
// [multi-pokeidle-io] idem, para os tiles do modo economia
function atualizarTilePkCofre(...a) {
  const r = __atualizarTilePkCofreOriginal(...a);
  try {
    const arte = a[0]?.querySelector?.('.eco-pk-arte');
    const pk = a[1]?.pk;
    if (arte && pk && typeof pk === 'object') {
      arte.__pk = pk;
      arte.setAttribute('data-pk-marca', '44');
    }
  } catch {}
  return r;
}
`,
    required: false,
  },
];

/**
 * Aplica as marcas (só quando `marcas`: a extensão /hunt está ligada nesta conta) e, em seguida, os trechos extras
 * registrados (`extras`, cada um `(source) => { src, cauda? } | null`).
 * Devolve { texto, marcas, extras }; `texto` é null se nada foi aplicado (jogo mudou, já aplicado ou sem o ponto).
 */
function aplicarPatch(source, { marcas = true, extras = [] } = {}) {
  const nada = { texto: null, marcas: false, extras: 0 };
  if (typeof source !== 'string') return nada;
  let out = source;
  let extra = '';
  let marcasOk = false;
  const marcado = marcas && !source.includes('__spritePokemonOriginal');
  // o obrigatório precisa existir (e ser único) antes de mexer em qualquer parte
  const obrigatoriosOk = HOOKS.filter((h) => h.required).every((h) => declaracaoOk(out, h.name));
  if (marcado && obrigatoriosOk) {
    marcasOk = true;
    for (const h of HOOKS) {
      const decl = new RegExp('(^|\\n)function ' + h.name + '\\(');
      if (!declaracaoOk(out, h.name)) continue;
      out = out.replace(decl, `$1function __${h.name}Original(`);
      extra += h.wrapper;
    }
  }
  let cauda = '';
  let extrasOk = 0;
  for (const fn of extras) {
    let r = null;
    try {
      r = fn(out);
    } catch {
      r = null;
    }
    if (!r || typeof r.src !== 'string') continue;
    out = r.src;
    cauda += r.cauda ?? '';
    extrasOk++;
  }
  if (!marcasOk && !extrasOk) return nada;
  const marcaCauda = marcasOk ? `
// [multi-pokeidle-io]
globalThis.__pkMarcaAtiva = true;${extra}` : '';
  return { texto: `${out}${marcaCauda}${cauda}`, marcas: marcasOk, extras: extrasOk };
}

// Declaração única de `nome` no início de uma linha (o jogo pode declarar a função mais de uma vez, o que deixa o ponto ambíguo)
function declaracaoOk(source, nome) {
  const decl = new RegExp('(^|\\n)function ' + nome + '\\(');
  const m = decl.exec(source);
  return !!m && !source.slice(m.index + m[0].length).match(decl);
}

/** Texto do app.js com as marcas e/ou os trechos extras, ou null se nada pôde ser aplicado (ver aplicarPatch). */
function patchApp(source, opts) {
  return aplicarPatch(source, opts).texto;
}

function createGamePatch({ isWanted = () => true, sendLog = () => {} } = {}) {
  const extras = []; // trechos extras registrados por módulos adicionais (addPatch)

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
        if (p.responseStatusCode !== 200) return await pass();
        const { body, base64Encoded } = await dbg.sendCommand('Fetch.getResponseBody', { requestId: p.requestId });
        const source = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
        // as marcas do /hunt só entram com o /hunt ligado; os trechos extras decidem por conta própria
        const r = aplicarPatch(source, { marcas: !!isWanted(id), extras });
        if (isWanted(id) && !r.marcas && !warned) {
          warned = true;
          sendLog({ acc: `conta${id}`, kind: 'load', level: 'warn', text: '[hunt] não achei o ponto de encaixe no app.js (o jogo mudou?); o atalho ⚔? fica desligado nesta carga' });
        }
        const patched = r.texto;
        if (!patched) return await pass();
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

  return { attach, addPatch: (fn) => { if (typeof fn === 'function') extras.push(fn); } };
}

module.exports = { createGamePatch, patchApp, aplicarPatch };
