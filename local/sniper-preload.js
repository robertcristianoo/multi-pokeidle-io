// Preload do sniper. Roda antes dos scripts do jogo e injeta, no mundo
// principal da página, um gancho em WebSocket.prototype.send. Com ele o sniper "empresta" o socket
// que o próprio jogo já abriu (mesma sessão, nenhuma conexão nova) e lê/pede o mercado por ele.
// A configuração e o liga/desliga chegam depois, pelo main, via executeJavaScript -> window.__snp.
const { webFrame } = require('electron');

function hook() {
  if (window.__snp) return;
  const S = (window.__snp = {
    cfg: { on: false, live: false, rules: [], intervalSec: 8, cap: { gold: 0, orb: 0 } },
    ws: null,
    nick: null,
    catalogo: [],
    socks: new WeakSet(),
    logs: [],
    base: { gold: 0, orb: 0 },
    local: { gold: 0, orb: 0 },
    baseSet: false,
    tried: new Set(),
    waiting: null,
    running: false,
    nextAt: 0,
    lastBuyAt: 0,
    lastBuyTry: 0,
    timeouts: 0,
    events: [], // compras confirmadas/falhas, entregues ao main (print + aviso)
    lastBuy: null,
    skew: 0, // relógio local - relógio do servidor (as retenções dos anúncios usam o do servidor)
    wakeAt: 0, // acorda mais cedo quando um anúncio dentro do preço está para ser liberado
    wakeRule: null,
    noted: new Set(),
  });

  const log = (level, text) => {
    S.logs.push({ level, text });
    if (S.logs.length > 200) S.logs.shift();
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (x) => String(x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const spent = (m) => S.base[m] + S.local[m];
  const serverNow = () => Date.now() - S.skew;
  const fmt = (n) => Number(n).toLocaleString('pt-BR');

  // ---- socket do jogo ----
  const origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      // O `hello` é a primeira mensagem de todo socket do jogo (inclusive nas reconexões)
      if (typeof data === 'string' && !S.socks.has(this) && data.includes('"t":"hello"')) {
        S.socks.add(this);
        try { S.nick = JSON.parse(data).nick ?? null; } catch {}
        S.ws = this;
        this.addEventListener('message', onMessage);
        this.addEventListener('close', () => { if (S.ws === this) S.ws = null; });
        log('info', `socket do jogo capturado (${S.nick ?? '?'})`);
      }
    } catch {}
    return origSend.apply(this, arguments);
  };

  function onMessage(ev) {
    const d = ev.data;
    if (typeof d !== 'string') return;
    if (d.includes('"servidorAgora"')) {
      const sm = /"servidorAgora":\s*(\d+)/.exec(d);
      if (sm) S.skew = Date.now() - Number(sm[1]);
    }
    // O jogo manda muita coisa; só parseia o que interessa
    const isMarket = d.includes('"t":"market"');
    const isCat = d.includes('"catalogo"');
    const isBuy = d.includes('marketComprado');
    const isErr = d.includes('"t":"erro"');
    if (!isMarket && !isCat && !isBuy && !isErr) return;
    let m;
    try { m = JSON.parse(d); } catch { return; }

    if (isCat && Array.isArray(m?.mercado?.catalogo)) {
      S.catalogo = m.mercado.catalogo.map((i) => ({ id: i.id, nome: i.nome }));
      log('info', `catálogo do mercado: ${S.catalogo.length} itens`);
    }
    if (isBuy) {
      // os eventos do jogo chegam em lote: { t: 'batalha', ev: [{ k: 'marketComprado', descricao }] }
      const lista = m.t === 'batalha' && Array.isArray(m.ev) ? m.ev : [m];
      for (const e of lista) {
        if (e && (e.k === 'marketComprado' || e.k === 'marketCompradoLote')) buyDone(true, e.descricao ?? e.k);
      }
    }
    if (isErr && m.t === 'erro') {
      const texto = m.chave ?? m.msg ?? '?';
      if (Date.now() - S.lastBuyAt < 8000) buyDone(false, String(texto));
      if (S.waiting) {
        log('warn', `servidor recusou a consulta (${texto}); aguardando 30s`);
        S.nextAt = Date.now() + 30000;
        finishWait(null);
      }
    }
    if (isMarket && m.t === 'market' && S.waiting) {
      const w = S.waiting;
      if (w.kind === 'item' && m.aba === 'item' && Number(m.itemId) === w.itemId && m.moeda === w.rule.moeda) finishWait(m.linhas ?? []);
      else if (w.kind === 'pokemon' && m.aba === 'vitrine') finishWait(m.linhas ?? []);
    }
  }

  // Fecha a última compra pedida (uma só vez): vira log + evento para o main tirar o print e avisar
  function buyDone(ok, texto, timeout = false) {
    const b = S.lastBuy;
    if (!b) return;
    const custo = b.qtd * b.preco;
    if (b.done) {
      // a confirmação chegou DEPOIS do prazo de 6 s: a compra valeu, então o gasto volta a contar
      if (ok && b.timedOut && !b.lateOk) {
        b.lateOk = true;
        S.local[b.moeda] += custo;
        S.events.push({ ev: 'ok', texto, compra: { nome: b.nome, qtd: b.qtd, preco: b.preco, moeda: b.moeda, id: b.id } });
        log('ok', `COMPRA CONFIRMADA (atrasada): ${texto}`);
      }
      return;
    }
    b.done = true;
    S.events.push({ ev: ok ? 'ok' : 'falha', texto, compra: { nome: b.nome, qtd: b.qtd, preco: b.preco, moeda: b.moeda, id: b.id } });
    log(ok ? 'ok' : 'error', ok ? `COMPRA CONFIRMADA: ${texto}` : `COMPRA FALHOU: ${texto}`);
    if (!ok) {
      // o gasto reservado na hora do pedido volta: só compra que deu certo conta no teto
      S.local[b.moeda] = Math.max(0, S.local[b.moeda] - custo);
      b.timedOut = timeout;
      setTimeout(() => S.tried.delete(b.id), 10000); // se o anúncio ainda estiver lá (ex.: retenção), tenta de novo
    }
    // próxima tentativa já: outros jogadores também estão de sniper, cada segundo conta
    S.wakeAt = Date.now() + (ok ? 400 : 150);
    S.wakeRule = b.ruleId;
  }

  let waitResolve = null;
  function finishWait(linhas) {
    const w = S.waiting;
    S.waiting = null;
    if (waitResolve) waitResolve(linhas);
    waitResolve = null;
    return w;
  }

  // ---- consulta e compra ----
  function resolveItem(rule) {
    const alvo = norm(rule.nome);
    const exato = S.catalogo.filter((i) => norm(i.nome) === alvo);
    if (exato.length === 1) return exato[0];
    const parcial = S.catalogo.filter((i) => norm(i.nome).includes(alvo));
    if (parcial.length === 1) return parcial[0];
    const key = `amb:${rule.id}:${S.catalogo.length}`;
    if (!S.tried.has(key)) {
      S.tried.add(key);
      log('warn', parcial.length ? `item "${rule.nome}" ambíguo: ${parcial.slice(0, 6).map((i) => i.nome).join(', ')}` : `item "${rule.nome}" não encontrado no catálogo`);
    }
    return null;
  }

  function query(rule) {
    return new Promise((resolve) => {
      let msg;
      if (rule.tipo === 'item') {
        const it = resolveItem(rule);
        if (!it) return resolve(null);
        S.waiting = { kind: 'item', rule, itemId: Number(it.id) };
        msg = { t: 'market.item', itemId: it.id, moeda: rule.moeda };
      } else {
        S.waiting = { kind: 'pokemon', rule };
        msg = {
          t: 'market.listar', tipo: 'pokemon', moeda: rule.moeda, busca: rule.nome || '', ordem: 'baratos',
          criterios: [], elemento: '', categoria: '', soShiny: !!rule.soShiny, soP5: !!rule.soP5,
          soTmElemental: false, soTmAoe: false, semOutland: false,
          nivelMin: '', nivelMax: '', potenciaMin: '', potenciaMax: '', ivMin: '', ivMax: '',
          qualidadeMin: '', qualidadeMax: '', notaMin: '', notaMax: '', pagina: 0, especieId: 0,
        };
      }
      waitResolve = resolve;
      try { S.ws.send(JSON.stringify(msg)); } catch { finishWait(null); return; }
      setTimeout(() => {
        if (S.waiting && waitResolve === resolve) {
          S.timeouts++;
          if (S.timeouts % 5 === 1) log('warn', `sem resposta do mercado para "${rule.nome}"`);
          finishWait(null);
        }
      }, 6000);
    });
  }

  function consider(rule, linhas) {
    const agora = serverNow();
    const dentro = linhas
      .filter((a) => a && a.id != null && a.moeda === rule.moeda && a.preco > 0 && a.preco <= rule.maxPreco
        && a.vendedor !== S.nick && !S.tried.has(a.id))
      .sort((x, y) => x.preco - y.preco);
    const retido = (a) => !!(a.compravelEm && agora < a.compravelEm);
    const achados = dentro.filter((a) => !retido(a));
    // anúncio no preço, mas em retenção: volta exatamente quando o servidor liberar (não espera o ciclo)
    const retidos = dentro.filter(retido);
    if (retidos.length) {
      const em = Math.min(...retidos.map((a) => a.compravelEm)) - agora;
      const wake = Date.now() + Math.min(600000, Math.max(400, em + 250));
      if (!S.wakeAt || wake < S.wakeAt) { S.wakeAt = wake; S.wakeRule = rule.id; }
      const r = retidos[0];
      if (!S.noted.has(r.id)) {
        S.noted.add(r.id);
        if (S.noted.size > 2000) S.noted.clear();
        log('info', `${rule.nome}: anúncio a ${fmt(r.preco)} em retenção, volto em ${Math.ceil(em / 1000)}s para comprar`);
      }
    }
    if (!achados.length) return;
    const a = achados[0];
    const unidade = rule.moeda === 'orb' ? 'gemas' : 'coins';
    let qtd = Math.max(1, Math.min(Number(a.qtd) || 1, rule.qtd || 1));
    const nome = `${rule.nome}${rule.soShiny ? ' (shiny)' : ''}`;

    if (!S.cfg.live) {
      S.tried.add(a.id);
      log('match', `[SIMULAÇÃO] compraria ${qtd}× ${nome} a ${fmt(a.preco)} ${unidade} (teto ${fmt(rule.maxPreco)}) — anúncio ${a.id}`);
      return;
    }
    const teto = Number(S.cfg.cap?.[rule.moeda]) || 0;
    const restante = teto - spent(rule.moeda);
    qtd = Math.min(qtd, Math.floor(restante / a.preco));
    if (qtd < 1) {
      const key = `cap:${rule.moeda}`;
      if (!S.tried.has(key)) { S.tried.add(key); log('warn', `teto de gasto em ${unidade} atingido/zerado; não comprei ${nome} a ${fmt(a.preco)}`); }
      return;
    }
    if (S.lastBuy && !S.lastBuy.done) return; // uma compra por vez; a próxima tentativa vem assim que esta fechar
    S.tried.add(a.id);
    if (S.tried.size > 5000) S.tried.clear();
    S.lastBuyAt = Date.now();
    S.local[rule.moeda] += qtd * a.preco; // reserva o gasto já; a confirmação só valida
    log('buy', `COMPRANDO ${qtd}× ${nome} a ${fmt(a.preco)} ${unidade} — anúncio ${a.id}`);
    const compra = (S.lastBuy = { id: a.id, nome, qtd, preco: a.preco, moeda: a.moeda, ruleId: rule.id, done: false });
    setTimeout(() => { if (S.lastBuy === compra) buyDone(false, 'sem confirmação do servidor em 6s', true); }, 6000);
    // id, preco e moeda vão exatamente como o servidor listou
    try { S.ws.send(JSON.stringify({ t: 'market.comprar', id: a.id, qtd, preco: a.preco, moeda: a.moeda })); } catch {}
  }

  async function cycle() {
    if (S.running) return;
    S.running = true;
    try {
      let rules = S.cfg.rules.filter((r) => r.ativo !== false && r.maxPreco > 0 && r.nome);
      if (S.wakeRule) rules = [...rules.filter((r) => r.id === S.wakeRule), ...rules.filter((r) => r.id !== S.wakeRule)];
      S.wakeAt = 0;
      S.wakeRule = null;
      for (const rule of rules) {
        if (!S.cfg.on || !S.ws || S.ws.readyState !== 1) break;
        const linhas = await query(rule);
        if (linhas) consider(rule, linhas);
        await sleep(1200 + Math.random() * 800);
      }
    } finally {
      S.nextAt = Math.max(S.nextAt, Date.now() + Math.max(5, Number(S.cfg.intervalSec) || 8) * 1000);
      S.running = false;
    }
  }

  setInterval(() => {
    if (S.cfg.on && S.ws && S.ws.readyState === 1 && !S.running && (Date.now() >= S.nextAt || (S.wakeAt && Date.now() >= S.wakeAt))) cycle();
  }, 1000);

  // ---- ponte com o main ----
  S.setCfg = (c) => {
    if (!S.baseSet) { S.base = { gold: Number(c.spentBase?.gold) || 0, orb: Number(c.spentBase?.orb) || 0 }; S.baseSet = true; }
    const eraOn = S.cfg.on, eraLive = S.cfg.live;
    S.cfg = { on: !!c.on, live: !!c.live, rules: Array.isArray(c.rules) ? c.rules : [], intervalSec: c.intervalSec, cap: c.cap || {} };
    if (S.cfg.on && !eraOn) { S.tried.clear(); log('info', `sniper LIGADO (${S.cfg.live ? 'COMPRA REAL' : 'simulação'})`); }
    if (!S.cfg.on && eraOn) log('info', 'sniper DESLIGADO');
    if (S.cfg.on && eraOn && S.cfg.live !== eraLive) log('info', `modo: ${S.cfg.live ? 'COMPRA REAL' : 'simulação'}`);
  };
  S.drain = () => {
    const logs = S.logs.splice(0);
    return { logs, events: S.events.splice(0), spent: { gold: spent('gold'), orb: spent('orb') }, socket: !!(S.ws && S.ws.readyState === 1), running: S.running, catalogo: S.catalogo.length };
  };
}

webFrame.executeJavaScript(`(${hook.toString()})()`);
