# 💳 Integración Mercado Pago - Guía Completa

## 🎯 Objetivo
Automatizar la verificación de pagos para que cuando un artista pague, se apruebe automáticamente sin intervención manual.

## 📋 Estado Actual vs Estado Objetivo

### ❌ Actualmente (Manual):
1. Artista solicita entradas
2. Artista hace transferencia bancaria
3. Artista sube comprobante
4. **TÚ verificas manualmente** en tu banco
5. **TÚ apruebas** en admin_preventa.html
6. Artista recarga página para ver aprobación

### ✅ Con Mercado Pago (Automático):
1. Artista solicita entradas
2. Sistema genera link de pago de Mercado Pago
3. Artista paga con QR, tarjeta, etc (en página de MP)
4. **MP confirma pago automáticamente** (webhook)
5. **Sistema aprueba solo** cuando el pago impacta
6. **Artista ve aprobación en tiempo real** (sin recargar)

---

## 🚀 Pasos para Implementar

### 1️⃣ Crear Cuenta Mercado Pago Developer

1. Ir a: https://www.mercadopago.com.ar/developers
2. Crear cuenta de desarrollador (usa tu cuenta de MP personal)
3. Crear una aplicación nueva
4. Obtener credenciales:
   - **Public Key** (para frontend)
   - **Access Token** (para backend - ¡MANTENER SECRETO!)

### 2️⃣ Instalar Backend (Necesario para Webhooks)

Mercado Pago requiere un **servidor backend** para recibir notificaciones de pago.

**Opciones:**
- Netlify Functions (Recomendado - gratis, fácil)
- Vercel Serverless Functions
- AWS Lambda
- Servidor Node.js propio

**Ejemplo con Netlify Functions:**

```bash
# Crear carpeta netlify/functions
mkdir -p netlify/functions

# Instalar SDK de Mercado Pago
npm install mercadopago
```

### 3️⃣ Crear Función para Generar Preferencia de Pago

**Archivo: `netlify/functions/create-payment.js`**

```javascript
const mercadopago = require('mercadopago');

// Configurar con tu Access Token
mercadopago.configure({
  access_token: 'TU_ACCESS_TOKEN_AQUI'
});

exports.handler = async (event) => {
  const { orderId, totalAmount, artistName, artistEmail, quantity } = JSON.parse(event.body);

  try {
    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: `Entradas VYT Music - ${quantity} tickets`,
          unit_price: totalAmount,
          quantity: 1,
        }
      ],
      payer: {
        name: artistName,
        email: artistEmail
      },
      back_urls: {
        success: `https://vytmusic.netlify.app/preventa_artistas.html?orderId=${orderId}&status=success`,
        failure: `https://vytmusic.netlify.app/preventa_artistas.html?orderId=${orderId}&status=failure`,
        pending: `https://vytmusic.netlify.app/preventa_artistas.html?orderId=${orderId}&status=pending`
      },
      auto_return: "approved",
      notification_url: "https://vytmusic.netlify.app/.netlify/functions/payment-webhook",
      external_reference: orderId, // Tu orden ID de Firebase
      statement_descriptor: "VYTMUSIC"
    };

    const response = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: response.body.id,
        init_point: response.body.init_point // URL para que el usuario pague
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 4️⃣ Crear Función Webhook para Recibir Notificaciones

**Archivo: `netlify/functions/payment-webhook.js`**

```javascript
const mercadopago = require('mercadopago');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Tus credenciales de Firebase Admin SDK
      projectId: "TU_PROJECT_ID",
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const { data, type } = JSON.parse(event.body);

  // Solo procesar pagos aprobados
  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.findById(data.id);
      
      if (payment.body.status === 'approved') {
        const orderId = payment.body.external_reference; // Tu ID de Firebase
        const eventId = 'EVENTO_ID'; // Extraer de external_reference si lo incluyes
        
        // Actualizar orden en Firebase
        await db.collection(`ticket_orders_${eventId}`).doc(orderId).update({
          status: 'approved',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'mercadopago_auto',
          mercadoPagoId: payment.body.id,
          paymentMethod: 'mercadopago'
        });

        console.log(`✅ Orden ${orderId} aprobada automáticamente`);
      }

      return { statusCode: 200, body: 'OK' };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      return { statusCode: 500, body: 'Error' };
    }
  }

  return { statusCode: 200, body: 'OK' };
};
```

