const LS_KEY = "comments";

const form = document.getElementById("commentForm");
const nameInput = document.getElementById("nameInput");
const commentInput = document.getElementById("commentInput");
const addCommentBtn = document.getElementById("addCommentBtn");
const commentsList = document.getElementById("commentsList");

let comments = JSON.parse(localStorage.getItem(LS_KEY)) || [];

function saveComments() {
  localStorage.setItem(LS_KEY, JSON.stringify(comments));
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} сек тому`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  const d = Math.floor(h / 24);
  return `${d} дн тому`;
}

function formatDate(ts) {
  try {
    const dt = new Date(ts);
    const local = dt.toLocaleString("uk-UA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${local} · ${timeAgo(ts)}`;
  } catch {
    return "";
  }
}

function renderCommentHTML(c) {
  const children = (c.responses || []).map(renderCommentHTML).join("");
  return `
    <div class="comment-item" data-id="${c.id}">
        <p>${c.name}</p>
        <p>${c.comment}</p>
        <p class="comment-time">${formatDate(c.createdAt)}</p>
      <div class="comment-actions">
        <button class="btn btn-delete">Delete</button>
        <button class="btn btn-respond">Respond</button>
      </div>
      <div class="comment-children">
        ${children}
      </div>
    </div>
    `;
}

function renderComments() {
  commentsList.innerHTML = comments.map(renderCommentHTML).join("");
}

function respondComment(targetId, payload) {
    function dfs(list) {
      for (const c of list) {
        if (String(c.id) === String(targetId)) {
          c.responses = c.responses || [];
          c.responses.push(payload);
          return true;
        }
        if (c.responses && dfs(c.responses)) return true;
      }
      return false;
    }
    dfs(comments);
    saveComments();
    renderComments();
  }  

function addComment(comment) {
  comments.push(comment);
  saveComments();
  renderComments();
}

function deleteComment(targetId) {
    function removeRec(list) {
      return list
        .filter((c) => String(c.id) !== String(targetId))
        .map((c) => ({
          ...c,
          responses: c.responses ? removeRec(c.responses) : [],
        }));
    }
    comments = removeRec(comments);
    saveComments();
    renderComments();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderComments();

    commentsList.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".btn-delete");
      const respBtn = e.target.closest(".btn-respond");
      const item = e.target.closest(".comment-item");
      if (!item) return;
      const id = item.dataset.id;
  
      if (delBtn) {
        deleteComment(id);
        return;
      }
  
      if (respBtn) {
        const responder = prompt("Ваше ім'я:", "Гість");
        if (responder === null) return;
        const text = prompt("Ваша відповідь:");
        if (!text || !text.trim()) return;
  
        respondComment(id, {
          id: crypto.randomUUID(),
          name: (responder || "Гість").trim(),
          comment: text.trim(),
          createdAt: Date.now(),
          responses: [],
        });
      }
    });
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim() || "Guest";
      const text = commentInput.value.trim();
      if (!text) return;
  
      addComment({
        id: crypto.randomUUID(),
        name,
        comment: text,
        responses: [],
        createdAt: Date.now(),
      });
      form.reset();
    });
  });