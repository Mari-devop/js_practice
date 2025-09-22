const calenderHeader = document.getElementById("calender_header");
const monthYear = document.getElementById("monthYear");
const calenderBody = document.getElementById("calender_body");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const modalForm = document.getElementById("modalForm");
const events = document.getElementById("events");
const addEventBtn = document.getElementById("addEventBtn");
const eventInput = document.getElementById("eventInput");
const dateInput = document.getElementById("dateInput");
const eventsTitle = document.getElementById("eventsTitle");

const previousMonthBtn = document.getElementById("previousMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function formatMonthYear(y, m) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m, 1));
}

function renderCalender() {
  calenderBody.innerHTML = "";
  monthYear.textContent = formatMonthYear(currentYear, currentMonth);

  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = (currentMonth + 11) % 12;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const leadingDays = firstWeekday;

  for (let i = leadingDays; i > 0; i--) {
    const day = daysInPrevMonth - i + 1;
    const cell = document.createElement("div");
    cell.textContent = day;
    cell.classList.add("calender_body_day", "calender_body_day_out");
    calenderBody.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("button");
    cell.className = "calender_body_day";
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    cell.dataset.date = `${yyyy}-${mm}-${dd}`;
    cell.textContent = day;

    if (
      yyyy === currentDate.getFullYear() &&
      currentMonth === currentDate.getMonth() &&
      day === currentDate.getDate()
    ) {
      cell.classList.add("calender_body_day_today");
    }
    calenderBody.appendChild(cell);
  }

  const usedDays = leadingDays + daysInMonth;
  const totalCells = 42;
  const trailingDays = totalCells - usedDays;

  for (let day = 1; day <= trailingDays; day++) {
    const cell = document.createElement("div");
    cell.textContent = day;
    cell.classList.add("calender_body_day", "calender_body_day_out");
    calenderBody.appendChild(cell);
  }
}

let selectedDate = null;
let eventsByDate = JSON.parse(localStorage.getItem("eventsByDate") || "{}");

function renderEvents(dateKey) {
  events.innerHTML = "";

  const list = eventsByDate[dateKey] || [];

  const title = document.createElement("p");
  title.className = "events_title";
  title.textContent = `Event List for ${dateKey}`;
  events.appendChild(title);

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "events_empty";
    empty.textContent = "No events";
    events.appendChild(empty);
    return;
  }

  list.forEach((text, idx) => {
    const item = document.createElement("div");
    item.className = "event_item";

    item.innerHTML = `
      <p class="event_text">${text}</p>
      <p class="event_date">${dateKey}</p>
      <button class="event_delete" data-index="${idx}">Delete</button>
    `;

    events.appendChild(item);
  });

  const delAll = document.createElement("button");
  delAll.className = "event_delete_all";
  delAll.textContent = "Delete all for this date";
  events.appendChild(delAll);
}


previousMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalender();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalender();
});

renderCalender();

calenderBody.addEventListener("click", (e) => {
  const day = e.target.closest(".calender_body_day");
  if (!day || !calenderBody.contains(day)) return;
  if (day.classList.contains("calender_body_day_out")) return;

  selectedDate = day.dataset.date;
  dateInput.value = selectedDate;
  eventInput.value = "";

  eventsTitle.textContent = `Event for ${selectedDate}`;
  renderEvents(selectedDate);

  modal.showModal();
});

modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const text = eventInput.value.trim();
  const dateValue = dateInput.value;
  
  if (!text) {
    alert("Please enter event text");
    return;
  }
  
  const eventDate = new Date(dateValue);
  if (isNaN(eventDate.getTime())) {
    alert("Invalid date");
    return;
  }
});

closeBtn.addEventListener("click", () => {
  modal.close();
});

addEventBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const text = eventInput.value.trim();
  const dateValue = dateInput.value;

  if (!text || !dateValue) return;

  if (!eventsByDate[dateValue]) eventsByDate[dateValue] = [];
  eventsByDate[dateValue].push(text);

  localStorage.setItem("eventsByDate", JSON.stringify(eventsByDate));

  eventInput.value = "";
  renderEvents(dateValue);
});

events.addEventListener("click", (e) => {
  const btnOne = e.target.closest(".event_delete");
  if (btnOne) {
    const idx = Number(btnOne.dataset.index);
    if (!Number.isInteger(idx)) return;

    const dateKey = selectedDate || dateInput.value;
    if (!dateKey) return;

    const list = eventsByDate[dateKey] || [];
    list.splice(idx, 1); 
    if (list.length === 0) {
      delete eventsByDate[dateKey]; 
    } else {
      eventsByDate[dateKey] = list;
    }
    localStorage.setItem("eventsByDate", JSON.stringify(eventsByDate));
    renderEvents(dateKey);
    return;
  }

  const btnAll = e.target.closest(".event_delete_all");
  if (btnAll) {
    const dateKey = selectedDate || dateInput.value;
    if (!dateKey) return;

    delete eventsByDate[dateKey]; 
    localStorage.setItem("eventsByDate", JSON.stringify(eventsByDate));
    renderEvents(dateKey);
  }
});
