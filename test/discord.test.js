// Discord por conta: leitura das respostas do site (perfil, convite), validade da tag IDLE, estado guardado e o botão da conta.
const { app, check, finish } = require('./helpers');
require('../src/i18n').setLang('pt-BR'); // the texts checked here are in Portuguese
const { createDiscord, inviteCode, tagStatus, readResponse, lerEstado, statusInfo } = require('../src/discord');

const API = 'https://discord.com/api/v9';
const GUILD = '111222333444555';

app.whenReady().then(async () => {
  try {
    check(inviteCode('https://discord.gg/y2y3XyPc') === 'y2y3XyPc' && inviteCode('https://discord.com/invite/abc12') === 'abc12' && inviteCode('https://x.com/abc') === null, 'código do convite');

    check(tagStatus({ tag: 'IDLE', identity_enabled: true, identity_guild_id: GUILD }, GUILD) === 'ok', 'tag IDLE ativa do servidor do jogo vale');
    check(tagStatus({ tag: 'idle', identity_enabled: true }, null) === 'ok', 'sem o id do servidor conhecido, vale pela tag');
    check(tagStatus({ tag: 'IDLE', identity_enabled: false }, null) === 'no', 'tag desativada não vale');
    check(tagStatus({ tag: 'IDLE', identity_enabled: true, identity_guild_id: '999999999' }, GUILD) === 'no', 'tag IDLE de outro servidor não vale');
    check(tagStatus({ tag: 'ABCD', identity_enabled: true }, GUILD) === 'no' && tagStatus(null) === 'no' && tagStatus(undefined) === 'no', 'outra tag ou sem tag não vale');

    const me = { id: '123456789012345678', primary_guild: { tag: 'IDLE', identity_enabled: true, identity_guild_id: GUILD } };
    const r1 = readResponse(`${API}/users/@me`, 200, me, { serverId: GUILD });
    check(r1.loggedIn === true && r1.meId === me.id && r1.tag === 'ok', '/users/@me com a tag: logado e tag ok');
    check(readResponse(`${API}/users/@me`, 200, { id: me.id }, {}).tag === 'no', '/users/@me sem primary_guild: sem tag');
    check(readResponse(`${API}/users/@me`, 401, null, {}).loggedIn === false, '401 em /users/@me: deslogado');
    check(readResponse(`${API}/users/${me.id}/profile?with_mutual_guilds=true`, 200, { user: { primary_guild: me.primary_guild } }, { meId: me.id }).tag === 'ok', 'perfil do próprio usuário traz a tag');
    check(readResponse(`${API}/users/999999999999/profile`, 200, { user: { primary_guild: me.primary_guild } }, { meId: me.id }) === null, 'perfil de outra pessoa é ignorado');
    check(readResponse(`${API}/invites/y2y3XyPc?with_counts=true`, 200, { guild: { id: GUILD } }, { inviteCode: 'y2y3XyPc' }).serverId === GUILD, 'o convite revela o id do servidor');
    check(readResponse(`${API}/invites/outro`, 200, { guild: { id: GUILD } }, { inviteCode: 'y2y3XyPc' }) === null, 'convite de outro código é ignorado');
    check(readResponse('https://evil.example/api/v9/users/@me', 200, me, {}) === null && readResponse('http://discord.com/api/v9/users/@me', 200, me, {}) === null, 'só a API https do discord.com é lida');

    check(statusInfo(null).kind === 'unknown' && statusInfo({ loggedIn: false, tag: 'unknown' }).kind === 'out', 'selo: desconhecido e deslogado');
    check(statusInfo({ loggedIn: true, tag: 'no' }).kind === 'notag' && statusInfo({ loggedIn: true, tag: 'ok' }).kind === 'ok' && statusInfo({ loggedIn: true, tag: 'unknown' }).label.includes('logado'), 'selo: falta tag, ok e logado sem tag vista');

    const lido = lerEstado({ serverId: GUILD, accounts: { 1: { loggedIn: true, tag: 'ok', at: 5 }, x: {}, 2: { loggedIn: 'sim', tag: 'zzz' } } });
    check(lido.serverId === GUILD && lido.accounts.get(1).tag === 'ok' && lido.accounts.get(2).loggedIn === null && lido.accounts.get(2).tag === 'unknown' && lido.accounts.size === 2, 'estado guardado: inválidos descartados');
    check(lerEstado('lixo').accounts.size === 0 && lerEstado({ serverId: 'abc' }).serverId === null, 'estado ilegível vira vazio');

    // controlador
    let salvo = null;
    const avisos = [];
    const ctl = createDiscord({ getSlots: () => [{ id: 1 }, { id: 2 }], notify: (n) => avisos.push(n), store: { get: () => null, set: (v) => { salvo = v; } }, timers: false, now: () => 1000, invite: () => 'https://discord.gg/y2y3XyPc' });
    check(ctl.info(1).kind === 'unknown', 'conta nova: sem leitura');
    ctl._aplicar(1, { loggedIn: true, meId: me.id, tag: 'no' });
    check(ctl.info(1).kind === 'notag' && avisos.length === 0, 'logada sem tag: pede a tag, sem aviso de sucesso');
    ctl._aplicar(1, { tag: 'ok', serverId: GUILD });
    check(ctl.info(1).kind === 'ok' && avisos.length === 1 && avisos[0].text.includes('/resgatar') && ctl.serverId() === GUILD, 'tag ativa: selo ok, um aviso lembrando do /resgatar, servidor guardado');
    ctl._aplicar(1, { tag: 'ok' });
    check(avisos.length === 1, 'o aviso não se repete');
    check(ctl.info(2).kind === 'unknown', 'a outra conta não muda (estado é por conta)');
    check(salvo && salvo.accounts[1].tag === 'ok' && salvo.serverId === GUILD, 'o estado é salvo');
    ctl._aplicar(1, { loggedIn: false });
    check(ctl.info(1).kind === 'out' && ctl.state(1).tag === 'unknown', 'deslogou: não afirma mais a tag');

    // janela: abre o convite na conta (sem a tag) e reaproveita
    const abertas = [];
    const fake = (id, destino) => {
      const w = { destroyed: false, focus() { this.focou = true; }, isDestroyed() { return this.destroyed; }, on() {}, loadURL() {}, webContents: { on() {}, debugger: { attach() { throw new Error('sem depurador'); } } } };
      abertas.push({ id, destino, w });
      return w;
    };
    const ctl2 = createDiscord({ getSlots: () => [{ id: 1 }], timers: false, makeWindow: fake, invite: () => 'https://discord.gg/y2y3XyPc' });
    ctl2.open(1);
    check(abertas.length === 1 && abertas[0].destino === 'https://discord.gg/y2y3XyPc', 'abre o convite na sessão da conta');
    ctl2.open(1);
    check(abertas.length === 1 && abertas[0].w.focou, 'segundo clique só foca a janela');
    ctl2.open(9);
    check(abertas.length === 1, 'conta que não existe não abre janela');
  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});
