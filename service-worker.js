const CACHE_NAME = 'mon-site-cache-v7';  // Version incrémentée pour forcer la mise à jour
const urlsToCache = [
  '/Mon-site/',
  '/Mon-site/index.html',
  '/Mon-site/mentions-legales.html',
  '/Mon-site/comment-ca-marche.html',
  '/Mon-site/style.css',
  '/Mon-site/portable.css',
  '/Mon-site/script.js',
  '/Mon-site/offline.js',
  '/Mon-site/Logo.png',
  '/Mon-site/nouvel-an.jpg',
  '/Mon-site/OpenSource.webp',
  '/Mon-site/404.html',
  '/Mon-site/robots.txt',
  '/Mon-site/sitemap.xml',
  'index.html',
  'mentions-legales.html',
  'comment-ca-marche.html',
  'style.css',
  'portable.css',
  'script.js',
  'offline.js',
  'Logo.png',
  'nouvel-an.jpg',
  'OpenSource.webp',
  '404.html',
  'robots.txt',
  'sitemap.xml'
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
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) return cachedResponse;
              
              // Essayer de trouver la page demandée avec différents chemins
              const url = new URL(event.request.url);
              const requestPath = url.pathname.split('/').pop() || 'index.html';
              
              // Essayer plusieurs chemins possibles
              const possiblePaths = [
                requestPath,
                `/${requestPath}`,
                `/Mon-site/${requestPath}`,
                'index.html',
                '/index.html',
                '/Mon-site/index.html'
              ];
              
              // Essayer chaque chemin jusqu'à trouver une correspondance
              return Promise.any(
                possiblePaths.map(path => 
                  caches.match(path)
                    .then(response => {
                      if (response) return response;
                      return Promise.reject('Not found');
                    })
                )
              ).catch(() => caches.match('index.html'));
            });
        })
    );
    return;
  }

  // Pour les autres requêtes (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        // Si la ressource est en cache, la retourner
        if (response) {
          return response;
        }
        
        // Sinon, essayer de la récupérer depuis le réseau
        return fetch(event.request)
          .then(networkResponse => {
            // Mettre en cache la réponse pour les requêtes réussies
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(async () => {
            // Si la requête échoue, essayer de trouver une ressource similaire
            const url = new URL(event.request.url);
            const requestPath = url.pathname.split('/').pop();
            
            // Si c'est une requête pour Material Icons, utiliser le fallback d'offline.js
            if (url.href.includes('material-icons')) {
              return new Response('', { status: 404 }); // offline.js gérera le remplacement
            }
            
            // Pour les images, essayer de trouver une image de remplacement
            if (event.request.destination === 'image') {
              const fallbackImages = [
                'Logo.png',
                'OpenSource.webp',
                'nouvel-an.jpg'
              ];
              
              // Essayer chaque image de remplacement
              for (const img of fallbackImages) {
                const cachedResponse = await caches.match(img);
                if (cachedResponse) return cachedResponse;
              }
            }
            
            // Pour les fichiers CSS et JS, essayer de les charger depuis le même répertoire
            if (event.request.destination === 'style' || 
                event.request.destination === 'script') {
              const cachedResponse = await caches.match(requestPath);
              if (cachedResponse) return cachedResponse;
            }
            
            // Pour les autres types de requêtes, renvoyer une réponse d'erreur
            return new Response('Ressource non disponible hors ligne', {
              status: 404,
              statusText: 'Non trouvé',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
