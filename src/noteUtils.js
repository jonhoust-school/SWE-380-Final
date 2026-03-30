function filterNotes(notes, filterText) {
  const query = (filterText || "").toLowerCase();

  return notes.filter((note) =>
    (note.fullName || "").toLowerCase().includes(query)
  );
}

function getSelectedNote(notes, selectedId) {
  return notes.find((note) => note.id === selectedId) || null;
}

function shouldShowPlaceholder(note) {
  if (!note) return true;
  return !(note.content && note.content.length > 0);
}

function isFormattedNote(note) {
  if (!note) return false;
  return note.type === "md" || note.formatted === true;
}

function toggleNotesHidden(currentValue) {
  return !currentValue;
}

module.exports = {
  filterNotes,
  getSelectedNote,
  shouldShowPlaceholder,
  isFormattedNote,
  toggleNotesHidden
};