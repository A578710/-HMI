/* HMI Manual v3.7 — legacy service-worker cleanup.
   This file exists only so browsers with an older registered worker receive an update,
   delete stale caches and unregister the worker. The manual then works network-first. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
      await self.registration.unregister();
      for (const client of clients) {
        try {
          const url = new URL(client.url);
          if (!url.searchParams.has('v37')) {
            url.searchParams.set('v37','1');
            await client.navigate(url.href);
          }
        } catch (_) {}
      }
    } catch (_) {}
  })());
});
