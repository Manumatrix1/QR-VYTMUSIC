// Service Worker para VYT MUSIC PWA - VERSIÓN PANEL SIMPLIFICADO
const CACHE_NAME = 'vyt-music-simple-v18'; // 🔥 Actualizado 2026-03-22
const urlsToCache = [
  '/',
  '/index.html',
  '/eventos.html',
  '/manifest.json'
];

// URLs que NO deben ser cacheadas (para funcionalidad en tiempo real)
const noCacheUrls = [
  '/firebase_config.js',
  '/test_camara_directo.html',
  '/escaner_rapido.html',
  '/escaner_qr_final.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando v3 (Panel Simplificado)');
  // Forzar activación inmediata
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache abierto con soporte de cámara');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requests con lógica inteligente
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // No cachear URLs específicas
  if (noCacheUrls.some(noCache => url.pathname.includes(noCache))) {
    console.log('🚫 No caching:', url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }
  
  // No cachear requests de API o Firebase
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Estrategia de cache: Network First para páginas principales
  if (url.pathname.includes('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si hay respuesta de red, actualizar cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, usar cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para otros recursos, usar cache first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Actualización del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando v2');
  // Tomar control inmediatamente
  self.clients.claim();
  
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

// Manejar mensajes del cliente (para limpiar cache manualmente)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 Limpiando cache por solicitud del cliente');
    caches.delete(CACHE_NAME).then(() => {
      console.log('✅ Cache limpiado');
    });
  }
});