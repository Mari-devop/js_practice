const statusUser = document.querySelector("[data-role='conn-status']");
const online = document.querySelector("[data-role='users-count']");
const list = document.querySelector("[data-role='messages']");
const nameInput = document.querySelector("[data-role='name']");
const input = document.querySelector("[data-role='input']");
const send = document.querySelector("[data-role='send']");
const form = document.querySelector("[data-role='send-message']");

let ws;
let connected = false;

let myName = "";
const MAX_MESSAGE_LENGTH = 1000;
let autoScroll = true;

ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  connected = true;
  statusUser.textContent = "Online";
  statusUser.classList.add("online");
  statusUser.classList.remove("offline");
  statusUser.classList.remove("warning");
  send.disabled = !input.value.trim();
};

ws.onmessage = (event) => {
    const raw = event.data;
    let obj;
    try {
        obj = JSON.parse(raw);
    } catch {
        console.error("Error parsing JSON:", raw);
        return;
    }
  if (obj.type === "online") {
    online.textContent = "Online: " + obj.count;
    return;
  } 

  if (obj.type === "message") {
    renderMessage({ user: obj.user, text: obj.text, ts: obj.ts });
    return;
  }

  console.error("Unknown message type:", obj);
};

ws.onclose = () => {
  connected = false;
  statusUser.innerHTML = "Offline";
  statusUser.classList.add("offline");
  statusUser.classList.remove("online");
  statusUser.classList.remove("warning");
  send.disabled = true;
};

ws.onerror = (event) => {
  console.error("WebSocket error:", event);
};

function sendMessage() {
  const value = input.value.trim();
  if (value.length > MAX_MESSAGE_LENGTH) {
    alert("Message is too long");
    return;
  }
  if (value.trim() === "") {
    alert("Message is empty");
    return;
  }
  const payload = {
    type: "message",
    user: myName || "Anon",
    text: value,
    ts: Date.now(),
  };

  if (connected && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    input.value = "";
    send.disabled = true;
    input.focus();
  }
}

nameInput.addEventListener("input", (event) => {
    myName = event.target.value.trim();
  });

function updateStatus(status) {
  statusUser.innerHTML = status;
  statusUser.classList.add(status);
  statusUser.classList.remove("offline");
  statusUser.classList.remove("online");
}

function renderMessage({ user, text, ts }) {
  const messageElement = document.createElement("li");
  messageElement.textContent = `${user || "Anon"}: ${text}`;

  if ((user || "Anon") === (myName || "Anon")) messageElement.classList.add("own-message");

  const nearBottom =
    list.scrollHeight - list.scrollTop - list.clientHeight < 30;

  list.appendChild(messageElement);

  if (nearBottom) {
    list.scrollTop = list.scrollHeight;
  }
}

input.addEventListener("input", () => {
  send.disabled = !input.value.trim() || !connected;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

send.addEventListener("click", sendMessage);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});
