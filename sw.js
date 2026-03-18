const CACHE_NAME = 'vale-producao-2026-03-18-1136';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css?v=2026-03-18-1136',
  './css/desktop-fix.css?v=2026-03-18-1136',
  './css/campaigns.css?v=2026-03-18-1136',
  './css/content-plan.css?v=2026-03-18-1136',
  './css/presskit.css?v=2026-03-18-1136',
  './css/admin.css?v=2026-03-18-1136',
  './js/app.js?v=2026-03-18-1136',
  './js/utils.js',
  './js/data/questions.js',
  './js/data/build-info.js',
  './js/core/report.js',
  './js/core/analytics.js',
  './js/core/storage.js',
  './js/core/compare.js',
  './js/core/campaigns.js',
  './js/core/content-plan.js',
  './js/core/presskit.js',
  './js/core/admin.js',
  './js/core/commercial.js',
  './js/core/growth-suite.js',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';
  if(isNavigation){
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', clone)).catch(() => {});
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
