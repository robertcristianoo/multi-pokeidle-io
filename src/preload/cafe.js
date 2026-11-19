const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cafe', {
  get: () => ipcRenderer.invoke('cafe:get'),
  copy: (qual) => ipcRenderer.invoke('cafe:copy', qual),
  close: () => ipcRenderer.send('cafe:close'),
});
