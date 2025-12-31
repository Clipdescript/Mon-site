const CACHE_NAME = 'mon-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/mentions-legales.html',
  '/style.css',
  '/portable.css',
  '/script.js',
  '/Logo.png',
  '/nouvel-an.jpg',
  '/OpenSource.webp',
  '/Soleil sans nuage.svg',
  '/Soleil partiellement couvert.svg',
  '/Nuage passant devant le soleil.svg',
  '/Nuage passant derriere le soleil.svg',
  '/Nuageux.svg',
  '/Nuage avec averse.svg'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des fichiers statiques');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
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
    })
  );
  self.clients.claim();
});

// Gestion des requêtes réseau
self.addEventListener('fetch', event => {
  // Ne pas mettre en cache les requêtes vers les APIs
  if (event.request.url.includes('api.open-meteo.com') || 
      event.request.url.includes('nominatim.openstreetmap.org')) {
    return;
  }

  // Pour les requêtes de navigation, toujours essayer de renvoyer index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .catch(() => fetch(event.request))
    );
    return;
  }

  // Pour les autres requêtes, essayer d'abord le cache, puis le réseau
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
            if (response && response.status === 200 && response.type === 'basic') {
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
                { headers: { 'Content-Type': 'image/svg+xml' }}
              );
            }
            // Pour les autres types de requêtes, renvoyer une réponse vide
            return new Response('', { status: 404, statusText: 'Hors ligne' });
          });
      })
  );
});


