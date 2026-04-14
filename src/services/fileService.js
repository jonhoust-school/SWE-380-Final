export async function loadDownloadNotes() {
  try {
    if (!window.electronAPI?.getDownloadNotes) {
      return [];
    }

    const result = await window.electronAPI.getDownloadNotes();

    if (!result?.success || !Array.isArray(result.files)) {
      return [];
    }

    return result.files;
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
}

export async function createPdfNote(name) {
  return window.electronAPI.createPdfNote(name);
}

export async function saveNote(note) {
  return window.electronAPI.saveNote(note);
}

export async function deleteNote(note) {
  return window.electronAPI.deleteNote(note);
}

export async function duplicateNote(note) {
  return window.electronAPI.duplicateNote(note);
}

export async function exportNote(note) {
  return window.electronAPI.exportNote(note);
}