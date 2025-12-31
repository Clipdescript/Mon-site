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
  // Pour les requêtes d'API
  if (event.request.url.includes('api.open-meteo.com') || 
      event.request.url.includes('nominatim.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mise en cache des réponses API
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pour les autres requêtes
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetchAndCache(event.request))
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Fonction utilitaire pour mettre en cache les nouvelles réponses
function fetchAndCache(request) {
  return fetch(request).then(response => {
    // Vérifier si la réponse est valide
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    // Mettre en cache la réponse
    const responseToCache = response.clone();
    caches.open(CACHE_NAME)
      .then(cache => cache.put(request, responseToCache));
    return response;
  });
}

