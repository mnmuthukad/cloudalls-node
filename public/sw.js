const CACHE_NAME = 'cloudalls-static-v1';
const ASSETS_TO_CACHE = [
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/manifest.json',
];
const SECURE_ROUTES = ['/login', '/client/', '/corp/', '/dev/', '/finance/', '/system/', '/shared/', '/process-', '/careers_details'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch(() => undefined)
      .finally(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.filter((cache) => cache !== CACHE_NAME).map((cache) => caches.delete(cache))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    SECURE_ROUTES.some((route) => url.pathname.includes(route))
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const cacheControl = networkResponse.headers.get('cache-control') || '';
        if (networkResponse.ok && networkResponse.type === 'basic' && !cacheControl.includes('no-store')) {
          const responseToCache = networkResponse.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error())),
  );
});
