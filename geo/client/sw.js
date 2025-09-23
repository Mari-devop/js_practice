const CACHE = 'geo-audio-v1';
const PRELOAD = [
  './', './index.html', './style.css',
  './app.js', './audioEngine.js', './ws-client.js', './map.js', './geoutil.js',
  './data/pois.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRELOAD)));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav')) {
    e.respondWith(
      caches.match(req).then(cached => {
        const fetchAndCache = fetch(req).then(res => {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchAndCache;
      })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(res => {
      caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }).catch(() => caches.match(req))
  );
});
