const addForm = document.getElementById("addForm");
const urlInput = document.getElementById("url");
const descriptionInput = document.getElementById("description");

const gallery = document.getElementById("gallery");
const saveBtn = document.getElementById("saveBtn");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const image = document.getElementById("image");
const modalDescEl = document.getElementById("modal-description");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let currentIndex = 0;

function renderGallery() {
  while (gallery.firstChild) gallery.removeChild(gallery.firstChild);

  if (!images.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No images';
    gallery.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();

  for (const { url, description, id } of images) {
    const fig = document.createElement('figure');
    fig.className = 'item';
    fig.dataset.id = id;

    const img = document.createElement('img');
    img.src = url;
    img.alt = description || '';

    const cap = document.createElement('figcaption');
    cap.textContent = description || '';

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.type = 'button';
    del.setAttribute('aria-label', 'Delete image');
    del.textContent = 'Delete';

    fig.appendChild(img);
    fig.appendChild(cap);
    fig.appendChild(del);

    frag.appendChild(fig);
  }

  gallery.appendChild(frag);
}


function loadImages() {
  const raw = JSON.parse(localStorage.getItem("images")) || [];
  images = raw.map((o) => ({
    url: o.url,
    description: o.description,
    id: o.id,
  }));
  renderGallery();
}

function probeImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.referrerPolicy = "no-referrer"; 
    img.src = url;
  });
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  const desc = descriptionInput.value.trim();
  if (!url || !desc) return;

  try {
    await probeImage(url);
    images.push({ url, description: desc, id: currentIndex++ });
    renderGallery();
    addForm.reset();
  } catch {
    alert(
      "This URL is not a direct image or it’s blocked. Use a direct image link (e.g. ending with .jpg/.png/.webp)."
    );
  }
});

gallery.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (btn) {
    const item = btn.closest(".item");
    const idNum = Number(item?.dataset.id);
    currentIndex--;
    images = images.filter((i) => i.id !== idNum);
    renderGallery();
    return;
  }

  const imgEl = e.target.closest(".item img");
  if (imgEl) {
    currentIndex = images.findIndex((i) => i.url === imgEl.src);
    image.src = imgEl.src;
    image.alt = imgEl.alt;
    modalDescEl.textContent = imgEl.alt || "";
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  }
});

function updateModal() {
  if (!images.length) return;
  currentIndex =
    ((currentIndex % images.length) + images.length) % images.length;
  const item = images[currentIndex];
  if (!item) return;
  image.src = item.url;
  image.alt = item.description || "";
  modalDescEl.textContent = item.description || "";
}

prevBtn.addEventListener("click", () => {
  if (!images.length) return;
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateModal();
});

nextBtn.addEventListener("click", () => {
  if (!images.length) return;
  currentIndex = (currentIndex + 1) % images.length;
  updateModal();
});

saveBtn.addEventListener("click", () => {
  localStorage.setItem("images", JSON.stringify(images));
});

loadImages();

closeBtn.addEventListener("click", () => modal.close());

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.open) modal.close();
});
