const cacheName = 'v2';
const cacheAssets = [
    '/',
    '/index.html',
    '/index.js',
    '/lib/q23rp98u.js',
    '/style.css',
    'https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700&display=swap',
];
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(cacheName)
        .then(cache => {
        cache.addAll(cacheAssets);
    })
        .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cache => {
            if (cache !== cacheName) {
                return caches.delete(cache);
            }
        }));
    }));
});
self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
//# sourceMappingURL=sw.js.map