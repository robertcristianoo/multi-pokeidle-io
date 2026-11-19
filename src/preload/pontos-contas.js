// Preload da janela "Pontos das contas": lê as linhas (uma por conta) e repassa as ações com o número da conta da linha.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pc', {
  rows: () => ipcRenderer.invoke('pts:overview'),
  act: (acc, site, action) => ipcRenderer.send('pts:act', acc, site, action),
  onFocus: (cb) => ipcRenderer.on('pc:focus', (_e, acc) => cb(acc)),
});
