export function createModalController({ elements, onCreate }) {
  const {
    addNoteBtn,
    modalOverlay,
    cancelModalBtn,
    createModalBtn,
    newNoteName,
    newNoteType
  } = elements;

  function openModal() {
    modalOverlay.classList.remove("hidden");
    newNoteName.value = "";
    newNoteType.value = "txt";
    newNoteName.focus();
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  function handleCreate() {
    onCreate({
      name: newNoteName.value,
      type: newNoteType.value
    });

    closeModal();
  }

  addNoteBtn.addEventListener("click", openModal);
  cancelModalBtn.addEventListener("click", closeModal);
  createModalBtn.addEventListener("click", handleCreate);

  newNoteName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleCreate();
    if (event.key === "Escape") closeModal();
  });

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  return {
    openModal,
    closeModal
  };
}