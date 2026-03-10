// Service Worker para Reproductor de Gala - VYT MUSIC
// Cache offline de pistas de audio

const CACHE_NAME = 'vyt-gala-audio-v1';
const CACHE_URLS = [
    './reproductor_gala.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🎵 SW Gala: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ SW Gala: Cache abierto');
            return cache.addAll(CACHE_URLS);
        })
    );
    
    self.skipWaiting();
});

// Activación y limpieza de caches viejos
self.addEventListener('activate', (event) => {
    console.log('🎵 SW Gala: Activando...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('vyt-gala-')) {
                        console.log('🗑️ SW Gala: Eliminando cache viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // Solo interceptar audio files de Firebase Storage
    if (url.includes('firebasestorage.googleapis.com') && 
        (url.includes('.mp3') || url.includes('.wav') || url.includes('/pistas/'))) {
        
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('🎵 Sirviendo desde cache:', url.substring(0, 100));
                    return cachedResponse;
                }
                
                console.log('📡 Descargando y cacheando:', url.substring(0, 100));
                return fetch(event.request).then((response) => {
                    // No cachear si la respuesta no es exitosa
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    // Clonar la respuesta porque solo se puede usar una vez
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                }).catch((error) => {
                    console.error('❌ Error descargando audio:', error);
                    throw error;
                });
            })
        );
    } 
    // Para otros recursos, estrategia network-first
    else {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});

// Mensaje desde la app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_AUDIO') {
        console.log('📥 Solicitud de cache:', event.data.url);
        
        caches.open(CACHE_NAME).then((cache) => {
            fetch(event.data.url).then((response) => {
                cache.put(event.data.url, response);
            });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🗑️ Limpiando cache...');
        caches.delete(CACHE_NAME);
    }
});
