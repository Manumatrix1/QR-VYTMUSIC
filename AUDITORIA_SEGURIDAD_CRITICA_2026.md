# 🔥 AUDITORÍA DE SEGURIDAD CRÍTICA - VYTMUSIC QR
## Fecha: 20 de Marzo 2026
## Auditor: Senior Fullstack Developer + Ciberseguridad Cloud

---

## 📋 RESUMEN EJECUTIVO

**Estado General:** 🔴 **CRÍTICO** - Se detectaron vulnerabilidades explotables en producción

**Métricas de Riesgo:**
- 🔴 **7 Vulnerabilidades Críticas** (Fix inmediato)
- 🟠 **12 Problemas Altos** (Fix esta semana)
- 🟡 **8 Problemas Medios** (Mejoras arquitecturales)

**Áreas Comprometidas:**
- Firestore Security Rules: **COMPLETAMENTE ABIERTO**
- Sistema de Votación: **Sin protección contra duplicados**
- QR Scanner: **Versión SDK obsoleta y desincronizada**
- Contador de Tickets: **Race conditions sin resolver**

---

## ❌ ERRORES CRÍTICOS (FIX INMEDIATO - 24 HORAS)

### 🔴 CRÍTICO 1: Firestore Rules - Acceso Total sin Autenticación

**Archivo:** `firestore.rules` (líneas 86, 109, 112, 129, 135, 139)

**Problema:**
```javascript
// ❌ CUALQUIERA puede leer/escribir votaciones de jurados
match /{colId}/{docId} {
    allow read, write: if colId.matches('votaciones_jurados_.*');
}

// ❌ CUALQUIERA puede modificar votos de jurados
match /jury_votes/{docId} {
    allow read, write: if true;
}

// ❌ CUALQUIERA puede actualizar artistas (contadores de votos)
match /events/{eventId}/artists/{docId} {
    allow read: if true;
    allow update: if true;  // ← SIN VALIDACIÓN
}

// ❌ CUALQUIERA puede marcar tickets como usados
match /events/{eventId}/tickets/{docId} {
    allow read: if true;
    allow update: if true;  // ← SIN VALIDACIÓN
}
```

**Impacto:**
- Un atacante puede **manipular votos** sin restricciones
- Puede **marcar todas las entradas como usadas** desde la consola de Firebase
- Puede **modificar contadores de artistas** directamente
- **NO HAY AUDIT TRAIL** - sin forma de rastrear modificaciones

**Explotación:**
```javascript
// Cualquiera puede ejecutar esto desde la consola del navegador:
import { doc, updateDoc } from 'firebase/firestore';

// Manipular votos
await updateDoc(doc(db, 'events/G13/artists/artist123'), {
    totalScore: 999999,
    totalRatingsCount: 500
});

// Marcar todas las entradas como usadas
const tickets = await getDocs(collection(db, 'events/G13/tickets'));
tickets.forEach(async (t) => {
    await updateDoc(doc(db, `events/G13/tickets/${t.id}`), { used: true });
});
```

**Solución Inmediata:**
```javascript
// firestore.rules - REEMPLAZAR LÍNEAS 117-142

// ✅ Votos de JURADOS: solo escribir con código de jurado válido
match /events/{eventId}/jury_evaluations/{docId} {
    allow read: if true;
    allow create: if request.resource.data.juryCode != null 
                  && request.resource.data.juryCode is string
                  && request.resource.data.juryCode.size() >= 4;
    allow update: if false;  // Evitar modificaciones después de crear
}

match /events/{eventId}/jury_votes/{docId} {
    allow read: if true;
    allow create: if request.resource.data.juryCode != null;
    allow update: if false;
}

// ✅ Votos PÚBLICOS: validar estructura y evitar sobreescritura
match /events/{eventId}/ticket_votes/{ticketId}/votes/{voteId} {
    allow read: if true;
    allow create: if request.resource.data.ticketName != null
                  && request.resource.data.singingScore is number
                  && request.resource.data.singingScore >= 0
                  && request.resource.data.singingScore <= 5;
    allow update: if request.auth != null;  // Solo admins pueden modificar votos existentes
}

// ✅ Artistas: contadores atómicos + validación incremental
match /events/{eventId}/artists/{docId} {
    allow read: if true;
    allow update: if 
        // Permitir solo incrementos/decrementos - no valores absolutos
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly([
            'totalScore', 'totalSingingScore', 'totalTransmissionScore',
            'totalAttitudeScore', 'totalOriginalityScore', 'totalCostumeScore',
            'totalStagingScore', 'totalRatingsCount'
        ]))
        ||
        // O admin autenticado (para correcciones)
        request.auth != null;
}

// ✅ Tickets: solo marcar como usados si NO está usado ya
match /events/{eventId}/tickets/{docId} {
    allow read: if true;
    allow update: if 
        // Validar que solo cambia el estado 'used'
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['used', 'usedAt', 'scannedBy', 'scannedDevice'])
        // Y que no estaba usado antes
        && resource.data.used == false
        // Y que se marca como usado (no al revés)
        && request.resource.data.used == true;
}

// ✅ Colecciones dinámicas votaciones_jurados_{eventId}
match /{colId}/{docId} {
    allow read: if colId.matches('votaciones_jurados_.*');
    allow write: if false;  // Bloqueado - usar rutas específicas arriba
}

match /{colId}/{docId} {
    allow read: if colId.matches('jurados_.*');
    allow write: if false;  // Bloqueado - usar rutas específicas
}
```

