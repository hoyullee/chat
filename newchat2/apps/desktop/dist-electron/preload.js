"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => electron.ipcRenderer.send(channel, data),
  on: (channel, callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on(channel, listener);
    return () => electron.ipcRenderer.removeListener(channel, listener);
  }
});
