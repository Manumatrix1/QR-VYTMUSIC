/**
 * admin-push.js — Notificaciones push para el admin (FCM)
 *
 * Uso en cualquier página admin:
 *   <script type="module" src="./admin-push.js"></script>
 *   <div id="push-activation-area"></div>  ← opcional, muestra el botón de activación
 *
 * CONFIGURACIÓN REQUERIDA:
 *   Reemplazá VAPID_KEY con la clave de tu proyecto:
 *   Firebase Console → Proyecto vyt-music → ⚙️ Configuración → Cloud Messaging
 *   → Configuración web → "Generar par de claves" → copiar la clave
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// ⚠️ REEMPLAZAR con la VAPID Key de Firebase Console > Cloud Messaging > Configuración web
const VAPID_KEY = 'BBKbIhJ_QZT961HvpRbYY4aPit24e3P-D9NZ9CHFFFobsFx5mmjBhKX-IZUyxJNKhQmOlGpUZ-cDibzJN4qD7_A';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU",
    authDomain: "vyt-music.firebaseapp.com",
    projectId: "vyt-music",
    storageBucket: "vyt-music.firebasestorage.app",
    messagingSenderId: "574981837817",
    appId: "1:574981837817:web:a29933a22bbfd51a086328"
};

// Reutilizar app si ya está inicializada (evita duplicados)
const app = getApps().find(a => a.name === '[DEFAULT]') || initializeApp(FIREBASE_CONFIG);
// Lazy init: messaging puede fallar si el navegador no soporta SW
let _messaging = null;
let _db = null;
function getMsg() { if (!_messaging) _messaging = getMessaging(app); return _messaging; }
function getDB()  { if (!_db) _db = getFirestore(app); return _db; }

// ─────────────────────────────────────────────
// Registrar token FCM del dispositivo en Firestore
// ─────────────────────────────────────────────
async function registrarTokenAdmin() {
    try {
        if (!('Notification' in window)) {
            console.warn('Este navegador no soporta notificaciones.');
            return null;
        }

        // Registrar el service worker -- antes usaba /firebase-messaging-sw.js
        // aparte, pero al compartir el scope "/" con service-worker.js (el de
        // la PWA general) se pisaban entre sí y el token de push quedaba
        // huérfano cada vez que se visitaba cualquier otra página. Ahora los
        // mensajes de background de FCM están fusionados en service-worker.js.
        const swReg = await navigator.serviceWorker.register('/service-worker.js');
        // Esperar a que el SW esté activo o en espera
        await new Promise(resolve => {
            if (swReg.active || swReg.waiting || swReg.installing) { resolve(); return; }
            swReg.addEventListener('updatefound', () => resolve());
            setTimeout(resolve, 3000); // fallback
        });

        const token = await getToken(getMsg(), {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swReg
        });

        if (!token) {
            console.warn('No se obtuvo token FCM — el usuario puede haber bloqueado las notificaciones.');
            return null;
        }

        // Guardar token en Firestore (clave = token, así no hay duplicados)
        await setDoc(doc(getDB(), 'admin_fcm_tokens', token), {
            token,
            dispositivo: navigator.userAgent.substring(0, 120),
            activadoEn: serverTimestamp(),
            activo: true
        });

        console.log('✅ Token FCM registrado:', token.substring(0, 20) + '...');
        return token;
    } catch (err) {
        console.error('Error registrando token FCM:', err);
        return null;
    }
}

// ─────────────────────────────────────────────
// Manejar notificaciones cuando la app está ABIERTA (foreground)
// ─────────────────────────────────────────────
onMessage(getMsg(), (payload) => {
    const title = payload.notification?.title || '🎟️ VYT MUSIC';
    const body  = payload.notification?.body  || '';
    const link  = payload.data?.link;

    // Mostrar notificación nativa del navegador
    if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
            body,
            icon: '/logo-192x192.png',
            tag: 'vyt-admin-foreground'
        });
        if (link) notif.onclick = () => window.open(link, '_blank');
    }

    // También mostrar toast en la página
    mostrarToastAdmin(title, body, link);
});

function mostrarToastAdmin(title, body, link) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 16px; right: 16px; z-index: 9999;
        background: #1e293b; border: 2px solid #f59e0b;
        border-radius: 12px; padding: 16px 20px; max-width: 340px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5); cursor: pointer;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <style>@keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }</style>
        <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:24px">🔔</span>
            <div style="flex:1;">
                <p style="font-weight:bold;color:#f59e0b;margin:0 0 4px;">${title}</p>
                <p style="color:#e2e8f0;font-size:13px;margin:0;">${body}</p>
            </div>
            <button onclick="this.closest('div[style]').remove()" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;padding:0;line-height:1;">✕</button>
        </div>
    `;
    if (link) toast.onclick = (e) => { if (e.target.tagName !== 'BUTTON') window.open(link, '_blank'); };
    document.body.appendChild(toast);
    setTimeout(() => { try { toast.remove(); } catch(e){} }, 8000);
}

// ─────────────────────────────────────────────
// UI: Botón de activación (se inserta en #push-activation-area si existe)
// ─────────────────────────────────────────────
async function initPushUI() {
    const area = document.getElementById('push-activation-area');

    if (Notification.permission === 'granted') {
        if (area) area.innerHTML = `<div style="padding:8px 14px;background:#1e3a2f;border:1px solid #059669;border-radius:8px;font-size:13px;color:#6ee7b7;">⏳ Registrando token...</div>`;
        const token = await registrarTokenAdmin();
        if (area) {
            if (token) {
                area.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:#064e3b;border:1px solid #059669;border-radius:8px;font-size:13px;color:#6ee7b7;">
                    🔔 Notificaciones push activas — <span style="opacity:0.6">${token.substring(0,10)}...</span>
                </div>`;
            } else {
                area.innerHTML = `<div style="padding:8px 14px;background:#451a03;border:1px solid #d97706;border-radius:8px;font-size:13px;color:#fcd34d;">
                    ⚠️ Permiso OK pero no se pudo registrar el token
                    <button onclick="window._reintentarPush()" style="margin-left:10px;padding:4px 10px;background:#d97706;border:none;border-radius:6px;color:white;font-size:12px;cursor:pointer;">Reintentar</button>
                </div>`;
            }
        }
    } else if (Notification.permission === 'denied') {
        if (area) {
            area.innerHTML = `<div style="padding:8px 14px;background:#450a0a;border:1px solid #dc2626;border-radius:8px;font-size:13px;color:#fca5a5;">
                🔕 Notificaciones bloqueadas — habilitarlas desde la configuración del navegador
            </div>`;
        }
    } else {
        // No decidió todavía — mostrar botón
        if (area) {
            area.innerHTML = `<button id="btn-activar-push" style="display:flex;align-items:center;gap:8px;padding:10px 18px;background:#d97706;border:none;border-radius:8px;color:white;font-weight:bold;font-size:14px;cursor:pointer;">
                🔔 Activar notificaciones push en este dispositivo
            </button>`;
            document.getElementById('btn-activar-push').onclick = activarNotificaciones;
        }
    }
}

window._reintentarPush = async function() {
    const area = document.getElementById('push-activation-area');
    if (area) area.innerHTML = `<div style="padding:8px 14px;background:#1e3a2f;border:1px solid #059669;border-radius:8px;font-size:13px;color:#6ee7b7;">⏳ Reintentando...</div>`;
    const token = await registrarTokenAdmin();
    if (area) {
        if (token) {
            area.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:#064e3b;border:1px solid #059669;border-radius:8px;font-size:13px;color:#6ee7b7;">
                ✅ Token registrado — <span style="opacity:0.6">${token.substring(0,10)}...</span>
            </div>`;
        } else {
            area.innerHTML = `<div style="padding:8px 14px;background:#450a0a;border:1px solid #dc2626;border-radius:8px;font-size:13px;color:#fca5a5;">
                ❌ Falló — abrí la consola del navegador para ver el error detallado
            </div>`;
        }
    }
};

async function activarNotificaciones() {
    const btn = document.getElementById('btn-activar-push');
    if (btn) { btn.textContent = '⏳ Activando...'; btn.disabled = true; }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        if (btn) { btn.textContent = '❌ Permiso denegado'; }
        return;
    }

    const token = await registrarTokenAdmin();
    const area = document.getElementById('push-activation-area');
    if (area) {
        area.innerHTML = token
            ? `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:#064e3b;border:1px solid #059669;border-radius:8px;font-size:13px;color:#6ee7b7;">
                ✅ ¡Notificaciones activadas! Recibirás alertas en este dispositivo.
               </div>`
            : `<div style="padding:8px 14px;background:#450a0a;border:1px solid #dc2626;border-radius:8px;font-size:13px;color:#fca5a5;">
                ❌ Error al activar — revisá que el VAPID_KEY esté configurado en admin-push.js
               </div>`;
    }
}

// Arrancar al cargar el script
initPushUI();
