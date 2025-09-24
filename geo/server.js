const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const mime = require('mime-types');

const PORT = 3032;
const CLIENT_DIR = path.join(__dirname, 'client');

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(CLIENT_DIR, decodeURI(urlPath));

  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const ct = mime.lookup(filePath) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

const pois = JSON.parse(
  fs.readFileSync(path.join(CLIENT_DIR, 'data', 'pois.json'), 'utf8')
);

const toRad = (x) => x * Math.PI / 180;
function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const s1 = Math.sin(dLat/2)**2;
  const s2 = Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}
function isInside(user, poi) {
  return distanceMeters(user, poi.coords) <= poi.radius;
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'POIS', pois }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'LOCATION') {
      const user = { lat: msg.lat, lng: msg.lng };

      const inside = pois
        .filter(p => isInside(user, p))
        .map(p => ({ p, dist: distanceMeters(user, p.coords) }))
        .sort((a,b) => (a.dist - b.dist) || (a.p.priority - b.p.priority));

      const active = inside[0]?.p || null;

      const prefetch = pois
        .map(p => ({ url: p.audio, d: distanceMeters(user, p.coords) }))
        .sort((a,b) => a.d - b.d)
        .slice(0, 3)
        .map(x => x.url);

      ws.send(JSON.stringify({
        type: 'NEARBY',
        active: active ? { id: active.id, title: active.title, audio: active.audio } : null,
        prefetch
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Geo-Audio-WS running at http://localhost:${PORT}`);
});
