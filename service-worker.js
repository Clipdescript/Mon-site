const CACHE_NAME = 'mon-site-cache-v10';

// Fichiers essentiels à mettre en cache
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './portable.css',
  './script.js'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  
  // Mise en cache des fichiers essentiels
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Installation du Service Worker et mise en cache des ressources');
        // Mettre en cache chaque fichier individuellement pour éviter que l'un échoue bloque tous les autres
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Impossible de mettre en cache ${url}:`, error);
            });
          })
        );
      })
      .catch(error => {
        console.error('Erreur lors de l\'installation du Service Worker:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  // Suppression des anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  
  // Prendre le contrôle de tous les clients
  self.clients.claim();
});

// Gestion des requêtes réseau
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET et les requêtes API
  if (request.method !== 'GET' || 
      url.hostname.includes('api.') || 
      url.hostname.includes('open-meteo.com') || 
      url.hostname.includes('nominatim.openstreetmap.org')) {
    return;
  }

  // Stratégie: D'abord le réseau, puis le cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Mettre en cache la réponse si elle est valide
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec, chercher dans le cache
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si c'est une navigation et que la page n'est pas en cache, retourner index.html
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            // Retourner une réponse d'erreur au lieu de undefined
            return new Response('Ressource non disponible', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
