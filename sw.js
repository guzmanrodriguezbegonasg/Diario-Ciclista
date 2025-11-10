const CACHE_NAME = 'diario-ciclista-cache-v8'; // VERSIÓN FINAL Y CORRECTA
// Lista de archivos MÍNIMA y ESENCIAL.
// El resto de los archivos (.tsx, etc.) se cachearán dinámicamente la primera vez que se pidan.
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Evento de instalación: cachear el app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell essentials');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        // Forzar al service worker en espera a convertirse en el service worker activo.
        return self.skipWaiting();
      })
      .catch(error => {
          // Este log es crucial para depurar. Si esto aparece, la instalación falló.
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
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
    })
  );
});

// Evento de fetch: Primero caché, y si no, red (Cache-first, with dynamic caching)
self.addEventListener('fetch', event => {
  // Solo queremos manejar las peticiones GET para nuestra app.
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
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
                // Cachear el nuevo recurso (ej. los archivos .tsx) para futuras peticiones.
                console.log('Service Worker: Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fallo en el fetch del Service Worker:', error);
            // Si no hay red ni caché, la petición fallará. Esto es normal en modo offline.
            throw error;
        });
      })
  );
});
