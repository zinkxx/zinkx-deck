const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('crypto');

contextBridge.exposeInMainWorld('electronAPI', {
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (text) => ipcRenderer.invoke('write-clipboard', text),
  hash: (text, algo) => {
    try {
      return crypto.createHash(algo).update(text).digest('hex');
    } catch (e) {
      return '';
    }
  },
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
  setOpacity: (val) => ipcRenderer.invoke('set-opacity', val)
});


