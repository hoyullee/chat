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
electron.contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => electron.ipcRenderer.send("win-minimize"),
  maximize: () => electron.ipcRenderer.send("win-maximize"),
  close: () => electron.ipcRenderer.send("win-close")
});