### 5️⃣ Modificar Frontend (preventa_artistas.html)

**En lugar de subir comprobante, redirigir a Mercado Pago:**

```javascript
// Después de crear la orden en Firebase
const response = await fetch('/.netlify/functions/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: currentOrderId,
    totalAmount: totalAmount,
    artistName: artistName,
    artistEmail: artistEmail,
    quantity: quantity
  })
});

const { init_point } = await response.json();

// Redirigir al usuario a pagar en Mercado Pago
window.location.href = init_point;
```

### 6️⃣ Configurar Variables de Entorno en Netlify

En tu panel de Netlify:
1. Site settings → Environment variables
2. Agregar:
   - `MERCADOPAGO_ACCESS_TOKEN` = tu access token
   - `FIREBASE_PRIVATE_KEY` = tu private key de Firebase
   - `FIREBASE_CLIENT_EMAIL` = tu client email de Firebase

---

## 💡 Ventajas de Mercado Pago

✅ **Aprobación automática** - Sin verificación manual
✅ **Seguridad** - MP valida el pago real
✅ **Múltiples métodos** - Tarjeta, QR, efectivo (RapiPago/PagoFácil)
✅ **QR instantáneo** - Usuario escanea y paga desde celular
✅ **Notificaciones** - Email automático al usuario
✅ **Protección** - Cobertura contra fraudes

---

## 💰 Costos Mercado Pago (Argentina 2026)

- **Tarjeta de crédito/débito**: ~3-4% + IVA
- **Medios offline (RapiPago)**: ~2-3% + IVA
- **Cuenta Mercado Pago**: 0% (si el usuario paga desde su saldo)

**Ejemplo:** Entrada $10,000 → Comisión ~$400 → Recibes $9,600

---

## 🔄 Flujo Completo con MP

```mermaid
Usuario solicita entradas
    ↓
Sistema crea orden en Firebase (status: pending)
    ↓
Sistema llama a create-payment.js
    ↓
MP genera link de pago
    ↓
Usuario paga en página de MP
    ↓
MP envía webhook a payment-webhook.js
    ↓
Webhook actualiza Firebase (status: approved)
    ↓
Listener en preventa_artistas.html detecta cambio
    ↓
Página avanza automáticamente a paso 4 (cargar nombres)
```

---

## 📚 Recursos Útiles

- **Documentación oficial**: https://www.mercadopago.com.ar/developers/es/docs
- **SDK Node.js**: https://github.com/mercadopago/sdk-nodejs
- **Testing sandbox**: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-integration
- **Tarjetas de prueba**: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

## ⚠️ Importante

1. **Nunca expongas tu Access Token en el frontend** (solo en backend/Netlify Functions)
2. **Valida siempre el webhook** antes de aprobar automáticamente
3. **Usa modo sandbox** para testing antes de producción
4. **Guarda el `mercadoPagoId`** en Firebase para hacer seguimiento

---

## 🎯 Próximos Pasos

1. ✅ Sistema en tiempo real implementado (listener)
2. ✅ Precios de niños agregados
3. ⏳ Crear cuenta Mercado Pago Developer
4. ⏳ Configurar Netlify Functions
5. ⏳ Integrar create-payment
6. ⏳ Integrar webhook
7. ⏳ Testing con tarjetas de prueba
8. ⏳ Activar en producción

---

**¿Necesitas ayuda con alguno de estos pasos? ¡Avísame!** 🚀
