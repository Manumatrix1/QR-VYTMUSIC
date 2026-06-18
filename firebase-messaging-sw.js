// Service Worker para Firebase Cloud Messaging (notificaciones push en background)
// Este archivo DEBE estar en la raíz del sitio para que FCM funcione.

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
        tag:   'vyt-admin-notif',    // reemplaza la anterior en vez de apilar
        renotify: true,
        data: { link }
    });
});

// Al hacer clic en la notificación → abrir el link de la acción
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const link = event.notification.data?.link || 'https://vyt-music.web.app/admin_preventa.html';
    event.waitUntil(clients.openWindow(link));
});
