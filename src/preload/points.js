// Preload da barra do painel de pontos: só repassa os comandos (próxima, página completa, config, fechar, arrastar).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pts', {
  cmd: (name) => ipcRenderer.send('pts:cmd', name),
  resize: (dy) => ipcRenderer.send('pts:resize', dy),
  onState: (cb) => ipcRenderer.on('pts:state', (_e, s) => cb(s)),
});
