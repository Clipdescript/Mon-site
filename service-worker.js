const CACHE_NAME = 'mon-site-cache-v4';
const urlsToCache = [
  '/Mon-site/',
  '/Mon-site/index.html',
  '/Mon-site/mentions-legales.html',
  '/Mon-site/style.css',
  '/Mon-site/portable.css',
  '/Mon-site/script.js',
  '/Mon-site/Logo.png',
  '/Mon-site/nouvel-an.jpg',
  '/Mon-site/OpenSource.webp'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des fichiers statiques');
        // Ajouter chaque fichier un par un pour éviter les erreurs
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url, { cache: 'no-store' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                console.warn(`Impossible de mettre en cache ${url}: ${response.status}`);
              })
              .catch(error => {
                console.warn(`Erreur lors de la mise en cache de ${url}:`, error);
              });
          })
        );
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Gestion des requêtes réseau
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  const path = requestUrl.pathname;
  
  // Ne pas mettre en cache les requêtes vers les APIs
  if (event.request.url.includes('api.') || 
      event.request.url.includes('open-meteo.com') || 
      event.request.url.includes('nominatim.openstreetmap.org')) {
    return;
  }

  // Pour les requêtes de navigation
  if (event.request.mode === 'navigate') {
    // Pour la page des mentions légales
    if (path.endsWith('mentions-legales.html')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Mettre en cache la réponse pour une utilisation hors ligne
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => {
            // Essayer de récupérer depuis le cache
            return caches.match('mentions-legales.html')
              .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                // Si la page n'est pas dans le cache, rediriger vers index.html
                return caches.match('index.html');
              });
          })
      );
    } else {
      // Pour les autres pages
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Mettre en cache la réponse pour une utilisation ultérieure
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => caches.match('index.html'))
      );
    }
    return;
  }

  // Pour les autres requêtes
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si la ressource est en cache, la renvoyer
        if (cachedResponse) {
          return cachedResponse;
        }
        // Sinon, essayer le réseau
        return fetch(event.request)
          .then(response => {
            // Si la réponse est valide, la mettre en cache
            if (response && response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, renvoyer une réponse par défaut si c'est une image
            if (event.request.destination === 'image') {
              return new Response(
                '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Image non disponible</title><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
                { 
                  headers: { 
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                  }
                }
              );
            }
            // Pour les autres types de requêtes, renvoyer une réponse vide
            return new Response('Ressource non disponible hors ligne', { 
              status: 404, 
              statusText: 'Hors ligne',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});


