self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("chatgpt-study-cache-v2").then(cache => {
      return cache.addAll([
        "/",
        "/manifest.json",
        "/icon-192.png",
        "/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});