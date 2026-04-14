import { createNotesState } from "./state/noteState.js";
import {
  loadDownloadNotes,
  createPdfNote,
  saveNote,
  deleteNote,
  duplicateNote,
  exportNote
} from "./services/fileService.js";
import { createEditorController } from "./ui/editor.js";
import { createSidebarController } from "./ui/sidebar.js";
import { createModalController } from "./ui/modal.js";
import { createLayoutController } from "./ui/layout.js";
import { createPdfViewerController } from "./ui/pdfViewer.js";

const state = createNotesState();

const elements = {
  noteList: document.getElementById("noteList"),
  noteTitle: document.getElementById("noteTitle"),
  editor: document.getElementById("editor"),
  content: document.querySelector(".content"),
  placeholderText: document.getElementById("placeholderText"),
  addNoteBtn: document.getElementById("addNoteBtn"),
  modalOverlay: document.getElementById("modalOverlay"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  createModalBtn: document.getElementById("createModalBtn"),
  newNoteName: document.getElementById("newNoteName"),
  newNoteType: document.getElementById("newNoteType"),
  notesHiddenCheckbox: document.getElementById("notesHiddenCheckbox"),
  searchInput: document.getElementById("searchInput"),
  sidebarResizer: document.getElementById("sidebarResizer"),
  sidebarArrowBtn: document.getElementById("sidebarArrowBtn"),
  topbarMenuBtn: document.getElementById("topbarMenuBtn"),
  topbarDropdown: document.getElementById("topbarDropdown"),
  menuSaveBtn: document.getElementById("menuSaveBtn"),
  menuDeleteBtn: document.getElementById("menuDeleteBtn"),
  menuExportBtn: document.getElementById("menuExportBtn"),
  menuDuplicateBtn: document.getElementById("menuDuplicateBtn"),
  menuSaveAsBtn: document.getElementById("menuSaveAsBtn")
};

let editorController;
let sidebarController;
let pdfViewerController;

async function renderAll() {
  sidebarController.render();
  sidebarController.renderVisibility();
  editorController.render();

  const note = state.getSelectedNote();
  if (note?.type === "pdf") {
    await pdfViewerController.show(note);
  } else {
    pdfViewerController.hide();
  }
}

async function createNote({ name, type }) {
  const safeName = name.trim() || "New Note";

  if (type === "pdf") {
    const result = await createPdfNote(safeName);

    if (!result?.success) {
      alert(result?.error || "Failed to create PDF.");
      return;
    }

    state.addNote(result.note);
    renderAll();
    return;
  }

  const extension = type === "md" ? "md" : "txt";

  const note = {
    id: `new-${Date.now()}`,
    name: safeName,
    fullName: `${safeName}.${extension}`,
    type: extension,
    content: "",
    formatted: extension === "md",
    path: null
  };

  state.addNote(note);
  renderAll();
}

async function handleSave() {
  const note = state.getSelectedNote();
  if (!note || note.type === "pdf") return;

  const result = await saveNote(note);
  if (!result?.success) {
    alert(result?.error || "Save failed.");
    return;
  }

  state.replaceNote(result.note, note.id);
  renderAll();
}

async function handleDelete() {
  const note = state.getSelectedNote();
  if (!note) return;

  const confirmed = window.confirm(`Delete "${note.fullName}"?`);
  if (!confirmed) return;

  const result = await deleteNote(note);
  if (!result?.success) {
    alert(result?.error || "Delete failed.");
    return;
  }

  state.removeSelectedNote();
  renderAll();
}

async function handleExport() {
  const note = state.getSelectedNote();
  if (!note) return;

  const result = await exportNote(note);
  if (!result?.success && !result?.canceled) {
    alert(result?.error || "Export failed.");
  }
}

async function handleDuplicate() {
  const note = state.getSelectedNote();
  if (!note) return;

  const result = await duplicateNote(note);
  if (!result?.success) {
    alert(result?.error || "Duplicate failed.");
    return;
  }

  state.addNote(result.note);
  renderAll();
}

async function init() {
  editorController = createEditorController({
    state,
    elements
  });

  pdfViewerController = createPdfViewerController({
    elements
  });

  sidebarController = createSidebarController({
    state,
    elements,
    onChange: renderAll
  });

  createModalController({
    elements,
    onCreate: createNote
  });

  createLayoutController({
    elements,
    actions: {
      onSave: handleSave,
      onSaveAs: async () => {},
      onDelete: handleDelete,
      onExport: handleExport,
      onDuplicate: handleDuplicate
    }
  });

  const loadedNotes = await loadDownloadNotes();

  if (loadedNotes.length > 0) {
    state.setNotes(loadedNotes);
  } else {
    state.setNotes([
      {
        id: "sample-1",
        name: "New Note",
        fullName: "New Note.txt",
        type: "txt",
        content: "",
        formatted: false,
        path: null
      },
      {
        id: "sample-2",
        name: "My Formatted List",
        fullName: "My Formatted List.md",
        type: "md",
        content: "# My Formatted List\n\n- First item\n- Second item",
        formatted: true,
        path: null
      }
    ]);
  }

  renderAll();
}

init();