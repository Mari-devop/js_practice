const CACHE_VERSION = "v1";
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(["/offline.html"]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isStatic =
    /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|map)$/i.test(
      url.pathname
    );

  if (isStatic) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
    return;
  }

  if (
    request.mode === "navigate" ||
    (url.origin === location.origin && url.pathname.endsWith(".html"))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          const resp = await fetch(request);
          if (resp && resp.ok) cache.put(request, resp.clone());
          return resp;
        } catch (e) {
          const cached = await cache.match(request);
          return cached || (await caches.match("/offline.html"));
        }
      })()
    );
    return;
  }
});
