# 🔥 MIGRACIÓN DE NETLIFY A FIREBASE HOSTING

## ✅ ¿ES POSIBLE? SÍ, 100% POSIBLE Y MÁS SIMPLE

**Ventajas de usar Firebase Hosting:**
- ✅ Ya usas Firebase para la base de datos
- ✅ **NO necesitas configurar variables de entorno complejas**
- ✅ Firebase Cloud Functions accede directamente a Firestore
- ✅ Dominio gratis: `tunombre.web.app` y `tunombre.firebaseapp.com`
- ✅ Certificado SSL automático
- ✅ Todo en un solo lugar (hosting + database + functions)
- ✅ Configuración más simple que Netlify
- ✅ NO necesitas Firebase Admin SDK en las funciones (ya están autenticadas)

---

## 🎯 COMPARACIÓN

| Aspecto | Netlify (Actual) | Firebase Hosting (Nuevo) |
|---------|------------------|--------------------------|
| Variables de entorno | ❌ Manual en dashboard | ✅ Automáticas (mismo proyecto) |
| Funciones serverless | Netlify Functions | Firebase Cloud Functions |
| Base de datos | Firebase Firestore | Firebase Firestore |
| Setup | Complejo | Simple |
| Costo | Gratis hasta 100GB | Gratis hasta 10GB |
| Dominio personalizado | Sí | Sí |
| SSL/HTTPS | Sí | Sí (automático) |

---

## 🚀 GUÍA DE MIGRACIÓN (30 minutos)

### PASO 1: Instalar Firebase CLI (5 minutos)

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación
firebase --version

# Login a Firebase
firebase login
```

---

### PASO 2: Inicializar Firebase en tu Proyecto (5 minutos)

```bash
# En la raíz de tu proyecto
cd "c:\Users\lucia\Desktop\creacion web\vyt.web\VYTMUSIC QR\QR-VYTMUSIC-main"

