# 📱 GUÍA: Notificaciones Automáticas por WhatsApp

## 🎯 Objetivo
Recibir una notificación automática en tu WhatsApp cuando un cliente completa el pago en Mercado Pago.

## ✅ ¿Qué Ya Está Implementado?

El webhook (`mercadopago-webhook.js`) ahora:
1. ✅ Actualiza la orden a `approved` automáticamente
2. ✅ Prepara el mensaje de WhatsApp con todos los datos del cliente
3. ✅ Guarda el mensaje en Firebase para que puedas verlo después
4. ✅ Registra en logs toda la información

## 📲 Opciones para Recibir Notificaciones Reales

### OPCIÓN 1: CallMeBot (GRATIS - Más Simple)

**Ventajas:**
- ✅ 100% Gratis
- ✅ Configuración en 2 minutos
- ✅ No requiere código de servidor

**Desventajas:**
- ⚠️ Límite de 100 mensajes/día
- ⚠️ Solo puede enviar a UN número (el tuyo)

**Cómo Configurar:**

1. **Activar CallMeBot en tu WhatsApp:**
   - Agrega el número `+34 644 44 80 61` a tus contactos (nombre: CallMeBot)
   - Envíale por WhatsApp: `I allow callmebot to send me messages`
   - Recibirás tu **API Key** (guárdala)

2. **Agregar tu API Key a Netlify:**
   - Ve a: https://app.netlify.com
   - Selecciona tu sitio "vytmusic"
   - **Site settings** → **Environment variables**
   - Agregar nueva variable:
     ```
     CALLMEBOT_API_KEY
     Valor: [tu API key que recibiste]
     ```
   - Agregar otra variable:
     ```
     ADMIN_PHONE
     Valor: 543413632329
     ```

3. **Actualizar el webhook** (código abajo)

**Código para agregar al webhook:**

```javascript
// Después de actualizar la orden en Firebase, agregar:

// 📱 ENVIAR NOTIFICACIÓN WHATSAPP CON CALLMEBOT
try {
  const callMeBotKey = process.env.CALLMEBOT_API_KEY;
  const adminPhone = process.env.ADMIN_PHONE;
  
  if (callMeBotKey && adminPhone) {
    const shortMessage = `🎉 PAGO APROBADO: ${clientName} - ${quantity} entradas - $${totalAmount.toLocaleString()}. Ver: ${adminLink}`;
    
    const callMeBotURL = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(shortMessage)}&apikey=${callMeBotKey}`;
    
    // Enviar notificación
    const response = await fetch(callMeBotURL);
    
    if (response.ok) {
      console.log('✅ Notificación WhatsApp enviada con CallMeBot');
      await orderRef.update({
        whatsappNotificationSent: true,
        whatsappNotificationMethod: 'callmebot'
      });
    } else {
      console.error('❌ Error enviando WhatsApp:', await response.text());
    }
  }
} catch (notifError) {
  console.error('⚠️ Error con CallMeBot:', notifError);
}
```

---

### OPCIÓN 2: Twilio WhatsApp API (PROFESIONAL - De Pago)

**Ventajas:**
- ✅ Ilimitado
- ✅ Muy confiable
- ✅ Puede enviar a múltiples números
- ✅ Incluye confirmación de entrega

**Desventajas:**
- 💵 Costo: ~USD 0.005 por mensaje
- 🔧 Requiere cuenta de Twilio

**Cómo Configurar:**

1. **Crear cuenta en Twilio:**
   - Ve a: https://www.twilio.com/try-twilio
   - Regístrate (incluye crédito gratis para pruebas)
   - Verifica tu número de WhatsApp

2. **Obtener credenciales:**
   - Account SID
   - Auth Token
   - WhatsApp Sender Number (ej: whatsapp:+14155238886)

3. **Agregar variables en Netlify:**
   ```
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_WHATSAPP_FROM
   ADMIN_WHATSAPP
   ```

4. **Instalar dependencia:**
   - Agregar en `netlify/functions/package.json`:
     ```json
     "dependencies": {
       "firebase-admin": "^12.0.0",
       "node-fetch": "^2.7.0",
       "twilio": "^4.20.0"
     }
     ```

5. **Código para el webhook:**

```javascript
const twilio = require('twilio');

// Crear cliente Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Enviar mensaje
await client.messages.create({
  from: process.env.TWILIO_WHATSAPP_FROM, // ej: 'whatsapp:+14155238886'
  to: `whatsapp:+${process.env.ADMIN_WHATSAPP}`, // ej: 'whatsapp:+543413632329'
  body: whatsappMessage
});
```

---

### OPCIÓN 3: Telegram Bot (GRATIS - Alternativa)

Si prefieres Telegram:

1. Crear bot con @BotFather
2. Obtener Bot Token
3. Enviar notificaciones vía HTTP

**Ventajas:**
- ✅ Gratis ilimitado
- ✅ Más fácil que WhatsApp
- ✅ Incluye notificaciones push automáticas

---

## 🔥 RECOMENDACIÓN PERSONAL

**Para empezar: CallMeBot**
- Es gratis
- Configuración en 2 minutos
- Suficiente para tu volumen actual

**Cuando crezca el negocio: Twilio**
- Más profesional
- Sin límites
- Muy confiable

---

## 📝 Próximos Pasos

1. ✅ Elige una opción (recomiendo CallMeBot para empezar)
2. ✅ Sigue los pasos de configuración
3. ✅ Actualiza el webhook con el código correspondiente
4. ✅ Haz una compra de prueba para verificar

---

## 🐛 Debugging

**Ver logs del webhook:**
1. Ve a: https://app.netlify.com
2. Selecciona tu sitio
3. **Functions** → **mercadopago-webhook** → **Function log**

**Ver datos guardados en Firebase:**
- Los mensajes preparados están en cada orden:
  - `whatsappNotificationURL`
  - `whatsappNotificationMessage`
  - `whatsappNotificationSent`
