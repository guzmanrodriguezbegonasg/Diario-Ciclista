const CACHE_NAME = 'diario-ciclista-cache-v5'; // Incremented cache version
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
  // Los archivos TSX/JS ahora son cacheados por el manejador 'fetch' en la primera solicitud, no durante la instalación.
  // Esto es más robusto y evita errores si los archivos fuente no son directamente accesibles.
];

// Evento de instalación: cachear el app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        // Forzar al service worker en espera a convertirse en el service worker activo.
        return self.skipWaiting();
      })
      .catch(error => {
          console.error("Falló la instalación del Service Worker:", error);
      })
  );
});

// Evento de activación: limpiar cachés antiguas
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
        // Indicar al service worker activo que tome el control de la página inmediatamente.
        return self.clients.claim();
    })
  );
});

// Evento de fetch: Primero caché, y si no, red (Cache-first)
self.addEventListener('fetch', event => {
  // Solo queremos manejar las peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si tenemos una coincidencia en la caché, la devolvemos.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no hay coincidencia, vamos a la red.
        return fetch(event.request).then(networkResponse => {
            // Comprobar si recibimos una respuesta válida
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Necesitamos clonar la respuesta porque es un stream y solo se puede consumir una vez.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cachear el nuevo recurso para futuras peticiones.
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fallo en el fetch del Service Worker:', error);
            // Esto es crucial para que el navegador sepa que el fetch falló si no hay red ni caché.
            throw error;
        });
      })
  );
});
