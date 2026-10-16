// Versión simple de service worker: cache app shell + respuestas offline.
// Ajusta CACHE_NAME si cambias la app.
const CACHE_NAME = 'proximos-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/icon.svg'
  // No incluyo la fuente externa por CORS, el navegador la solicitará en red.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Para navegación (SPA) devolvemos index.html del cache si falla la red.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(()=>caches.match('/index.html'))
    );
    return;
  }
  // Para otros recursos: cache-first, fallback a red
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).catch(()=>cached))
  );
});
