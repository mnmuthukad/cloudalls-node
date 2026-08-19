const CACHE_NAME = 'cloudalls-static-v3';
const ASSETS_TO_CACHE = [
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/manifest.json',
];
const SECURE_ROUTES = ['/login', '/client/', '/corp/', '/dev/', '/finance/', '/system/', '/shared/', '/process-', '/careers/'];

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

  // Only intercept the small set of whitelisted static assets.
  // Everything else (pages, fonts, icons, images, API) is always fetched
  // fresh from the network — never served from a stale cache.
  if (!ASSETS_TO_CACHE.includes(url.pathname)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              event.waitUntil(cache.put(event.request, networkResponse.clone()));
            }
            return networkResponse;
          })
          .catch(() => cached || Response.error());
        return cached || fetchPromise;
      }),
    ),
  );
});
