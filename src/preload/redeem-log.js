// Preload da janela do registro dos resgates: só lê o arquivo pelo processo principal.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rl', {
  read: () => ipcRenderer.invoke('pts:log'),
});
