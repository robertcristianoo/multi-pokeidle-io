// Registro de compras da auto-reposição: grava na pasta de dados, sobrevive a "reiniciar" (novo objeto sobre a mesma pasta),
// é separado por conta, limita o tamanho e ignora linhas estragadas.
const { app, check, finish } = require('./helpers');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createRestockLog, KEEP } = require('../src/restock-log');

app.whenReady().then(() => {
  try {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkmulti-rst-'));
    let t = Date.parse('2026-11-18T14:00:00Z');
    const abre = () => createRestockLog(dir, { now: () => new Date((t += 1000)) });
    let log = abre();
    check(log.read(1).length === 0, 'sem arquivo: registro vazio');
    log.append(1, ['14:43:55 reposição ligada', '14:44:10 comprou 10 Ultra Ball']);
    log.append(2, '09:00:00 outra conta');
    check(log.read(1).length === 2 && log.read(2).length === 1, 'cada conta tem o seu registro');
    log = abre(); // app fechado e aberto de novo (ou versão nova): o arquivo continua na pasta de dados
    const lido = log.read(1);
    check(lido.length === 2 && lido[0].texto.endsWith('reposição ligada') && lido[1].texto.includes('Ultra Ball'), 'o registro continua depois de reabrir, na ordem');
    check(!Number.isNaN(Date.parse(lido[0].t)), 'cada entrada guarda a data/hora gravada');
    log.append(1, 'linha com\ttab\ne quebra');
    check(!log.read(1).at(-1).texto.includes('\n') && !log.read(1).at(-1).texto.includes('\t'), 'tabs e quebras de linha viram espaço');
    fs.appendFileSync(log.file(1), 'lixo sem tab\nnão-data\ttexto\n');
    check(log.read(1).length === 3, 'linhas estragadas são ignoradas');
    for (let i = 0; i < KEEP * 2; i++) log.append(3, `entrada ${i}`);
    const grande = log.read(3, KEEP * 3);
    check(grande.length <= KEEP * 1.5 + 1 && grande.at(-1).texto === `entrada ${KEEP * 2 - 1}`, `limita o tamanho e mantém as mais recentes (${grande.length})`);
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(err);
    check(false, `erro inesperado: ${err.message}`);
  }
  finish();
});
