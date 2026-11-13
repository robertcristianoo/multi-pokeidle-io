const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('snp', {
  get: () => ipcRenderer.invoke('snp:get'),
  save: (cfg) => ipcRenderer.invoke('snp:save', cfg),
});
