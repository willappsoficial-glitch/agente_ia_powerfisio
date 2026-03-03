// Service Worker Básico para habilitar a instalação PWA
const CACHE_NAME = 'totem-powerfisio-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Permite que os dados passem direto para não interferir na sua busca do Google Sheets
});
