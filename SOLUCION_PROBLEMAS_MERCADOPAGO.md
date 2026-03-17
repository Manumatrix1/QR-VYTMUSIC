# 🔧 SOLUCIÓN: Problemas con Mercado Pago

**Fecha:** 17 de marzo de 2026  
**Problemas reportados:**
1. ❌ Cliente ve opciones de pago nuevamente después de pagar
2. ❌ No llegan notificaciones de WhatsApp cuando se recibe un pago

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. 🔄 Problema: "Vuelve a salir pagar"

**Causa raíz:** Cuando el cliente volvía desde Mercado Pago con `payment=success`, el sistema hacía un `location.reload()` después de 3 segundos, lo cual perdía el contexto de la orden y volvía a mostrar el formulario de pago.

**Solución aplicada:**

En [preventa_artistas.html](preventa_artistas.html#L577-L632), ahora el sistema:

1. ✅ Verifica el estado real de la orden en Firebase
2. ✅ Si está `approved`, **oculta las secciones de solicitud y pago**
3. ✅ Continúa directamente al paso siguiente (nombres o selección artista)
4. ✅ Si aún está `pending`, muestra la sección de espera con listener en tiempo real

**Código actualizado (líneas 577-632):**
```javascript
if (paymentStatus === 'success') {
    // Verificar estado REAL en Firebase
    const orderSnap = await getDoc(orderRef);
    
    if (orderData.status === 'approved') {
        // ✅ OCULTAR formularios de pago
        document.getElementById('section-request').classList.add('hidden');
        document.getElementById('section-payment').classList.add('hidden');
        
        // ✅ Continuar al siguiente paso
        if (orderData.attendeeNames) {
            // Ya tiene nombres → ir a selección de artista
        } else {
            // Pedir nombres
        }
    }
}
```

---

### 2. 📱 Problema: "Nunca me envió mensaje por WhatsApp"

**Causa raíz:** El webhook actualizaba Firebase pero no tenía implementado el envío de notificaciones.

**Solución aplicada:**

En [netlify/functions/mercadopago-webhook.js](netlify/functions/mercadopago-webhook.js#L100-L160), ahora el webhook:

1. ✅ Prepara un mensaje completo con datos del cliente
2. ✅ Intenta enviar usando **CallMeBot API** (gratis)
3. ✅ Guarda los datos en Firebase como backup
4. ✅ Registra todo en logs para debugging

**Nuevo código (líneas 100-160):**
```javascript
// 📱 ENVIAR NOTIFICACIÓN WHATSAPP CON CALLMEBOT
const callMeBotKey = process.env.CALLMEBOT_API_KEY;
const adminPhone = process.env.ADMIN_PHONE;

if (callMeBotKey && adminPhone) {
    const shortMessage = `🎉 PAGO APROBADO: ${clientName} - ${quantity} entradas - $${totalAmount}`;
    const callMeBotURL = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(shortMessage)}&apikey=${callMeBotKey}`;
    
    const response = await fetch(callMeBotURL);
    
    if (response.ok) {
        console.log('✅ Notificación WhatsApp enviada');
        await orderRef.update({
            whatsappNotificationSent: true
        });
    }
}
```

---

## 🎯 CONFIGURACIÓN REQUERIDA (5 minutos)

### ⚡ Opción Recomendada: CallMeBot (GRATIS)

**Paso 1: Activar CallMeBot**

1. En tu WhatsApp, agrega el contacto: `+34 644 44 80 61` (nombre: CallMeBot)
2. Envíale este mensaje exacto: `I allow callmebot to send me messages`
3. Recibirás tu **API Key** (algo como: `123456`)
4. Guarda ese número

**Paso 2: Configurar en Netlify**

1. Ve a: https://app.netlify.com
2. Selecciona tu sitio **vytmusic**
3. **Site settings** → **Environment variables** → **Add a variable**

Agregar estas dos variables:

```
Variable 1:
Key: CALLMEBOT_API_KEY
Value: [el código que recibiste de CallMeBot]

Variable 2:
Key: ADMIN_PHONE
Value: 543413632329
```

4. Guarda y **redeploy** el sitio:
   - Ve a **Deploys** → **Trigger deploy** → **Deploy site**

**Paso 3: Probar**

1. Haz una compra de prueba desde [preventa_artistas.html](preventa_artistas.html)
2. Completa el pago en Mercado Pago (usa tarjeta de prueba)
3. Deberías recibir un mensaje automático en tu WhatsApp ✨

---

## 🔍 CÓMO VERIFICAR QUE FUNCIONA

### Ver Logs del Webhook

1. Ve a: https://app.netlify.com
2. Sitio **vytmusic** → **Functions** → **mercadopago-webhook**
3. Click en **Function log**

**Logs exitosos deberían mostrar:**
```
🔔 Webhook recibido de Mercado Pago
💳 Payment ID recibido: 123456789
✅ Pago APROBADO
✅ Orden XXX actualizada a APPROVED
📲 Enviando notificación WhatsApp con CallMeBot...
✅ Notificación WhatsApp enviada exitosamente
```

### Ver Datos en Firebase

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto → **Firestore Database**
3. Busca la colección `ticket_orders_{eventId}`
4. Abre una orden reciente

Deberías ver estos campos nuevos:
```
whatsappNotificationSent: true
whatsappNotificationMethod: 'callmebot'
whatsappNotificationTimestamp: [fecha]
whatsappNotificationMessage: [el mensaje completo]
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No recibo mensajes de WhatsApp"

**Verificar:**
1. ✅ Que enviaste el mensaje de activación a CallMeBot
2. ✅ Que recibiste tu API Key
3. ✅ Que agregaste las variables en Netlify correctamente
4. ✅ Que hiciste redeploy después de agregar las variables

**Revisar logs:**
- Si dice "CallMeBot no configurado" → Falta agregar las variables
- Si dice "Error respuesta CallMeBot" → Verifica el API Key

### "Cliente sigue viendo opciones de pago"

**Esto ya está solucionado** en el nuevo código. Si persiste:

1. Limpia la caché del navegador (Ctrl + Shift + R)
2. Verifica que el deploy se completó correctamente
3. Revisa que la orden en Firebase tiene `status: 'approved'`

---

## 🚀 MEJORAS ALTERNATIVAS (Opcional)

Si CallMeBot te queda chico (máx 100 mensajes/día), hay opciones profesionales:

### Twilio WhatsApp API
- Más confiable
- Sin límites
- Costo: ~USD 0.005 por mensaje
- Ver: [GUIA_NOTIFICACIONES_WHATSAPP.md](GUIA_NOTIFICACIONES_WHATSAPP.md)

### Telegram Bot
- 100% gratis ilimitado
- Más fácil que WhatsApp
- Notificaciones push automáticas

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| [mercadopago-webhook.js](netlify/functions/mercadopago-webhook.js) | Integración CallMeBot | Enviar notificaciones WhatsApp automáticas |
| [preventa_artistas.html](preventa_artistas.html#L577) | Verificación estado avanzada | Evitar mostrar pago 2 veces |
| [GUIA_NOTIFICACIONES_WHATSAPP.md](GUIA_NOTIFICACIONES_WHATSAPP.md) | Documentación | Guía completa alternativas notificación |

---

## ✅ PRÓXIMOS PASOS

1. **Activar CallMeBot** (5 minutos) - ver arriba
2. **Configurar variables en Netlify** (2 minutos)
3. **Hacer deploy** (automático)
4. **Probar con compra real**

---

## 📞 SOPORTE

Si necesitas ayuda:
- Revisa los logs del webhook en Netlify
- Verifica las variables de entorno
- Comprueba que CallMeBot respondió con tu API Key

El sistema ahora está preparado para notificaciones automáticas 🎉
