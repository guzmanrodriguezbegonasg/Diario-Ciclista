const CACHE_NAME = 'diario-ciclista-cache-v3'; // Incremented cache version for update
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/Stats.tsx',
  '/components/EntryForm.tsx',
  '/components/EntryList.tsx',
  '/components/EntryItem.tsx',
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
      .then(() => {
        return self.skipWaiting();
      })
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
    .then(() => {
        return self.clients.claim();
    })
  );
});

// Fetch event: Cache-first, falling back to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a match in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If no match, fetch from the network.
        return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            throw error;
        });
      })
  );
});