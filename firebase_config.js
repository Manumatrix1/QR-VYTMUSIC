// firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
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
export const auth = getAuth(app);
// Usar memoryLocalCache en lugar de IndexedDbPersistence para evitar
// conflictos con "Tracking Prevention" en Edge/Safari móvil
export const db = initializeFirestore(app, { localCache: memoryLocalCache() });
export const storage = getStorage(app);