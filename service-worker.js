const CACHE_NAME = 'mon-site-cache-v11';

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
        console.log('Installation du Service Worker');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Cache ${url} failed:`, error.message);
              return null;
            });
          })
        );
      })
      .catch(error => {
        console.error('Service Worker install error:', error.message);
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
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Gestion des requêtes réseau
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET et les requêtes externes
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API calls and external services
  if (url.hostname.includes('api.') || 
      url.hostname.includes('open-meteo.com') || 
      url.hostname.includes('nominatim.openstreetmap.org') ||
      url.hostname.includes('fonts.googleapis.com')) {
    return;
  }

  // Strategy: Network first, then cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache).catch(err => {
              console.warn('Cache.put failed:', err.message);
            });
          });
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.mode === 'navigate') {
              return caches.match('./index.html').catch(() => {
                return new Response('Offline - Index not available', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
            }
            return new Response('Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
