const CACHE = 'hmi-service-guide-v2-7';
const ASSETS = [
  './','./index.html','./manifest.webmanifest','./assets/css/styles.css','./assets/js/app.js','./assets/js/explorer.js',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/img/brand-logo.webp','./assets/img/brand-mark.webp','./assets/img/main.webp','./assets/img/diagnostics.webp',
  './assets/img/pumps.webp','./assets/img/settings.webp','./assets/img/settings-main.webp','./assets/img/settings-delays.webp','./assets/img/settings-drive.webp','./assets/img/settings-pid.webp','./assets/img/service-io.webp','./assets/img/service-cascade.webp','./assets/img/service-modbus.webp','./assets/img/service-states.webp','./assets/img/schedule.webp',
  './assets/img/trendtabs.webp','./assets/img/journal.webp','./assets/img/alarms.webp','./assets/img/main-card.webp','./assets/img/settings-card.webp','./assets/img/schedule-card.webp','./assets/img/trendtabs-card.webp','./assets/img/journal-card.webp','./assets/img/alarms-card.webp','./assets/img/settings-main-card.webp','./assets/img/settings-delays-card.webp','./assets/img/settings-drive-card.webp','./assets/img/settings-pid-card.webp','./assets/img/service-io-card.webp','./assets/img/service-cascade-card.webp','./assets/img/service-modbus-card.webp','./assets/img/service-states-card.webp'
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
