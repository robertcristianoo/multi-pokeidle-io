// Preload da janela de configuração da auto-reposição: só leva a configuração e o resumo entre a janela e o main.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rst', {
  get: () => ipcRenderer.invoke('rst:get'),
  save: (cfg) => ipcRenderer.invoke('rst:save', cfg),
});
