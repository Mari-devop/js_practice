const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const users = new Set();

function broadcastMessage(raw) {
  for (const client of users) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  }
}

function broadcastOnlineUsers() {
  const payload = JSON.stringify({ type: "online", count: users.size });
  broadcastMessage(payload);
}

function noop() {}
function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", (ws, req) => {
  console.log("Новий користувач підключився");

  ws.isAlive = true;
  ws.on("pong", heartbeat);

  users.add(ws);
  broadcastOnlineUsers();

  ws.on("message", (message) => {
    console.log("Отримано повідомлення:", message.toString());
    broadcastMessage(message.toString());
  });

  ws.on("close", () => {
    users.delete(ws);
    broadcastOnlineUsers();
  });

  ws.on("error", (err) => {
    console.error("WS error:", err.message);
    try { ws.close(); } catch (_) {}
  });
});

const interval = setInterval(() => {
  for (const ws of users) {
    if (ws.isAlive === false) {
      try { ws.terminate(); } catch (_) {}
      users.delete(ws);
      continue;
    }
    ws.isAlive = false;
    ws.ping(noop);
  }
  broadcastOnlineUsers();
}, 30000);

wss.on("close", () => clearInterval(interval));

server.listen(PORT, () => {
  console.log(`Сервер працює на http://localhost:${PORT}`);
});
