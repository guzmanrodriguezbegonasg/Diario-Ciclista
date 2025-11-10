const CACHE_NAME = 'diario-ciclista-cache-v2'; // Incremented cache version
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/index.tsx',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event: Cache-first strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Network falling back to cache
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Check if we received a valid response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed, try the cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse;
          });
      })
    );
});