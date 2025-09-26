const LS_KEY = "content-editor:lite";

const saveBtn = document.getElementById("save-btn");
const removeBtn = document.getElementById("remove-btn");
const contentContainer = document.getElementById("content-container");
const exportBtn = document.getElementById("export-btn");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const headerBtn1 = document.getElementById("header-btn-1");
const headerBtn2 = document.getElementById("header-btn-2");
const headerBtn3 = document.getElementById("header-btn-3");
const paragraphBtn = document.getElementById("paragraph-btn");
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const underlineBtn = document.getElementById("underline-btn");

let activeEl = null;

let past = [];   
let future = []; 

function snapshot() {
  return JSON.stringify(serializeDocument());
}

function pushHistory() {
  past.push(snapshot());
  if (past.length > 50) past.shift();
  future = []; 
  updateUndoRedoButtons();
}

function restoreFromSnapshot(snap) {
  try {
    const data = JSON.parse(snap);
    renderFromData(data);
    setActive(null);
  } catch (e) {
    console.warn("Failed to restore snapshot:", e);
  }
}

function updateUndoRedoButtons() {
  undoBtn.disabled = past.length === 0;
  redoBtn.disabled = future.length === 0;
}

function setActive(el) {
  if (activeEl === el) return;
  if (activeEl) activeEl.classList.remove("ce-block--active");
  activeEl = el;
  if (activeEl) activeEl.classList.add("ce-block--active");
}

function createBlock(tagName, text = "", styles = {}) {
  const el = document.createElement(tagName);
  el.className = "ce-block";
  el.contentEditable = "true";
  el.textContent = text; 
  applyStyles(el, styles);

  el.addEventListener("focus", () => setActive(el));
  el.addEventListener("click", () => setActive(el));

  el.addEventListener("blur", () => {
    save();
    pushHistory();
  });

  el.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && (el.textContent || "").length === 0) {
      e.preventDefault();
      const next = el.nextElementSibling || el.previousElementSibling;
      el.remove();
      save();
      pushHistory();
      if (next) next.focus();
      else setActive(null);
    }
  });

  return el;
}

function applyStyles(el, styles = {}) {
  el.style.fontWeight = styles.bold ? "700" : "400";
  el.style.fontStyle = styles.italic ? "italic" : "normal";
  el.style.textDecoration = styles.underline ? "underline" : "none";
}

function readStyles(el) {
  return {
    bold: el.style.fontWeight === "700",
    italic: el.style.fontStyle === "italic",
    underline: el.style.textDecoration.includes("underline"),
  };
}

function addBlock(type) {
  const el = createBlock(type, "");
  if (activeEl && activeEl.parentElement === contentContainer) {
    activeEl.insertAdjacentElement("afterend", el);
  } else {
    contentContainer.appendChild(el);
  }
  el.focus();
  save();
  pushHistory();
}

function toggleStyle(key) {
  if (!activeEl) return;
  const st = readStyles(activeEl);
  st[key] = !st[key];
  applyStyles(activeEl, st);
  save();
  pushHistory();
}

function serializeDocument() {
  const blocks = [...contentContainer.children].map((el) => ({
    type: el.tagName.toLowerCase(), 
    text: el.textContent || "",
    styles: readStyles(el),
  }));
  return { version: 1, blocks };
}

function renderFromData(data) {
  contentContainer.innerHTML = "";
  if (!data || !Array.isArray(data.blocks)) return;
  for (const b of data.blocks) {
    const el = createBlock(b.type || "p", b.text || "", b.styles || {});
    contentContainer.appendChild(el);
  }
  const first = contentContainer.firstElementChild;
  if (first) first.focus();
}

function save() {
  const doc = serializeDocument();
  localStorage.setItem(LS_KEY, JSON.stringify(doc));
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) {
      renderFromData(parsed);
      return true;
    }
  } catch (e) {
    console.warn("Failed to load:", e);
  }
  return false;
}

function clearAll() {
  localStorage.removeItem(LS_KEY);
  contentContainer.innerHTML = "";
  setActive(null);
  past = [];
  future = [];
  updateUndoRedoButtons();
}

function init() {
  const loaded = load();
  if (!loaded) {
    const p = createBlock("p", "");
    contentContainer.appendChild(p);
    p.focus();
    pushHistory();
  } else {
    pushHistory();
  }
}

init();
updateUndoRedoButtons();


headerBtn1.addEventListener("click", () => addBlock("h1"));
headerBtn2.addEventListener("click", () => addBlock("h2"));
headerBtn3.addEventListener("click", () => addBlock("h3"));
paragraphBtn.addEventListener("click", () => addBlock("p"));

boldBtn.addEventListener("click", () => toggleStyle("bold"));
italicBtn.addEventListener("click", () => toggleStyle("italic"));
underlineBtn.addEventListener("click", () => toggleStyle("underline"));

saveBtn.addEventListener("click", save);

removeBtn.addEventListener("click", () => {
  if (confirm("Clear document and storage?")) clearAll();
});

exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(serializeDocument(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content-editor.json";
  a.click();
  URL.revokeObjectURL(url);
});

undoBtn.addEventListener("click", () => {
  if (past.length === 0) return;
  const current = snapshot();
  const prev = past.pop();
  future.push(current);
  restoreFromSnapshot(prev);
  updateUndoRedoButtons();
});

redoBtn.addEventListener("click", () => {
  if (future.length === 0) return;  
  const current = snapshot();
  const next = future.pop();
  past.push(current);
  restoreFromSnapshot(next);
  updateUndoRedoButtons();
});
