const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

ipcMain.handle("create-pdf-note", async (_event, name) => {
  try {
    const downloadsPath = app.getPath("downloads");
    const safeBaseName = sanitizeFileBaseName(name || "New Note");
    const targetPath = ensureUniquePath(downloadsPath, safeBaseName, "pdf");

    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([612, 792]);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(targetPath, Buffer.from(pdfBytes));

    return {
      success: true,
      note: noteFromPath(targetPath)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

function sanitizeFileBaseName(name) {
  return (name || "New Note")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\.+$/, "")
    .trim() || "New Note";
}

function getExtension(note) {
  return note?.type === "md" ? "md" : note?.type === "pdf" ? "pdf" : "txt";
}

function ensureUniquePath(dir, baseName, ext) {
  let candidate = path.join(dir, `${baseName}.${ext}`);
  let counter = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${baseName} (${counter}).${ext}`);
    counter += 1;
  }

  return candidate;
}

function noteFromPath(filePath, content = "") {
  const ext = path.extname(filePath).replace(".", "").toLowerCase() || "txt";
  const fullName = path.basename(filePath);
  const name = fullName.replace(/\.[^.]+$/, "");

  return {
    id: filePath,
    path: filePath,
    name,
    fullName,
    type: ext,
    formatted: ext === "md",
    content: ext === "pdf" ? "" : content
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#1f1f1f",
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.on("before-input-event", (event, input) => {
    const isDevToolsShortcut =
      input.control &&
      input.shift &&
      input.key.toLowerCase() === "i";

    const isF12 = input.key === "F12";

    if (isDevToolsShortcut || isF12) {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  win.loadFile(path.join(__dirname, "dist", "src", "index.html"));
}

ipcMain.handle("get-download-notes", async () => {
  try {
    const downloadsPath = app.getPath("downloads");
    const entries = fs.readdirSync(downloadsPath, { withFileTypes: true });

    const files = entries
      .filter((entry) => {
        if (!entry.isFile()) return false;
        const lower = entry.name.toLowerCase();
        return lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".pdf");
      })
      .map((entry) => {
        const filePath = path.join(downloadsPath, entry.name);
        const stats = fs.statSync(filePath);

        let note;
        if (entry.name.toLowerCase().endsWith(".pdf")) {
          note = noteFromPath(filePath);
        } else {
          const content = fs.readFileSync(filePath, "utf8");
          note = noteFromPath(filePath, content);
        }

        return {
          ...note,
          modifiedTime: stats.mtimeMs
        };
      })
      .sort((a, b) => b.modifiedTime - a.modifiedTime);

    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message, files: [] };
  }
});

ipcMain.handle("read-pdf", async (_event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return {
      success: true,
      data: Array.from(buffer)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle("save-note", async (_event, note) => {
  try {
    if (note?.type === "pdf") {
      return { success: true, note };
    }

    const downloadsPath = app.getPath("downloads");
    const ext = getExtension(note);
    const safeBaseName = sanitizeFileBaseName(note.name);
    const targetPath =
      note.path || path.join(downloadsPath, `${safeBaseName}.${ext}`);

    fs.writeFileSync(targetPath, note.content ?? "", "utf8");

    return {
      success: true,
      note: noteFromPath(targetPath, note.content ?? "")
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-note", async (_event, note) => {
  try {
    if (note?.path && fs.existsSync(note.path)) {
      fs.unlinkSync(note.path);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("duplicate-note", async (_event, note) => {
  try {
    const downloadsPath = app.getPath("downloads");
    const ext = getExtension(note);
    const baseName = sanitizeFileBaseName(`${note.name} Copy`);
    const targetPath = ensureUniquePath(downloadsPath, baseName, ext);

    if (ext === "pdf" && note.path) {
      fs.copyFileSync(note.path, targetPath);
      return {
        success: true,
        note: noteFromPath(targetPath)
      };
    }

    const content = note.content ?? "";
    fs.writeFileSync(targetPath, content, "utf8");

    return {
      success: true,
      note: noteFromPath(targetPath, content)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("export-note", async (_event, note) => {
  try {
    const ext = getExtension(note);

    const result = await dialog.showSaveDialog({
      title: "Export Note",
      defaultPath: "",
      filters: [
        { name: "Supported Files", extensions: ["txt", "md", "pdf"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    let targetPath = result.filePath;
    if (!path.extname(targetPath)) {
      targetPath = `${targetPath}.${ext}`;
    }

    if (ext === "pdf" && note.path) {
      fs.copyFileSync(note.path, targetPath);
    } else {
      fs.writeFileSync(targetPath, note.content ?? "", "utf8");
    }

    return {
      success: true,
      exportedPath: targetPath
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});