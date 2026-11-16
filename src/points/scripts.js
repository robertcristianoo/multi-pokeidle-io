// Scripts de conferência e resgate do bônus, executados dentro de uma página do canal da própria conta (com a sessão
// dela). Cada um confere o saldo e, se houver saldo e a conta estiver liberada, resgata 1 bônus naquele canal.
// Porte dos scripts do PointsRedeemer da referência:
//  - cada bônus vem em 4 durações (1, 3, 5 e 10 h, com o preço proporcional): vale o mais barato liberado (o de 1 h;
//    pausado, esgotado ou em espera no canal, o de 3, 5 ou 10 h, que dá o mesmo por hora); sem nenhum liberado, o mais barato;
//  - baú de bônus da Twitch (+50): pego quando `claim` está ligado;
//  - checagem anti-robô da Twitch: quando o pedido é desafiado, o script pede o token em /integrity, de dentro da
//    página, como o próprio site faz, e manda de novo.
//
// Entrada `a`: { api, channel, token, device?, clientId?, word, spend, refund, claim?, claimId? } (refund: saldo a partir do
// qual os pontos do último resgate são considerados devolvidos, ou null). Saída (JSON): points, cost, title, paused,
// cheapest, redeemed, status, refused, error, claimed, claimError, me, channelId.

const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // Client-Id público do próprio site da Twitch

// O começo dos scripts da Twitch (dentro de "async a => {"): gql(query, variables) chama a API do site com o login da
// conta; no lugar da query pode ir o pedido inteiro (o das operações salvas, com operationName e o hash). Quando a
// Twitch desafia o pedido com a checagem anti-robô, pede o token dela de dentro da página e manda de novo.
const TWITCH_GQL = `
    const base = { 'Client-Id': a.clientId, Authorization: 'OAuth ' + a.token, 'Content-Type': 'text/plain;charset=UTF-8',
      ...(a.device ? { 'X-Device-Id': a.device } : {}) };
    let integrity = null;
    const gql = async (query, variables) => {
      const body = JSON.stringify(typeof query === 'string' ? { query, variables } : query);
      for (let i = 0; i < 2; i++) {
        const r = await fetch(a.api + '/gql', { method: 'POST', cache: 'no-cache',
          headers: integrity ? { ...base, 'Client-Integrity': integrity } : base, body });
        if (!r.ok) return { failed: 'erro ' + r.status };
        const j = await r.json();
        const challenged = !!j?.extensions?.challenge || (j?.errors || []).some((e) => e?.extensions?.code === 'IntegrityCheckFailed');
        if (!challenged) return j;
        if (integrity) return { failed: 'checagem anti-robô da Twitch' };
        const t = await fetch(a.api + '/integrity', { method: 'POST', cache: 'no-cache', headers: base });
        const tj = t.ok ? await t.json() : null;
        if (!tj?.token) return { failed: 'checagem anti-robô da Twitch (' + t.status + ')' };
        integrity = tj.token;
      }
    };
    const fail = (j, x) => j?.failed || x?.error?.code || j?.errors?.[0]?.message || 'sem resposta';`;

// Expressão JS (pronta para executeJavaScript) que roda o script da Kick com os argumentos dados.
function kickScript(args) {
  return `(async a => {
    const call = (path, init) => fetch(a.api + '/api/v2/channels/' + encodeURIComponent(a.channel) + path, {
      cache: 'no-cache', credentials: 'include', ...init,
      headers: { Accept: 'application/json', 'x-app-platform': 'web', Authorization: 'Bearer ' + a.token,
        ...(init && init.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    try {
      let r = await call('/points');
      if (!r.ok) return { error: 'saldo: erro ' + r.status };
      const points = ((await r.json()) || {}).data?.points;
      if (typeof points !== 'number') return { error: 'saldo: sem os pontos na resposta' };
      r = await call('/rewards');
      if (!r.ok) return { points, error: 'bônus: erro ' + r.status };
      const word = new RegExp(a.word, 'i');
      const all = ((((await r.json()) || {}).data) || []).slice().sort((x, y) => x.cost - y.cost).filter((x) => x.is_enabled && word.test(x.title || '')
        && /pokeidle/i.test((x.title || '') + ' ' + (x.description || '')));
      const reward = all.find((x) => !x.is_paused) || all[0];
      if (!reward) return { points, error: 'canal sem o bônus' };
      const out = { points, cost: reward.cost, title: reward.title, paused: !!reward.is_paused, cheapest: all[0].cost };
      if (!a.spend || reward.is_paused || points < reward.cost || (a.refund !== null && points >= a.refund)) return out;
      // transaction_id no formato ULID, como o site gera: tempo em base 32 + 16 caracteres ao acaso
      const abc = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
      let t = Date.now(), id = '';
      for (let i = 0; i < 10; i++) { id = abc[t % 32] + id; t = Math.floor(t / 32); }
      for (let i = 0; i < 16; i++) id += abc[Math.floor(Math.random() * 32)];
      r = await call('/rewards/' + reward.id + '/redeem', { method: 'POST', body: JSON.stringify({ transaction_id: id, message: '' }) });
      return { ...out, redeemed: r.ok, status: r.status };
    } catch (e) { return { error: 'sem resposta da Kick: ' + ((e && e.message) || e) }; }
  })(${JSON.stringify(args)}).then((o) => JSON.stringify(o))`;
}

