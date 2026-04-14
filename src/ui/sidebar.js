export function createSidebarController({ state, elements, onChange }) {
  const { noteList, searchInput } = elements;

  function getFilteredNotes() {
    const query = searchInput.value.trim().toLowerCase();

    return state.getNotes().filter((note) =>
      note.fullName.toLowerCase().includes(query)
    );
  }

  function render() {
    noteList.innerHTML = "";

    const notes = getFilteredNotes();

    notes.forEach((note) => {
      const item = document.createElement("div");
      item.className = `note-item ${note.id === state.getSelectedId() ? "active" : ""}`;
      item.textContent = note.fullName;

      item.addEventListener("click", () => {
        state.setSelectedId(note.id);
        onChange();
      });

      noteList.appendChild(item);
    });
  }

  function renderVisibility() {
    noteList.style.visibility = state.getNotesHidden() ? "hidden" : "visible";
  }

  searchInput.addEventListener("input", render);

  return {
    render,
    renderVisibility
  };
}