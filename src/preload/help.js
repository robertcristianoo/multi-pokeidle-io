const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('help', {
  close: () => ipcRenderer.send('help:close'),
});
