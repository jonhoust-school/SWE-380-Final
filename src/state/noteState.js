export function createNotesState() {
  const state = {
    notes: [],
    selectedId: null,
    notesHidden: false
  };

  return {
    getNotes() {
      return state.notes;
    },

    setNotes(notes) {
      state.notes = notes;
      state.selectedId = notes.length > 0 ? notes[0].id : null;
    },

    addNote(note) {
      state.notes.push(note);
      state.selectedId = note.id;
    },

    replaceNote(updatedNote, previousId = null) {
      const targetId = previousId || updatedNote.id;
      const index = state.notes.findIndex((note) => note.id === targetId);

      if (index >= 0) {
        state.notes[index] = updatedNote;
        state.selectedId = updatedNote.id;
      }
    },

    removeSelectedNote() {
      const currentId = state.selectedId;
      const index = state.notes.findIndex((note) => note.id === currentId);

      if (index === -1) return;

      state.notes.splice(index, 1);

      if (state.notes.length === 0) {
        state.selectedId = null;
        return;
      }

      const nextIndex = Math.max(0, index - 1);
      state.selectedId = state.notes[nextIndex].id;
    },

    getSelectedId() {
      return state.selectedId;
    },

    setSelectedId(id) {
      state.selectedId = id;
    },

    getSelectedNote() {
      return state.notes.find((note) => note.id === state.selectedId) || null;
    },

    updateSelectedNoteContent(content) {
      const note = state.notes.find((item) => item.id === state.selectedId);
      if (note) {
        note.content = content;
      }
    },

    getNotesHidden() {
      return state.notesHidden;
    },

    setNotesHidden(hidden) {
      state.notesHidden = hidden;
    }
  };
}