export function createLayoutController({ elements, actions }) {
  const {
    sidebarArrowBtn,
    topbarMenuBtn,
    topbarDropdown,
    notesHiddenCheckbox,
    sidebarResizer,
    menuSaveBtn,
    menuDeleteBtn,
    menuExportBtn,
    menuDuplicateBtn,
    menuSaveAsBtn
  } = elements;

  function toggleSidebar() {
    document.body.classList.toggle("sidebar-hidden");
  }

  function closeTopbarMenu() {
    if (topbarDropdown) {
      topbarDropdown.classList.add("hidden");
    }
  }

  function toggleTopbarMenu(event) {
    if (!topbarDropdown) return;
    event.stopPropagation();
    topbarDropdown.classList.toggle("hidden");
  }

  if (sidebarArrowBtn) {
    sidebarArrowBtn.addEventListener("click", toggleSidebar);
  }

  if (topbarMenuBtn) {
    topbarMenuBtn.addEventListener("click", toggleTopbarMenu);
  }

  if (notesHiddenCheckbox) {
    notesHiddenCheckbox.addEventListener("change", () => {
      /* intentionally does nothing for now */
    });
  }

  if (menuSaveBtn) {
    menuSaveBtn.addEventListener("click", async () => {
      closeTopbarMenu();
      await actions.onSave();
    });
  }

  if (menuDeleteBtn) {
    menuDeleteBtn.addEventListener("click", async () => {
      closeTopbarMenu();
      await actions.onDelete();
    });
  }

  if (menuExportBtn) {
    menuExportBtn.addEventListener("click", async () => {
      closeTopbarMenu();
      await actions.onExport();
    });
  }

  if (menuDuplicateBtn) {
    menuDuplicateBtn.addEventListener("click", async () => {
      closeTopbarMenu();
      await actions.onDuplicate();
    });
  }

    if (menuSaveAsBtn) {
    menuSaveAsBtn.addEventListener("click", async () => {
        closeTopbarMenu();
        await actions.onSaveAs();
    });
    }

  document.addEventListener("click", (event) => {
    if (!topbarDropdown || !topbarMenuBtn) return;

    const clickedInside =
      topbarDropdown.contains(event.target) ||
      topbarMenuBtn.contains(event.target);

    if (!clickedInside) {
      closeTopbarMenu();
    }
  });

  let isResizing = false;

  if (sidebarResizer) {
    sidebarResizer.addEventListener("mousedown", () => {
      if (document.body.classList.contains("sidebar-hidden")) return;

      isResizing = true;
      document.body.classList.add("resizing");
    });
  }

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

  return {
    closeTopbarMenu
  };
}