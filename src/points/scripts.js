// Scripts de conferência e resgate do bônus, executados dentro de uma página do canal da própria conta (com a sessão
// dela). Cada um confere o saldo e, se houver saldo e a conta estiver liberada, resgata 1 bônus naquele canal.
//
// Limites deliberados:
//  - nada de baú (captura do baú de bônus da Twitch): não é implementado aqui;
//  - nada de checagem anti-robô: se a Twitch desafiar o pedido (extensions.challenge / IntegrityCheckFailed), o
//    script para e devolve `refused`, sem pedir token de integridade nem contornar a verificação.
//
// Entrada `a`: { api, channel, token, device?, clientId?, word, spend, refund } (refund: saldo a partir do qual os
// pontos do último resgate são considerados devolvidos, ou null). Saída (JSON): points, cost, title, paused,
// redeemed, status, refused, error.

const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // Client-Id público do próprio site da Twitch

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
      const reward = (((await r.json()) || {}).data || []).find((x) => x.is_enabled && word.test(x.title || '')
        && /pokeidle/i.test((x.title || '') + ' ' + (x.description || '')));
      if (!reward) return { points, error: 'canal sem o bônus' };
      const out = { points, cost: reward.cost, title: reward.title, paused: !!reward.is_paused };
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
function twitchScript(args) {
  return `(async a => {
    const base = { 'Client-Id': a.clientId, Authorization: 'OAuth ' + a.token, 'Content-Type': 'text/plain;charset=UTF-8',
      ...(a.device ? { 'X-Device-Id': a.device } : {}) };
    const gql = async (query, variables) => {
      const r = await fetch(a.api + '/gql', { method: 'POST', cache: 'no-cache', headers: base, body: JSON.stringify({ query, variables }) });
      if (!r.ok) return { failed: 'erro ' + r.status };
      const j = await r.json();
      // Desafio anti-robô da Twitch: não é contornado; o resgate para e fica registrado
      const challenged = !!j?.extensions?.challenge || (j?.errors || []).some((e) => e?.extensions?.code === 'IntegrityCheckFailed');
      return challenged ? { failed: 'checagem anti-robô da Twitch (não contornada)' } : j;
    };
    const fail = (j, x) => j?.failed || x?.error?.code || j?.errors?.[0]?.message || 'sem resposta';
    try {
      const j = await gql('query($login:String!){user(login:$login){id channel{self{communityPoints{balance}}' +
        ' communityPointsSettings{customRewards{id title prompt cost isEnabled isPaused isInStock cooldownExpiresAt}}}}}',
        { login: a.channel });
      if (j?.failed) return { error: 'saldo: ' + j.failed };
      const user = j?.data?.user;
      if (!user?.channel) return { error: 'canal não encontrado' };
      const cp = user.channel.self?.communityPoints;
      if (typeof cp?.balance !== 'number') return { error: 'saldo: sem os pontos na resposta (login da Twitch?)' };
      const points = cp.balance;
      const word = new RegExp(a.word, 'i');
      const reward = (user.channel.communityPointsSettings?.customRewards || []).find((x) => x.isEnabled && word.test(x.title || '')
        && /pokeidle/i.test((x.title || '') + ' ' + (x.prompt || '')));
      if (!reward) return { points, error: 'canal sem o bônus' };
      const out = { points, cost: reward.cost, title: reward.title,
        paused: !!(reward.isPaused || !reward.isInStock || reward.cooldownExpiresAt) };
      if (!a.spend || out.paused || points < reward.cost || (a.refund !== null && points >= a.refund)) return out;
      const id = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
      const r = await gql('mutation($i:RedeemCommunityPointsCustomRewardInput!){redeemCommunityPointsCustomReward(input:$i){redemption{id} error{code}}}',
        { i: { channelID: user.id, cost: reward.cost, prompt: reward.prompt ?? null, rewardID: reward.id, title: reward.title, transactionID: id } });
      const p = r?.data?.redeemCommunityPointsCustomReward;
      if (p && !p.error && !r.errors) return { ...out, redeemed: true };
      return { ...out, refused: fail(r, p) };
    } catch (e) { return { error: 'sem resposta da Twitch: ' + ((e && e.message) || e) }; }
  })(${JSON.stringify(args)}).then((o) => JSON.stringify(o))`;
}

const SCRIPTS = { kick: kickScript, twitch: twitchScript };

module.exports = { kickScript, twitchScript, SCRIPTS, TWITCH_CLIENT_ID };
