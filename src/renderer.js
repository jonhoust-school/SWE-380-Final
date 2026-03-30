const state = {
  notes: [],
  selectedId: null,
  notesHidden: true
};

const noteList = document.getElementById("noteList");
const noteTitle = document.getElementById("noteTitle");
const editor = document.getElementById("editor");
const placeholderText = document.getElementById("placeholderText");
const addNoteBtn = document.getElementById("addNoteBtn");
const modalOverlay = document.getElementById("modalOverlay");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const createModalBtn = document.getElementById("createModalBtn");
const newNoteName = document.getElementById("newNoteName");
const newNoteType = document.getElementById("newNoteType");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const notesHiddenCheckbox = document.getElementById("notesHiddenCheckbox");
const editorToolbar = document.getElementById("editorToolbar");
const searchInput = document.getElementById("searchInput");
const sidebarResizer = document.getElementById("sidebarResizer");

function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedId) || null;
}

function renderNotes(filter = "") {
  noteList.innerHTML = "";

  const filteredNotes = state.notes.filter((note) =>
    note.fullName.toLowerCase().includes(filter.toLowerCase())
  );

  filteredNotes.forEach((note) => {
    const item = document.createElement("div");
    item.className = `note-item ${note.id === state.selectedId ? "active" : ""}`;
    item.textContent = note.fullName;

    item.addEventListener("click", () => {
      state.selectedId = note.id;
      renderAll();
    });

    noteList.appendChild(item);
  });
}

function renderEditor() {
  const selected = getSelectedNote();

  if (!selected) {
    noteTitle.textContent = "No Note Selected";
    editor.value = "";
    placeholderText.classList.remove("hidden");
    editorToolbar.classList.add("hidden");
    return;
  }

  noteTitle.textContent = selected.name;
  editor.value = selected.content;
  placeholderText.classList.toggle("hidden", selected.content.length > 0);
  editorToolbar.classList.toggle("hidden", !selected.formatted);
}

function renderNotesVisibility() {
  if (state.notesHidden) {
    noteList.style.visibility = "hidden";
  } else {
    noteList.style.visibility = "visible";
  }
}

function renderAll() {
  renderNotes(searchInput.value);
  renderEditor();
  renderNotesVisibility();
}

function openModal() {
  modalOverlay.classList.remove("hidden");
  newNoteName.value = "";
  newNoteType.value = "txt";
  newNoteName.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

function createNote() {
  const rawName = newNoteName.value.trim();
  const type = newNoteType.value;
  const name = rawName || "New Note";

  const extension = type === "md" ? "md" : "txt";
  const formatted = extension === "md";

  const newNote = {
    id: `new-${Date.now()}`,
    name,
    fullName: `${name}.${extension}`,
    type: extension,
    content: "",
    formatted
  };

  state.notes.push(newNote);
  state.selectedId = newNote.id;

  closeModal();
  renderAll();
}

async function loadDownloadNotes() {
  if (!window.electronAPI?.getDownloadTxtFiles) {
    fallbackNotes();
    return;
  }

  const result = await window.electronAPI.getDownloadTxtFiles();

  if (!result.success || result.files.length === 0) {
    fallbackNotes();
    return;
  }

  state.notes = result.files;
  state.selectedId = result.files[0].id;
  renderAll();
}

function fallbackNotes() {
  state.notes = [
    {
      id: "sample-1",
      name: "New Note",
      fullName: "New Note.txt",
      type: "txt",
      content: "",
      formatted: false
    },
    {
      id: "sample-2",
      name: "My Formatted List",
      fullName: "My Formatted List.md",
      type: "md",
      content: "",
      formatted: true
    }
  ];

  state.selectedId = state.notes[0].id;
  renderAll();
}

addNoteBtn.addEventListener("click", openModal);
cancelModalBtn.addEventListener("click", closeModal);
createModalBtn.addEventListener("click", createNote);

newNoteName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") createNote();
  if (event.key === "Escape") closeModal();
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

editor.addEventListener("input", () => {
  const selected = getSelectedNote();
  if (!selected) return;

  selected.content = editor.value;
  placeholderText.classList.toggle("hidden", selected.content.length > 0);
});

toggleSidebarBtn.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-hidden");
});

notesHiddenCheckbox.addEventListener("change", () => {
  state.notesHidden = notesHiddenCheckbox.checked;
  renderNotesVisibility();
});

searchInput.addEventListener("input", () => {
  renderNotes(searchInput.value);
});

/* Draggable sidebar */
let isResizing = false;

sidebarResizer.addEventListener("mousedown", () => {
  isResizing = true;
  document.body.classList.add("resizing");
});

window.addEventListener("mousemove", (event) => {
  if (!isResizing) return;

  const minWidth = 150;
  const maxWidth = 420;
  const nextWidth = Math.min(Math.max(event.clientX, minWidth), maxWidth);

  document.documentElement.style.setProperty("--sidebar-width", `${nextWidth}px`);
});

window.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.classList.remove("resizing");
});

loadDownloadNotes();