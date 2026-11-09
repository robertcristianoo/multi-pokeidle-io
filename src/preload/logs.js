const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('logs', {
  onLog: (cb) => ipcRenderer.on('log', (_e, entry) => cb(entry)),
});
