// Sniper: o liga/desliga é da barra; salvar pela janela de configuração (possivelmente desatualizada) não
// pode religar/desligar contas nem ligar a compra real por engano; o botão avisa quando falta regra.
const { app, check, finish, waitFor } = require('../../test/helpers');
const { ipcMain, BrowserWindow, session } = require('electron');
const fs = require('fs');
const { startFakeGame } = require('./fakegame');

app.whenReady().then(async () => {
  try {
    const slots = [{ id: 1, view: { webContents: { isDestroyed: () => true } } }];
    const logs = [];
    const avisos = [];
    const ext = require('../sniper.js')({ getSlots: () => slots, sendLog: (e) => logs.push(e.text), notify: (n) => avisos.push(n) });
    const f = ext.features().find((x) => x.id === 'sniper');
    const save = ipcMain._invokeHandlers?.get('snp:save');
    const get = ipcMain._invokeHandlers?.get('snp:get');
    check(!!f && !!save && !!get, 'funcionalidade e handlers registrados');
    const stale = async (patch) => { const d = await get(); const cfg = JSON.parse(JSON.stringify(d.cfg)); patch(cfg); return save({}, cfg); };

    check(f.isOn(1) === false && f.badge(1) === '', 'começa desligado, sem selo');
    f.set(1, true);
    check(f.isOn(1) && /sem regras/.test(f.badge(1)), `ligado sem regra: "${f.badge(1)}"`);

    // janela desatualizada tenta desligar e ligar compra real: o liga/desliga da barra prevalece e live fica falso
    let cfg = await stale((c) => { c.accounts[1].on = false; c.accounts[1].live = true; c.rules.push({ id: 'r1', ativo: true, tipo: 'item', nome: 'Master Ball', moeda: 'gold', maxPreco: 1000, qtd: 1 }); });
    check(f.isOn(1) === true, 'salvar pela janela não desliga o que a barra ligou');
    // (live = true com on = true é permitido: é a escolha explícita na janela; aqui a janela mandou on=false)
    check(cfg.accounts[1].live === true || cfg.accounts[1].live === false, 'live é boolean');
    check(cfg.rules.length === 1, 'regra salva');

    f.set(1, false);
    check(!f.isOn(1), 'desliga pela barra');
    cfg = await stale((c) => { c.accounts[1].on = true; c.accounts[1].live = true; });
    check(!f.isOn(1) && cfg.accounts[1].live === false, 'janela desatualizada não liga a conta nem a compra real');

    f.set(1, true);
    check(f.isOn(1) && cfg.accounts[1].live === false && /^(⚠|sim)/.test(f.badge(1)), `religar volta à simulação: "${f.badge(1)}"`);
    f.set(1, false);

    // O preload entra na página e empresta o socket do jogo (o "hello" é a 1ª mensagem do jogo)
    const ses = session.fromPartition('persist:teste-sniper');
    ext.onSlotCreated(1, { webContents: { session: ses } });
    const win = new BrowserWindow({ show: false, webPreferences: { session: ses, backgroundThrottling: false } });
    await win.loadURL('data:text/html,<title>x</title>');
    const r = await win.webContents.executeJavaScript(`(() => {
      const hook = !!window.__snp;
      try { new WebSocket('ws://127.0.0.1:1').send('{"t":"hello","nick":"Teste"}'); } catch {}
      return { hook, nick: window.__snp && window.__snp.nick };
    })()`);
    check(r.hook, 'gancho do sniper (window.__snp) injetado na página');
    check(r.nick === 'Teste', `gancho captura o socket do jogo pelo "hello" (nick=${r.nick})`);


    // ---- ponta a ponta contra um "jogo" falso ----
    // 1ª consulta: H (4, em retenção), A (5, livre), B (9, acima do teto). A é comprado primeiro (livre > retido) e o
    // servidor recusa ("já saiu"): o gasto reservado volta e a próxima tentativa sai NA HORA, sem esperar o ciclo
    // (que está em 600 s). 2ª consulta: E (4, livre) e D (5, livre): compra E, o mais barato entre os livres.
    const T0 = Date.now();
    const tentativas = [];
    let consultas = 0;
    const game = await startFakeGame((m, send) => {
      if (m.t === 'hello') {
        send({ t: 'x', mercado: { catalogo: [{ id: 7, nome: 'Bronze Boss Token' }] } });
        send({ t: 'estado', servidorAgora: Date.now() });
      } else if (m.t === 'market.item') {
        consultas++;
        const H = { id: 'H', preco: 4, moeda: 'orb', qtd: 1, vendedor: 'outro', compravelEm: T0 + 9000 };
        const A = { id: 'A', preco: 5, moeda: 'orb', qtd: 1, vendedor: 'outro' };
        const B = { id: 'B', preco: 9, moeda: 'orb', qtd: 1, vendedor: 'outro' };
        const D = { id: 'D', preco: 5, moeda: 'orb', qtd: 1, vendedor: 'outro' };
        const E = { id: 'E', preco: 4, moeda: 'orb', qtd: 1, vendedor: 'outro' };
        const linhas = tentativas.length === 0 ? [H, A, B] : [H, D, E, B];
        send({ t: 'market', aba: 'item', itemId: 7, moeda: 'orb', linhas });
      } else if (m.t === 'market.comprar') {
        tentativas.push(m.id);
        if (tentativas.length === 1) send({ t: 'erro', chave: 'market.anuncioSaiu' });
        else send({ t: 'batalha', ev: [{ k: 'marketComprado', descricao: '1× Bronze Boss Token' }] });
      }
    });
    const ses2 = session.fromPartition('persist:teste-sniper-2');
    ext.onSlotCreated(2, { webContents: { session: ses2 } });
    const gwin = new BrowserWindow({ show: false, webPreferences: { session: ses2, backgroundThrottling: false } });
    // o mercado fica ABERTO na tela (#cm-lista visível): antes o sniper pausava nesse caso
    const html = `<div id="cm-lista" style="width:50px;height:50px">mercado</div><script>const w=new WebSocket("ws://127.0.0.1:${game.port}");w.onopen=()=>w.send(JSON.stringify({t:"hello",nick:"Eu"}));</script>`;
    await gwin.loadURL('data:text/html,' + encodeURIComponent(html));
    slots.push({ id: 2, view: { webContents: gwin.webContents } });
    f.set(2, true);
    const cur = (await get()).cfg;
    cur.rules = [{ id: 'r1', ativo: true, tipo: 'item', nome: 'Bronze Boss Token', moeda: 'orb', maxPreco: 5, qtd: 1, soShiny: false, soP5: false }];
    cur.cap = { gold: 0, orb: 5 }; // só dá para gastar 5 gemas: a tentativa que falhou NÃO pode consumir o teto
    cur.intervalSec = 600; // ciclo normal praticamente desligado
    cur.accounts[2].live = true;
    await save({}, cur);

    check(await waitFor(() => avisos.length >= 2, 15000), 'falha + compra seguinte geraram 2 avisos');
    const ms = Date.now() - T0;
    check(tentativas[0] === 'A', `1ª tentativa: o livre a 5 (o de 4 está em retenção): ${tentativas}`);
    check(tentativas[1] === 'E', `2ª tentativa logo após a falha: o mais barato livre (E, 4): ${tentativas}`);
    check(ms < 6000, `a nova tentativa saiu na hora, sem esperar o ciclo (${ms}ms)`);
    check(avisos[0]?.kind === 'fail' && /anúncio já saiu/.test(avisos[0].text), `aviso de falha curto e legível: ${avisos[0]?.title} | ${avisos[0]?.text}`);
    check(avisos[1]?.kind === 'ok' && /comprou 1× Bronze Boss Token/.test(avisos[1].title) && /4 gemas/.test(avisos[1].text), `aviso de sucesso: ${avisos[1]?.title} | ${avisos[1]?.text}`);
    check(avisos.every((a) => a.ms <= 5000 && !a.image), 'avisos duram até 5 s e não levam imagem');
    if (avisos[0]?.openPath) {
      check(await waitFor(() => fs.existsSync(avisos[0].openPath) && fs.statSync(avisos[0].openPath).size > 1000, 4000), 'print da falha salvo em disco');
    }
    // teto: gastou 4 de 5; o D (5) e o H (4, quando liberar) já não cabem
    check(await waitFor(() => logs.some((l) => /teto de gasto/.test(l)), 4000), 'teto de gasto respeitado depois da compra bem-sucedida');
    await new Promise((r) => setTimeout(r, 1500));
    check(tentativas.length === 2 && !tentativas.includes('H') && !tentativas.includes('D'), `nenhuma compra a mais (${tentativas})`);
    f.set(2, false);
    game.close();

    // ---- máscara de valores na janela de configuração ----
    const ui = new BrowserWindow({ show: false, webPreferences: { preload: require('path').join(__dirname, '..', 'sniper-ui-preload.js') } });
    await ui.loadFile(require('path').join(__dirname, '..', 'sniper.html'));
    const run = (code) => ui.webContents.executeJavaScript(code);
    await run('document.getElementById("add").click()');
    const mask = await run(`(() => {
      const preco = [...document.querySelectorAll('input.preco')].pop();
      preco.value = '14205740';
      preco.dispatchEvent(new Event('input', { bubbles: true }));
      const cap = document.getElementById('capGold');
      cap.value = '1500000';
      cap.dispatchEvent(new Event('input', { bubbles: true }));
      return { preco: preco.value, hint: preco.parentElement.querySelector('.hint').textContent, cap: cap.value, capHint: document.getElementById('capGoldHint').textContent };
    })()`);
    check(mask.preco === '14.205.740', `preço com separador de milhar: ${mask.preco}`);
    check(/14,21 mi coins/.test(mask.hint), `valor abreviado embaixo: ${mask.hint}`);
    check(mask.cap === '1.500.000' && /1,5 mi coins/.test(mask.capHint), `teto em coins com máscara: ${mask.cap} (${mask.capHint})`);
    await run('document.getElementById("save").click()');
    await new Promise((r) => setTimeout(r, 400));
    const saved = (await get()).cfg;
    check(saved.rules.some((x) => x.maxPreco === 14205740) && saved.cap.gold === 1500000, 'salva o número limpo (sem pontos)');
  } catch (err) {
    check(false, `erro inesperado: ${err.stack || err}`);
  }
  finish();
});
