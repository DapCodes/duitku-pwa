const CACHE_NAME = 'duitku-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/mascout.png',
  '/assets/mascout2.png',
  '/assets/mascout3.png'
];

const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

// Install: cache critical assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately without waiting for old SW to release
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache local assets - these must succeed
      await Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Skip cache:', url, err))
        )
      );
      // Cache external assets - best effort
      await Promise.allSettled(
        EXTERNAL_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Skip external cache:', url, err))
        )
      );
    })
  );
});

// Activate: claim all clients immediately + clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all open pages immediately
      self.clients.claim(),
      // Remove old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
    ])
  );
});

// Fetch: Network-first for navigations, Cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the latest version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // All other requests: Cache-first with network fallback
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(response => {
        // Only cache successful responses from our origin or known CDNs
        if (response.ok && (request.url.startsWith(self.location.origin) || 
            request.url.includes('googleapis.com') || 
            request.url.includes('gstatic.com') ||
            request.url.includes('cdn.jsdelivr.net'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Return offline fallback for image requests
        if (request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
