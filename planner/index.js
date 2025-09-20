const LS_KEY = "taskList";

const plannerForm = document.getElementById("planner_form");
const plannerInput = document.getElementById("planner_input");
const plannerList = document.getElementById("planner_list");
const filterSelect = document.getElementById("filter_status");

let tasks = [];
let filter = "all";

function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    tasks = raw ? JSON.parse(raw) : [];
    console.log("loaded from LS:", tasks);
  } catch (e) {
    console.error("LS parse error", e);
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (filter === "done") return tasks.filter((t) => t.done);
  if (filter === "active") return tasks.filter((t) => !t.done);
  return tasks;
}

function sortTasksByStatusThenDate(list) {
  return list.slice().sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    const ad = a.createdAt ?? 0;
    const bd = b.createdAt ?? 0;
    return bd - ad;
  });
}

function addTask(text) {
  if (!text) return;
  if (tasks.some((t) => t.text.toLowerCase() === text.toLowerCase())) return;

  const id =
    window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : String(Date.now() + Math.random());

  const newTask = { id, text, done: false, createdAt: Date.now() };
  tasks.unshift(newTask);
  saveTasks();
  render();
  plannerInput.value = "";
  plannerInput.focus();
}

function toggleTask(id, done) {
  const t = tasks.find((t) => t.id === id);
  if (!t) return;
  t.done = done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function render() {
  while (plannerList.firstChild)
    plannerList.removeChild(plannerList.firstChild);

  const visible = sortTasksByStatusThenDate(getVisibleTasks());

  if (visible.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks yet";
    li.style.opacity = "0.7";
    plannerList.appendChild(li);
    return;
  }

  visible.forEach((t) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = t.id;

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "10px";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", () => toggleTask(t.id, cb.checked));

    const text = document.createElement("span");
    text.textContent = t.text;
    if (t.done) {
      text.style.textDecoration = "line-through";
      text.style.opacity = "0.6";
    }

    const del = document.createElement("button");
    del.className = "btn btn-delete";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(t.id));

    left.appendChild(cb);
    left.appendChild(text);
    li.appendChild(left);
    li.appendChild(del);
    plannerList.appendChild(li);
  });
}

plannerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(plannerInput.value.trim());
});

if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    filter = filterSelect.value;
    render();
  });
}

loadTasks();
render();