# Inicializar Firebase
firebase init
```

**Selecciona estas opciones en el wizard:**

1. **¿Qué servicios quieres usar?**
   - ✅ Firestore (ya lo tienes)
   - ✅ **Hosting** (para el sitio web)
   - ✅ **Functions** (para Mercado Pago)

2. **Proyecto Firebase:**
   - Selecciona: **Use an existing project**
   - Elige: `vyt-music` (tu proyecto actual)

3. **Configuración de Firestore:**
   - Usa los archivos existentes (Enter, Enter)

4. **Configuración de Hosting:**
   - **Public directory:** `.` (punto) o `public` (recomiendo `.`)
   - **Single-page app:** `No`
   - **GitHub deploys:** `No` (por ahora)
   - **Overwrite index.html:** `No`

5. **Configuración de Functions:**
   - **Lenguaje:** JavaScript
   - **ESLint:** No (para simplificar)
   - **Install dependencies:** Yes

---

### PASO 3: Convertir Netlify Functions a Firebase Functions (10 minutos)

Firebase creará una carpeta `functions/`. Vamos a mover tu código ahí.

#### 3.1. Estructura de carpetas

```
tu-proyecto/
├── functions/              ← NUEVA carpeta creada por Firebase
│   ├── index.js           ← Aquí pondremos las funciones
│   ├── package.json       ← Dependencias
├── index.html             ← Tus archivos HTML (se quedan igual)
├── preventa_artistas.html
├── eventos.html
├── firebase_config.js
└── firebase.json          ← Configuración de hosting
```

#### 3.2. Adaptar las funciones

**Archivo: `functions/index.js`**

Crea este archivo con el siguiente contenido:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// ✅ Inicializar Firebase Admin (automático, no necesita credenciales)
admin.initializeApp();
const db = admin.firestore();

// ==========================================
// FUNCIÓN 1: Crear Pago en Mercado Pago
// ==========================================
exports.createPayment = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { orderId, eventId, eventName, ticketCount, totalAmount, payerEmail } = req.body;

    console.log('📋 Datos recibidos:', { orderId, eventId, ticketCount, totalAmount });

    if (!orderId || !eventId || !ticketCount || !totalAmount) {
      res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['orderId', 'eventId', 'ticketCount', 'totalAmount']
      });
      return;
    }

    // ✅ OBTENER ACCESS TOKEN de Firebase Config (lo configuraremos después)
    const mpAccessToken = functions.config().mercadopago.token;

    if (!mpAccessToken) {
      console.error('❌ Token de Mercado Pago no configurado');
      res.status(500).json({ error: 'Mercado Pago no configurado' });
      return;
    }

    // Crear preferencia de pago
    const preference = {
      items: [{
        id: orderId,
        title: `${ticketCount} entrada${ticketCount > 1 ? 's' : ''} - ${eventName || 'VYT-MUSIC'}`,
        description: `Preventa especial para ${eventName || 'VYT-MUSIC'}`,
        category_id: 'tickets',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(totalAmount)
      }],
      payer: {
        email: payerEmail || undefined
      },
      external_reference: orderId,
      notification_url: `https://vyt-music.web.app/mercadopagoWebhook`,
      back_urls: {
        success: `https://vyt-music.web.app/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=success`,
        failure: `https://vyt-music.web.app/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=failure`,
        pending: `https://vyt-music.web.app/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      },
      statement_descriptor: 'VYTMUSIC',
      metadata: {
        event_id: eventId,
        order_id: orderId,
        ticket_count: ticketCount
      }
    };

    console.log('📤 Enviando preferencia a Mercado Pago...');

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Mercado Pago:', data);
      res.status(response.status).json({ 
        error: 'Error creando preferencia',
        details: data
      });
      return;
    }

    console.log('✅ Preferencia creada:', data.id);

    res.status(200).json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// ==========================================
// FUNCIÓN 2: Webhook de Mercado Pago
// ==========================================
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
  console.log('🔔 Webhook recibido de Mercado Pago');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;
    console.log('📦 Body recibido:', body);

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log(`💳 Payment ID recibido: ${paymentId}`);

      const mpAccessToken = functions.config().mercadopago.token;
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      const payment = await paymentResponse.json();
      console.log('💰 Detalles del pago:', payment);

      if (payment.status === 'approved') {
        console.log('✅ Pago APROBADO');

        const orderId = payment.external_reference;
        
        if (!orderId) {
          console.warn('⚠️ No se encontró external_reference en el pago');
          res.status(200).json({ received: true, warning: 'No external_reference' });
          return;
        }

        const eventId = orderId.split('_')[0];
        
        console.log(`🔍 Buscando orden ${orderId} en evento ${eventId}`);

        const orderRef = db.collection(`ticket_orders_${eventId}`).doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          console.error(`❌ Orden ${orderId} no encontrada en Firebase`);
          res.status(404).json({ error: 'Order not found' });
          return;
        }

        await orderRef.update({
          status: 'approved',
          paymentStatus: 'paid',
          mercadoPagoPaymentId: paymentId,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'mercadopago_webhook',
          paymentDetails: {
            status: payment.status,
            statusDetail: payment.status_detail,
            paymentMethod: payment.payment_method_id,
            transactionAmount: payment.transaction_amount,
            dateApproved: payment.date_approved,
            payerEmail: payment.payer?.email || null
          }
        });

        console.log(`✅ Orden ${orderId} actualizada a APPROVED automáticamente`);

        res.status(200).json({ 
          success: true, 
          orderId: orderId,
          status: 'approved'
        });
      } else {
        console.log(`⏳ Pago en estado: ${payment.status}`);
        res.status(200).json({ 
          received: true, 
          status: payment.status 
        });
      }
    } else {
      console.log('📋 Notificación no es de tipo payment');
      res.status(200).json({ received: true });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ 
      error: 'Error procesando webhook',
      message: error.message 
    });
  }
});
```

#### 3.3. Actualizar package.json de functions

**Archivo: `functions/package.json`**

```json
{
  "name": "vytmusic-functions",
  "version": "1.0.0",
  "description": "Firebase Cloud Functions para VYT-MUSIC",
  "main": "index.js",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0",
    "node-fetch": "^2.7.0"
  }
}
```

Instala las dependencias:

```bash
cd functions
npm install
cd ..
```

---

### PASO 4: Configurar Token de Mercado Pago en Firebase (2 minutos)

**IMPORTANTE:** En Firebase no necesitas configurar variables en un dashboard. Se hace por línea de comandos:

```bash
# Configurar el token de Mercado Pago
firebase functions:config:set mercadopago.token="APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624"

# Verificar que se guardó
firebase functions:config:get
```

**¡ESO ES TODO!** No necesitas Firebase Admin credentials porque las funciones ya están autenticadas automáticamente. ✨

---

### PASO 5: Actualizar URLs en el Frontend (3 minutos)

Debes cambiar las URLs de las funciones en `preventa_artistas.html`:

**ANTES (Netlify):**
```javascript
const response = await fetch('/.netlify/functions/create-payment', {
```

**DESPUÉS (Firebase):**
```javascript
const response = await fetch('https://vyt-music.web.app/createPayment', {
```

**O mejor aún, usa URLs relativas si despliegas en el mismo dominio:**
```javascript
const response = await fetch('/createPayment', {
```

---

### PASO 6: Configurar firebase.json (3 minutos)

**Archivo: `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**",
      "netlify/**",
      "*.md",
      "test_*.html"
    ],
    "rewrites": [
      {
        "source": "/createPayment",
        "function": "createPayment"
      },
      {
        "source": "/mercadopagoWebhook",
        "function": "mercadopagoWebhook"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

---

### PASO 7: Desplegar Todo (2 minutos)

```bash
# Desplegar hosting y functions al mismo tiempo
firebase deploy

# O por separado:
firebase deploy --only hosting
firebase deploy --only functions
```

**¡Listo!** Tu sitio estará disponible en:
- `https://vyt-music.web.app`
- `https://vyt-music.firebaseapp.com`

---

## 🌐 DOMINIO PERSONALIZADO (Opcional)

Si quieres usar tu propio dominio (ej: `vytmusic.com`):

```bash
firebase hosting:channel:deploy live
```

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto `vyt-music`
3. Ve a **Hosting**
4. Click **"Agregar dominio personalizado"**
5. Sigue los pasos para verificar tu dominio
6. Firebase te dará registros DNS para configurar

---

## 📝 RESUMEN DE CAMBIOS NECESARIOS

### Archivos a Crear/Modificar:

1. ✅ **`functions/index.js`** - Nuevas Cloud Functions
2. ✅ **`functions/package.json`** - Dependencias
3. ✅ **`firebase.json`** - Configuración de hosting
4. ✅ **`preventa_artistas.html`** - Cambiar URLs de funciones

### Archivos que NO necesitas más:

- ❌ `netlify.toml`
- ❌ `netlify/functions/*`
- ❌ `.env.netlify` (¡ya no necesitas variables de entorno manuales!)

---

## ✅ VENTAJAS DE ESTA MIGRACIÓN

1. **Más Simple:** No necesitas configurar variables de entorno en un dashboard
2. **Todo en un Lugar:** Hosting + Database + Functions en Firebase
3. **Más Rápido:** Firebase Functions accede directamente a Firestore sin credenciales
4. **Más Seguro:** No necesitas exponer Firebase Admin SDK credentials
5. **Gratis:** Plan gratuito generoso
6. **SSL Automático:** HTTPS configurado automáticamente
7. **CDN Global:** Tu sitio se distribuye globalmente automáticamente

---

## 🎯 CHECKLIST DE MIGRACIÓN

- [ ] Instalar Firebase CLI (`npm install -g firebase-tools`)
- [ ] Login a Firebase (`firebase login`)
- [ ] Inicializar proyecto (`firebase init`)
- [ ] Crear `functions/index.js` con el código
- [ ] Instalar dependencias (`cd functions && npm install`)
- [ ] Configurar token MP (`firebase functions:config:set`)
- [ ] Actualizar URLs en `preventa_artistas.html`
- [ ] Configurar `firebase.json`
- [ ] Desplegar (`firebase deploy`)
- [ ] Probar en `https://vyt-music.web.app`

---

## 🧪 TESTING DESPUÉS DE MIGRAR

1. Abre: `https://vyt-music.web.app/preventa_artistas.html?eventId=test&eventName=Prueba`
2. Completa el formulario
3. Click "Pagar con Mercado Pago"
4. Verifica que redirige a Mercado Pago
5. Paga con tarjeta de prueba
6. Verifica que el pago se aprueba automáticamente

---

## 💰 COSTOS

**Plan Gratuito de Firebase Hosting:**
- 10 GB de almacenamiento
- 360 MB/día de transferencia (≈ 10 GB/mes)
- Dominio gratis (.web.app)
- SSL gratis

**Plan Gratuito de Cloud Functions:**
- 2 millones de invocaciones/mes
- 400,000 GB-segundos de compute
- 200,000 GB-segundos de memoria
- 5 GB de tráfico de salida

**Para tu caso:** GRATIS (estás muy por debajo de los límites)

---

## 🚀 TIEMPO TOTAL DE MIGRACIÓN

- Lectura de esta guía: 10 min
- Setup inicial: 5 min
- Crear funciones: 10 min
- Configuración: 5 min
- Deploy: 2 min
- Testing: 3 min

**TOTAL: ~35 minutos**

---

## 📞 ¿NECESITAS AYUDA?

Si decides migrar, puedo:
1. Crear todos los archivos necesarios
2. Guiarte paso a paso
3. Ayudarte con cualquier error

**¿Quieres que proceda con la migración?** Solo dime y creo todos los archivos automáticamente. 🚀

---

**Recomendación:** Firebase Hosting es MUCHO más simple para tu caso porque ya usas Firebase. La configuración toma 35 minutos pero después todo es automático. 🔥
