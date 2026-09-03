// VYT BURGUER — Service Worker v2 (FCM push + cache)
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU',
  authDomain: 'vyt-music.firebaseapp.com',
  projectId: 'vyt-music',
  storageBucket: 'vyt-music.firebasestorage.app',
  messagingSenderId: '574981837817',
  appId: '1:574981837817:web:a29933a22bbfd51a086328'
});

const messaging = firebase.messaging();

// Push en background (tab cerrada o minimizada)
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || '🍔 ¡Tu pedido está listo!', {
    body: n.body || 'Pasá a retirar en el mostrador.',
    icon: '/imagenes/logo-96x96.png',
    badge: '/imagenes/logo-96x96.png',
    vibrate: [400, 150, 400, 150, 400],
    tag: 'pedido-burguer',
    requireInteraction: true,
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    for (const c of list) {
      if (c.url.includes('burguer_estado') && 'focus' in c) return c.focus();
    }
    return clients.openWindow('/burguer_estado.html');
  }));
});

const CACHE = 'vyt-burguer-v2';

const PRECACHE = [
  '/burguer.html',
  '/burguer_caja.html',
  '/burguer_cocina.html',
  '/burguer_despacho.html',
  '/burguer_admin.html',
  '/burguer_estado.html',
  '/firebase_config.js',
  '/imagenes/logo-96x96.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('vyt-burguer-') && k !== CACHE).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // No interceptar Firestore, Auth ni Storage (los maneja sw.js)
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('securetoken.googleapis.com') ||
      url.hostname.includes('firebasestorage.googleapis.com')) return;

  // Firebase SDK y Tailwind desde CDN — cache-first (acelera carga)
  if (url.hostname.includes('gstatic.com') || url.hostname.includes('tailwindcss.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          if (resp.ok) caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
          return resp;
        });
      })
    );
    return;
  }

  // Archivos propios: network-first para HTML, cache-first para assets
  if (url.origin === location.origin) {
    if (e.request.destination === 'document') {
      e.respondWith(
        fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        }).catch(() => caches.match(e.request))
      );
    } else {
      e.respondWith(
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(resp => {
            if (resp.ok) caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
            return resp;
          });
        })
      );
    }
  }
});
