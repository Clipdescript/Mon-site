const CACHE_NAME = 'mon-site-cache-v8';  // Version incrémentée pour forcer la mise à jour

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
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
  '404.html'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  // Force l'activation immédiate du nouveau service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des fichiers statiques');
        // Ajouter chaque fichier un par un pour éviter les erreurs
        return cache.addAll(urlsToCache)
          .then(() => console.log('Toutes les ressources ont été mises en cache'))
          .catch(error => {
            console.error('Erreur lors de la mise en cache des ressources:', error);
            throw error; // Propage l'erreur pour échouer l'installation si nécessaire
          });
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
  
  // Ne pas mettre en cache les requêtes vers les APIs et les requêtes non-GET
  if (event.request.method !== 'GET' || 
      event.request.url.includes('api.') || 
      event.request.url.includes('open-meteo.com') || 
      event.request.url.includes('nominatim.openstreetmap.org')) {
    return;
  }

  // Pour les requêtes de navigation (pages HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre en cache la réponse pour une utilisation hors ligne
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur, essayer de servir depuis le cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // Si la page n'est pas en cache, servir index.html
              return cachedResponse || caches.match('index.html');
            });
        })
    );
    return;
  }

  // Pour les autres requêtes (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(cachedResponse => {
        // Si la ressource est en cache, la retourner
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Sinon, essayer de la récupérer depuis le réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Mettre en cache la réponse pour les requêtes réussies
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
              
            return response;
          })
          .catch(error => {
            console.error('Erreur de récupération:', error);
            
            // Si c'est une image, retourner une image par défaut
            if (event.request.destination === 'image') {
              return caches.match('Logo.png') || new Response('', { status: 404 });
            }
            
            // Pour les CSS et JS, retourner une réponse vide
            if (['style', 'script'].includes(event.request.destination)) {
              return new Response('', { status: 404 });
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
