const CACHE_NAME = 'totem-pf-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Responde às requisições e cria um "modo offline" falso para agradar o Chrome
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => new Response('Você está offline.'))
    );
});
