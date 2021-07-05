// https://vaadin.com/learn/tutorials/learn-pwa/turn-website-into-a-pwa

self.addEventListener('install', async event => {
    console.log('SW install');
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
});

self.addEventListener('fetch', async event => {
    console.log('SW fetch');
    const req = event.request;
    event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(req);
    return cachedResponse || fetch(req);
}

const cacheName = 'uzevius-v1';
const staticAssets = [
    './',
    './index.html',
    './code.js',
    './style.css',
    './data/points.geojson'
];