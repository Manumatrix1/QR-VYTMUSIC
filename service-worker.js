// Service Worker para VYT MUSIC PWA
//
// Incluye también las notificaciones push (FCM) en el mismo archivo. Antes
// vivían separadas en firebase-messaging-sw.js, registrado también en scope
// "/" -- dos service workers distintos no pueden controlar el mismo scope al
// mismo tiempo, así que cada vez que este SW (el de la pantalla principal,
// que se visita todo el tiempo) se activaba, expulsaba al de mensajería y el
// token de push quedaba "huérfano": FCM lo marcaba como inválido en el
// próximo envío (por eso admin_fcm_tokens terminaba con TODOS los tokens en
// activo:false, sin excepción). Unificándolos en uno solo se evita la pelea
// de scope.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU",
    authDomain: "vyt-music.firebaseapp.com",
    projectId: "vyt-music",
    storageBucket: "vyt-music.firebasestorage.app",
    messagingSenderId: "574981837817",
    appId: "1:574981837817:web:a29933a22bbfd51a086328"
});

const messaging = firebase.messaging();

// Mostrar notificación cuando la app está en BACKGROUND o cerrada
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || '🎟️ VYT MUSIC';
    const body  = payload.notification?.body  || 'Tenés una notificación nueva';
    const link  = payload.data?.link || 'https://vyt-music.web.app/admin_preventa.html';

    self.registration.showNotification(title, {
        body,
        icon:  '/logo-192x192.png',
        badge: '/logo-72x72.png',
        tag:   'vyt-admin-notif',
        renotify: true,
        data: { link }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const link = event.notification.data?.link || 'https://vyt-music.web.app/admin_preventa.html';
    event.waitUntil(clients.openWindow(link));
});

const CACHE_NAME = 'vyt-music-v32';

// Solo cachear el mínimo indispensable para offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación: activar inmediatamente sin esperar
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activación: limpiar caches viejos y FORZAR RECARGA en todos los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        // Forzar recarga en todos los dispositivos al actualizarse el SW
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});

// Fetch: HTML siempre desde red, resto cache-first
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Firebase y APIs externas: siempre red
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('cdn') ||
    url.hostname.includes('unpkg') ||
    url.hostname.includes('cdnjs')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML: siempre red (nunca cache) — así los cambios se ven de inmediato
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
    );
    return;
  }

  // JS y CSS propios: red primero, cache de respaldo
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Resto (imágenes, fuentes, etc.): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') caches.delete(CACHE_NAME);
});
