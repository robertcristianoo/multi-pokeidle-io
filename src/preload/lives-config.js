// Preload da janela de configuração das lives (canais, vagas, resgate por conta, baú e guarda do bônus).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lc', {
  get: () => ipcRenderer.invoke('lives:config-get'),
  official: () => ipcRenderer.invoke('lives:official-channels'),
  optimize: (lists, keys) => ipcRenderer.invoke('lives:optimize', lists, keys),
  save: (config) => ipcRenderer.invoke('lives:config-save', config),
});
