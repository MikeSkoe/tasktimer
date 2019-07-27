const cacheName = 'v1';
const cacheAssets = [
   '/',
   '/index.html',
   '/index.js',
   '/lib/q23rp98u.js',
   '/style.css',
];

self.addEventListener('install', (e: any) => {
   e.waitUntil(
      caches.open(cacheName)
         .then(cache => {
            cache.addAll(cacheAssets);
         })
         .then(() => (self as any).skipWaiting())
   );
});

self.addEventListener('activate', (e: any) => {
   e.waitUntil(
      caches.keys().then(cacheNames => {
         return Promise.all(
            cacheNames.map(cache => {
               if (cache !== cacheName) {
                  return caches.delete(cache);
               }
            })
         )
      })
   );
});

self.addEventListener('fetch', (e: any) => {
   e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
   );
});
