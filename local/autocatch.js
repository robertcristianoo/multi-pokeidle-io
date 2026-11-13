// Auto-captura pelo mapa. Carregado por main.js junto com as outras extensões.
// Usa a LISTA do Mapa do jogo: filtro Pokédex = "Não capturados" e, região por região (Kanto, Johto, Outland,
// Hoenn... só as liberadas, sem cadeado), caça a área liberada de MENOR nível que ainda tem pokémon faltando.
// Para trocar de área, sai da hunt pelo atalho "Ir para o Centro Pokémon" (espera destravar: ele fica 3 s bloqueado
// a cada dano), cura a equipe ("Curar equipe") e, já no Centro, escolhe a hunt nova na lista (no layout de celular, pelo "Caçar");
// quando o jogo avisa que algo foi capturado, reabre o mapa, confere e passa para a próxima, até acabar tudo.
// Só ESCOLHE a área: lançar as bolas continua sendo com o auto-bola (autoball.js) ou as automações do jogo.
// Atalhos: Ctrl+Alt+Shift+1..4 liga/desliga por posição; Ctrl+Alt+C liga/desliga todas; Ctrl+Alt+R zera as capturas da semana; Ctrl+Alt+Shift+D grava o diagnóstico da tela (todas as contas).
//
// Captura semanal (Top Catch): o jogo zera a contagem da semana no domingo 00:00 (Brasília), mas o Mapa continua
// marcando como "já capturado" o que você pegou em qualquer semana. Por isso a automação NÃO usa o filtro
// "Não capturados": ela lista todas as espécies e pula só as capturadas NESTA semana. Cada captura avisada pelo
// jogo (a espécie que estava sendo caçada) é gravada em cache por conta (userData/autocatch-semana.json). O cache
// zera sozinho na virada da semana ou na hora, com Ctrl+Alt+R, e aí dá para capturar tudo de novo quando quiser.
//
// Respeita os filtros do mapa que você deixou ligados (nível mín./máx., tipo, busca): o que eles escondem
// não entra na fila. Áreas em que nada é capturado por MAX_AREA_MIN minutos são puladas. Se o jogo mudar o
// mapa e a automação não achar os elementos de que precisa, ela AVISA no log (erro) em vez de dar a lista
// por concluída.

const TICK_MS = process.env.PKMULTI_TEST ? 300 : 2500;
const MAX_AREA_MIN = 20; // sem captura nesse tempo: pula a área (anotada como "pulada" até a lista acabar)
const RECHECK_MIN = 3; // confere o mapa de tempos em tempos mesmo sem aviso de captura

// Domingo 00:00 de Brasília (UTC-3, sem horário de verão) da semana corrente, como 'AAAA-MM-DD'
const semanaAtual = (agora = Date.now()) => {
  const d = new Date(agora - 3 * 3600e3);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay())).toISOString().slice(0, 10);
};

