const lOCAL_KEY = "contacts";

const form = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addContactBtn = document.getElementById("addContactBtn");
const contactsList = document.getElementById("contactsList");
const searchInput = document.getElementById("searchInput");

let contacts = JSON.parse(localStorage.getItem(lOCAL_KEY)) || [];
let editingId = null; 

function saveContacts() {
  localStorage.setItem(lOCAL_KEY, JSON.stringify(contacts));
}

function makeContactCard(c) {
  const wrap = document.createElement('div');
  wrap.className = 'contact-item';
  wrap.dataset.id = c.id;

  const pName = document.createElement('p');
  const nameIcon = document.createElement('span');
  nameIcon.textContent = '💁';
  const nameText = document.createTextNode(c.name);
  pName.appendChild(nameIcon);
  pName.appendChild(nameText);

  const pEmail = document.createElement('p');
  const emailIcon = document.createElement('span');
  emailIcon.textContent = '📧';
  const emailText = document.createTextNode(c.email);
  pEmail.appendChild(emailIcon);
  pEmail.appendChild(emailText);

  const pPhone = document.createElement('p');
  const phoneIcon = document.createElement('span');
  phoneIcon.textContent = '📞';
  const phoneText = document.createTextNode(c.phone);
  pPhone.appendChild(phoneIcon);
  pPhone.appendChild(phoneText);

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn btn-delete';
  btnDelete.type = 'button';
  btnDelete.textContent = 'Delete';

  const btnEdit = document.createElement('button');
  btnEdit.className = 'btn btn-edit';
  btnEdit.type = 'button';
  btnEdit.textContent = 'Edit';

  wrap.appendChild(pName);
  wrap.appendChild(pEmail);
  wrap.appendChild(pPhone);
  wrap.appendChild(btnDelete);
  wrap.appendChild(btnEdit);

  return wrap;
}

function renderContacts(list = contacts) {
  if (!contactsList) return;

  while (contactsList.firstChild) contactsList.removeChild(contactsList.firstChild);

  if (!list.length) {
    const empty = document.createElement('div');
    empty.textContent = 'No contacts found';
    contactsList.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  for (const c of list) {
    frag.appendChild(makeContactCard(c));
  }
  contactsList.appendChild(frag);
}

document.addEventListener("DOMContentLoaded", () => renderContacts());

function addContact(contact) {
  contacts.push(contact);
  saveContacts();
  applyFilter();
}

function deleteContact(id) {
  const targetId = String(id);
  contacts = contacts.filter((c) => String(c.id) !== targetId);
  if (editingId && String(editingId) === targetId) {
    editingId = null;
    form.reset();
    addContactBtn.textContent = "Add Contact";
  }
  saveContacts();
  applyFilter();
}

function updateContact(id, patch) {
  const idx = contacts.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) return;
  contacts[idx] = { ...contacts[idx], ...patch };
  saveContacts();
  applyFilter();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
  };

  if (editingId) {
    updateContact(editingId, payload);
    editingId = null;
    addContactBtn.textContent = "Add Contact";
  } else {
    addContact({
      id: crypto.randomUUID(),
      ...payload,
    });
  }

  form.reset();
});

const digits = (s = "") => s.replace(/\D/g, "");
const lower  = (s = "") => s.toLowerCase();

function matches(c, q) {
  const qTrim   = q.trim();
  const qLower  = lower(qTrim);
  const qDigits = digits(qTrim);

  const byText =
    lower(c.name).includes(qLower) ||
    lower(c.email).includes(qLower);

  const byPhone =
    qDigits.length > 0 &&                      
    digits(c.phone).includes(qDigits);

  return byText || byPhone;
}

function applyFilter() {
  const q = searchInput.value.trim();
  if (!q) {
    renderContacts(); 
    return;
  }
  const filtered = contacts.filter((c) => matches(c, q));
  renderContacts(filtered);
}

searchInput.addEventListener("input", debounce(applyFilter, 200));

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchInput.value = "";
    applyFilter();
  }
});

function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}

contactsList.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) {
    const card = deleteBtn.closest(".contact-item");
    if (!card) return;
    deleteContact(card.dataset.id);
    return;
  }

  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) {
    const card = editBtn.closest(".contact-item");
    if (!card) return;
    const id = card.dataset.id;

    const c = contacts.find((x) => String(x.id) === String(id));
    if (!c) return;

    nameInput.value = c.name;
    emailInput.value = c.email;
    phoneInput.value = c.phone;

    editingId = id;
    addContactBtn.textContent = "Update Contact";
    nameInput.focus();
  }
});

