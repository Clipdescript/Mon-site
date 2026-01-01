const CACHE_NAME = 'mon-site-cache-v9';

// Fichiers essentiels à mettre en cache
const urlsToCache = [
  '/Mon-site/index.html',
  '/Mon-site/mentions-legales.html',
  '/Mon-site/comment-ca-marche.html',
  '/Mon-site/style.css',
  '/Mon-site/portable.css',
  '/Mon-site/script.js',
  '/Mon-site/offline.js',
  '/Mon-site/Logo.png',
  '/Mon-site/404.html'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  
  // Mise en cache des fichiers essentiels
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Installation du Service Worker et mise en cache des ressources');
        return cache.addAll(urlsToCache);
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
        if (response.status === 200) {
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
            // Si c'est une navigation et que la page n'est pas en cache, retourner index.html
            if (request.mode === 'navigate' && !cachedResponse) {
              return caches.match('/Mon-site/index.html');
            }
            return cachedResponse;
          });
      })
  );
});