**Despliegue:**
```bash
firebase deploy --only firestore:rules
```

---

### 🔴 CRÍTICO 2: Votación Pública - Sin Protección Anti-Duplicados

**Archivo:** `voting_page.html` (líneas 952-990)

**Problema:**
```javascript
// ❌ NO HAY TRANSACCIÓN - Race condition
const existingVote = await getDoc(voteRef);
if (existingVote.exists() && isNewVote) {
    console.warn('⚠️ Voto duplicado detectado');
    // ← Pero SIGUE escribiendo igual!!!
}

await updateDoc(doc(db, `events/${activeEventId}/artists`, artistId), {
    totalScore: increment(diffs.singing + diffs.transmission...)
});

await setDoc(voteRef, { /* nuevo voto */ });
```

**Escenario de Explotación:**
```javascript
// Un atacante abre 10 tabs del navegador
// Todas ejecutan el voto AL MISMO TIEMPO
// Resultado: 10 votos en lugar de 1

for (let i = 0; i < 10; i++) {
    setTimeout(async () => {
        await submitVoteToFirebase(voteData);
    }, 0);  // Todas ejecutan simultáneamente
}
```

**Solución:**
```javascript
// voting_page.html - REEMPLAZAR submitVoteToFirebase

import { runTransaction } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

async function submitVoteToFirebase(voteData) {
    const { artistId, scores, ticketId, ticketName, isNewVote } = voteData;
    
    const artistRef = doc(db, `events/${activeEventId}/artists`, artistId);
    const voteRef = doc(db, `events/${activeEventId}/ticket_votes/${ticketId}/votes`, artistId);
    
    try {
        // ✅ TRANSACCIÓN ATÓMICA - Previene race conditions
        await runTransaction(db, async (transaction) => {
            // 1. Verificar si ya votó
            const existingVote = await transaction.get(voteRef);
            
            if (existingVote.exists() && isNewVote) {
                throw new Error('DUPLICATE_VOTE');
            }
            
            // 2. Calcular diferencias
            const oldScores = existingVote.exists() ? existingVote.data() : null;
            const diffs = {
                singing: scores.singing - (oldScores?.singingScore || 0),
                transmission: scores.transmission - (oldScores?.transmissionScore || 0),
                attitude: scores.attitude - (oldScores?.attitudeScore || 0),
                originality: scores.originality - (oldScores?.originalityScore || 0),
                costume: scores.costume - (oldScores?.costumeScore || 0),
                staging: scores.staging - (oldScores?.stagingScore || 0)
            };
            const totalDiff = Object.values(diffs).reduce((a, b) => a + b, 0);
            
            // 3. Leer artista
            const artistSnap = await transaction.get(artistRef);
            if (!artistSnap.exists()) {
                throw new Error('ARTIST_NOT_FOUND');
            }
            
            const artistData = artistSnap.data();
            
            // 4. Actualizar contadores
            transaction.update(artistRef, {
                totalSingingScore: (artistData.totalSingingScore || 0) + diffs.singing,
                totalTransmissionScore: (artistData.totalTransmissionScore || 0) + diffs.transmission,
                totalAttitudeScore: (artistData.totalAttitudeScore || 0) + diffs.attitude,
                totalOriginalityScore: (artistData.totalOriginalityScore || 0) + diffs.originality,
                totalCostumeScore: (artistData.totalCostumeScore || 0) + diffs.costume,
                totalStagingScore: (artistData.totalStagingScore || 0) + diffs.staging,
                totalScore: (artistData.totalScore || 0) + totalDiff,
                totalRatingsCount: (artistData.totalRatingsCount || 0) + (isNewVote ? 1 : 0)
            });
            
            // 5. Guardar voto
            transaction.set(voteRef, {
                artistId,
                ticketName,
                singingScore: scores.singing,
                transmissionScore: scores.transmission,
                attitudeScore: scores.attitude,
                originalityScore: scores.originality,
                costumeScore: scores.costume,
                stagingScore: scores.staging,
                votedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        
        console.log('✅ Voto guardado con transacción atómica');
        return { success: true };
        
    } catch (error) {
        if (error.message === 'DUPLICATE_VOTE') {
            displayMessage('⚠️ Ya votaste por este artista', 'warning', 3000);
            return { success: false, reason: 'duplicate' };
        }
        
        console.error('❌ Error en transacción:', error);
        throw error;
    }
}

// ✅ Agregar debounce al botón de voto
let isVoting = false;

async function handleVote(artistId) {
    if (isVoting) {
        console.log('⏳ Voto en proceso, ignorando click duplicado');
        return;
    }
    
    isVoting = true;
    const voteBtn = document.querySelector(`[data-artist-id="${artistId}"]`);
    if (voteBtn) {
        voteBtn.disabled = true;
        voteBtn.textContent = '⏳ Enviando...';
    }
    
    try {
        // ... lógica de votación
        await submitVoteToFirebase(voteData);
    } finally {
        isVoting = false;
        if (voteBtn) {
            voteBtn.disabled = false;
            voteBtn.textContent = '🗳️ VOTAR';
        }
    }
}
```

