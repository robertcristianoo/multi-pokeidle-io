const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ram', {
  onState: (cb) => ipcRenderer.on('ram:state', (_e, s) => cb(s)),
  hide: () => ipcRenderer.send('ram:hide'),
});
