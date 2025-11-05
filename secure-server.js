const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const HTTP_PORT = 8000;
const HTTPS_PORT = 8443;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Certificado autofirmado para desarrollo local
const cert = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDJ3+9x9v5pGjANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhs
b2NhbGhvc3QwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjATMREwDwYD
VQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
-----END CERTIFICATE-----`;

const key = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7l1sP2JqJ...
-----END PRIVATE KEY-----`;

const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to scanner
    if (pathname === '/') {
        pathname = '/escaner_inteligente_integrado.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.parse(filePath).ext;
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    // Security headers for camera access
    const headers = {
        'Content-Type': mimeType,
        'Permissions-Policy': 'camera=self',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
    };
    
    // Check if file exists
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found');
            return;
        }
        
        // Read and serve file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('500 Internal Server Error');
                return;
            }
            
            res.writeHead(200, headers);
            res.end(data);
        });
    });
};

// HTTP Server (redirect to HTTPS)
const httpServer = http.createServer((req, res) => {
    const redirectUrl = `https://localhost:${HTTPS_PORT}${req.url}`;
    res.writeHead(301, { 'Location': redirectUrl });
    res.end();
});

// HTTPS Server for camera access
let httpsServer;
try {
    // Intenta usar certificados si están disponibles
    const options = {
        key: fs.readFileSync('server.key').toString(),
        cert: fs.readFileSync('server.crt').toString()
    };
    httpsServer = https.createServer(options, requestHandler);
} catch (e) {
    console.log('⚠️  No se encontraron certificados SSL, usando HTTP solamente');
    // Solo HTTP si no hay certificados
    httpServer.listen(HTTP_PORT, () => {
        console.log(`🚀 Servidor HTTP iniciado en http://localhost:${HTTP_PORT}`);
        console.log(`📱 Escáner disponible en: http://localhost:${HTTP_PORT}/escaner_inteligente_integrado.html`);
        console.log(`⚠️  NOTA: Chrome puede requerir HTTPS para acceso a cámara`);
        console.log(`💡 SOLUCIÓN: Usa Chrome con --unsafely-treat-insecure-origin-as-secure=http://localhost:${HTTP_PORT}`);
    });
    return;
}

// Si tenemos certificados, usar HTTPS
httpServer.listen(HTTP_PORT, () => {
    console.log(`🔄 Servidor HTTP (redirige a HTTPS) en puerto ${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`🔒 Servidor HTTPS iniciado en https://localhost:${HTTPS_PORT}`);
    console.log(`📱 Escáner seguro disponible en: https://localhost:${HTTPS_PORT}/escaner_inteligente_integrado.html`);
    console.log(`✅ Acceso a cámara permitido con HTTPS`);
});