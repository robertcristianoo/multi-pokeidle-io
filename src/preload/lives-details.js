// Preload da janela de detalhes das lives: só lê a tabela do gerenciador.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ld', {
  get: () => ipcRenderer.invoke('lives:details'),
});