// Expressão JS do script da Twitch (GraphQL do site, com o login da conta: auth-token como OAuth e o aparelho).
// Lê o saldo, pega o baú se tiver (a.claim) e, com a.word, resgata 1 bônus se der. Devolve também o id da conta e o do canal.
function twitchScript(args) {
  return `(async a => {${TWITCH_GQL}
    try {
      const j = await gql('query($login:String!){currentUser{id} user(login:$login){id channel{self{communityPoints{balance availableClaim{id}}}' +
        ' communityPointsSettings{customRewards{id title prompt cost isEnabled isPaused isInStock cooldownExpiresAt}}}}}', { login: a.channel });
      if (j?.failed) return { error: 'saldo: ' + j.failed };
      const user = j?.data?.user;
      if (!user?.channel) return { error: 'canal não encontrado' };
      const ids = { me: j?.data?.currentUser?.id ?? null, channelId: user.id };
      const cp = user.channel.self?.communityPoints;
      if (typeof cp?.balance !== 'number') return { ...ids, error: 'saldo: sem os pontos na resposta (login da Twitch?)' };
      let points = cp.balance; const out = { points, ...ids };
      const claimId = cp.availableClaim?.id || a.claimId;
      if (a.claim && claimId) {
        const k = await gql('mutation($i:ClaimCommunityPointsInput!){claimCommunityPoints(input:$i){claim{id} currentPoints error{code}}}',
          { i: { channelID: user.id, claimID: claimId } });
        const p = k?.data?.claimCommunityPoints;
        if (p && !p.error && !k.errors) { out.claimed = true; points = typeof p.currentPoints === 'number' ? p.currentPoints : points + 50; }
        else out.claimError = fail(k, p);
        out.points = points;
      }
      if (!a.word) return out;
      const word = new RegExp(a.word, 'i');
      const all = (user.channel.communityPointsSettings?.customRewards || []).slice().sort((x, y) => x.cost - y.cost).filter((x) => x.isEnabled && word.test(x.title || '')
        && /pokeidle/i.test((x.title || '') + ' ' + (x.prompt || '')));
      const shut = (x) => x.isPaused || !x.isInStock || !!x.cooldownExpiresAt;
      const reward = all.find((x) => !shut(x)) || all[0];
      if (!reward) return { ...out, error: 'canal sem o bônus' };
      Object.assign(out, { cost: reward.cost, title: reward.title, paused: shut(reward), cheapest: all[0].cost });
      if (!a.spend || out.paused || points < reward.cost || (a.refund !== null && points >= a.refund)) return out;
      // O transactionID é um id novo a cada resgate (32 letras hexadecimais). O custo, o título e a descrição (prompt)
      // vão iguais aos do bônus no canal: a Twitch confere e, se não baterem, recusa (PROPERTIES_MISMATCH).
      const id = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
      const r = await gql('mutation($i:RedeemCommunityPointsCustomRewardInput!){redeemCommunityPointsCustomReward(input:$i){redemption{id} error{code}}}',
        { i: { channelID: user.id, cost: reward.cost, prompt: reward.prompt ?? null, rewardID: reward.id, title: reward.title, transactionID: id } });
      const p = r?.data?.redeemCommunityPointsCustomReward;
      if (p && !p.error && !r.errors) return { ...out, redeemed: true };
      return { ...out, refused: fail(r, p) };
    } catch (e) { return { error: 'sem resposta da Twitch: ' + ((e && e.message) || e) }; }
  })(${JSON.stringify(args)}).then((o) => JSON.stringify(o))`;
}

// Ação avulsa da Twitch (raid, momento): `corpo` roda dentro do try, com gql(), fail() e `a` disponíveis.
function twitchAction(args, corpo) {
  return `(async a => {${TWITCH_GQL}
    try {${corpo}
    } catch (e) { return { error: 'sem resposta da Twitch: ' + ((e && e.message) || e) }; }
  })(${JSON.stringify({ clientId: TWITCH_CLIENT_ID, ...args })}).then((o) => JSON.stringify(o))`;
}

// A operação salva da Twitch para entrar numa raid (a mesma que o site manda ao clicar em "Entrar na raid").
const JOIN_RAID_HASH = 'c6a332a86d1087fbbb1a8623aa01bd1313d2386e7c63be60fdb2d1901f01a4ae';

// Entra na raid `raidId` (avisada pela Twitch no canal da live aberta). Devolve { joined } ou { error }.
function twitchRaidScript(api, token, device, raidId) {
  return twitchAction({ api, token, device, raid: raidId }, `
      const r = await gql({ operationName: 'JoinRaid', variables: { input: { raidID: a.raid } },
        extensions: { persistedQuery: { version: 1, sha256Hash: '${JOIN_RAID_HASH}' } } });
      if (r && !r.failed && !r.errors) return { joined: true };
      return { error: fail(r, null) };`);
}

// Pega o "momento" `momentId` do canal (avisado pela Twitch). Devolve { claimed } ou { error }.
function twitchMomentScript(api, token, device, momentId) {
  return twitchAction({ api, token, device, moment: momentId }, `
      const r = await gql('mutation($i:ClaimCommunityMomentInput!){claimCommunityMoment(input:$i){moment{id}}}', { i: { momentID: a.moment } });
      const p = r?.data?.claimCommunityMoment;
      if (p && !r.errors) return { claimed: true };
      return { error: fail(r, p) };`);
}

const SCRIPTS = { kick: kickScript, twitch: twitchScript };

module.exports = { kickScript, twitchScript, twitchRaidScript, twitchMomentScript, SCRIPTS, TWITCH_CLIENT_ID };
