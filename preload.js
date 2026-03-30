const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Lab Notes",
  getDownloadTxtFiles: () => ipcRenderer.invoke("get-download-txt-files")
});