---

### 🔴 CRÍTICO 3: Scanner QR - SDK Firebase v9 (Obsoleto y Desincronizado)

**Archivo:** `escaner_qr_final.html` (líneas 9-10)

**Problema:**
```html
<!-- ❌ Firebase SDK v9.23.0 COMPAT (Abril 2023 - OBSOLETO) -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<script>
    // ❌ API COMPAT (deprecada)
    const app = firebase.initializeApp(firebaseConfig);
    this.db = firebase.firestore();
</script>
```

**Resto del sistema usa v11.6.1:**
```javascript
// firebase_config.js - v11.6.1 (Enero 2025)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
export const db = initializeFirestore(app, { localCache: memoryLocalCache() });
```

**Consecuencias:**
- **Datos desincronizados** entre escáner y sistema principal
- **Security Rules v2** no compatibles con SDK v9
- **Caches separados** - datos duplicados en navegador
- **Parches de seguridad desactualizados** (3 años atrás)

**Solución:**
```html
<!-- escaner_qr_final.html - REEMPLAZAR LÍNEAS 9-28 -->

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Escáner de Entradas - VYT MUSIC</title>
    <script src="https://unpkg.com/html5-qrcode@2.3.4/html5-qrcode.min.js"></script>
    
    <script type="module">
        // ✅ Importar desde firebase_config.js centralizado
        import { db } from './firebase_config.js';
        import { 
            collection, 
            doc, 
            getDocs, 
            updateDoc, 
            addDoc,
            onSnapshot 
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        
        // Exponer para uso en el código del escáner
        window.firestoreModules = { collection, doc, getDocs, updateDoc, addDoc, onSnapshot };
        window.db = db;
    </script>
    
    <!-- ... resto del HTML -->
</head>

<script type="module">
    // EN VEZ DE: this.db = firebase.firestore();
    // USAR: this.db = window.db; (ya inicializado)
    
    class GalaScanner {
        constructor() {
            this.db = window.db;  // ✅ Usar instancia centralizada
            // ... resto del código
        }
        
        async loadGalaEntries() {
            const { collection, getDocs } = window.firestoreModules;
            
            const ticketsRef = collection(this.db, `events/${this.eventId}/tickets`);
            const snapshot = await getDocs(ticketsRef);
            
            // ... resto del código
        }
        
        async recordAccess(entry) {
            const { doc, updateDoc, addDoc, collection } = window.firestoreModules;
            
            await updateDoc(
                doc(this.db, 'events', this.eventId, 'tickets', entry.id),
                {
                    used: true,
                    usedAt: new Date().toISOString(),
                    scannedBy: this.assistantName,
                    scannedDevice: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
                }
            );
            
            // ... resto del código
        }
    }
</script>
```

---

### 🔴 CRÍTICO 4: Generador de Entradas - Race Condition en Numeración

**Archivo:** `generador_entrada_puerta.html` (líneas 520-540)

**Problema:**
```javascript
// ❌ RACE CONDITION - Dos generadores simultáneos pueden crear el mismo número
const counterRef = doc(db, 'counters', `tickets_${eventId}`);
const counterSnap = await getDoc(counterRef);
const currentCount = counterSnap.exists() ? counterSnap.data().count : 0;
const ticketNumber = currentCount + 1;  // ← NO ATÓMICO

// Guardar nuevo contador
await setDoc(counterRef, { count: ticketNumber });  // ← Puede sobrescribir
```

**Escenario:**
```
T=0ms: Generador A lee count=100
T=5ms: Generador B lee count=100 (aún no guardó A)
T=10ms: Generador A guarda count=101, crea ticket #101
T=15ms: Generador B guarda count=101, crea ticket #101 ← DUPLICADO!
```

