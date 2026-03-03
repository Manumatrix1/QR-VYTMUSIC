// firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Centralización de las credenciales de Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU", 
    authDomain: "vyt-music.firebaseapp.com",
    projectId: "vyt-music", 
    storageBucket: "vyt-music.firebasestorage.app", 
    messagingSenderId: "574981837817", 
    appId: "1:574981837817:web:a29933a22bbfd51a086328"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ========================================
// 🆕 MEJORA: PERSISTENCIA OFFLINE (Marzo 2026)
// Habilita caché local para funcionar sin internet
// NO afecta funcionalidad existente - solo agrega capacidad offline
// ========================================
enableIndexedDbPersistence(db).then(() => {
    console.log('✅ Persistencia offline habilitada - El sistema puede funcionar sin internet');
}).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('⚠️ Persistencia limitada: Múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Este navegador no soporta persistencia offline');
    } else {
        console.warn('⚠️ No se pudo habilitar persistencia:', err);
    }
    // Sistema sigue funcionando normalmente aunque falle la persistencia
});