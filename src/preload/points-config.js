// Preload da janela de configuração do resgate automático.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pc', {
  get: () => ipcRenderer.invoke('pts:config-get'),
  save: (auto) => ipcRenderer.invoke('pts:config-save', auto),
});