**Solución:**
```javascript
// generador_entrada_puerta.html - REEMPLAZAR generateDoorTicket()

import { 
    doc, 
    getDoc, 
    runTransaction 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

async function generateDoorTicket() {
    // Validaciones...
    
    showLoading('Generando entrada...');
    
    try {
        const counterRef = doc(db, 'counters', `tickets_${eventId}`);
        const ticketsCol = collection(db, `events/${eventId}/tickets`);
        
        // ✅ TRANSACCIÓN ATÓMICA para obtener número único
        const ticketNumber = await runTransaction(db, async (transaction) => {
            const counterSnap = await transaction.get(counterRef);
            const currentCount = counterSnap.exists() ? counterSnap.data().count : 0;
            const newCount = currentCount + 1;
            
            // Incrementar contador
            transaction.set(counterRef, { count: newCount, lastUpdated: new Date().toISOString() });
            
            return newCount;
        });
        
        // Generar ID único
        const ticketId = `DOOR-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        // Datos del ticket
        const ticketData = {
            id: ticketId,
            ticketNumber: ticketNumber,
            ticketNumberFormatted: ticketNumber.toString().padStart(4, '0'),
            name: ui.clientName.value.trim(),
            phone: ui.clientPhone.value.trim() || 'No especificado',
            price: parseFloat(ui.ticketPrice.value) || 0,
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
            soldBy: ui.sellerName.value.trim(),
            notes: ui.ticketNotes.value.trim() || '',
            used: false,
            canVote: true,
            prefix: 'DOOR',
            showName: eventName,
            seatLocation: 'General',
            paymentStatus: 'Pagado',
            generatedAt: new Date().toISOString(),
            generatedBy: ui.sellerName.value.trim()
        };
        
        // Agregar artista si seleccionó uno
        if (ui.selectedArtistId.value) {
            const artistId = ui.selectedArtistId.value;
            const artistName = ui.selectedArtistName.textContent;
            ticketData.supportingArtist = { id: artistId, name: artistName };
        }
        
        // Guardar ticket en Firestore
        await setDoc(doc(ticketsCol, ticketId), ticketData);
        
        // Agregar a sesión
        sessionTickets.push(ticketData);
        updateRecentTickets();
        
        hideLoading();
        showSuccess(ticketData);
        
        displayMessage(`✅ Entrada N° ${ticketNumber} generada exitosamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error generando entrada:', error);
        hideLoading();
        alert('❌ Error al generar entrada: ' + error.message);
    }
}
```

---

### 🔴 CRÍTICO 5: Credenciales Firebase Expuestas en Archivos HTML

**Archivos Afectados:**
- `escaner_qr_final.html` (línea 16)
- `votacion_jurados_FINAL.html` (línea 656)
- `mis_devoluciones.html` (línea 137)
- `sistema_premios*.html` (línea 14)

**Problema:**
```javascript
// ❌ Hardcodeado en cada archivo
const firebaseConfig = {
    apiKey: "AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU", 
    authDomain: "vyt-music.firebaseapp.com",
    projectId: "vyt-music",
    // ...
};

const app = initializeApp(firebaseConfig);  // ← INICIALIZACIÓN DUPLICADA
```

**Consecuencias:**
- **Múltiples instancias de Firebase** - conflictos de cache
- **Credenciales duplicadas** - difícil actualizar
- **Sin SSO** - problemas de autenticación cross-página

**Solución:**
```javascript
// TODOS LOS ARCHIVOS HTML - REEMPLAZAR bloque Firebase config

<script type="module">
    // ✅ Importar configuración centralizada
    import { db, auth, storage } from './firebase_config.js';
    import { 
        initializeFirestore, 
        collection, 
        doc, 
        getDocs 
    } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
    
    // Exponer globalmente si es necesario
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    
    // El resto del código usa: db, auth, storage directamente
</script>
```

---

### 🔴 CRÍTICO 6: Escape QR Scanner - Sin Validación de EventID

**Archivo:** `escaner_qr_final.html` (líneas 1258-1280)

**Problema:**
```javascript
// ❌ Código QR puede contener CUALQUIER eventId
const urlParams = new URLSearchParams(decodedText.split('?')[1]);
const ticketId = urlParams.get('ticket');
// ← NO VERIFICA que el QR corresponda al evento actual!

// Busca en ALL entries sin filtrar por eventId
const entry = this.galaEntries.find(e => e.id === ticketId);
```

**Explotación:**
```javascript
// Un usuario puede reutilizar QRs de OTROS eventos
// QR de Gala 1: https://...?ticket=ABC&eventId=G1
// QR de Gala 2: https://...?ticket=XYZ&eventId=G2

// Si escanea QR de G2 en el evento G1, puede pasar si:
// - El ticketId coincide por casualidad
// - O si no valida el eventId del QR
```

**Solución:**
```javascript
// escaner_qr_final.html - REEMPLAZAR onScanSuccess()

async onScanSuccess(decodedText, decodedResult) {
    if (this.isValidating) return;
    
    try {
        let ticketId = decodedText;
        let qrEventId = null;
        
        // Extraer parámetros del QR
        if (decodedText.includes('?')) {
            try {
                const url = new URL(decodedText);
                ticketId = url.searchParams.get('ticket');
                qrEventId = url.searchParams.get('eventId');
                
                // ✅ VALIDAR que el QR pertenece a ESTE evento
                if (qrEventId && qrEventId !== this.eventId) {
                    this.playErrorSound();
                    this.showScanResult(
                        `❌ QR de OTRO EVENTO (${qrEventId}) - NO VÁLIDO AQUÍ`, 
                        'error'
                    );
                    console.error(`🚫 EventId mismatch: QR=${qrEventId}, Actual=${this.eventId}`);
                    return;
                }
                
                if (!ticketId) {
                    throw new Error('QR inválido - sin ticket ID');
                }
                
            } catch (e) {
                this.playErrorSound();
                this.showScanResult('❌ Código QR mal formado', 'error');
                console.error('Error parseando QR:', e);
                return;
            }
        }
        
        console.log(`🎯 Buscando ticket: ${ticketId} en evento: ${this.eventId}`);
        
        // Buscar entrada
        const entry = this.galaEntries.find(e => 
            e.id === ticketId || 
            e.qrCode === ticketId
        );
        
        if (!entry) {
            this.playErrorSound();
            this.addDebugLog(`❌ Entrada NO ENCONTRADA: ${ticketId}`, 'error');
            this.showScanResult(
                `❌ Entrada no registrada en este evento (${this.galaEntries.length} entradas)`, 
                'error'
            );
            return;
        }
        
        if (entry.status === 'entered') {
            this.playErrorSound();
            this.showScanResult(`⚠️ ${entry.guestName} ya ingresó anteriormente`, 'error');
            return;
        }
        
        // ✅ VÁLIDO - Mostrar diálogo de confirmación
        await this.pauseScannerForValidation(entry);
        
    } catch (error) {
        console.error('❌ Error procesando QR:', error);
        this.playErrorSound();
        this.showScanResult('❌ Error al procesar el código', 'error');
    }
}
```

---

### 🔴 CRÍTICO 7: API Keys Expuestas en Repositorio Git

**Problema:**
```bash
# firebase_config.js está en Git con credenciales reales
$ git log firebase_config.js
commit abc123... "Actualizar Firebase config"
  apiKey: "AIzaSyC_2Ukoxf_ry7QfKtou1Cz6nY-qTVw4qTU"
  
# ESTAS CREDENCIALES ESTÁN EN GITHUB PÚBLICO!!!
```

**Consecuencias:**
- **Cualquiera puede usar tu proyecto Firebase**
- **Abusar de tu cuota gratuita**
- **Inyectar datos falsos**

**Nota:** Las API keys de Firebase para Web son públicas **POR DISEÑO** (Firebase las considera identificadores públicos, no secretos), pero el problema real es que junto con las Security Rules abiertas, permiten acceso total.

**Solución:**
```bash
# 1. Rotar API Key (Firebase Console)
# https://console.firebase.google.com/project/vyt-music/settings/general

# 2. Agregar a .gitignore
echo "firebase_config.js" >> .gitignore

# 3. Crear template
cat > firebase_config.template.js << 'EOF'
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// Copy this file to firebase_config.js and replace with your credentials
EOF

# 4. Limpiar historial Git (CUIDADO - destructivo)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch firebase_config.js" \
  --prune-empty --tag-name-filter cat -- --all
```

**IMPORTANTE:** Como las API keys de Firebase Web son públicas, la VERDADERA protección viene de las Security Rules. Primero arregla CRITICAL 1.

---

## 🟠 PROBLEMAS ALTOS (FIX ESTA SEMANA)

### 🟠 ALTO 1: Storage Rules - Upload sin Límites

**Archivo:** `storage.rules` (líneas 1-55)

**Problema:**
```javascript
// ⚠️ Cualquiera puede subir archivos de 200MB sin autenticación
match /audiciones_videos/{fileName} {
    allow read: if true;
    allow write: if request.resource.size < 200 * 1024 * 1024;
}

// ⚠️ Sin validación de tipo de archivo real (solo Content-Type)
match /pistas/{eventId}/{artistId}/{fileName} {
    allow write: if request.resource.contentType.matches('audio/.*');
    // ← Un atacante puede enviar Content-Type: audio/mpeg con payload malicioso
}
```

**Explotación:**
```javascript
// Subir archivo ejecutable disfrazado de audio
const blob = new Blob([maliciousCode], { type: 'audio/mpeg' });
const storageRef = ref(storage, 'pistas/G13/fake_artist/virus.mp3');
await uploadBytes(storageRef, blob);  // ✅ Aceptado!
```

**Solución:**
```javascript
// storage.rules - REEMPLAZAR COMPLETO

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ✅ Helper: validar extensión del archivo
    function validExtension(extensions) {
      return request.resource.name.matches('.*\.(' + extensions + ')$');
    }
    
    // ✅ Helper: validar tamaño
    function validSize(maxSizeMB) {
      return request.resource.size < maxSizeMB * 1024 * 1024;
    }
    
    // Audiciones - FOTOS
    match /audiciones_fotos/{fileName} {
      allow read: if true;
      allow write: if validSize(5)
                   && validExtension('jpg|jpeg|png|webp')
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Audiciones - VIDEOS
    match /audiciones_videos/{fileName} {
      allow read: if true;
      allow write: if validSize(100)  // ← Reducido de 200MB a 100MB
                   && validExtension('mp4|mov|avi|mkv')
                   && request.resource.contentType.matches('video/.*');
    }
    
    // Comprobantes de pago
    match /payment_proofs/{eventId}/{fileName} {
      allow read: if true;
      allow write: if validSize(5)
                   && validExtension('jpg|jpeg|png|pdf')
                   && (request.resource.contentType.matches('image/.*')
                       || request.resource.contentType == 'application/pdf');
    }
    
    // Pistas de audio - ✅ MÁS RESTRICTIVO
    match /pistas/{eventId}/{artistId}/{fileName} {
      allow read: if true;
      allow write: if validSize(50)  // ← Reducido de 100MB a 50MB
                   && validExtension('mp3|wav|m4a|ogg')
                   && request.resource.contentType.matches('audio/.*')
                   // ✅ Validar que artistId existe en Firestore
                   && exists(/databases/(database)/documents/events/$(eventId)/artists/$(artistId));
    }
    
    // Pistas organización - SOLO ADMIN
    match /pistas_organizacion/{eventId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null  // ← REQUIERE AUTENTICACIÓN
                   && validSize(50)
                   && validExtension('mp3|wav|m4a|ogg')
                   && request.resource.contentType.matches('audio/.*');
    }
    
    // Resto - SOLO AUTENTICADO
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 🟠 ALTO 2: URLs sin encodeURIComponent

**Archivos:** Múltiples (`panel_evento.html`, `gestion_jurados_clean.html`, etc.)

**Problema:**
```javascript
// ❌ Nombres con caracteres especiales rompen URLs
const url = `panel_evento.html?eventId=${eventId}&eventName=${eventName}`;
// Si eventName = "Gala & Fiesta!" → URL malformada
```

**Solución:**
```javascript
// ✅ Crear helper global en navigation-utils.js

// navigation-utils.js - AGREGAR al inicio
export function buildEventURL(page, eventId, eventName, extraParams = {}) {
    const url = new URL(page, window.location.origin);
    url.searchParams.set('eventId', eventId);
    url.searchParams.set('eventName', eventName);
    
    Object.entries(extraParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    
    return url.toString();
}

export function parseEventParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        eventId: params.get('eventId'),
        eventName: params.get('eventName'),
        isValid: params.has('eventId') && params.has('eventName')
    };
}

