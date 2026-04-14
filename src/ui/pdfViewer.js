export function createPdfViewerController({ elements }) {
  const { content, placeholderText } = elements;

  let host = null;
  let iframe = null;

  function ensureHost() {
    if (host) return;

    host = document.createElement("div");
    host.className = "pdf-viewer-host hidden";

    iframe = document.createElement("iframe");
    iframe.className = "pdf-iframe";
    iframe.title = "PDF Viewer";

    host.appendChild(iframe);
    content.appendChild(host);
  }

  function toFileUrl(filePath) {
    const normalized = filePath.replace(/\\/g, "/");
    return encodeURI(`file:///${normalized}`);
  }

  async function show(note) {
    ensureHost();

    placeholderText.classList.add("hidden");
    host.classList.remove("hidden");
    iframe.src = toFileUrl(note.path);
  }

  function hide() {
    if (!host) return;
    host.classList.add("hidden");
    iframe.src = "about:blank";
  }

  return {
    show,
    hide
  };
}