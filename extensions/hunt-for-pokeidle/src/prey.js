// A janela do Prey (Mochila → Prey, jogo 1.458): em cada cartela já roletada, o /hunt responde se alguma opção dá
// mais XP que a melhor hunt normal do pokémon em campo (a régua: a melhor hunt liberada sem esta cartela) — sim ou
// não — e, quando não dá, que bônus e quantas estrelas fariam dar. No retrato, borda verde na opção que dá mais e
// X vermelho na que não dá (a hunt que o treinador ainda não abre também leva o X). A conta é a do painel
// (`engine.analisarPrey`), feita aqui no navegador e refeita a cada roletada: a cartela vem do estado do jogo
// (`automation.prey`), a mesma fonte que a janela desenha. Se o pokémon tem o disco de AoE, ele entra como no painel.
//
// No topo da janela: "Apoie o dev!" (o mesmo balão do painel) e o botão que liga e desliga tudo ("Desativar /hunt"
// / "Ativar /hunt"), com a escolha salva. Se o jogo mudar a janela e as âncoras sumirem, nada aparece: o painel do
// /hunt continua igual.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  if (!PIH.on || !PIH.engine) return;

  const CHAVE = 'pokeidle-hunt:prey:v1';
  const lerLigado = () => { try { return JSON.parse(localStorage.getItem(CHAVE))?.ligado ?? true; } catch { return true; } };
  let ligado = lerLigado();
  const gravar = () => { try { localStorage.setItem(CHAVE, JSON.stringify({ ligado })); } catch { /* sem armazenamento */ } };

  const NOME_BONUS = { dano: 'Dano', defesa: 'Defensivo', captura: 'Capture Boost', spawn: 'Spawn' };
  const nfc = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pct = (x) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  const xpH = (v) => `${nfc.format(v)} XP/h`;
  const estrelas = (n) => '★'.repeat(n);
  const combinacao = (o, bonus, est) => `<b>${esc(o.nome)}</b> › ${esc(NOME_BONUS[bonus] ?? bonus)} › ${estrelas(est)}`;

  // ---- a conta ---------------------------------------------------------------------------------
  // A régua de cada cartela (o ranking das hunts liberadas sem ela) sai em pedaços de 20 hunts, entre um quadro e
  // outro do jogo, e fica guardada: rolar a lista, o bônus ou as estrelas não muda a régua, só a outra cartela muda.
  const reguas = new Map();
  const memos = new Map();
  const pausa = () => new Promise((r) => setTimeout(r, 0));
  function reguaDe(chave, pk, ctx, op) {
    if (!reguas.has(chave)) {
      if (reguas.size > 6) { reguas.clear(); memos.clear(); }
      const hunts = PIH.engine.huntsLiberadas(ctx);
      reguas.set(chave, (async () => {
        const linhas = [];
        for (let i = 0; i < hunts.length; i += 20) {
          linhas.push(...PIH.engine.analisar(pk, { ...ctx, hunts: hunts.slice(i, i + 20), huntsDoJogo: ctx.hunts }, { ...op, soLiberadas: false }).linhas);
          await pausa();
        }
        return linhas;
      })().catch((err) => { reguas.delete(chave); throw err; }));
    }
    return reguas.get(chave);
  }

  async function analisarCartela(jogo, pk, c, efeitos, bestiario) {
    const calc = PIH.calculo;
    const ctx = calc.contexto(jogo, pk);
    const outras = efeitos.filter((e) => e.cartela !== c.i);
    const op = { ...calc.opcoes(), prey: outras, bestiario };
    const eu = calc.eu();
    const chave = JSON.stringify([pk.id, pk.level, pk.stats, outras.map((e) => [e.pk, e.bonus, e.est]), bestiario, op.tipoDoDia, eu?.level, eu?.loja?.alvoAtrasados]);
    try {
      const base = await reguaDe(chave, pk, ctx, op);
      if (!memos.has(chave)) memos.set(chave, new Map());
      return PIH.engine.analisarPrey(pk, ctx, op, { i: c.i, lista: c.lista, bonus: c.bonus, est: c.est }, { base, memo: memos.get(chave) });
    } catch (err) {
      console.warn('[pokeidle-hunt] Prey: a conta falhou', err);
      return null;
    }
  }

  function cartelasDoEstado(jogo, eu) {
    const { prey, sazonal } = jogo.mod;
    if (!prey?.normalizarPrey || !sazonal?.chaveDoDiaSazonal) return null;
    const p = prey.normalizarPrey(eu?.automation?.prey, sazonal.chaveDoDiaSazonal(Date.now()));
    const liberadas = prey.cartelasLiberadas(eu?.automation);
    return p.cartelas.map((c, i) => ({ i, bloqueada: i >= liberadas, lista: c?.lista ?? [], pk: c?.pk ?? null, bonus: c?.bonus ?? null, est: c?.est ?? null, n: c?.n ?? [0, 0, 0], custo: prey.custoDaRoletada }));
  }

  // ---- o desenho --------------------------------------------------------------------------------
  const pedido = (bonus, est) => `${esc(NOME_BONUS[bonus] ?? bonus)} ${estrelas(est)}${est < 5 ? ' ou mais' : ''}`;
  const SIM = '<b class="pih-prey-sim-txt">Sim</b>';
  const NAO = '<b class="pih-prey-nao-txt">Não</b>';

  function htmlResumo(r, c) {
    if (!c.bonus || !c.lista.length) return '<b>/hunt</b> · Faça a roletada grátis: aqui aparece se alguma opção dá mais XP que a sua melhor hunt normal.';
    if (!r) return '<b>/hunt</b> · Não deu para calcular esta cartela agora.';
    if (!r.opcoes.some((o) => o.liberada)) return '<b>/hunt</b> · Você não possui nível para acessar tais opções de hunt. Sorteie novamente.';
    const m = r.melhorSemCartela;
    const regua = m ? `a sua melhor hunt normal (${esc(m.nome)}, ${xpH(m.xpPokemonH)})` : 'a sua melhor hunt normal';
    const pergunta = `<b>/hunt</b> · Dá mais XP que ${regua}?`;
    const agora = `${esc(NOME_BONUS[c.bonus])} ${estrelas(c.est)}`;
    const estimado = (bonus) => (bonus === 'spawn' ? ' <span class="pih-prey-est" title="O Spawn ainda não foi medido em jogo: é estimativa">≈</span>' : '');
    if (c.pk != null) {
      const e = r.opcoes.find((o) => o.pokeId === c.pk);
      if (!e) return `${pergunta} Não deu para calcular a espécie escolhida.`;
      if (!e.liberada) return `${pergunta} ${NAO}: você não possui nível para a hunt de ${esc(e.nome)}.`;
      if (e.passa) return `${pergunta} ${SIM}: ${esc(e.nome)} com ${agora} rende ${xpH(e.valor)}${estimado(c.bonus)} (${pct(e.contraMelhor)}).`;
      const precisa = Object.entries(e.minEst ?? {}).sort((a, b) => a[1] - b[1]).map(([b, n]) => pedido(b, n));
      return `${pergunta} ${NAO}: ${esc(e.nome)} com ${agora} rende ${xpH(e.valor)}${estimado(c.bonus)} (${pct(e.contraMelhor)}). ${precisa.length ? `Daria mais com ${precisa.join(' ou ')}.` : 'Nem com 5★ de algum bônus.'}`;
    }
    const sim = r.opcoes.filter((o) => o.passa);
    if (sim.length) return `${pergunta} ${SIM}, com ${agora}: ${sim.map((o) => `${esc(o.nome)} (${pct(o.contraMelhor)})`).join(', ')}${estimado(c.bonus)} — as de borda verde.`;
    const caminhos = (r.caminhos ?? []).slice(0, 3).map((cm) => `${pedido(cm.bonus, cm.est)} (${cm.opcoes.map((o) => esc(o.nome)).join(', ')})`);
    return `${pergunta} ${NAO}, com ${agora}. ${caminhos.length ? `Daria com ${caminhos.join(' · ')}.` : 'Nem com 5★ de algum bônus: sorteie a lista de novo.'}`;
  }

  // Borda verde ou X vermelho no retrato; a dica do jogo ganha a linha do /hunt, e volta ao normal ao desligar.
  function marcarOpcoes(el, r, c) {
    const porId = new Map((r?.opcoes ?? []).map((o) => [o.pokeId, o]));
    for (const cel of el.querySelectorAll('.pry-c-pk[data-pk]')) {
      const o = porId.get(Number(cel.dataset.pk));
      let marca = cel.querySelector(':scope > .pih-prey-marca');
      if (cel.dataset.pihTitulo == null) cel.dataset.pihTitulo = cel.title ?? '';
      if (!o || !c.bonus) {
        marca?.remove();
        cel.classList.remove('pih-prey-marcado');
        cel.title = cel.dataset.pihTitulo;
        continue;
      }
      if (!marca) {
        marca = document.createElement('i');
        marca.setAttribute('aria-hidden', 'true');
        cel.append(marca);
      }
      cel.classList.add('pih-prey-marcado');
      marca.className = `pih-prey-marca ${o.passa ? 'pih-prey-sim' : 'pih-prey-nao'}`;
      const precisa = Object.entries(o.minEst ?? {}).sort((a, b) => a[1] - b[1]).map(([b, n]) => `${NOME_BONUS[b]} ${estrelas(n)}${n < 5 ? ' ou mais' : ''}`);
      const linha = !o.liberada
        ? `/hunt: Não — você não possui nível para esta hunt (Nv ${o.hunt?.nivel ?? '?'})`
        : `/hunt: ${o.passa ? 'Sim' : 'Não'} — ${xpH(o.valor)}${o.contraMelhor != null ? ` (${pct(o.contraMelhor)} contra a sua melhor hunt normal)` : ''}${!o.passa && precisa.length ? `; daria mais com ${precisa.join(' ou ')}` : ''}`;
      cel.title = cel.dataset.pihTitulo ? `${cel.dataset.pihTitulo}\n${linha}` : linha;
    }
  }

  function limpar(raiz) {
    for (const n of raiz.querySelectorAll('.pih-prey-resumo, .pih-prey-marca')) n.remove();
    for (const n of raiz.querySelectorAll('.pih-prey-marcado')) {
      n.classList.remove('pih-prey-marcado');
      if (n.dataset.pihTitulo != null) n.title = n.dataset.pihTitulo;
    }
  }

  // "Apoie o dev!": o mesmo balão do painel (QR e link da Livepix), aberto embaixo do topo da janela.
  const CORACAO = '<svg class="pih-coracao" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.4 1.7 8.3a3.9 3.9 0 0 1 5.5-5.5l.8.8.8-.8a3.9 3.9 0 0 1 5.5 5.5z"/></svg>';
  function apoio(raiz, topo) {
    if (!PIH.apoio || topo.querySelector('.pih-prey-apoiar')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pih-btn pih-prey-apoiar';
    b.title = 'Apoie o dev!';
    b.setAttribute('aria-expanded', 'false');
    b.innerHTML = `${CORACAO}<span>Apoie o dev!</span>`;
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      let balao = raiz.querySelector('.pih-prey-apoio');
      if (balao) { balao.remove(); b.setAttribute('aria-expanded', 'false'); return; }
      balao = document.createElement('div');
      balao.className = 'pih-apoio pih-prey-apoio';
      balao.innerHTML = `<a class="pih-apoio-qr" href="${PIH.apoio.url}" target="_blank" rel="noopener noreferrer" title="Abrir a página de apoio na Livepix">${PIH.apoio.qr}</a>
        <div><b>Apoie o dev!</b>
        <p>Escaneie o QR com o celular ou abra o link: o Pix vai pela Livepix, valor livre.</p>
        <p>Caso queira, mande uma mensagem pra mim, Liang, com seu @ no Discord e seu nick no jogo! Agradeço pelo apoio!</p>
        <a class="pih-btn pih-apoio-link" href="${PIH.apoio.url}" target="_blank" rel="noopener noreferrer">Abrir livepix.gg/crispim ↗</a></div>`;
      topo.after(balao);
      b.setAttribute('aria-expanded', 'true');
    });
    topo.insertBefore(b, topo.querySelector('.pih-prey-toggle') ?? topo.querySelector('#pry-ajuda') ?? null);
  }

  function botao(raiz) {
    const topo = raiz.querySelector('.pry-topo');
    if (!topo) return;
    let b = topo.querySelector('.pih-prey-toggle');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'pih-btn pih-prey-toggle';
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        ligado = !ligado;
        gravar();
        feito = '';
        agendar();
      });
      topo.insertBefore(b, topo.querySelector('#pry-ajuda') ?? null);
    }
    const texto = ligado ? 'Desativar /hunt' : 'Ativar /hunt';
    if (b.textContent !== texto) b.textContent = texto;
    b.classList.toggle('pih-desligado', !ligado);
    b.title = ligado ? 'Esconder a análise do /hunt nesta janela' : 'Mostrar se cada opção dá mais XP que a sua melhor hunt normal';
    apoio(raiz, topo);
  }

  // ---- quando refazer ---------------------------------------------------------------------------
  // `feito`: os dados da última conta desenhada, e `marcas`, quantos elementos nossos ela deixou na janela (o jogo
  // pode redesenhar e apagá-los). `emCurso`: os dados da conta que está rodando — o relógio da janela muda a tela a
  // cada segundo, e isso não pode recomeçar uma conta que ainda não terminou.
  let feito = '';
  let marcas = '';
  let emCurso = '';
  let pendente = 0;
  const agendar = () => { if (!pendente) pendente = setTimeout(() => { pendente = 0; atualizar(); }, 150); };

  let rodada = 0;
  async function atualizar() {
    const raiz = document.getElementById('pry');
    if (!raiz) { feito = ''; return; }
    botao(raiz);
    const calc = PIH.calculo;
    const eu = calc?.eu();
    const pk = calc?.pkAtivo();
    const nossos = () => `${raiz.querySelectorAll('.pih-prey-resumo').length}.${raiz.querySelectorAll('.pih-prey-marca').length}`;
    const dados = JSON.stringify([ligado, pk?.id, pk?.level, pk?.stats, eu?.automation?.prey, eu?.automation?.preyCartela2, eu?.level, eu?.loja?.alvoAtrasados, calc?.opcoes().tipoDoDia]);
    if (dados === emCurso) return;
    if (dados === feito && nossos() === marcas) return;
    if (!ligado || !calc?.pronto()) { limpar(raiz); feito = dados; marcas = nossos(); return; }
    const minha = ++rodada;
    emCurso = dados;
    let jogo;
    try { jogo = await PIH.carregarJogo(); } catch { emCurso = ''; return; }
    const cartelas = cartelasDoEstado(jogo, eu);
    if (minha !== rodada) return;
    if (!cartelas) { emCurso = ''; return; }
    const efeitos = PIH.engine._interno.preyDoJogador({ mod: jogo.mod, eu });
    const bestiario = PIH.engine._interno.bestiarioDoJogador({ mod: jogo.mod, eu, especies: jogo.especies, hunts: calc.contexto(jogo, pk).hunts });
    const resumoDe = (el) => {
      let resumo = el.querySelector('.pih-prey-resumo');
      if (!resumo) {
        resumo = document.createElement('p');
        resumo.className = 'pih-prey-resumo';
        const ancora = el.querySelector('.pry-efeito');
        if (ancora) ancora.before(resumo); else el.append(resumo);
      }
      return resumo;
    };
    for (const c of cartelas) {
      const el = raiz.querySelector(`.pry-cartela[data-cartela="${c.i}"]`);
      if (!el) continue;
      if (c.bloqueada) { el.querySelector('.pih-prey-resumo')?.remove(); marcarOpcoes(el, null, c); continue; }
      if (!c.bonus || !c.lista.length) { resumoDe(el).innerHTML = htmlResumo(null, c); marcarOpcoes(el, null, c); continue; }
      const resumo = resumoDe(el);
      if (!resumo.innerHTML) resumo.innerHTML = '<b>/hunt</b> · Calculando…';
      const r = await analisarCartela(jogo, pk, c, efeitos, bestiario);
      if (minha !== rodada) return;
      if (!el.isConnected) { emCurso = ''; return agendar(); }
      const html = htmlResumo(r, c);
      if (resumo.innerHTML !== html) resumo.innerHTML = html;
      marcarOpcoes(el, r, c);
    }
    feito = dados;
    marcas = nossos();
    emCurso = '';
  }

  // A janela nasce e renasce dentro do modal da Mochila; o estado muda a cada roletada e escolha.
  const vigiar = () => new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true });
  PIH.on('estado', agendar);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', vigiar, { once: true });
  else vigiar();
})(globalThis);
