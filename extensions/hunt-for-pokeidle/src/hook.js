// Escuta o WebSocket do jogo sem mexer em nada.
//
// Roda no contexto da página (world MAIN), antes do cliente do jogo abrir o socket. Só
// acrescenta um ouvinte de mensagem: nada é enviado, nada é alterado, o jogo continua
// recebendo exatamente o que recebia. O que chega é repassado ao barramento da extensão
// (`PIH.on`), que as outras partes (catálogo, geometria, tela) assinam.
(function (root) {
  'use strict';
  const PIH = (root.__pokeidleHunt ??= {});
  if (PIH.hookInstalado) return;
  PIH.hookInstalado = true;

  // ---- barramento de eventos -------------------------------------------------------------
  const ouvintes = new Map();
  // O último de cada tipo fica guardado: quem assina depois (a tela carrega mais tarde que o
  // welcome, às vezes) recebe na hora em vez de esperar o próximo.
  const ultimo = new Map();
  const RETIDOS = new Set(['welcome', 'estado']);

  PIH.on = (tipo, fn) => {
    if (!ouvintes.has(tipo)) ouvintes.set(tipo, new Set());
    ouvintes.get(tipo).add(fn);
    if (ultimo.has(tipo)) {
      try { fn(ultimo.get(tipo)); } catch (err) { console.error('[pokeidle-hunt]', err); }
    }
    return () => ouvintes.get(tipo)?.delete(fn);
  };
  PIH.emit = (tipo, dado) => {
    if (RETIDOS.has(tipo)) ultimo.set(tipo, dado);
    for (const fn of ouvintes.get(tipo) ?? []) {
      try { fn(dado); } catch (err) { console.error('[pokeidle-hunt]', err); }
    }
  };

  // ---- o estado chega em delta ------------------------------------------------------------
  // O jogo manda o quadro inteiro no welcome e depois só o que mudou. A remontagem é a do
  // próprio jogo (`shared/estado-delta.mjs`), importada ao vivo; até ela chegar, os pacotes
  // ficam na fila para não perder nenhum delta.
  let mesclar = null;
  const fila = [];
  // A remontagem do estado (`shared/estado-delta.mjs`) vem embutida pelo boot.js, não de um import
  // remoto. Até os módulos chegarem, os pacotes ficam na fila para não perder nenhum delta.
  PIH.jogoPronto
    .then(() => {
      mesclar = PIH.criarMescladorDeEstado();
      for (const parcial of fila.splice(0)) entregarEstado(parcial);
    })
    .catch((err) => console.error('[pokeidle-hunt] estado-delta indisponível', err));

  function entregarEstado(parcial) {
    if (!mesclar) { fila.push(parcial); return; }
    const eu = mesclar(parcial);
    if (eu) PIH.emit('estado', eu);
  }

  function aoReceber(ev) {
    if (typeof ev.data !== 'string') return;
    // Só interessam quatro tipos; os pacotes `campo` são os mais frequentes (vários por
    // segundo) e são pequenos. Tudo o mais passa direto sem parse.
    const cab = ev.data.slice(0, 40);
    let tipo = null;
    if (cab.includes('"t":"welcome"')) tipo = 'welcome';
    else if (cab.includes('"t":"estado"')) tipo = 'estado';
    else if (cab.includes('"t":"campo.init"')) tipo = 'campo.init';
    else if (cab.includes('"t":"campo"')) tipo = 'campo';
    if (!tipo) return;
    let m;
    try { m = JSON.parse(ev.data); } catch { return; }
    if (tipo === 'welcome') {
      // O estado do welcome é o quadro completo (`cheio`): zera o mesclador antes.
      PIH.emit('welcome', m);
      if (m.estado) entregarEstado({ ...m.estado, cheio: true });
    } else if (tipo === 'estado') {
      if (m.estado) entregarEstado(m.estado);
    } else {
      PIH.emit(tipo, m);
    }
  }

  // ---- o socket ---------------------------------------------------------------------------
  const Original = root.WebSocket;
  function WebSocketObservado(...args) {
    const ws = new Original(...args);
    try {
      const alvo = new URL(String(args[0]), location.href);
      if (alvo.host === location.host) ws.addEventListener('message', aoReceber);
    } catch { /* URL estranha: não é o socket do jogo */ }
    return ws;
  }
  WebSocketObservado.prototype = Original.prototype;
  for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) WebSocketObservado[k] = Original[k];
  root.WebSocket = WebSocketObservado;
})(globalThis);
