const CACHE_NAME = "chatgpt-study-cache-v3";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg"
];

// インストール時: 新しいキャッシュを作成し、即座にアクティブ化
self.addEventListener("install", e => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(urlsToCache);
    }).then(() => {
      // 新しいService Workerを即座にアクティブ化
      return self.skipWaiting();
    })
  );
});

// アクティベート時: 古いキャッシュを削除
self.addEventListener("activate", e => {
  console.log("[Service Worker] Activate");
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // すべてのクライアントで新しいService Workerを即座に有効化
      return self.clients.claim();
    })
  );
});

// フェッチ時: キャッシュ優先、なければネットワークから取得
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(e.request).then(response => {
        // 有効なレスポンスのみキャッシュに追加
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });
        return response;
      });
    })
  );
});