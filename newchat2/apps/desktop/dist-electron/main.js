"use strict";
const electron = require("electron");
const path = require("path");
let win = null;
const webPrefs = {
  preload: path.join(__dirname, "preload.js"),
  contextIsolation: true,
  nodeIntegration: false
};
function createWindow() {
  win = new electron.BrowserWindow({
    width: 380,
    height: 700,
    frame: false,
    webPreferences: webPrefs
  });
  win.webContents.setWindowOpenHandler(() => ({
    action: "allow",
    overrideBrowserWindowOptions: {
      width: 400,
      height: 650,
      frame: false,
      webPreferences: webPrefs
    }
  }));
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.ipcMain.on("win-minimize", (e) => {
  var _a;
  return (_a = electron.BrowserWindow.fromWebContents(e.sender)) == null ? void 0 : _a.minimize();
});
electron.ipcMain.on("win-maximize", (e) => {
  const w = electron.BrowserWindow.fromWebContents(e.sender);
  if (w == null ? void 0 : w.isMaximized()) w.unmaximize();
  else w == null ? void 0 : w.maximize();
});
electron.ipcMain.on("win-close", (e) => {
  var _a;
  return (_a = electron.BrowserWindow.fromWebContents(e.sender)) == null ? void 0 : _a.close();
});
electron.app.whenReady().then(() => {
  electron.Menu.setApplicationMenu(null);
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
