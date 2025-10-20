// Service Worker para VYT MUSIC PWA
const CACHE_NAME = 'vyt-music-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/votacion_jurados_FINAL.html',
  '/manifest.json',
  '/imagenes/logo-192x192.png',
  '/imagenes/logo-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde cache si existe, sino fetch de la red
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Actualización del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});