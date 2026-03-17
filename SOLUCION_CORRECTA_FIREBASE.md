# ✅ SOLUCIÓN CORRECTA: Sistema de Pago con FIREBASE

**Fecha:** 17 de marzo de 2026  
**Plataforma:** Firebase Hosting + Firebase Cloud Functions  
**Dominio:** https://vyt-music.web.app

---

## ⚠️ ACLARACIÓN IMPORTANTE

Tu sistema está en **FIREBASE**, NO en Netlify. Las instrucciones anteriores estaban incorrectas.

---

## 🔧 PROBLEMAS SOLUCIONADOS

### 1. ❌ Cliente veía opciones de pago después de pagar

**Causa:** El sistema hacía `reload()` al volver de Mercado Pago sin verificar el estado real.

**Solución:** [preventa_artistas.html](preventa_artistas.html#L577-L632)
- Verifica estado real en Firebase antes de mostrar secciones
- Oculta formularios si `status === 'approved'`
- Continúa al siguiente paso automáticamente

### 2. ❌ No llegaban notificaciones de WhatsApp

**Causa:** El webhook actualizaba Firebase pero no enviaba notificaciones.

**Solución:** [functions/index.js](functions/index.js#L450-L490)
- Integración con CallMeBot en la función `mercadopagoWebhookV2`
- Envío automático de WhatsApp cuando se aprueba un pago
- Guardado de datos en Firebase como backup

### 3. ❌ URLs mezcladas (netlify + firebase)

**Solución:** Todas las URLs actualizadas a `vyt-music.web.app`

---

## 🎯 CONFIGURAR NOTIFICACIONES WHATSAPP (5 minutos)

### PASO 1: Activar CallMeBot

1. **Agregar contacto en WhatsApp:**
   - Número: `+34 644 44 80 61`
   - Nombre: CallMeBot

2. **Enviar mensaje de activación:**
   ```
   I allow callmebot to send me messages
   ```
   (Exactamente así, en inglés)

3. **Recibir tu API Key:**
   - CallMeBot te responderá con un número (ej: `123456`)
   - 📋 Guárdalo

---

### PASO 2: Configurar Variables en Firebase

#### Opción A: Usando Firebase Console (Más fácil)

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto **vyt-music**
3. En el menú: **Functions** → **⚙️ Configuración**
4. En la sección **Variables de entorno**:

```bash
# Agregar estas variables:
CALLMEBOT_PHONE = 543413632329
CALLMEBOT_APIKEY = [tu API key de CallMeBot]
MERCADOPAGO_TOKEN = APP_USR-7575962186897913-030906-df25368a0b2e0978194066d7ab64beff-192683624
```

5. Click **Guardar**

#### Opción B: Usando Firebase CLI (Avanzado)

En la carpeta `functions`, crear archivo `.env`:

```bash
CALLMEBOT_PHONE=543413632329
CALLMEBOT_APIKEY=[tu API key]
MERCADOPAGO_TOKEN=APP_USR-7575962186897913-030906-df25368a0b2e0978194066d7ab64beff-192683624
```

Luego desplegar:
```bash
firebase deploy --only functions
```

---

### PASO 3: Re-desplegar Functions

```bash
firebase deploy --only functions:mercadopagoWebhookV2
```

Esperar ~2 minutos.

---

## ✅ VERIFICAR QUE FUNCIONA

### Test de Pago

1. Ir a: https://vyt-music.web.app/preventa_artistas.html?eventId=[TU_EVENT_ID]
2. Completar formulario
3. Pagar con tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   CVV: 123
   Vencimiento: 11/25
   Nombre: APRO
   ```
4. **Deberías recibir WhatsApp automático** 🎉

### Ver Logs

1. Ve a: https://console.firebase.google.com
2. **Functions** → **Logs**
3. Busca: `mercadopagoWebhookV2`

Logs correctos:
```
✅ Pago APROBADO
✅ Orden XXX actualizada a APPROVED
📲 Enviando notificación WhatsApp con CallMeBot...
✅ Notificación WhatsApp enviada exitosamente
```

---

## 📊 ESTRUCTURA DEL SISTEMA

### Firebase Functions (Backend)

```
functions/index.js
├── createPaymentV2         → Crea preferencia MP
├── mercadopagoWebhookV2    → Recibe notificaciones MP ⭐ ACTUALIZADO
├── avisarPagoAdmin         → Notificación admin preventa
└── chatPublico             → IA asistente
```

### Rewrites en firebase.json

```json
{
  "/createPayment": "createPaymentV2",
  "/mercadopagoWebhook": "mercadopagoWebhookV2",
  "/avisarPagoAdmin": "avisarPagoAdmin"
}
```

### Frontend (Hosting)

```
preventa_artistas.html
├── Llama a: /createPayment
└── Recibe retorno de MP con payment=success
    └── Verifica estado en Firebase
        ├── Si approved → Continúa proceso
        └── Si pending → Muestra pantalla espera
```

---

## 🔍 DEBUGGING

### "No recibo WhatsApp"

1. ✅ Verificar que enviaste mensaje a CallMeBot
2. ✅ Verificar API Key en Firebase Console
3. ✅ Ver logs de la función: buscar "CallMeBot"
4. ✅ Hacer test con compra real de prueba

### "Cliente ve opciones de pago otra vez"

1. ✅ Verificar que estás en `vyt-music.web.app` (NO netlify.app)
2. ✅ Limpiar caché del navegador (Ctrl+Shift+R)
3. ✅ Ver estado real en Firebase Console → Firestore
4. ✅ Verificar que la orden tiene `status: 'approved'`

### "Webhook no actualiza"

1. ✅ Ver logs: https://console.firebase.google.com → Functions → Logs
2. ✅ Verificar que Mercado Pago envía notificación:
   - En tu cuenta MP: **Webhooks** → **Historial**
   - URL debería ser: `us-central1-vyt-music.cloudfunctions.net/mercadopagoWebhookV2`

---

## 📱 FLUJO COMPLETO

```
Usuario hace compra
    ↓
preventa_artistas.html → /createPayment
    ↓
Firebase Function crea preferencia MP
    ↓
Usuario redirigido a Mercado Pago
    ↓
Usuario paga
    ↓
MP envía webhook a Firebase
    ↓
mercadopagoWebhookV2 (Firebase Function):
    ├── Actualiza orden a 'approved'
    ├── Envía WhatsApp con CallMeBot ⭐
    └── Guarda datos en Firebase
    ↓
Usuario vuelve con ?payment=success
    ↓
preventa_artistas.html verifica estado
    ├── Si approved → Continúa a QRs ✅
    └── Si pending → Espera webhook
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
firebase functions:log --only mercadopagoWebhookV2

# Desplegar solo functions
firebase deploy --only functions

# Desplegar solo hosting
firebase deploy --only hosting

# Desplegar todo
firebase deploy

# Ver info del proyecto
firebase projects:list
```

---

## 💡 DIFERENCIAS FIREBASE vs NETLIFY

| Aspecto | Firebase | Netlify |
|---------|----------|---------|
| **Dominio** | vyt-music.web.app | vytmusic.netlify.app ❌ |
| **Functions** | Cloud Functions (Node.js) | Netlify Functions |
| **Variables** | Firebase Console o .env | Netlify Dashboard |
| **Deploy** | `firebase deploy` | Git push auto |
| **Logs** | Firebase Console | Netlify Dashboard |

---

## 📄 ARCHIVOS ACTUALIZADOS

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `functions/index.js` | Agregar notificaciones WhatsApp | 450-490 |
| `preventa_artistas.html` | Verificar estado antes de mostrar | 577-632 |
| `generador_entrada_puerta.html` | URL netlify → firebase | 382, 448 |
| `ver_entradas.html` | URL netlify → firebase | 229, 385 |
| `votacion_jurados_FINAL.html` | URL netlify → firebase | 1146, 5933, 5999 |

---

## ⚠️ ARCHIVOS IGNORAR (Carpeta netlify/)

Los archivos en `netlify/functions/` **NO se usan**. Tu sistema usa Firebase Cloud Functions.

Puedes eliminar la carpeta `netlify/` si querés:
```bash
rm -rf netlify/
```

---

## 🎉 RESULTADO FINAL

Cuando alguien pague con Mercado Pago:

1. ✅ Se actualiza automáticamente a "aprobado" en Firebase
2. ✅ Te llega WhatsApp instantáneo con:
   - Nombre del cliente
   - Teléfono  
   - Cantidad de entradas
   - Monto
   - Link al panel admin
3. ✅ Cliente NO vuelve a ver opciones de pago
4. ✅ Cliente continúa directamente a sus QRs

---

## 📞 SOPORTE

**Si algo no funciona:**

1. Ver logs en Firebase Console
2. Verificar variables de entorno
3. Confirmar que CallMeBot respondió con API Key
4. Hacer test con compra de prueba

**URLs importantes:**
- Firebase Console: https://console.firebase.google.com
- Tu sitio: https://vyt-music.web.app
- Admin preventa: https://vyt-music.web.app/admin_preventa.html

---

**🎊 Sistema completamente funcional con Firebase! 🎊**
