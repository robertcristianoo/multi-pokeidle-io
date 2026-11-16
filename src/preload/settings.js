// Preload da janela de Configurações.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cfg', {
  get: () => ipcRenderer.invoke('cfg:get'),
  toggle: (name) => ipcRenderer.invoke('cfg:toggle', name),
  ext: (ext, acc, on) => ipcRenderer.invoke('cfg:ext', ext, acc, on),
  open: (name) => ipcRenderer.send('cfg:open', name),
});
