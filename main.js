const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#1f1f1f",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

ipcMain.handle("get-download-txt-files", async () => {
  try {
    const downloadsPath = app.getPath("downloads");
    const entries = fs.readdirSync(downloadsPath, { withFileTypes: true });

    const txtFiles = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".txt"))
      .map((entry) => {
        const filePath = path.join(downloadsPath, entry.name);
        const content = fs.readFileSync(filePath, "utf8");

        return {
          id: filePath,
          name: entry.name.replace(/\.txt$/i, ""),
          fullName: entry.name,
          type: "txt",
          content,
          formatted: false,
          path: filePath
        };
      });

    return { success: true, files: txtFiles };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      files: []
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});