const { app } = require('electron');

// Isola a pasta de dados ANTES de qualquer require do app (cookies/sessões reais ficam intactos)
app.setPath('userData', process.env.PKMULTI_TEST_DATA);

// Fixa o idioma do sistema (app.getLocale()): os testes conferem textos em português, mas o CI roda em inglês e o app
// começa no idioma do sistema. PKMULTI_TEST_LANG troca o idioma (ex.: en-US) para simular outro sistema.
app.commandLine.appendSwitch('lang', process.env.PKMULTI_TEST_LANG || 'pt-BR');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (cond, msg) => {
  console.log(`${cond ? '  ok   ' : '  FALHA'} ${msg}`);
  if (!cond) fails++;
};
const finish = () => process.exit(fails ? 1 : 0);
const waitFor = async (fn, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await fn()) return true;
    await sleep(100);
  }
  return false;
};

module.exports = { app, sleep, check, finish, waitFor };
