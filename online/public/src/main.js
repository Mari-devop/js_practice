import { addToOutbox, getAllOutbox, deleteFromOutbox } from './idb.js';

const API_BASE = 'https://jsonplaceholder.typicode.com';
const NOTES_URL = `${API_BASE}/posts`; 

const form = document.getElementById('noteForm');
const statusEl = document.getElementById('status');
const list = document.getElementById('notes');

function setStatus(msg) { statusEl.textContent = msg; }


async function loadNotes() {
  try {
    const res = await fetch(NOTES_URL);        
    const data = await res.json();
    renderNotes(data.slice(0, 10));
    setStatus(navigator.onLine ? 'Онлайн' : 'Офлайн (кеш)');
  } catch {
    setStatus('Офлайн: показано з кешу (якщо є).');
  }
}

function renderNotes(items) {
  list.innerHTML = '';
  items.forEach(n => {
    const li = document.createElement('li');
    li.textContent = `${n.title}: ${n.body}`;
    list.appendChild(li);
  });
}

async function sendNote({ title, body }) {
  const payload = { title, body, userId: 1 }; 

  try {
    const res = await fetch(NOTES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Server responded with error');
    setStatus('Збережено онлайн ✅ (демо-відповідь)');
    await loadNotes(); 
    return;
  } catch {
    await addToOutbox({
      url: NOTES_URL,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setStatus('Немає мережі: запит збережено, надішлемо пізніше ⏳');

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      try { await reg.sync.register('sync-outbox'); } catch {}
    }
  }
}

window.addEventListener('online', async () => {
  setStatus('Мережа відновлена, відправляємо відкладені запити…');
  await flushOutboxInWindow();
  await loadNotes();
});

async function flushOutboxInWindow() {
  const items = await getAllOutbox();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (res.ok) await deleteFromOutbox(item.id);
    } catch {}
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  if (!title || !content) return;
  await sendNote({ title, body: content }); 
  form.reset();
});

loadNotes();
