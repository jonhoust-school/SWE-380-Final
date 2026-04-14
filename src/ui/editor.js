import { Editor } from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

export function createEditorController({ state, elements }) {
  const { editor, noteTitle, placeholderText } = elements;

  let wysiwygEditor = null;
  let editorContainer = null;

  function ensureEditorContainer() {
    if (editorContainer) return editorContainer;

    editorContainer = document.createElement("div");
    editorContainer.id = "wysiwygEditorHost";
    editorContainer.className = "wysiwyg-editor-host";
    editor.parentNode.appendChild(editorContainer);

    return editorContainer;
  }

  function createRichEditor() {
    if (wysiwygEditor) return;

    const host = ensureEditorContainer();

    wysiwygEditor = new Editor({
      el: host,
      height: "100%",
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      hideModeSwitch: true,
      usageStatistics: false,
      initialValue: "",
      toolbarItems: [
        ["heading", "bold", "italic", "strike"],
        ["hr", "quote"],
        ["ul", "ol"],
        ["table", "link"]
      ]
    });

    wysiwygEditor.on("change", () => {
      const selected = state.getSelectedNote();
      if (!selected) return;

      state.updateSelectedNoteContent(wysiwygEditor.getMarkdown());
    });
  }

  function hidePlaceholder() {
    placeholderText.classList.add("hidden");
  }

  function updatePlainPlaceholder() {
    const note = state.getSelectedNote();
    const hasContent = Boolean(note?.content?.trim()?.length);
    placeholderText.classList.toggle("hidden", hasContent);
  }

  function hideAllEditorUI() {
    editor.classList.add("editor-hidden");
    editor.style.display = "none";

    if (editorContainer) {
      editorContainer.style.display = "none";
    }
  }

  function showPlainEditor(note) {
    hidePlaceholder();
    updatePlainPlaceholder();

    if (editorContainer) {
      editorContainer.style.display = "none";
    }

    editor.classList.remove("editor-hidden");
    editor.style.display = "block";
    editor.value = note?.content || "";
  }

  function showRichEditor(note) {
    createRichEditor();

    editor.classList.add("editor-hidden");
    editor.style.display = "none";

    editorContainer.style.display = "block";
    hidePlaceholder();

    wysiwygEditor.setMarkdown(note?.content || "", false);
  }

  function render() {
    const note = state.getSelectedNote();

    if (!note) {
      noteTitle.textContent = "No Note Selected";

      if (editorContainer) {
        editorContainer.style.display = "none";
      }

      editor.classList.remove("editor-hidden");
      editor.style.display = "block";
      editor.value = "";
      placeholderText.classList.remove("hidden");
      return;
    }

    noteTitle.textContent = note.name;

    if (note.type === "pdf") {
      hideAllEditorUI();
      placeholderText.classList.add("hidden");
      return;
    }

    if (note.formatted || note.type === "md") {
      showRichEditor(note);
    } else {
      showPlainEditor(note);
    }
  }

  editor.addEventListener("input", () => {
    const note = state.getSelectedNote();
    if (!note || note.type === "pdf") return;

    state.updateSelectedNoteContent(editor.value);
    updatePlainPlaceholder();
  });

  return {
    render
  };
}