const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tt', {
  onAdd: (cb) => ipcRenderer.on('toast:add', (_e, t) => cb(t)),
  size: (h) => ipcRenderer.send('toast:size', h),
  open: (p) => ipcRenderer.send('toast:open', p),
});
