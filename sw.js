// Service Worker - VYT MUSIC Offline Audio Cache
const CACHE_NAME = 'vytmusic-audio-v1';

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Interceptar todas las peticiones a Firebase Storage
self.addEventListener('fetch', event => {
    if (!event.request.url.includes('firebasestorage.googleapis.com')) return;
    event.respondWith(serveAudio(event.request));
});

async function serveAudio(request) {
    const cache = await caches.open(CACHE_NAME);
    const rangeHeader = request.headers.get('range');

    // Buscar en caché por URL (ignorando headers)
    const cached = await cache.match(request.url);

    if (cached) {
        // Si el browser pide un rango y tenemos el archivo completo, cortarlo
        if (rangeHeader) return sliceResponse(cached, rangeHeader);
        return cached;
    }

    // No está en caché → red
    try {
        if (rangeHeader) {
            // Responder el rango al browser Y en paralelo cachear el archivo completo
            const [rangeResp] = await Promise.all([
                fetch(request),
                fetchAndCache(cache, request.url)
            ]);
            return rangeResp;
        } else {
            const resp = await fetch(request);
            if (resp.ok) await cache.put(request.url, resp.clone());
            return resp;
        }
    } catch {
        return new Response(
            JSON.stringify({ error: 'Pista no disponible sin conexión' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

async function fetchAndCache(cache, url) {
    try {
        const resp = await fetch(new Request(url));
        if (resp.ok) await cache.put(url, resp);
    } catch { /* sin red, no pasa nada */ }
}

// Cortar un blob cacheado para responder range requests
async function sliceResponse(response, rangeHeader) {
    const blob = await response.clone().blob();
    const m = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
    if (!m) return response.clone();
    const start = parseInt(m[1]);
    const end = m[2] ? parseInt(m[2]) : blob.size - 1;
    const chunk = blob.slice(start, end + 1);
    return new Response(chunk, {
        status: 206,
        headers: {
            'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Range': `bytes ${start}-${end}/${blob.size}`,
            'Content-Length': String(chunk.size),
            'Accept-Ranges': 'bytes'
        }
    });
}

// Pre-caché masivo enviado desde la página con postMessage
self.addEventListener('message', event => {
    if (event.data?.type !== 'PRECACHE') return;
    const port = event.ports[0];
    precacheAll(event.data.urls, port);
});

async function precacheAll(urls, port) {
    const cache = await caches.open(CACHE_NAME);
    let done = 0;
    for (const url of urls) {
        try {
            if (!await cache.match(url)) {
                const resp = await fetch(new Request(url));
                if (resp.ok) await cache.put(url, resp);
            }
        } catch { /* URL no disponible */ }
        done++;
        port?.postMessage({ done, total: urls.length });
    }
    port?.postMessage({ done, total: urls.length, complete: true });
}

// Limpiar URLs ya no usadas
self.addEventListener('message', event => {
    if (event.data?.type !== 'CLEAR_CACHE') return;
    caches.delete(CACHE_NAME);
});
