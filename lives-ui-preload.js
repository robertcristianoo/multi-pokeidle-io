const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lives', {
  open: () => ipcRenderer.send('lives:open'),
  onState: (cb) => ipcRenderer.on('lives:state', (_e, s) => cb(s)),
});
