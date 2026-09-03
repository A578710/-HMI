const CACHE = 'hmi-interactive-guide-v2';
const ASSETS = [
  './','./index.html','./manifest.webmanifest','./assets/css/styles.css','./assets/js/app.js','./assets/js/explorer.js',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/img/header_brand.webp','./assets/img/main.webp','./assets/img/diagnostics.webp',
  './assets/img/pumps.webp','./assets/img/settings.webp','./assets/img/schedule.webp',
  './assets/img/trendtabs.webp','./assets/img/journal.webp','./assets/img/alarms.webp'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
    const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return resp;
  }).catch(()=>caches.match('./index.html'))));
});
