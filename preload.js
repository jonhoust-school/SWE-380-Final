const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  appName: "Lab Notes",
  createPdfNote: (name) => ipcRenderer.invoke("create-pdf-note", name),
  getDownloadNotes: () => ipcRenderer.invoke("get-download-notes"),
  readPdf: (filePath) => ipcRenderer.invoke("read-pdf", filePath),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
  deleteNote: (note) => ipcRenderer.invoke("delete-note", note),
  duplicateNote: (note) => ipcRenderer.invoke("duplicate-note", note),
  exportNote: (note) => ipcRenderer.invoke("export-note", note)
});