module.exports = function init({ getSlots, sendLog }) {
  const fs = require('fs');
  const path = require('path');
  const cacheFile = () => path.join(require('electron').app.getPath('userData'), 'autocatch-semana.json');
  let cache = { semana: semanaAtual(), contas: {} }; // contas: { conta<id>: { slug: 'Nome' } }
  try {
    const lido = JSON.parse(fs.readFileSync(cacheFile(), 'utf8'));
    if (lido && lido.semana === cache.semana && lido.contas && typeof lido.contas === 'object') cache = lido;
  } catch { /* sem cache ainda (ou corrompido): começa vazio */ }
  const salvar = () => { try { fs.writeFileSync(cacheFile(), JSON.stringify(cache)); } catch { /* disco indisponível: segue só em memória */ } };
  const feitas = (id) => (cache.contas[`conta${id}`] ??= {});
  const virouSemana = () => {
    const atual = semanaAtual();
    if (cache.semana === atual) return false;
    cache = { semana: atual, contas: {} };
    salvar();
    return true;
  };

  const on = new Set();
  const last = new Map(); // id -> último status logado (evita repetir a mesma linha)

  // Roda dentro da página. cmd: 'step' (avança a máquina) | 'off' (limpa o alvo).
  const script = (cmd, seed = []) => `(async () => {
    const MAX_AREA = ${MAX_AREA_MIN} * 60000, RECHECK = ${RECHECK_MIN} * 60000;
    const $ = (s) => document.querySelector(s);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const A = (window.__acx ??= { socks: new WeakSet(), captured: 0, seen: 0, target: null, targetAt: 0, checkedAt: 0, skipped: new Set(), done: new Map(), busy: false, kinds: {}, samples: {} });
    A.kinds ??= {}; A.samples ??= {};
    // espécies já capturadas nesta semana: o cache do app manda a lista inteira a cada passo
    for (const [k, v] of ${JSON.stringify(seed)}) A.done.set(k, v); // só soma: um passo em andamento não pode perder o que já anotou

    // Conta os avisos de captura que o servidor manda (mesmo socket do jogo, nenhuma conexão nova)
    if (!A.hooked) {
      A.hooked = true;
      const orig = WebSocket.prototype.send;
      WebSocket.prototype.send = function () {
        try {
          if (!A.socks.has(this)) {
            A.socks.add(this);
            this.addEventListener('message', (ev) => {
              if (typeof ev.data !== 'string') return;
              if (ev.data.includes('"k":"capturado"')) A.captured++;
              // diagnóstico: conta os tipos de mensagem do servidor e guarda 1 amostra curta de cada (sem credenciais)
              if (ev.data.startsWith('{"t":"batalha"')) {
                try {
                  for (const e of JSON.parse(ev.data).ev || []) {
                    if (!['bola', 'aviso', 'morte', 'fugiu', 'capturado'].includes(e.k)) continue;
                    (A.recent ??= []).push({ h: new Date().toTimeString().slice(0, 8), k: e.k, slot: e.slot, quem: e.quem, ok: e.sucesso, chance: e.chance, ball: e.ballId, msg: e.msg });
                    if (A.recent.length > 40) A.recent.shift();
                  }
                } catch {}
              }
              const mk = /"k":"([^"]{1,40})"/.exec(ev.data.slice(0, 300));
              if (mk) {
                A.kinds[mk[1]] = (A.kinds[mk[1]] || 0) + 1;
                if (!A.samples[mk[1]] && !/token|auth|sess|mail|senha|pass|cookie/i.test(ev.data)) A.samples[mk[1]] = ev.data.slice(0, 300);
              }
            });
          }
        } catch {}
        return orig.apply(this, arguments);
      };
    }

    document.getElementById('pk-acx-badge')?.remove(); // limpa o selo de versões antigas

    const R = await (async () => {
    if (${JSON.stringify(cmd)} === 'off') { A.target = null; A.skipped.clear(); A.busy = false; return { s: 'off' }; }
    if (${JSON.stringify(cmd)} === 'arm') return { s: 'arm' }; // só garante o gancho do WebSocket (contagem dos tipos de mensagem)
    if (${JSON.stringify(cmd)} === 'diag') {
      // Foto do estado da tela (para entender o modo economia de energia): o que existe, o que está escondido e o que o servidor manda
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { w: Math.round(r.width), h: Math.round(r.height), display: cs.display, visibility: cs.visibility, hiddenClass: e.classList.contains('hidden') || !!e.hidden }; };
      const brief = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).join('.') : '');
      const achar = (re, max) => [...document.querySelectorAll('[id], [class]')].filter((e) => re.test(e.id + ' ' + (typeof e.className === 'string' ? e.className : ''))).slice(0, max)
        .map((e) => ({ el: brief(e), ...vis(e), texto: (e.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80) }));
      const ids = (l) => Object.fromEntries(l.map((s) => [s, $(s) ? vis($(s)) : null]));
      const ls = {};
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/eco|energ|saver|lite|poup|setting|config|opc/i.test(k)) ls[k] = String(localStorage.getItem(k)).slice(0, 120); } } catch {}
      return {
        s: 'diag',
        quando: new Date().toISOString(),
        url: location.pathname,
        html: { classe: document.documentElement.className, dataset: { ...document.documentElement.dataset } },
        body: { classe: document.body.className, dataset: { ...document.body.dataset } },
        economia: achar(/eco|energ|saver|poup|lite|low/i, 40),
        captura: achar(/caido|proxim|captur|spawn|selvag|wild/i, 40),
        caidos: { lista: $('#caidos-lista') ? vis($('#caidos-lista')) : null, linhas: document.querySelectorAll('#caidos-lista .caido').length, amostra: [...document.querySelectorAll('#caidos-lista .caido')].slice(0, 3).map((e) => e.outerHTML.replace(/<svg[\\s\\S]*?<\\/svg>/g, '<svg/>').replace(/\\s+/g, ' ').slice(0, 300)) },
        controles: ids(['#caidos', '#hunt-saida', '#ir-centro', '#eco-ir-centro', '#centro-curar', '#arena-saida', '#modal', '#mapa-modo', '#f-regiao', '#ml-corpo']),
        menu: [...document.querySelectorAll('.menu-topo button')].map((b) => ({ texto: b.textContent.trim().slice(0, 30), modal: b.dataset.modal || null, ...vis(b) })),
        localStorage: ls,
        textoVisivel: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 1200),
        servidor: { tipos: A.kinds, amostras: A.samples },
        recentes: A.recent || [],
        cliquesAutoBola: window.__abLog || [],
        autoBolaEnvios: window.__abEnv || [],
        autoBolaEventos: window.__abEvt || [],
        agora: new Date().toTimeString().slice(0, 8),
        caidosTodos: [...document.querySelectorAll('#caidos-lista .caido')].map((e) => ({ slot: e.dataset.slot, classe: e.className, tempo: e.querySelector('.caido-tempo i')?.style.width || null, nome: (e.querySelector('.caido-quem')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) })),
      };
    }
    if (${JSON.stringify(cmd)} === 'reset') { A.target = null; A.skipped.clear(); A.done.clear(); A.seen = A.captured; return { s: 'reset' }; }
    if (A.busy) return { s: 'busy' };
    // o jogo avisou uma captura: a espécie que estava sendo caçada entra no cache da semana
    if (A.target && A.captured !== A.seen) A.done.set(A.target.slug, A.target.nome);

    const now = Date.now();
    const mudou = A.captured !== A.seen;
    const venceu = A.target && now - A.targetAt > MAX_AREA;
    if (A.target && !mudou && !venceu && now - A.checkedAt < RECHECK) return { s: 'cacando', nome: A.target.nome };

    const modal = $('#modal');
    const modalAberto = () => !!modal && !modal.classList.contains('hidden');
    const mapaAberto = () => modalAberto() && !!$('#f-regiao');
    if (modalAberto() && !mapaAberto()) return { s: 'ocupado' }; // outra tela aberta pelo jogador

    A.busy = true;
    const capturadosAntes = A.captured; // captura que chegar DURANTE a varredura vale para a próxima, não se perde
    const fechar = () => { if (modalAberto()) $('#modal-fechar')?.click(); };
    const ate = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(120); } return false; };
    const nivelDe = (txt) => Number(String(txt || '').replace(/\\D/g, '')) || 0;
    // espera a lista terminar de desenhar: rodapé preenchido, linhas (ou o aviso de lista vazia) e contagem estável
    const assentar = async () => {
      let ant = -1, estavel = 0;
      const t0 = Date.now();
      while (Date.now() - t0 < 7000) {
        const corpo = $('#ml-corpo');
        const n = corpo ? corpo.querySelectorAll('.ml-linha').length : -1;
        const vazio = $('#ml-vazio');
        const pronto = !!corpo && /\\d/.test($('#mapa-rodape-txt')?.textContent || '') && (n > 0 || (!!vazio && !vazio.hidden));
        estavel = pronto && n === ant ? estavel + 1 : 0;
        ant = n;
        if (estavel >= 3) return true;
        await sleep(150);
      }
      return false;
    };

    // Opções de região do mapa. O jogo já trocou o menu (dropdown -> abas): tenta o seletor conhecido, depois qualquer
    // [data-regiao] do mapa e por último os botões dentro de #f-regiao. Chave = data-regiao, ou o nome da aba.
    const regOps = () => {
      const q = (s) => [...document.querySelectorAll(s)];
      const lista = [q('#f-regiao .mapa-reg-op'), q('#modal [data-regiao]'), q('#f-regiao button, #f-regiao [role="tab"]')].find((l) => l.length) || [];
      return lista.map((el) => ({ el, chave: el.dataset.regiao || (el.querySelector('b, span')?.textContent || el.textContent).trim().split(/\\s+/)[0] }));
    };
    const regAtiva = (el) => /(^|\\s)(on|ativa|ativo|active|selected)(\\s|$)/.test(el.className) || el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-current') === 'true';
    const regTrancada = (el) => el.disabled || el.getAttribute('aria-disabled') === 'true' || /tranc|trav|lock|bloq/i.test(el.className) || !!el.querySelector('[class*="lock"], [class*="tranc"], [class*="cadeado"]');
    // Resumo do HTML do menu para o log, quando a automação não acha o que precisa (ajuda a acompanhar mudanças do jogo)
    const resumo = (sel) => {
      const e = $(sel) || $('#modal');
      return e ? e.outerHTML.replace(/<svg[\\s\\S]*?<\\/svg>/g, '<svg/>').replace(/\\s+/g, ' ').slice(0, 700) : '(sem #modal)';
    };

    // Abre o Mapa em modo Lista com o filtro Pokédex "Todos"; devolve null se tudo certo, ou a mensagem de erro
    const prepararMapa = async () => {
      if (!mapaAberto()) {
        $('.menu-topo button[data-modal="mapa"]')?.click();
        if (!(await ate(() => mapaAberto(), 4000))) return 'não consegui abrir o mapa (botão Mapa não encontrado?)';
      }
      const btLista = $('#mapa-modo [data-modo="lista"]');
      if (btLista && !btLista.classList.contains('on')) { btLista.click(); await sleep(300); }
      // filtro Pokédex "Todos": o selo "já capturado" do jogo vale para qualquer semana, quem decide é o cache semanal
      const btTodos = $('#f-captura [data-captura=""]') || [...document.querySelectorAll('#f-captura button')].find((b) => b.textContent.trim() === 'Todos');
      if (!btLista || !btTodos || !regOps().length) return 'mapa sem lista/filtro Pokédex/região: o jogo mudou o mapa? ' + resumo('.mapa-barra');
      if (!regAtiva(btTodos)) { btTodos.click(); await sleep(300); }
      return null;
    };
    // Vai para a região (aba do menu) e espera a lista desenhar
    const irParaRegiao = async (reg) => {
      const op = () => regOps().find((o) => o.chave === reg)?.el;
      if (op() && !regAtiva(op())) {
        op().click(); // o jogo redesenha o mapa inteiro com a região nova
        await ate(() => op() && regAtiva(op()), 3000);
        await sleep(200);
      }
      return assentar();
    };
    // Onde o personagem está: caçando (botão "Ir para o Centro Pokémon" à mostra) ou no Centro
    const botaoCentro = () => {
      const a = $('#hunt-saida');
      if (a && !a.classList.contains('hidden')) return $('#ir-centro');
      const e = $('#eco-ir-centro');
      if (e && !e.classList.contains('hidden')) return e;
      return null;
    };
    // Sai da hunt pelo atalho do jogo. O botão fica travado 3 s a cada dano trocado, então espera destravar
    // (entre um monstro e outro) e clica na hora. Devolve true quando já está no Centro.
    const irAoCentro = async () => {
      if (!botaoCentro()) return true;
      const t0 = Date.now();
      while (Date.now() - t0 < 40000) {
        const b = botaoCentro();
        if (!b) return true;
        if (!b.disabled) { b.click(); break; }
        await sleep(50);
      }
      return ate(() => !botaoCentro(), 15000);
    };

    // No Centro Pokémon: clica em "Curar equipe" (a Enfermeira Joy) antes de seguir. o parâmetro "esperar" dá tempo de o botão aparecer
    // logo depois de chegar ao Centro; o botão só existe enquanto se está na praça.
    const curarEquipe = async (esperar) => {
      const visivel = () => { const b = $('#centro-curar'); return !!b && !b.classList.contains('hidden') && !b.disabled; };
      if (esperar) await ate(visivel, 8000);
      if (!visivel()) return false;
      $('#centro-curar').click();
      await sleep(1200); // o servidor cura e responde
      return true;
    };

    try {
      if (venceu) { A.skipped.add(A.target.slug); A.target = null; }
      if ($('#arena-saida') && !$('#arena-saida').classList.contains('hidden')) return { s: 'ocupado' }; // dentro de uma arena (boss)
      const erroMapa = await prepararMapa();
      if (erroMapa) return { s: 'erro', msg: erroMapa };

      // Regiões na ordem do menu, só as liberadas (sem cadeado) e sem "em obra"
      const regioes = regOps().filter((o) => !regTrancada(o.el)).map((o) => o.chave);
      if (!regioes.length) return { s: 'erro', msg: 'nenhuma região liberada encontrada no menu de regiões: ' + resumo('#f-regiao') };

      // 1) escolhe o alvo: a área liberada de menor nível que ainda tem pokémon faltando, na primeira região que tiver
      let escolhido = null;
      let inspecionadas = 0;
      let travadasRestantes = 0; // áreas com pokémon faltando, mas acima do nível do treinador
      for (const reg of regioes) {
        if (!(await irParaRegiao(reg))) continue;
        inspecionadas++;
        const linhas = [...document.querySelectorAll('#ml-corpo .ml-linha')];
        travadasRestantes += linhas.filter((r) => r.classList.contains('travada') && !A.done.has(r.dataset.slug)).length;
        const cand = linhas
          .filter((r) => !r.classList.contains('travada') && !A.done.has(r.dataset.slug) && !A.skipped.has(r.dataset.slug))
          .map((r, i) => ({ r, i, nv: nivelDe(r.querySelector('.ml-nv')?.textContent) || 1e9 }))
          .sort((a, b) => a.nv - b.nv || a.i - b.i);
        if (!cand.length) continue; // região completa (ou só com áreas travadas): próxima
        const r = cand[0].r;
        escolhido = { slug: r.dataset.slug, nome: r.querySelector('.ml-nome')?.textContent || r.dataset.slug, nv: cand[0].nv, regiao: reg, ja: r.classList.contains('on') };
        break;
      }
      if (!escolhido && !inspecionadas) return { s: 'erro', msg: 'a lista do mapa não carregou' };

      // 2) troca de área pelo caminho limpo: Centro Pokémon primeiro, depois a hunt nova
      if (escolhido && !escolhido.ja) {
        if (botaoCentro()) {
          fechar();
          if (!(await irAoCentro())) return { s: 'travado', nome: escolhido.nome }; // não destravou/não chegou ao Centro: tenta no próximo ciclo
          await sleep(400);
          await curarEquipe(true);
          const erro2 = await prepararMapa();
          if (erro2) return { s: 'erro', msg: erro2 };
        }
        else await curarEquipe(false); // já estava no Centro (ex.: a automação foi ligada lá): cura antes de sair
        if (!(await irParaRegiao(escolhido.regiao))) { fechar(); return { s: 'travado', nome: escolhido.nome }; }
        const linha = document.querySelector('#ml-corpo .ml-linha[data-slug="' + escolhido.slug + '"]');
        if (!linha || linha.classList.contains('travada')) { fechar(); return { s: 'travado', nome: escolhido.nome }; }
        linha.click();
        await sleep(700);
        // layout de celular: o toque só abre a ficha, quem escolhe a área é o botão "Caçar aqui"
        const cacar = $('#hunt-analyser .ha-cacar');
        if (modalAberto() && cacar && !cacar.disabled) { cacar.click(); await sleep(500); }
        if (modalAberto()) { fechar(); return { s: 'travado', nome: escolhido.nome }; } // porta de 10 s da hunt: tenta no próximo ciclo
      }
      A.seen = capturadosAntes;
      A.checkedAt = Date.now();
      fechar();
      if (!escolhido) { A.target = null; return { s: 'fim', puladas: [...A.skipped].length, travadas: travadasRestantes }; }
      if (!A.target || A.target.slug !== escolhido.slug) A.targetAt = Date.now();
      A.target = escolhido;
      return { s: 'alvo', nome: escolhido.nome, nv: escolhido.nv, regiao: escolhido.regiao, ja: escolhido.ja };
    } catch (e) {
      fechar();
      return { s: 'erro', msg: String(e && e.message || e) };
    } finally {
      A.busy = false;
    }
    })();
    R.done = [...A.done];
    return R;
  })()`;

  const say = (id, text, level = 'info') => sendLog({ acc: `conta${id}`, kind: 'load', level, text: `auto-captura: ${text}` });

  // Junta no cache o que a página registrou como capturado na semana
  const guardar = (id, lista) => {
    const f = feitas(id);
    const novas = [];
    for (const [slug, nome] of lista || []) if (!(slug in f)) { f[slug] = nome; novas.push(nome); }
    if (novas.length) salvar();
    return novas;
  };

  // webContents da conta, ou null se a janela/view já foi destruída (acessar `view.webContents` de uma view destruída lança)
  const vivo = (view) => {
    try {
      const wc = view.webContents;
      return wc.isDestroyed() ? null : wc;
    } catch {
      return null;
    }
  };

  // Diagnóstico (modo economia de energia etc.): grava a foto da tela e dos tipos de mensagem do servidor de cada conta em
  // userData/autocatch-diagnostico.txt. O 1º uso arma a contagem das mensagens; use de novo depois de alguns segundos.
  let diagArmado = false;
  async function diagnostico(so) {
    diagArmado = true;
    const saida = [];
    for (const { id, view } of getSlots()) {
      const wc = vivo(view);
      if (!wc || wc.isLoading() || (so !== undefined && so !== id)) continue;
      try { saida.push({ conta: id, ...(await wc.executeJavaScript(script('diag'))) }); } catch (e) { saida.push({ conta: id, erro: String(e && e.message || e) }); }
    }
    const arq = path.join(require('electron').app.getPath('userData'), 'autocatch-diagnostico.txt');
    try { fs.writeFileSync(arq, JSON.stringify(saida, null, 2)); } catch { /* sem disco */ }
    sendLog({ acc: 'app', kind: 'load', level: 'info', text: `auto-captura: diagnóstico gravado em ${arq} (${saida.length} conta(s)); use de novo após ~30 s para ver as mensagens do servidor` });
  }

  // Zera as capturas da semana para recapturar tudo de novo: de uma conta (menu da barra) ou de todas (sem argumento)
  const limparPaginas = (so) => {
    for (const { id, view } of getSlots()) {
      const wc = vivo(view);
      if ((so === undefined || so === id) && wc && !wc.isLoading()) wc.executeJavaScript(script('reset')).catch(() => {});
    }
  };
  function zerar(so) {
    if (so === undefined) cache = { semana: semanaAtual(), contas: {} };
    else delete cache.contas[`conta${so}`];
    salvar();
    limparPaginas(so);
    if (so === undefined) sendLog({ acc: 'app', kind: 'load', level: 'info', text: 'auto-captura: capturas da semana ZERADAS em todas — vai capturar tudo de novo' });
    else say(so, 'capturas da semana ZERADAS — vai capturar tudo de novo');
    tick();
  }

  async function passo() {
    if (virouSemana()) { limparPaginas(); sendLog({ acc: 'app', kind: 'load', level: 'info', text: 'auto-captura: nova semana — capturas zeradas' }); }
    for (const { id, view } of getSlots()) {
      const wc = vivo(view);
      if (!wc || wc.isLoading()) continue;
      if (!on.has(id)) {
        if (diagArmado) wc.executeJavaScript(script('arm')).catch(() => {});
        if (last.has(id)) {
          last.delete(id);
          wc.executeJavaScript(script('off')).catch(() => {});
        }
        continue;
      }
      try {
        const r = await wc.executeJavaScript(script('step', Object.entries(feitas(id))));
        if (!r) continue;
        for (const nome of guardar(id, r.done)) say(id, `capturado nesta semana: ${nome} (${Object.keys(feitas(id)).length} no cache)`);
        const key = `${r.s}:${r.nome ?? ''}:${r.msg ?? ''}`;
        if (last.get(id) === key) continue;
        if (['busy', 'cacando', 'ocupado', 'travado'].includes(r.s)) { if (r.s !== 'cacando') continue; }
        last.set(id, key);
        if (r.s === 'alvo') say(id, `${r.ja ? 'já está em' : 'indo para'} ${r.nome} (nv ${r.nv}, ${r.regiao})`);
        else if (r.s === 'fim') {
          say(id, `${r.travadas ? `nada mais disponível agora (${r.travadas} área(s) ainda travadas pelo nível)` : 'lista concluída'}${r.puladas ? ` (${r.puladas} área(s) puladas por não capturar a tempo)` : ''} — desligada`);
          on.delete(id);
          wc.executeJavaScript(script('off')).catch(() => {});
        } else if (r.s === 'erro') say(id, `erro: ${r.msg}`, 'error');
      } catch {
        /* página navegando: tenta no próximo tick */
      }
    }
  }

  // Nunca deixa a rejeição escapar (conta fechada no meio do passo, app encerrando): o próximo ciclo tenta de novo
  const tick = () => passo().catch(() => {});

  function toggle(index) {
    const slots = getSlots();
    const set = (id, v) => { v ? on.add(id) : on.delete(id); last.delete(id); };
    if (index === null) {
      const allOn = slots.every((s) => on.has(s.id));
      slots.forEach((s) => set(s.id, !allOn));
      sendLog({ acc: 'app', kind: 'load', level: 'info', text: `auto-captura ${allOn ? 'DESLIGADA' : 'LIGADA'} em todas` });
    } else {
      const { id } = slots[index];
      const v = !on.has(id);
      set(id, v);
      say(id, v ? 'LIGADA' : 'DESLIGADA');
    }
    tick();
  }

  setInterval(tick, TICK_MS);

  return {
    zerar,
    features: () => [{
      id: 'autocatch',
      group: 'Capturas',
      label: 'Auto-captura',
      actions: [{ label: 'Resetar capturas da semana', run: (id) => zerar(id) }, { label: 'Diagnóstico (gravar estado da tela)', run: (id) => diagnostico(id) }],
      title: 'Percorre as regiões liberadas e caça, do menor nível para o maior, as áreas cujo pokémon você ainda não tem',
      isOn: (id) => on.has(id),
      set: (id, v) => {
        v ? on.add(id) : on.delete(id);
        last.delete(id);
        say(id, v ? 'LIGADA' : 'DESLIGADA');
        tick();
      },
    }],
    onShortcut(event, input) {
      if (!input.control || !input.alt) return false;
      if (input.shift && input.code === 'KeyD') {
        event.preventDefault();
        diagnostico();
        return true;
      }
      if (!input.shift && input.code === 'KeyR') {
        event.preventDefault();
        zerar();
        return true;
      }
      if (!input.shift && input.code === 'KeyC') {
        event.preventDefault();
        toggle(null);
        return true;
      }
      const m = /^Digit([1-9])$/.exec(input.code);
      if (input.shift && m && Number(m[1]) <= getSlots().length) {
        event.preventDefault();
        toggle(Number(m[1]) - 1);
        return true;
      }
      return false;
    },
    onSlotRemoved(id) {
      on.delete(id);
      last.delete(id);
    },
  };
};