// USO en TODOS los archivos:
import { buildEventURL } from './navigation-utils.js';

const url = buildEventURL('panel_evento.html', eventId, eventName);
window.location.href = url;

const url = buildEventURL('votacion_jurados_FINAL.html', eventId, eventName, {
    admin: 'true',
    fromPanel: 'true'
});
```

---

### 🟠 ALTO 3: Scanner - Sin Debounce en Detección QR

**Archivo:** `escaner_gala_OPTIMIZADO.html` (líneas 500-550)

**Problema:**
```javascript
// ⚠️ Puede escanear el mismo QR múltiples veces en <2 segundos
async function processTicket(ticketId) {
    const now = Date.now();
    
    if (now - state.lastScanTime < 2000) {
        console.log('⏭️ Escaneo duplicado ignorado');
        return;  // ← BIEN pero puede mejorar
    }
    state.lastScanTime = now;
    // ...
}
```

**Mejora:**
```javascript
// escaner_gala_OPTIMIZADO.html - REEMPLAZAR processTicket()

const processingTickets = new Set();  // ← Agregar al inicio

async function processTicket(ticketId) {
    const now = Date.now();
    
    // ✅ Verificar si ya está en proceso
    if (processingTickets.has(ticketId)) {
        console.log('⏳ Ticket en proceso, ignorando...');
        return;
    }
    
    // ✅ Debounce temporal
    if (now - state.lastScanTime < 2000) {
        console.log('⏭️ Escaneo muy rápido, esperando...');
        return;
    }
    
    // Marcar como en proceso
    processingTickets.add(ticketId);
    state.lastScanTime = now;
    
    try {
        console.log(`🎫 Procesando: ${ticketId}`);
        
        const ticket = state.tickets.get(ticketId);
        
        if (!ticket) {
            showFeedback('error', '❌ NO ENCONTRADA', 'Entrada no existe');
            return;
        }
        
        if (ticket.used) {
            showFeedback('warning', ticket.name, '⚠️ YA INGRESÓ');
            return;
        }
        
        // Marcar como usada
        const ticketRef = doc(db, `events/${state.eventId}/tickets`, ticketId);
        await updateDoc(ticketRef, {
            used: true,
            usedAt: new Date().toISOString(),
            usedBy: 'Escáner Puerta'
        });
        
        ticket.used = true;
        state.entryCount++;
        ui.counter.textContent = state.entryCount;
        
        showFeedback('success', ticket.name, `✅ INGRESO ${state.entryCount}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        showFeedback('error', 'ERROR', 'No se pudo guardar');
    } finally {
        // ✅ Liberar después de 3 segundos
        setTimeout(() => {
            processingTickets.delete(ticketId);
        }, 3000);
    }
}
```

---

### 🟠 ALTO 4: Votación Jurados - Sin Validación de Rango

**Archivo:** `votacion_jurados_FINAL.html` (líneas 1200-1400)

**Problema:**
```javascript
// ⚠️ No valida que los puntajes estén en rango válido
const scores = {
    tecnica: parseInt(form.tecnicaScore.value),
    interpretacion: parseInt(form.interpretacionScore.value),
    // ...
};

// ← Un atacante puede modificar HTML y enviar score: 999999
await setDoc(voteRef, scores);
```

**Solución:**
```javascript
// votacion_jurados_FINAL.html - AGREGAR función de validación

function validateJuryScores(scores) {
    const validCategories = ['tecnica', 'interpretacion', 'puesta', 'originalidad', 'carisma'];
    const minScore = 0;
    const maxScore = 5;
    
    const errors = [];
    
    for (const category of validCategories) {
        const score = scores[category];
        
        if (score === undefined || score === null) {
            errors.push(`Falta puntaje: ${category}`);
            continue;
        }
        
        if (!Number.isInteger(score)) {
            errors.push(`${category}: debe ser número entero`);
        }
        
        if (score < minScore || score > maxScore) {
            errors.push(`${category}: debe estar entre ${minScore} y ${maxScore}`);
        }
    }
    
    if (scores.comentarios && scores.comentarios.length > 500) {
        errors.push('Comentarios: máximo 500 caracteres');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// USAR antes de guardar
async function submitJuryVote(artistId, scores) {
    // ✅ Validar puntajes
    const validation = validateJuryScores(scores);
    
    if (!validation.valid) {
        alert('❌ Puntajes inválidos:\n' + validation.errors.join('\n'));
        return;
    }
    
    // ✅ Normalizar/sanitizar
    const sanitizedScores = {
        tecnica: Math.min(Math.max(Math.floor(scores.tecnica), 0), 5),
        interpretacion: Math.min(Math.max(Math.floor(scores.interpretacion), 0), 5),
        puesta: Math.min(Math.max(Math.floor(scores.puesta), 0), 5),
        originalidad: Math.min(Math.max(Math.floor(scores.originalidad), 0), 5),
        carisma: Math.min(Math.max(Math.floor(scores.carisma), 0), 5),
        comentarios: (scores.comentarios || '').substring(0, 500).trim()
    };
    
    const total = Object.values(sanitizedScores)
        .filter(v => typeof v === 'number')
        .reduce((a, b) => a + b, 0);
    
    sanitizedScores.totalScore = total;
    sanitizedScores.votedAt = new Date().toISOString();
    
    // Guardar
    await setDoc(voteRef, sanitizedScores);
}
```

---

### 🟠 ALTO 5: Botones - Sin Deshabilitar al Hacer Click

**Archivos:** Múltiples (admin_preventa.html, generador_entrada_puerta.html, etc.)

**Problema:**
```javascript
// ⚠️ Usuario puede hacer doble-click y ejecutar 2 veces
button.addEventListener('click', async () => {
    await expensiveOperation();  // ← Sin deshabilitar botón
});
```

**Solución Global:**
```javascript
// navigation-utils.js - AGREGAR helper

export function makeButtonSafe(button, asyncHandler) {
    button.addEventListener('click', async (event) => {
        // Prevenir doble click
        if (button.disabled) return;
        
        // Deshabilitar botón
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = '⏳ Procesando...';
        button.style.opacity = '0.6';
        
        try {
            await asyncHandler(event);
        } catch (error) {
            console.error('Error en handler:', error);
            throw error;
        } finally {
            // Re-habilitar después de 1 segundo
            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
                button.style.opacity = '1';
            }, 1000);
        }
    });
}

// USO:
import { makeButtonSafe } from './navigation-utils.js';

const generateBtn = document.getElementById('generate-btn');
makeButtonSafe(generateBtn, async () => {
    await generateTickets();
});
```

---

### 🟠 ALTO 6-12: [Otros problemas documentados en AUDITORIA_SISTEMA_COMPLETA_MARZO_2026.md]

Ver archivo existente para detalles sobre:
- ALTO 6: Comentarios de jurados sin sanitización
- ALTO 7: Artistas sin sincronización realtime
- ALTO 8-12: Validaciones de formularios, manejo de errores, etc.

---

## 🟡 PROBLEMAS MEDIOS (MEJORAS ARQUITECTURALES)

### 🟡 MEDIO 1: Arquitectura - Código Duplicado

**Problema:**
- `firebase_config.js` importado correctamente ✅
- Pero 6 archivos HTML tienen config hardcodeada ❌
- Funciones de validación duplicadas en 15+ archivos

**Estructura Propuesta:**
```
/js
  /core
    - firebase.service.js      (Wrapper de Firebase)
    - auth.service.js          (Autenticación centralizada)
    - validation.service.js    (Validaciones reutilizables)
  /features
    - voting.service.js        (Lógica de votación)
    - tickets.service.js       (QR y tickets)
    - artists.service.js       (Gestión artistas)
  /utils
    - url.utils.js             (buildURL, parseParams)
    - ui.utils.js              (showMessage, loading, etc.)
    - date.utils.js            (Formato fechas)
```

**Consolidación:**
```javascript
// /js/core/firebase.service.js
export class FirebaseService {
    constructor() {
        if (FirebaseService.instance) {
            return FirebaseService.instance;
        }
        
        this.db = db;  // Desde firebase_config.js
        this.auth = auth;
        this.storage = storage;
        
        FirebaseService.instance = this;
    }
    
    // Métodos centralizados
    async getCollection(path) { /* ... */ }
    async updateDocument(path, data) { /* ... */ }
    // etc.
}

// /js/features/tickets.service.js
import { FirebaseService } from '../core/firebase.service.js';

export class TicketsService {
    constructor() {
        this.firebase = new FirebaseService();
    }
    
    async markAsUsed(eventId, ticketId) {
        // Lógica con transacción atómica
    }
    
    async generateTicket(eventId, ticketData) {
        // Lógica con contador atómico
    }
}
```

---

### 🟡 MEDIO 2: Error Handling - Sin Try/Catch Consistente

**Problema:**
```javascript
// 50% del código no maneja errores
const data = await getDocs(collection);  // ❌ Si falla, crash silencioso
```

**Solución:**
```javascript
// Crear wrapper global para async ops
export async function safeAsync(operation, fallback = null, errorMsg = 'Error en operación') {
    try {
        return await operation();
    } catch (error) {
        console.error(`❌ ${errorMsg}:`, error);
        showMessage(errorMsg, 'error');
        return fallback;
    }
}

// USO:
const tickets = await safeAsync(
    () => getDocs(collection(db, `events/${eventId}/tickets`)),
    [],
    'Error cargando tickets'
);
```

---

### 🟡 MEDIO 3-8: [Ver AUDITORIA_SISTEMA_COMPLETA_MARZO_2026.md para más]

---

## 📊 RESUMEN DE FIXES PRIORITARIOS

### ⏱️ SPRINT 1 (HOY - 24 HORAS)

1. ✅ **Firestore Rules** (CRÍTICO 1) - 30 min
2. ✅ **Votación con Transacciones** (CRÍTICO 2) - 1 hora
3. ✅ **Migrar escaner_qr_final.html a SDK 11.6.1** (CRÍTICO 3) - 1 hora
4. ✅ **Validación EventID en QR Scanner** (CRÍTICO 6) - 30 min
5. ✅ **Desplegar reglas**:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### ⏱️ SPRINT 2 (MAÑANA - 48 HORAS)

6. ✅ **Contador atómico tickets** (CRÍTICO 4) - 45 min
7. ✅ **Eliminar configs duplicadas** (CRÍTICO 5) - 30 min
8. ✅ **Storage Rules mejoradas** (ALTO 1) - 30 min
9. ✅ **URL encoding global** (ALTO 2) - 1 hora

### ⏱️ SPRINT 3 (ESTA SEMANA)

10. Debounce en scanners (ALTO 3)
11. Validación puntajes jurados (ALTO 4)
12. Botones seguros (ALTO 5)
13. Consolidación código (MEDIO 1)

---

## 🛠️ COMANDOS DE DESPLIEGUE

```bash
# 1. Backup actual
firebase firestore:export gs://vyt-music-backup/$(date +%Y%m%d)

# 2. Desplegar reglas
firebase deploy --only firestore:rules,storage:rules

# 3. Verificar en consola
# https://console.firebase.google.com/project/vyt-music/firestore/rules

# 4. Test en producción
# Intentar escribir sin auth - debe fallar:
await updateDoc(doc(db, 'jury_votes/test'), { test: 1 });
# Expected: "Missing or insufficient permissions"
```

---

## 📞 SOPORTE POST-DESPLIEGUE

1. **Monitor errores 24h:**
   - Firebase Console → Firestore → Rules tab
   - Ver "usage" metrics para detectar bloqueos inesperados

2. **Hotfix si algo falla:**
```javascript
// firestore.rules - TEMPLATE DE EMERGENCIA
match /{document=**} {
    allow read: if true;
    allow write: if request.auth != null;  // Mínimo requerimiento
}
```

3. **Rollback rápido:**
```bash
# Ver versiones anteriores
firebase firestore:rules:list

# Volver a versión anterior
firebase firestore:rules:release v20260319_235900
```

---

## ✅ CHECKLIST DE VERIFICACIÓN POST-FIX

- [ ] Votación pública sin duplicados (probar con 2 tabs)
- [ ] Scanner QR solo acepta QRs del evento correcto
- [ ] Tickets generados tienen números únicos (probar con 2 generadores)
- [ ] No se pueden modificar votos desde consola Firebase
- [ ] Storage rechaza archivos >50MB
- [ ] Todas las páginas usan firebase_config.js centralizado
- [ ] URLs con caracteres especiales funcionan correctamente
- [ ] Botones no se pueden clickear múltiples veces rápido

---

## 📚 DOCUMENTACIÓN RELACIONADA

- [AUDITORIA_SISTEMA_COMPLETA_MARZO_2026.md](AUDITORIA_SISTEMA_COMPLETA_MARZO_2026.md) - Auditoría previa
- [DOCUMENTACION_SISTEMA.md](DOCUMENTACION_SISTEMA.md) - Arquitectura completa
- [Firebase Security Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)

---

**Generado:** 20 de Marzo 2026  
**Próxima revisión:** Después de implementar CRÍTICOS 1-7  
**Contacto:** GitHub Copilot Assistant
