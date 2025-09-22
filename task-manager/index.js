const STATUS = ["new", "in-progress", "done"];
const STATUS_ORDER = { new: 0, "in-progress": 1, done: 2 };
const PRIORITIES = ["high", "medium", "low"];
const DEFAULT_STATUS = "new";
const DEFAULT_PRIORITY = "medium";
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

class Task {
  constructor(id, description, status = DEFAULT_STATUS, priority = DEFAULT_PRIORITY) {
    if (!STATUS.includes(status)) throw new Error(`Invalid status: ${status}`);
    if (!PRIORITIES.includes(priority)) throw new Error(`Invalid priority: ${priority}`);
    this.id = id;
    this.description = description;
    this.status = status;
    this.priority = priority;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    return this;
  }

  updatePriority(newPriority) {
    this.priority = newPriority;
    return this;
  }

  toHTML() {
    return `
      <div class="task-item" data-id="${this.id}">
        <p>${this.description}</p>
        <p>${this.status}</p>
        <p>${this.priority}</p>
        <button class="btn btn-delete">Delete</button>
      </div>`;
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
    this.renderTasks();
  }

  removeTaskById(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.renderTasks();
  }

  sortTasks(dir = "asc") {
    const mul = dir === "desc" ? -1 : 1;
    this.tasks.sort(
      (a, b) =>
        ((PRIORITY_ORDER[a.priority] ?? 999) - (PRIORITY_ORDER[b.priority] ?? 999)) *
        mul
    );
    this.renderTasks();
  }

  filterBy({ status, priority }) {
    let list = this.tasks;
    if (status) list = list.filter((t) => t.status === status);
    if (priority) list = list.filter((t) => t.priority === priority);
    this.renderTasks(list);
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  loadTasks() {
    const raw = JSON.parse(localStorage.getItem("tasks")) || [];
    this.tasks = raw.map(
      (o) => new Task(o.id, o.description, o.status, o.priority)
    );
  }

  renderTasks(list = this.tasks) {
    const ul = document.getElementById("tasksList");
    ul.innerHTML = list.map((t) => t.toHTML()).join("");
  }
}

const taskManager = new TaskManager();

let counter = 0;
const genId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

const list = document.getElementById("tasksList");
list.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;
  const item = btn.closest(".task-item");
  const id = item?.dataset.id;
  taskManager.removeTaskById(id);
});

document.getElementById("addTaskBtn").addEventListener("click", () => {
  const desc = document.getElementById("taskInput").value.trim();
  let status = document
    .getElementById("statusInput")
    .value.trim()
    .toLowerCase();
  let priority = document
    .getElementById("priorityInput")
    .value.trim()
    .toLowerCase();

  if (!STATUS.includes(status)) status = DEFAULT_STATUS;
  if (!PRIORITIES.includes(priority)) priority = DEFAULT_PRIORITY;

  if (!desc) return;

  taskManager.addTask(new Task(genId(), desc, status, priority));
  document.getElementById("taskInput").value = "";
});

document.getElementById("saveTasksBtn").addEventListener("click", () => {
  taskManager.saveTasks();
  console.log("Saved to localStorage");
});

document.getElementById("loadTasksBtn").addEventListener("click", () => {
  taskManager.loadTasks();
  taskManager.renderTasks();
  console.log("Loaded from localStorage");
});

let sortDir = "asc";

document.getElementById("sortTasksBtn").addEventListener("click", () => {
  sortDir = sortDir === "asc" ? "desc" : "asc";
  taskManager.sortTasks(sortDir);
});

document.getElementById("filterTasksBtn").addEventListener("click", () => {
  const status = document
    .getElementById("statusInput")
    .value.trim()
    .toLowerCase();
  const priority = document
    .getElementById("priorityInput")
    .value.trim()
    .toLowerCase();
  taskManager.filterBy({ status, priority });
});
