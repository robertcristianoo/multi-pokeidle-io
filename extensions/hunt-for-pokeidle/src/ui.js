// A tela: o botão /hunt ao lado do nome do pokémon em campo e o painel "Onde caçar?".
//
// O card "Em campo" do jogo (`#ativo-card`) é redesenhado inteiro a cada atualização do
// estado. Por isso a barra /hunt NÃO mora dentro dele: fica no painel em volta (`#p-ativo`),
// que não é redesenhado, logo antes do card — no fluxo, acima do pokémon, na largura da caixa.
//
// Ao abrir o jogo, a extensão confere onde está o pokémon ativo. Se o card não estiver onde
// esperamos (layout novo do jogo), ela pede um clique nele e lembra a escolha.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  if (!PIH.on || !PIH.engine) return;

  const CHAVE_PREFS = 'pokeidle-hunt:prefs:v1';
  const CHAVE_ALVO = 'pokeidle-hunt:alvo:v1';
  const POR_PAGINA = 25;
  // O apoio ao dev: a página pública na Livepix e o QR dela (mesmo conteúdo; vetor em store/apoio).
  const URL_APOIO = 'https://livepix.gg/crispim';
  const URL_WISHLIST = 'https://pokeidleguide.io/#wishlist';
  // Decisão de 18/10/2026: os discos não entram na conta (ver o cabeçalho de engine.js).
  // O que a conta faz com os discos: o AoE entra como estimativa quando o pokémon o tem; o TM Elemental não entra.
  const avisoDosDiscos = (r) => (r?.aoe
    ? 'AoE na conta como estimativa (≈): cada golpe acerta de 1,5 a 3 selvagens, e o número usa 2. O TM Elemental (Z-Move) não entra.'
    : r ? 'O seu pokémon não tem o disco de AoE. O TM Elemental (Z-Move) não entra na conta.'
      : 'O AoE entra como estimativa quando o pokémon tem o disco; o TM Elemental (Z-Move) não entra na conta.');
  const QR_APOIO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h33v33H0z"/><path stroke="#000000" d="M4 4.5h7m1 0h4m1 0h2m3 0h7M4 5.5h1m5 0h1m1 0h3m1 0h1m3 0h1m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m1 0h1m2 0h4m3 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m2 0h1m3 0h2m1 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h3m2 0h2m1 0h1m1 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m4 0h1m1 0h2m1 0h1m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M13 11.5h3m1 0h1m1 0h2M4 12.5h1m2 0h7m4 0h1m1 0h2m2 0h1m1 0h3M4 13.5h1m4 0h1m2 0h3m3 0h3m2 0h5M4 14.5h2m1 0h1m2 0h10m1 0h1m2 0h2m2 0h1M4 15.5h1m1 0h1m1 0h2m1 0h1m2 0h3m1 0h1m1 0h1m1 0h7M4 16.5h1m4 0h3m2 0h1m1 0h1m5 0h2m4 0h1M4 17.5h4m6 0h1m1 0h2m1 0h3m2 0h1m2 0h1M4 18.5h3m1 0h1m1 0h1m1 0h1m6 0h1m1 0h2m1 0h5M4 19.5h1m1 0h4m2 0h3m3 0h1m1 0h1m2 0h1m1 0h2m1 0h1M4 20.5h1m4 0h3m1 0h1m2 0h2m2 0h5m1 0h2M12 21.5h3m2 0h1m2 0h1m3 0h1m1 0h2M4 22.5h7m1 0h1m1 0h2m1 0h2m1 0h1m1 0h1m1 0h1m3 0h1M4 23.5h1m5 0h1m1 0h1m1 0h1m1 0h2m1 0h2m3 0h1M4 24.5h1m1 0h3m1 0h1m1 0h2m1 0h2m1 0h7M4 25.5h1m1 0h3m1 0h1m1 0h2m1 0h1m4 0h3m4 0h2M4 26.5h1m1 0h3m1 0h1m2 0h7m1 0h1m2 0h5M4 27.5h1m5 0h1m2 0h1m1 0h2m1 0h2m2 0h3m1 0h3M4 28.5h7m1 0h4m4 0h1m1 0h1m2 0h1m2 0h1"/></svg>';

  const lerJson = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } };
  const gravarJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

  let prefs = { ordem: 'xp', soLiberadas: true, regiao: '', ...lerJson(CHAVE_PREFS, {}) };
  delete prefs.comPocao; // a poção agora vale sempre (o padrão do motor), mesmo para quem a desmarcou numa versão antiga
  let welcome = null;
  let eu = null;

  // ---- formatação ------------------------------------------------------------------------
  const nf = new Intl.NumberFormat('pt-BR');
  const nfc = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  const num = (v) => nf.format(Math.round(v));
  const curto = (v) => (Math.abs(v) >= 10000 ? nfc.format(v) : num(v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const REGIAO = { kanto: 'Kanto', johto: 'Johto', outland: 'Outland', orre: 'Orre', hoenn: 'Hoenn', sinnoh: 'Sinnoh', unova: 'Unova', kalos: 'Kalos', alola: 'Alola', galar: 'Galar', paldea: 'Paldea' };
  const regiao = (r) => REGIAO[r] ?? (r ? r[0].toUpperCase() + r.slice(1) : '');
  const segundos = (s) => (s < 1 ? '<1 s' : s < 60 ? `${s.toFixed(1).replace('.', ',')} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
  // O que é raro se lê melhor pelo tempo até o próximo: "37 h", "67 d".
  const tempoAte = (porHora) => {
    if (!(porHora > 0)) return '—';
    const h = 1 / porHora;
    return h < 1 ? `${num(h * 60)} min` : h < 100 ? `${num(h)} h` : `${num(h / 24)} d`;
  };
  const pctPequeno = (p) => `${(p * 100).toLocaleString('pt-BR', { maximumSignificantDigits: 3 })}%`;
  const poucos = (v) => v.toLocaleString('pt-BR', { maximumSignificantDigits: 2 });

  // [multi-pokeidle-io] pkManual: pokémon escolhido pelo atalho ⚔? dos cards (mercado, coleção...); vale até fechar o painel
  let pkManual = null;
  const pkAtivo = () => pkManual ?? eu?.pokemons?.find((p) => p.id === eu.activeId) ?? null;

  // ---- o botão ---------------------------------------------------------------------------
  function criarBotao(extra = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `pih-btn ${extra}`.trim();
    b.textContent = '/hunt';
    return b;
  }

  // duas espadas cruzadas + "?" (o mesmo ícone do atalho sobre a arte)
  const ICONE_CAB = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path stroke-width="2" d="M4 4l11 11M20 4L9 15"/><path stroke-width="2" d="M12.3 17.7l5.4-5.4M11.7 17.7L6.3 12.3"/><path stroke-width="2.6" d="M16 16l3.5 3.5M8 16l-3.5 3.5"/></svg><b>?</b>';
  const botao = criarBotao('pih-barra');
  botao.title = 'Onde caçar? — as melhores hunts para o seu pokémon em campo';
  botao.setAttribute('aria-label', botao.title);
  botao.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    alternarPainel();
  });

  let alvoManual = lerJson(CHAVE_ALVO, null); // seletor escolhido pelo jogador, se o padrão falhar

  function ancora() {
    if (alvoManual) {
      const el = document.querySelector(alvoManual);
      if (el) return { modo: 'manual', el };
    }
    const card = document.getElementById('ativo-card');
    const painel = document.getElementById('p-ativo');
    const nome = card?.querySelector('.ativo-nome');
    if (card && painel && nome && !card.classList.contains('vazio')) return { modo: 'padrao', card, nome };
    return null;
  }

  let quadro = 0;
  function posicionarBotao() {
    cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(() => {
      const a = ancora();
      if (!a) { botao.hidden = true; return; }
      botao.hidden = false;
      if (a.modo === 'padrao') {
        botao.classList.remove('pih-fixo');
        botao.style.left = botao.style.top = botao.style.width = '';
        const cab = a.card.parentElement?.querySelector(':scope > .painel-cab');
        if (cab) {
          // ícone pequeno no cabeçalho "Em campo", antes dos botões + e chat do jogo
          botao.classList.remove('pih-barra');
          botao.classList.add('pih-icone', 'btn-compartilhar-pk');
          if (!botao.querySelector('svg')) botao.innerHTML = ICONE_CAB;
          const ref = cab.querySelector('#btn-refino-pk, #btn-compartilhar-pk');
          if (botao.parentElement !== cab || (ref && botao.nextElementSibling !== ref)) { if (ref) cab.insertBefore(botao, ref); else cab.append(botao); }
        } else {
          botao.classList.add('pih-barra');
          if (a.card.previousElementSibling !== botao) a.card.before(botao);
        }
      } else {
        // Reserva: flutua logo acima do ponto que o jogador apontou.
        botao.classList.remove('pih-barra');
        botao.classList.add('pih-fixo');
        if (botao.parentElement !== document.body) document.body.appendChild(botao);
        const r = a.el.getBoundingClientRect();
        botao.style.left = `${r.left}px`;
        botao.style.top = `${Math.max(4, r.top - botao.offsetHeight - 6)}px`;
      }
    });
  }

  function vigiarCard() {
    const painel = document.getElementById('p-ativo') ?? document.body;
    new MutationObserver(posicionarBotao).observe(painel, { childList: true, subtree: true });
    addEventListener('resize', posicionarBotao);
    addEventListener('scroll', posicionarBotao, true);
    // Rede de segurança para mudanças de layout que não mexem no card (abrir/fechar painéis).
    setInterval(posicionarBotao, 1500);
  }

  // ---- verificação: onde está o pokémon ativo? -------------------------------------------
  let aviso = null;
  function mostrarAviso(html, { fechaEm = 0, acao = null } = {}) {
    aviso?.remove();
    aviso = document.createElement('div');
    aviso.className = 'pih-aviso';
    aviso.append(criarBotao());
    const txt = document.createElement('div');
    txt.innerHTML = html;
    aviso.append(txt);
    if (acao) aviso.append(acao);
    const x = document.createElement('button');
    x.className = 'pih-x';
    x.textContent = '×';
    x.onclick = () => { aviso?.remove(); aviso = null; pararMira(); };
    aviso.append(x);
    document.body.append(aviso);
    if (fechaEm) setTimeout(() => { if (aviso?.contains(txt)) { aviso.remove(); aviso = null; } }, fechaEm);
  }

  let verificado = false;
  function verificar(tentativa = 0) {
    if (verificado || !eu) return;
    const pk = pkAtivo();
    if (!pk) {
      if (tentativa === 0) mostrarAviso('Coloque um pokémon <b>em campo</b> para usar o <b>/hunt</b>.', { fechaEm: 8000 });
      setTimeout(() => verificar(1), 3000);
      return;
    }
    const a = ancora();
    const texto = a?.modo === 'padrao' ? a.nome.textContent : a?.el?.textContent;
    if (a && texto?.includes(pk.nome)) {
      verificado = true;
      posicionarBotao();
      mostrarAviso(`Pokémon em campo encontrado: <b>${esc(pk.nome)}</b>. O <b>/hunt</b> está logo acima dele.`, { fechaEm: 4500 });
      return;
    }
    if (tentativa < 12) { setTimeout(() => verificar(tentativa + 1), 500); return; }
    const mirar = document.createElement('button');
    mirar.className = 'pih-mais';
    mirar.style.width = 'auto';
    mirar.textContent = 'Apontar';
    mirar.onclick = iniciarMira;
    mostrarAviso(`<b>Onde está seu Pokémon ativo?</b><br>Não achei o card de <b>${esc(pk.nome)}</b>. Clique em “Apontar” e depois no nome dele.`, { acao: mirar });
  }

  let mirando = null;
  function iniciarMira() {
    document.documentElement.classList.add('pih-mirando');
    let marcado = null;
    const sobre = (ev) => {
      marcado?.classList.remove('pih-alvo');
      marcado = ev.target instanceof Element && !ev.target.closest('.pih-aviso') ? ev.target : null;
      marcado?.classList.add('pih-alvo');
    };
    const clique = (ev) => {
      if (!marcado) return;
      ev.preventDefault();
      ev.stopPropagation();
      alvoManual = seletorDe(marcado);
      gravarJson(CHAVE_ALVO, alvoManual);
      pararMira();
      verificado = true;
      posicionarBotao();
      mostrarAviso('Pronto: o <b>/hunt</b> vai ficar logo acima deste ponto.', { fechaEm: 4000 });
    };
    addEventListener('mouseover', sobre, true);
    addEventListener('click', clique, true);
    mirando = () => {
      removeEventListener('mouseover', sobre, true);
      removeEventListener('click', clique, true);
      marcado?.classList.remove('pih-alvo');
    };
  }
  function pararMira() {
    document.documentElement.classList.remove('pih-mirando');
    mirando?.();
    mirando = null;
  }
  function seletorDe(el) {
    const partes = [];
    while (el && el !== document.body) {
      if (el.id) { partes.unshift(`#${CSS.escape(el.id)}`); break; }
      const i = [...el.parentElement.children].indexOf(el) + 1;
      partes.unshift(`${el.tagName.toLowerCase()}:nth-child(${i})`);
      el = el.parentElement;
    }
    return partes.join(' > ');
  }

  // ---- o painel --------------------------------------------------------------------------
  let painel = null;
  let mostrando = POR_PAGINA;
  let assinatura = '';
  let ultimo = null; // o último cálculo, para trocar de região sem simular de novo (~0,6 s)
  let apoioAberto = false; // o balão de apoio começa fechado a cada abertura do painel
  let vendoWishlist = false;
  let wishlist = null; // a última resposta da ponte: { dados } ou { erro }; null enquanto busca
  let especiesPorNome = null; // os PINs dizem a espécie pelo nome; preenchido quando o catálogo do jogo carrega

  function alternarPainel() {
    if (painel) return fecharPainel();
    painel = document.createElement('div');
    painel.className = 'pih-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Onde caçar?');
    document.body.append(painel);
    mostrando = POR_PAGINA;
    apoioAberto = false;
    posicionarPainel();
    desenhar();
    addEventListener('keydown', aoTeclar, true);
    setTimeout(() => addEventListener('pointerdown', aoClicarFora, true));
  }
  function fecharPainel() {
    painel?.remove();
    painel = null;
    pkManual = null;
    assinatura = '';
    vendoWishlist = false;
    removeEventListener('keydown', aoTeclar, true);
    removeEventListener('pointerdown', aoClicarFora, true);
  }
  // [multi-pokeidle-io] usado pelo atalho ⚔? (atalho.js): abre o painel para o pokémon de um card
  PIH.abrirParaPokemon = (pk) => {
    if (!pk || typeof pk !== 'object') return;
    if (painel) fecharPainel();
    pkManual = pk;
    alternarPainel();
  };
  const aoTeclar = (ev) => { if (ev.key === 'Escape') fecharPainel(); };
  // [multi-pokeidle-io] só fecha com clique de verdade: o Auto-bola do app dispara pointerdown/click sintéticos (isTrusted=false)
  // nos caídos a cada ~1 s, o que fechava o painel sozinho fora do modo economia
  const aoClicarFora = (ev) => { if (ev.isTrusted && painel && !painel.contains(ev.target) && ev.target !== botao && !ev.target.closest?.('.pih-atalho')) fecharPainel(); };

  function posicionarPainel() {
    if (!painel) return;
    if (pkManual) { // [multi-pokeidle-io] aberto por um card: centralizado, por cima de qualquer janela do jogo
      painel.classList.add('pih-manual');
      painel.style.left = `${Math.max(8, (innerWidth - (painel.offsetWidth || 640)) / 2)}px`;
      painel.style.top = `${Math.max(8, Math.min(40, innerHeight - painel.offsetHeight - 8))}px`;
      return;
    }
    painel.classList.remove('pih-manual');
    const base = document.getElementById('p-ativo')?.getBoundingClientRect() ?? botao.getBoundingClientRect();
    const larg = painel.offsetWidth || 640;
    let left = base.right + 10;
    if (left + larg > innerWidth - 8) left = Math.max(8, innerWidth - larg - 8);
    const top = Math.min(Math.max(8, base.top - 60), Math.max(8, innerHeight - painel.offsetHeight - 8));
    painel.style.left = `${left}px`;
    painel.style.top = `${top}px`;
  }

  function cabecalho(pk) {
    const q = Number(pk?.quality ?? pk?.qualidade);
    const iv = pk?.ivs ? Object.values(pk.ivs).reduce((s, x) => s + (Number(x) || 0), 0) : null;
    const sub = pk
      ? [esc(pk.nome), `Nv ${num(pk.level)}`, `P${esc(pk.potencia ?? 1)}`, Number.isFinite(q) ? `Q ${q.toFixed(3).replace('.', ',')}` : '', iv != null ? `IV ${iv}` : '']
        .filter(Boolean).join(' · ')
      : 'nenhum pokémon em campo';
    return `<div class="pih-cab">
      <span class="pih-btn" aria-hidden="true">/hunt</span>
      <div class="pih-titulo"><h3>${vendoWishlist ? '✨ Shiny WishList' : 'Onde caçar?'} <span class="pih-credito">made by Liang</span></h3><small>${sub}</small></div>
      <button type="button" class="pih-btn pih-apoiar" data-acao="wishlist" title="${vendoWishlist ? 'Voltar para o ranking de hunts' : 'Os Shiny que os jogadores querem comprar'}">${vendoWishlist ? '← Onde caçar?' : '✨ Shiny WishList'}</button>
      <button type="button" class="pih-btn pih-apoiar" data-acao="apoiar" aria-expanded="${apoioAberto}" aria-controls="pih-apoio" title="Apoie o dev!">Apoie o dev!</button>
      <button type="button" class="pih-fechar" data-acao="fechar" title="Fechar (Esc)">×</button>
    </div>
    ${blocoApoio()}`;
  }

  /** O balão de apoio: QR e link da Livepix, aberto pelo botão dourado do cabeçalho. */
  function blocoApoio() {
    return `<div class="pih-vao pih-apoio" id="pih-apoio"${apoioAberto ? '' : ' hidden'}>
      <a class="pih-apoio-qr" href="${URL_APOIO}" target="_blank" rel="noopener noreferrer" title="Abrir a página de apoio na Livepix">${QR_APOIO}</a>
      <div>
        <b>Apoie o dev!</b>
        <p>Escaneie o QR com o celular ou abra o link: o Pix vai pela Livepix, valor livre.</p>
        <p>Caso queira, mande uma mensagem pra mim, Liang, com seu @ no Discord e seu nick no jogo! Agradeço pelo apoio!</p>
        <a class="pih-btn pih-apoio-link" href="${URL_APOIO}" target="_blank" rel="noopener noreferrer">Abrir livepix.gg/crispim ↗</a>
      </div>
    </div>`;
  }

  function blocoStats(pk) {
    if (!pk?.stats) return '';
    const rot = [['hp', 'HP'], ['atk', 'ATK'], ['def', 'DEF'], ['spAtk', 'SP.ATK'], ['spDef', 'SP.DEF'], ['speed', 'SPD']];
    return `<div class="pih-vao pih-stats">${rot.map(([k, r]) => `
      <div class="pih-stat"><b>${r}</b><span>${num(pk.stats[k] ?? 0)}</span>${pk.ivs?.[k] != null ? `<i>IV ${esc(pk.ivs[k])}</i>` : ''}</div>`).join('')}
    </div>`;
  }

  /** O pódio de ginásio que entrou no dano deste pokémon (jogo 1.377.0), se ele está num. */
  function blocoPodio(p) {
    if (!p) return '';
    const medalha = ['👑', '🥈', '🥉'][p.lugar - 1] ?? '';
    return `<div class="pih-vao pih-bonus" title="Quem está no pódio de um ginásio bate mais forte na hunt com todo pokémon daquele tipo: +25% o líder, +10% o 2º, +5% o 3º (sem empilhar entre os dois tipos)">
      <b>Pódio de ginásio:</b> ${medalha} ${esc(p.lugar)}º lugar <span class="pih-bonus-total">+${esc(p.pct)}% de dano</span>
    </div>`;
  }

  /** Os bônus de XP que entraram na conta (multiplicam-se, como no jogo). */
  function blocoBonus(b) {
    if (!b) return '';
    const x = (v) => `×${v.toFixed(2).replace('.', ',')}`;
    const fmt = (i) => `${esc(i.nome)} ${i.mult >= 2 ? x(i.mult) : `+${(Math.round((i.mult - 1) * 1000) / 10).toString().replace('.', ',')}%`}`;
    const lista = b.itens.length ? b.itens.map(fmt).join(' · ') : 'nenhum bônus ativo';
    const iguais = Math.abs(b.pokemon - b.treinador) < 1e-6;
    return `<div class="pih-vao pih-bonus" title="Os bônus se multiplicam entre si (Pokepédia → Níveis e XP)">
      <b>Bônus de XP:</b> ${lista}
      <span class="pih-bonus-total">${iguais ? x(b.pokemon) : `pokémon ${x(b.pokemon)} · treinador ${x(b.treinador)}`}</span>
    </div>`;
  }

  /** O aviso fixo do painel: o que a conta deixa de fora de propósito. */
  const blocoAviso = (r) => `<div class="pih-nota" role="note">⚠ ${avisoDosDiscos(r)}</div>`;

  // ---- os modos do ranking -------------------------------------------------------------------
  // O Fragmento de Ovo Shiny só cai de Unova em diante: abaixo do Nv 5.000 do treinador nenhuma hunt
  // liberada o dá, e o modo nem aparece.
  const nivelDoFragmento = (jogo) => jogo?.mod?.ovoShiny?.NIVEL_MIN_FRAGMENTO_OVO_SHINY ?? 5000;
  const fragmentoLiberado = (jogo) => (eu?.level ?? 0) >= nivelDoFragmento(jogo);
  const modo = (jogo) => (prefs.ordem === 'fragmento' && !fragmentoLiberado(jogo) ? 'xp' : MODOS[prefs.ordem] ? prefs.ordem : 'xp');

  function celulaShiny(l) {
    if (l.capturaChance == null) return '<span class="pih-dim" title="O jogo não mandou o catálogo de bolas">—</span>';
    if (!l.shinyChance) return '<span class="pih-dim" title="A espécie não tem arte Shiny no jogo: a captura nunca sai Shiny">sem Shiny</span>';
    const bola = ultimo?.r?.captura?.bola?.nome ?? 'bola';
    return `<span title="${esc(`${poucos(l.capturasH)} capturas/h com a ${bola} (${pctPequeno(l.capturaChance)} por corpo). Um Shiny a cada ${tempoAte(l.shinyH)} de caça.`)}">${tempoAte(l.shinyH)}<small class="pih-faixa">${poucos(l.capturasH)} capturas/h</small></span>`;
  }
  function celulaFragmento(l) {
    if (!l.fragmentoChance) return '<span class="pih-dim" title="O fragmento cai de Unova em diante">—</span>';
    const porOvo = ultimo?.r?.fragmento?.porOvo ?? 10;
    const ovo = tempoAte(l.fragmentoH / porOvo);
    return `<span title="${esc(`${pctPequeno(l.fragmentoChance)} por abate · ${poucos(l.fragmentoH)} fragmento/h · ${porOvo} fragmentos fazem um Ovo Shiny: um ovo a cada ${ovo} de caça`)}">${tempoAte(l.fragmentoH)}<small class="pih-faixa">ovo: ${ovo}</small></span>`;
  }

  // `celula` é a coluna principal; `chip`, o número curto do botão da região; o Shiny e o fragmento
  // são raros e aparecem como o tempo até o próximo.
  const MODOS = {
    xp: { botao: 'XP/h', coluna: 'XP/h', celula: (l) => curto(l.xpPokemonH), chip: (l) => curto(l.xpPokemonH), unidade: 'XP/h', outro: 'ouro' },
    ouro: { botao: 'Ouro/h', coluna: 'Ouro/h', celula: (l) => curto(l.ouroH), chip: (l) => curto(l.ouroH), unidade: 'ouro/h', outro: 'xp' },
    shiny: { botao: 'Shiny/h', coluna: 'Shiny a cada', celula: celulaShiny, chip: (l) => tempoAte(l.shinyH), unidade: 'até o próximo Shiny', outro: 'xp' },
    fragmento: { botao: 'Fragmento/h', coluna: 'Fragmento a cada', celula: celulaFragmento, chip: (l) => tempoAte(l.fragmentoH), unidade: 'até o próximo fragmento', outro: 'xp' },
  };

  function dicaDoModo(m, r, jogo) {
    if (m === 'ouro') {
      return `O ouro/h é o <b>ouro de cada abate</b>, que desde 15/10/2026 já traz o <b>bônus de loot</b> (os itens de venda ao NPC saíram do jogo).
      O Loot Boost e a <b>venda dos pokémon capturados</b> não entram no cálculo.`;
    }
    const c = r?.captura;
    if (m === 'shiny' && c) {
      const deOnde = c.origem === 'marcada' ? 'a melhor das marcadas no arremesso automático'
        : c.origem === 'bolsa' ? 'nenhuma marcada no arremesso automático: a melhor da sua bolsa' : 'você está sem bolas: a melhor da Loja';
      return `Cada selvagem caído recebe <b>uma bola</b>: a conta usa a <b>${esc(c.bola.nome)}</b> (${deOnde}) em todo corpo, o "Throw Nonstop" do VIP${c.semParar ? '' : ' — <b>o seu está desligado</b>: sem ele, só entra o que você arremessar à mão'}.
      A chance de captura é a da ficha do jogo, pelo estágio da espécie, e o Shiny sai em 1 de cada ${num(1 / (c.chanceShiny ?? 1 / 24000))} capturas.
      ${c.multCaptura > 1 ? 'Capture Boost ativo: a captura dobra. ' : ''}${c.multShiny > 1 ? 'Shiny Secret Lure ativo: o Shiny dobra. ' : ''}A <b>venda dos capturados</b> não entra.`;
    }
    const f = r?.fragmento;
    if (m === 'fragmento' && f) {
      const escada = jogo?.mod?.ovoShiny?.tabelaFragmentoOvoShiny?.() ?? [];
      const faixa = escada.length ? `: de 1 em ${num(1 / escada[0].chance)} abates na porta de Unova a 1 em ${num(1 / escada.at(-1).chance)} no topo de Paldea` : '';
      return `O <b>Fragmento de Ovo Shiny</b> cai em toda hunt de Unova em diante (Nv ${num(f.nivelMin)}+), com chance que sobe com o nível da hunt${faixa}.
      ${f.porOvo} fragmentos fazem um Ovo Shiny no Professor Carvalho, que choca em ${num(f.horasChoca / 24)} dias e nasce sempre Shiny.
      ${r.captura?.multLoot > 1 ? 'Loot Boost ativo: ×1,4.' : 'O Loot Boost multiplica por 1,4 (desligado agora).'}`;
    }
    return '';
  }

  function controles(r, jogo) {
    const m = modo(jogo);
    const dica = dicaDoModo(m, r, jogo);
    const botao = (id) => `<button type="button" data-ordem="${id}" class="${m === id ? 'on' : ''}">${MODOS[id].botao}</button>`;
    return `<div class="pih-ctrl">
      <span class="pih-seg">${botao('xp')}${botao('ouro')}${botao('shiny')}${fragmentoLiberado(jogo) ? botao('fragmento') : ''}</span>
      <label><input type="checkbox" data-pref="soLiberadas" ${prefs.soLiberadas ? 'checked' : ''}> só hunts liberadas</label>
      <button type="button" class="pih-shiny" data-acao="wishlist" title="Os Shiny que os jogadores querem comprar">✨ SHINY ✨</button>
      ${dica ? `<button type="button" class="pih-ajuda" data-acao="ajuda-modo" aria-expanded="false" aria-controls="pih-dica-${m}" title="Como o ${MODOS[m].botao} é contado">?</button>` : ''}
    </div>
    ${dica ? `<div class="pih-vao pih-dica" id="pih-dica-${m}" hidden>${dica}</div>` : ''}`;
  }

  function risco(l) {
    if (l.umHit) return '<span class="pih-perigo" title="Um golpe do selvagem passa do seu HP">☠ 1 hit</span>';
    if (l.mortesH >= 0.5) return `<span class="pih-perigo" title="Mortes estimadas por hora">☠ ${l.mortesH.toFixed(1).replace('.', ',')}/h</span>`;
    const pct = Math.round(l.hitPct * 100);
    const oque = `O pior golpe do selvagem tira ${pct}% do seu HP`;
    if (pct >= 50) return `<span class="pih-alerta" title="${oque}">⚠ ${pct}%</span>`;
    return `<span class="pih-ok" title="${oque}">✓ ${pct}%</span>`;
  }

  // Abates/h: o número do simulador do jogo, ou ≈ com a faixa e, no título, de onde veio a estimativa.
  const faixaDe = (l) => l.kphFaixa ?? [l.kph, l.kph];
  const doJogo = () => `simulador do jogo${PIH.ritmo?.versaoDoJogo ? ` v${PIH.ritmo.versaoDoJogo}` : ''}`;
  function porqueEstimado(l) {
    if (l.ritmo === 'faixa') return `Hunt${l.mapa ? ` (mapa ${l.mapa})` : ''} fora da tabela do ${doJogo()}: a mediana dos mapas`;
    return 'Sem a tabela de ritmo: um tempo padrão por abate';
  }
  // Com o disco de AoE e mais de um golpe por selvagem, o número é estimativa: os selvagens por golpe não foram medidos.
  const estimado = (l) => l.ritmo !== 'jogo' || !!l.aoe?.estimado;
  function abates(l) {
    if (!estimado(l)) return `<span title="${esc(`Ritmo do ${doJogo()}${l.aoe ? ', com AoE,' : ''} no mapa ${l.mapa}`)}">${num(l.kph)}</span>`;
    if (l.aoe?.estimado && l.ritmo === 'jogo') {
      const [lo, hi] = faixaDe(l);
      return `<span title="${esc(`Com o disco de AoE: estimativa. Cada golpe acerta de 1,5 a 3 selvagens (o número usa ${String(l.aoe.porGolpe).replace('.', ',')}), sem medida em jogo; quem mata de um golpe usa o número do ${doJogo()}. Faixa: ${num(lo)}–${num(hi)} abates/h.`)}"><small class="pih-dim">≈</small>${num(l.kph)}<small class="pih-faixa">${num(lo)}–${num(hi)}</small></span>`;
    }
    const [lo, hi] = faixaDe(l);
    return `<span title="${esc(`${porqueEstimado(l)}. Faixa: ${num(lo)}–${num(hi)} abates/h.`)}"><small class="pih-dim">≈</small>${num(l.kph)}<small class="pih-faixa">${num(lo)}–${num(hi)}</small></span>`;
  }

  function linhaHtml(l, i) {
    const medido = l.kphMedido != null
      ? `<span class="pih-medido" title="Você fez ${num(l.kphMedido)} abates/h aqui com este pokémon (referência; não muda o ranking)">●</span>`
      : '';
    const cls = [i === 0 && !l.inviavel ? 'pih-top' : '', l.liberada ? '' : 'pih-bloq'].filter(Boolean).join(' ');
    const golpe = l.melhorGolpe ? `${esc(l.melhorGolpe.nome)} ×${l.efetividade.toFixed(2).replace('.', ',')}` : '';
    if (l.inviavel) {
      return `<tr class="${cls}"><td class="pih-pos">${i + 1}</td>
        <td class="pih-hunt"><div class="pih-com-arte">${arteDaHunt(l)}<div><b>${esc(l.nome)}</b><small>${regiao(l.regiao)} · Nv ${num(l.nivel)}</small></div></div></td>
        <td colspan="5"><span class="pih-perigo">não mata o selvagem</span></td></tr>`;
    }
    return `<tr class="${cls}" title="${esc(golpe)}">
      <td class="pih-pos">${i + 1}</td>
      <td class="pih-hunt"><div class="pih-com-arte">${arteDaHunt(l)}<div><b>${esc(l.nome)}</b><small>${regiao(l.regiao)} · Nv ${num(l.nivel)}${l.liberada ? '' : ' · 🔒'}</small></div></div></td>
      <td>${MODOS[modo(ultimo?.jogo)].celula(l)}</td>
      <td>${medido}${abates(l)}</td>
      <td>${segundos(l.ttk)}</td>
      <td>${risco(l)}</td>
      <td>${MODOS[MODOS[modo(ultimo?.jogo)].outro].celula(l)}</td>
    </tr>`;
  }

  // A tipagem do dia sazonal, como o jogo manda no estado (o mesmo teste do app.js deles).
  const TIPOS_DO_DIA = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
    'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'];
  const tipoDoDia = () => (TIPOS_DO_DIA.includes(eu?.diaSazonal?.tipo) ? eu.diaSazonal.tipo : null);
  const nomeDoTipo = (t) => t[0] + t.slice(1).toLowerCase();

  // Um botão por aba do mapa que tem hunt no ranking, com o melhor valor dela: quem quer ficar numa
  // região vê ali o que ela rende e, num clique, o ranking só dela.
  function regioes(todas, vista) {
    const M = MODOS[modo(ultimo?.jogo)];
    const melhor = new Map();
    for (const l of todas) if (!l.inviavel && !melhor.has(l.regiao)) melhor.set(l.regiao, l);
    const botao = (id, rotulo, top) => {
      const titulo = top ? `Melhor ${id ? `em ${rotulo}` : 'de todas'}: ${top.nome}, ${M.chip(top)} ${M.unidade}` : `Nenhuma hunt de ${rotulo} mata o selvagem`;
      return `<button type="button" data-regiao="${id}" class="${vista === id ? 'on' : ''}" aria-pressed="${vista === id}" title="${esc(titulo)}">${esc(rotulo)} <small>${top ? M.chip(top) : '—'}</small></button>`;
    };
    const presentes = PIH.engine.REGIOES_DO_MAPA.filter((g) => todas.some((l) => l.regiao === g.id));
    return `<div class="pih-regioes" role="group" aria-label="Região do mapa">${botao('', 'Todas', todas.find((l) => !l.inviavel))}${presentes.map((g) => botao(g.id, g.rotulo, melhor.get(g.id))).join('')}</div>`;
  }

  function corpo(r, jogo) {
    const todas = r.linhas;
    if (!todas.length) return '<div class="pih-erro">Nenhuma hunt liberada para o seu nível de treinador.</div>';
    // A região escolhida que sumiu do ranking (outro nível, "só hunts liberadas") volta para "Todas".
    const vista = todas.some((l) => l.regiao === prefs.regiao) ? prefs.regiao : '';
    const linhas = vista ? todas.filter((l) => l.regiao === vista) : todas;
    const top = linhas.find((l) => !l.inviavel);
    const M = MODOS[modo(jogo)];
    const melhor = top ? `<div class="pih-vao pih-melhor">
        <span class="pih-coroa">👑</span>
        ${arteDaHunt(top, 40)}
        <div><strong>${esc(top.nome)}</strong> <span class="pih-dim">${regiao(top.regiao)} · Nv ${num(top.nivel)}</span><br>
        ${curto(top.xpPokemonH)} XP/h do pokémon · ${curto(top.xpTreinadorH)} XP/h do treinador · ${curto(top.ouroH)} ouro/h · ${estimado(top) ? '≈' : ''}${num(top.kph)} abates/h${top.melhorGolpe ? ` · ${esc(top.melhorGolpe.nome)}` : ''}${M === MODOS.shiny && top.shinyH ? ` · Shiny a cada ${tempoAte(top.shinyH)} (${poucos(top.capturasH)} capturas/h)` : ''}${M === MODOS.fragmento && top.fragmentoH ? ` · fragmento a cada ${tempoAte(top.fragmentoH)}` : ''}</div>
      </div>` : '';
    return `${regioes(todas, vista)}${melhor}
      <div class="pih-vao pih-lista"><table class="pih-tab">
        <thead><tr><th>#</th><th>Hunt</th><th>${M.coluna}</th><th>Abates/h</th><th>Mata em</th><th>Risco</th><th>${MODOS[M.outro].coluna}</th></tr></thead>
        <tbody>${linhas.slice(0, mostrando).map(linhaHtml).join('')}</tbody>
      </table>
      ${linhas.length > mostrando ? `<button type="button" class="pih-mais" data-acao="mais">mostrar mais (${linhas.length - mostrando})</button>` : ''}
      </div>
      <div class="pih-rodape">Dados do jogo ${jogo.versao ? `v${esc(jogo.versao)}` : 'no ar'} · ${r.linhas.length} de ${r.total} hunts${vista ? ` (${linhas.length} em ${regiao(vista)})` : ''} · cálculo em ${r.ms} ms · ritmo do ${doJogo()} em ${r.linhas.filter((l) => l.ritmo === 'jogo').length} delas (≈ estimado)${tipoDoDia() ? ` · dia de ${nomeDoTipo(tipoDoDia())}: os pokémon do tipo ficam 2× mais fortes` : ''} · com poção automática · a pé, sem bicicleta${r.aoe ? ' · AoE estimado (≈)' : ''} · ● = você já caçou aqui (passe o mouse)</div>`;
  }

  // ---- artes dos pokémon -----------------------------------------------------------------
  // Vêm do próprio jogo: a CSP dele libera imagem e fetch do mesmo domínio. O tracker diz, por looktype, em que atlas está
  // o retrato e em que janela dele. A tela desenha a caixa vazia, e a imagem entra no lugar quando fica pronta, sem
  // redesenhar a lista: assim ela não pula de volta para o topo no meio da rolagem.
  const ARTES_POR_PEDIDO = 40;
  const ALFA_VISIVEL = 16; // abaixo disso é sobra de sombra do atlas, não o contorno do bicho
  const LADO_DA_ARTE = 88; // o maior tamanho em tela (44 px), no dobro para não borrar em tela de alta densidade
  const artes = new Map(); // looktype → imagem pronta; fica entre aberturas para a lista não piscar
  const artesPedidas = new Set();

  function arteHtml(looktype, px) {
    const lt = Number(looktype);
    if (!lt) return `<span class="pih-arte" style="--px:${px}px"></span>`;
    return `<span class="pih-arte" style="--px:${px}px" data-look="${lt}">${artes.has(lt) ? `<img src="${artes.get(lt)}" alt="">` : ''}</span>`;
  }
  const arteDaHunt = (l, px = 30) => arteHtml(ultimo?.jogo?.especies.get(l.pokeId)?.looktype, px);

  async function pintarArtes() {
    const faltam = [...new Set([...(painel?.querySelectorAll('.pih-arte[data-look]:empty') ?? [])].map((el) => Number(el.dataset.look)))].filter((lt) => !artesPedidas.has(lt));
    for (const lt of faltam) artesPedidas.add(lt);
    for (let i = 0; i < faltam.length; i += ARTES_POR_PEDIDO) {
      const lote = faltam.slice(i, i + ARTES_POR_PEDIDO);
      try {
        const r = await fetch(`/tracker/api/sprites?lt=${lote.join(',')}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const { retratos = {} } = await r.json();
        await Promise.all(lote.map(async (lt) => {
          const arte = retratos[lt]?.img ? await recortarArte(retratos[lt]).catch(() => null) : null;
          if (!arte) return;
          artes.set(lt, arte);
          painel?.querySelectorAll(`.pih-arte[data-look="${lt}"]`).forEach((el) => { el.innerHTML = `<img src="${arte}" alt="">`; });
        }));
      } catch (e) {
        for (const lt of lote) artesPedidas.delete(lt);
        console.warn('[pokeidle-hunt] artes dos pokémon:', e);
      }
    }
  }

  // A janela do atlas tem o bicho num canto, cercado de transparência, e cada espécie ocupa um pedaço dela. Recorta pelo
  // contorno para todas ficarem do mesmo tamanho. A imagem é do mesmo domínio, então o canvas pode ler os pixels.
  async function recortarArte({ img, x, y, w, h }) {
    const atlas = new Image();
    atlas.src = img;
    await atlas.decode();
    const janela = document.createElement('canvas');
    janela.width = w;
    janela.height = h;
    const g = janela.getContext('2d', { willReadFrequently: true });
    g.drawImage(atlas, x, y, w, h, 0, 0, w, h);
    const { data } = g.getImageData(0, 0, w, h);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        if (data[(py * w + px) * 4 + 3] <= ALFA_VISIVEL) continue;
        x0 = Math.min(x0, px); x1 = Math.max(x1, px);
        y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      }
    }
    if (x1 < 0) return null;
    const largura = x1 - x0 + 1;
    const altura = y1 - y0 + 1;
    const saida = document.createElement('canvas');
    saida.width = saida.height = LADO_DA_ARTE;
    const k = LADO_DA_ARTE / Math.max(largura, altura);
    const ctx = saida.getContext('2d');
    ctx.imageSmoothingEnabled = k < 1; // ampliar pixel art sem borrar; reduzir, com suavização
    ctx.drawImage(janela, x0, y0, largura, altura, (LADO_DA_ARTE - largura * k) / 2, (LADO_DA_ARTE - altura * k) / 2, largura * k, altura * k);
    return saida.toDataURL();
  }

  // ---- Shiny WishList --------------------------------------------------------------------
  const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const ETAPA_NOME = { especie: 'na própria espécie', ultima: 'na última evolução' };

  // O prazo cobre a variante userscript, que não tem ponte: ele vence, e sobra o link para o site.
  function pedirWishlist() {
    return new Promise((resolve) => {
      const id = String(Math.random());
      const fim = (r) => { clearTimeout(prazo); removeEventListener('message', aoResponder); resolve(r); };
      const aoResponder = (ev) => { if (ev.source === root && ev.data?.tipo === 'pih:wishlist:lista' && ev.data.id === id) fim(ev.data); };
      const prazo = setTimeout(() => fim({ erro: 'sem resposta da ponte' }), 12000);
      addEventListener('message', aoResponder);
      postMessage({ tipo: 'pih:wishlist:pedir', id }, location.origin);
    });
  }

  async function abrirWishlist() {
    vendoWishlist = true;
    wishlist = null;
    desenhar();
    const r = await pedirWishlist();
    if (r.erro) console.warn('[pokeidle-hunt] Shiny WishList:', r.erro);
    wishlist = r;
    if (vendoWishlist) desenhar();
    if (!r.dados || especiesPorNome) return;
    try {
      const { especies } = await PIH.carregarJogo();
      especiesPorNome = new Map();
      for (const e of especies.values()) if (!especiesPorNome.has(e.name)) especiesPorNome.set(e.name, e);
      if (vendoWishlist && wishlist === r) desenhar();
    } catch (e) {
      console.warn('[pokeidle-hunt] catálogo para as artes da Shiny WishList:', e);
    }
  }

  // A arte shiny, como o `looktypeDe` do cliente; sem ela, a comum, que ainda mostra o bicho certo.
  function arteDoPin(p) {
    const e = especiesPorNome?.get(p.especie);
    return arteHtml(e ? welcome?.shinyLooks?.[e.pokeId] ?? welcome?.shinyLooksOutland?.[e.pokeId] ?? e.looktype : null, 44);
  }

  function exigenciasDoPin(p) {
    const regra = Number.isFinite(p.notaMinima) ? `Nota mínima ${nf.format(p.notaMinima)} ${ETAPA_NOME[p.etapa] ?? ''}`.trim() : '';
    return [regra, p.observacao].filter(Boolean).join(' · ') || 'Sem exigência';
  }

  function linhaDoPin(p, i) {
    return `<tr class="${i === 0 ? 'pih-wl-primeiro' : ''}">
      <td>${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}</td>
      <td class="pih-hunt"><div class="pih-com-arte">${arteDoPin(p)}<div><b>✨ ${esc(p.especie)}</b><small>${esc(exigenciasDoPin(p))}</small></div></div></td>
      <td>${esc(p.nick)}</td>
      <td class="pih-wl-valor">${reais.format((Number(p.valorCentavos) || 0) / 100)}</td>
    </tr>`;
  }

  function blocoWishlist() {
    const aoSite = `<a class="pih-wl-link" href="${URL_WISHLIST}" target="_blank" rel="noopener noreferrer">Ver no site e como solicitar um Shiny Hunt</a>`;
    if (!wishlist) return `<div class="pih-carga">Buscando a lista…</div><div class="pih-rodape">${aoSite}</div>`;
    if (wishlist.erro) return `<div class="pih-erro">Não deu para carregar a lista aqui.</div><div class="pih-rodape">${aoSite}</div>`;
    const abertos = Array.isArray(wishlist.dados?.abertos) ? wishlist.dados.abertos : [];
    const lista = abertos.length
      ? `<div class="pih-vao pih-lista"><table class="pih-tab">
          <thead><tr><th>#</th><th>Shiny</th><th>Jogador</th><th>Pagou</th></tr></thead>
          <tbody>${abertos.map(linhaDoPin).join('')}</tbody>
        </table></div>`
      : '<div class="pih-carga">Ainda não há PINs.</div>';
    return `<div class="pih-wl-chamada"><b>Não sabe qual Shiny farmar? Veja aqui!</b> Cada PIN é um Shiny que um jogador quer comprar.</div>
      <div class="pih-vao pih-wl-volta">💰 <b>50% do valor volta</b> para quem fechar negócio: 25% para o anunciante e 25% para quem pegar o Shiny.</div>
      ${lista}
      <div class="pih-rodape">O valor é o que o jogador pagou para ficar listado. O preço do Shiny é negociado entre quem pediu e quem pegou. ${aoSite}</div>`;
  }

  async function desenhar() {
    if (!painel) return;
    const pk = pkAtivo();
    if (vendoWishlist) {
      painel.innerHTML = `${cabecalho(pk)}${blocoWishlist()}`;
      ligarEventos();
      posicionarPainel();
      return;
    }
    if (!welcome || !eu) {
      painel.innerHTML = `${cabecalho(pk)}<div class="pih-carga">Esperando o jogo conectar…</div>`;
      ligarEventos();
      return;
    }
    if (!pk) {
      painel.innerHTML = `${cabecalho(null)}<div class="pih-erro">Coloque um pokémon em campo para ver onde caçar.</div>`;
      ligarEventos();
      return;
    }
    painel.innerHTML = `${cabecalho(pk)}${blocoStats(pk)}${controles()}${blocoAviso(null)}<div class="pih-carga">Lendo o jogo…</div>`;
    ligarEventos();
    posicionarPainel();
    try {
      const jogo = await PIH.carregarJogo();
      if (!painel || vendoWishlist) return;
      const r = PIH.engine.analisar(pk, contexto(jogo, pk), { ...prefs, ordem: modo(jogo), tipoDoDia: tipoDoDia() });
      ultimo = { r, jogo };
      painel.innerHTML = htmlDoCalculo();
      assinatura = assinaturaDe(pk);
    } catch (err) {
      console.error('[pokeidle-hunt]', err);
      if (!painel || vendoWishlist) return;
      painel.innerHTML = `${cabecalho(pk)}<div class="pih-erro">Não consegui calcular: ${esc(err.message)}</div>`;
    }
    ligarEventos();
    posicionarPainel();
  }

  function htmlDoCalculo() {
    const { r, jogo } = ultimo;
    return `${cabecalho(r.pokemon)}${blocoStats(r.pokemon)}${blocoBonus(r.bonusXp)}${blocoPodio(r.podio)}${controles(r, jogo)}${blocoAviso(r)}${corpo(r, jogo)}`;
  }

  function contexto(jogo, pk) {
    const chave = PIH.geo?.chaveDoPokemon(pk);
    return {
      mod: jogo.mod,
      especies: jogo.especies,
      hunts: welcome.hunts ?? [],
      consts: {
        tabelaTipos: welcome.tabelaTipos,
        ampliacaoHunt: welcome.ampliacaoHunt,
        multHpSelvagem: welcome.multHpSelvagem,
        multDanoSelvagem: welcome.multDanoSelvagem,
        tiposBoost: welcome.tiposBoost,
        catalogoBolas: welcome.catalogoBolas, captura: welcome.captura, chanceShiny: welcome.chanceShiny, shinyLooks: welcome.shinyLooks,
      },
      eu,
      ritmo: PIH.ritmo ?? null,
      mapaVisto: (slug) => PIH.geo?.mapaDa(slug) ?? null,
      ritmoMedido: (slug) => (chave ? PIH.geo?.ritmoMedido(slug, chave) ?? null : null),
    };
  }

  function ligarEventos() {
    if (!painel) return;
    painel.querySelector('[data-acao="fechar"]')?.addEventListener('click', fecharPainel);
    for (const b of painel.querySelectorAll('[data-acao="wishlist"]')) {
      b.addEventListener('click', () => {
        if (vendoWishlist) { vendoWishlist = false; desenhar(); } else abrirWishlist();
      });
    }
    pintarArtes();
    const apoiar = painel.querySelector('[data-acao="apoiar"]');
    apoiar?.addEventListener('click', () => {
      apoioAberto = !apoioAberto;
      painel.querySelector('#pih-apoio').hidden = !apoioAberto;
      apoiar.setAttribute('aria-expanded', String(apoioAberto));
      posicionarPainel();
    });
    painel.querySelector('[data-acao="mais"]')?.addEventListener('click', () => { mostrando += POR_PAGINA; desenhar(); });
    const ajuda = painel.querySelector('[data-acao="ajuda-modo"]');
    ajuda?.addEventListener('click', () => {
      const dica = painel.querySelector('.pih-dica');
      dica.hidden = !dica.hidden;
      ajuda.setAttribute('aria-expanded', String(!dica.hidden));
    });
    for (const b of painel.querySelectorAll('[data-ordem]')) {
      b.addEventListener('click', () => { prefs.ordem = MODOS[b.dataset.ordem] ? b.dataset.ordem : 'xp'; gravarJson(CHAVE_PREFS, prefs); desenhar(); });
    }
    for (const b of painel.querySelectorAll('[data-regiao]')) {
      b.addEventListener('click', () => {
        prefs.regiao = String(b.dataset.regiao ?? '').replace(/[^\w-]/g, '');
        gravarJson(CHAVE_PREFS, prefs);
        mostrando = POR_PAGINA;
        if (!ultimo) return desenhar();
        painel.innerHTML = htmlDoCalculo();
        ligarEventos();
        posicionarPainel();
      });
    }
    for (const c of painel.querySelectorAll('[data-pref]')) {
      c.addEventListener('change', () => { prefs[c.dataset.pref] = c.checked; gravarJson(CHAVE_PREFS, prefs); desenhar(); });
    }
  }

  // Recalcula com o painel aberto só quando muda o que entra na conta (outro pokémon, nível
  // novo, refino) — não a cada golpe recebido. Os discos não entram, então não disparam.
  // O dia sazonal vira às 18:00 de Brasília com o jogador em campo: muda o ranking, então entra aqui.
  const assinaturaDe = (pk) => (pk ? `${pk.id}|${pk.level}|${JSON.stringify(pk.stats)}|${tipoDoDia() ?? ''}` : '');

  // ---- ligação com o jogo ----------------------------------------------------------------
  function preaquecer() {
    const ocioso = root.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    ocioso(() => PIH.carregarJogo().catch((err) => console.warn('[pokeidle-hunt] pré-carga falhou', err)));
  }

  PIH.on('welcome', (m) => {
    welcome = m;
    preaquecer();
  });
  PIH.on('estado', (e) => {
    const primeiro = !eu;
    eu = e;
    posicionarBotao();
    if (primeiro) setTimeout(() => verificar(0), 800);
    if (painel && !vendoWishlist && assinatura && assinaturaDe(pkAtivo()) !== assinatura) desenhar();
  });

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', vigiarCard, { once: true });
  else vigiarCard();
})(globalThis);
