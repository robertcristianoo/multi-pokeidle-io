// Nomes das contas (account-names.js): o nome salvo fica na config (por instalação) e volta na reabertura; sem nome, o
// rótulo é "Conta N"; nomes inválidos não são gravados; nomes iguais ganham o sufixo do id; e o rótulo não depende da posição.
// Os nomes usados aqui são fictícios.
const { check, finish } = require('./helpers');
const { createAccountNames, NAME_SCRIPT, MAX_NAME_LEN } = require('../src/account-names');

// Armazenamento falso (no lugar de loadConfig/saveConfig do main): guarda o objeto e conta as gravações
const memoryStore = (inicial = {}) => {
  const st = { data: inicial, writes: 0 };
  st.get = () => st.data;
  st.set = (v) => { st.data = JSON.parse(JSON.stringify(v)); st.writes++; };
  return st;
};

// 1. Sem nome: fallback "Conta N" (o número é o id, não a posição)
{
  const names = createAccountNames();
  check(names.label(1) === 'Conta 1' && names.label(4) === 'Conta 4', 'sem nome salvo, o rótulo é "Conta N"');
  check(names.get(1) === null, 'get sem nome devolve null');
}

// 2. Gravação: aparada, gravada uma vez, e só quando muda
{
  const store = memoryStore();
  const names = createAccountNames();
  names.configure({ store });
  let avisos = 0;
  names.onChange(() => { avisos++; });
  check(names.set(1, '  Jogadora Teste  ') === true, 'nome válido é gravado');
  check(names.get(1) === 'Jogadora Teste', 'o nome é guardado aparado (sem espaços nas pontas)');
  check(names.label(1) === 'Jogadora Teste', 'o rótulo é o nome');
  check(store.data['1'] === 'Jogadora Teste' && store.writes === 1, 'o nome vai para o armazenamento, chave "1"');
  check(names.set(1, 'Jogadora Teste') === false && store.writes === 1, 'mesmo nome não grava de novo');
  check(avisos === 1, 'a mudança avisa os ouvintes uma vez');
  check(names.set(1, '') === false && names.set(1, '   ') === false, 'nome vazio ou só com espaços não é gravado');
  check(names.set(1, 'x'.repeat(MAX_NAME_LEN + 1)) === false, 'nome com mais de 30 caracteres não é gravado');
  check(names.set(1, 'x'.repeat(MAX_NAME_LEN)) === true, 'nome com 30 caracteres é aceito');
  check(names.set(0, 'Treinador Exemplo') === false && names.set('abc', 'Treinador Exemplo') === false, 'id inválido não é gravado');
  check(names.get(1) === 'x'.repeat(MAX_NAME_LEN), 'entradas inválidas não mudam o nome atual');
}

// 3. Persistência: outra instância (a próxima abertura do app) lê o que foi salvo, antes de qualquer leitura do jogo
{
  const store = memoryStore();
  const primeira = createAccountNames();
  primeira.configure({ store });
  primeira.set(2, 'Treinador Exemplo');
  const reaberta = createAccountNames();
  reaberta.configure({ store });
  check(reaberta.get(2) === 'Treinador Exemplo' && reaberta.label(2) === 'Treinador Exemplo', 'o nome salvo volta na abertura seguinte');
  check(reaberta.label(1) === 'Conta 1', 'conta sem nome salvo continua "Conta N"');
}

// 4. Dados salvos inválidos são descartados na carga
{
  const names = createAccountNames();
  names.configure({ store: memoryStore({ '1': '', '2': 5, x: 'Nome', '3': '   Válido   ', '4': 'y'.repeat(31) }) });
  check(names.get(1) === null && names.get(2) === null && names.get(4) === null, 'valores vazios, não textos e longos demais são descartados');
  check(names.get(3) === 'Válido', 'valor válido é carregado aparado');
  check(names.label(1) === 'Conta 1', 'sem nome válido, o rótulo cai no "Conta N"');
}

// 5. Nomes iguais: os dois recebem o sufixo do id, nos dois sentidos e sem diferenciar maiúsculas
{
  const names = createAccountNames();
  names.configure({ store: memoryStore() });
  names.set(1, 'Jogador Igual');
  check(names.label(1) === 'Jogador Igual', 'um nome sozinho não leva sufixo');
  names.set(3, 'jogador igual');
  check(names.label(1) === 'Jogador Igual (conta 1)' && names.label(3) === 'jogador igual (conta 3)', 'nomes repetidos ganham o sufixo do id nas duas contas');
  check(names.label(2) === 'Conta 2', 'conta sem nome segue "Conta N" mesmo com nomes repetidos');
  names.set(3, 'Outro Nome');
  check(names.label(1) === 'Jogador Igual' && names.label(3) === 'Outro Nome', 'sem repetição, o sufixo some');
}

// 6. labels() devolve o rótulo de cada conta pedida
{
  const names = createAccountNames();
  names.configure({ store: memoryStore({ '2': 'Treinador Exemplo' }) });
  const r = names.labels([1, 2]);
  check(r[1] === 'Conta 1' && r[2] === 'Treinador Exemplo', 'labels() devolve { id: rótulo }');
}

// 7. Leitura do jogo: só fontes confiáveis (preload e "nick" do localStorage); nenhum texto solto da tela vira nome
{
  const rodar = (nick, lives) => {
    const ctx = { window: { __lives: lives }, localStorage: { getItem: (k) => (k === 'nick' ? nick : null) } };
    return new Function('window', 'localStorage', `return ${NAME_SCRIPT}`)(ctx.window, ctx.localStorage);
  };
  check(NAME_SCRIPT.includes('__lives.name') && NAME_SCRIPT.includes("getItem('nick')"), 'NAME_SCRIPT usa o nome do preload e o "nick" do localStorage');
  check(!NAME_SCRIPT.includes('querySelectorAll') && !NAME_SCRIPT.includes('Nv'), 'NAME_SCRIPT não lê texto da tela (um pokémon nunca vira o nome da conta)');
  check(rodar('"Jogador_01"', null) === 'Jogador_01' && rodar('Jogador_02', null) === 'Jogador_02', 'lê o nick do localStorage, também quando vem em JSON');
  check(rodar('x', { name: 'Do_Preload' }) === 'Do_Preload', 'o nome do preload tem prioridade');
  check(rodar('Ursaluna Bloodmoon', null) === null && rodar('', null) === null && rodar(null, null) === null, 'texto fora do formato de nick (ou vazio) não vira nome');
}

finish();
