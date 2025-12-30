// Version du cache - incrémenter pour forcer la mise à jour
const CACHE_VERSION = 'v4';
const CACHE_NAME = `mon-site-cache-${CACHE_VERSION}`;

// Fichiers à mettre en cache lors de l'installation
const FILES_TO_CACHE = [
  './',
  './index.html',
  './404.html',
  './style.css',
  './portable.css',
  './script.js',
  './Logo.png',
  './nouvel-an.jpg',
  // Icônes météo SVG
  './Soleil sans nuage.svg',
  './Soleil partiellement couvert.svg',
  './Nuage passant devant le soleil.svg',
  './Nuage passant derriere le soleil.svg',
  './Nuageux.svg',
  './Nuage avec averse.svg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers');
        return cache.addAll(FILES_TO_CACHE.map(file => new Request(file, { cache: 'reload' })));
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de la mise en cache:', error);
      })
  );
  // Force l'activation immédiate du nouveau service worker
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes vers les APIs externes (météo, géolocalisation)
  if (event.request.url.includes('api.open-meteo.com') || 
      event.request.url.includes('nominatim.openstreetmap.org') ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    // Pour les APIs, utiliser la stratégie réseau d'abord, puis cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si la requête réussit, mettre à jour le cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si le réseau échoue, essayer le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Pour les fichiers statiques, utiliser la stratégie cache d'abord
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si trouvé dans le cache, retourner la version mise en cache
        if (cachedResponse) {
          return cachedResponse;
        }
        // Sinon, faire une requête réseau
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // Si la requête échoue et que c'est une navigation, retourner index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

