const { contextBridge, ipcRenderer } = require('electron');

// Página "Conta desligada": só expõe o botão para ligar a conta (o main descobre a conta pelo remetente)
contextBridge.exposeInMainWorld('off', {
  turnOn: () => ipcRenderer.send('power:on'),
});
