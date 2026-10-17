const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tb', {
  get: () => ipcRenderer.invoke('tb:get'),
  toggle: (feature) => ipcRenderer.send('tb:toggle', feature),
  action: (name) => ipcRenderer.send('tb:action', name),
  onState: (cb) => ipcRenderer.on('tb:state', (_e, s) => cb(s)),
});
