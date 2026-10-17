// Preload de teste: dá à toolbar.html uma `tb` falsa (estado fixo + registro das ações pedidas).
const { contextBridge } = require('electron');

const snap = JSON.parse(process.env.PKMULTI_TB_SNAP || '{}');
const acts = [];
contextBridge.exposeInMainWorld('tb', {
  get: async () => snap,
  toggle: () => {},
  action: (n) => acts.push(n),
  onState: () => {},
  acts: () => acts.slice(),
});
