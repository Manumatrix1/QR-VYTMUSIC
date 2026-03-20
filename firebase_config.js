// firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { initializeAuth, browserLocalPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { initializeFirestore, memoryLocalCache } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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
// initializeAuth con array de persistencia: intenta localStorage primero,
// si Edge/Safari lo bloquea con "Tracking Prevention", cae silenciosamente a memoria.
// Con getAuth(app) el SDK usaba localStorage por defecto y fallaba ruidosamente (8+ errores).
export const auth = initializeAuth(app, {
    persistence: [browserLocalPersistence, inMemoryPersistence]
});
// memoryLocalCache: Firestore nunca usa IndexedDB (soluciona Tracking Prevention en móvil)
export const db = initializeFirestore(app, { localCache: memoryLocalCache() });
export const storage = getStorage(app);