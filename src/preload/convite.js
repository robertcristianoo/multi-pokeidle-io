const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('convite', {
  get: () => ipcRenderer.invoke('convite:get'),
  copy: () => ipcRenderer.invoke('convite:copy'),
  open: () => ipcRenderer.invoke('convite:open'),
  close: () => ipcRenderer.send('convite:close'),
});
