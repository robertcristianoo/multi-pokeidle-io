const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tb', {
  get: () => ipcRenderer.invoke('tb:get'),
  toggle: (feature) => ipcRenderer.send('tb:toggle', feature),
  menu: (group, rect) => ipcRenderer.send('tb:menu', group, rect),
  popup: (name, rect) => ipcRenderer.send('tb:popup', name, rect),
  action: (name) => ipcRenderer.send('tb:action', name),
  onState: (cb) => ipcRenderer.on('tb:state', (_e, s) => cb(s)),
});
