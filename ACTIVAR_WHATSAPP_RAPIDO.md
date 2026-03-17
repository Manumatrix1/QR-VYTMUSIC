# ⚡ GUÍA RÁPIDA: Activar Notificaciones WhatsApp

## 🎯 QUÉ SE SOLUCIONÓ

✅ **Problema 1:** Cliente ya no vuelve a ver opciones de pago después de pagar  
✅ **Problema 2:** Ahora recibirás notificaciones automáticas en WhatsApp cuando alguien pague

---

## 📱 ACTIVAR NOTIFICACIONES (5 minutos)

### PASO 1: Activar CallMeBot en tu WhatsApp

1. **Agregar contacto CallMeBot:**
   - Abrí WhatsApp
   - Nuevo contacto: `+34 644 44 80 61`
   - Guárdalo como "CallMeBot"

2. **Enviar mensaje de activación:**
   - Abrí el chat con CallMeBot
   - Enviá exactamente este mensaje: `I allow callmebot to send me messages`
   - **IMPORTANTE:** El mensaje tiene que ser exacto (en inglés)

3. **Recibir tu API Key:**
   - CallMeBot te responderá con tu **API Key** (un número)
   - Ejemplo: `123456`
   - 📋 **COPIÁ ese número y guardalo**

---

### PASO 2: Configurar en Netlify

1. **Ir a Netlify:**
   - Abrí: https://app.netlify.com
   - Logueate
   - Seleccioná tu sitio **vytmusic**

2. **Agregar variables:**
   - Click en **Site settings** (configuración del sitio)
   - En el menú izquierdo: **Environment variables**
   - Click en **Add a variable**

3. **Variable 1 - API Key:**
   ```
   Key: CALLMEBOT_API_KEY
   Value: [pegá el número que te dio CallMeBot]
   ```
   - Click **Create variable**

4. **Variable 2 - Tu teléfono:**
   ```
   Key: ADMIN_PHONE
   Value: 543413632329
   ```
   - Click **Create variable**

5. **Redeploy el sitio:**
   - Arriba click en **Deploys**
   - Click en **Trigger deploy**
   - Seleccioná **Deploy site**
   - Esperá 1-2 minutos

---

## ✅ CÓMO PROBAR QUE FUNCIONA

### Opción 1: Hacer una compra de prueba

1. Ir a tu página de preventa
2. Completar el formulario
3. Hacer una compra de prueba con Mercado Pago
4. Usar tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   CVV: 123
   Vencimiento: 11/25
   Nombre: APRO
   ```
5. **Deberías recibir un WhatsApp automático** 🎉

### Opción 2: Ver los logs

1. Ve a: https://app.netlify.com
2. Click en tu sitio
3. **Functions** → **mercadopago-webhook**
4. **Function log**

Buscá estos mensajes:
```
✅ Notificación WhatsApp enviada exitosamente
```

---

## 🎉 RESULTADO

Cuando alguien pague con Mercado Pago, **te llegará automáticamente un WhatsApp** con:
- 💰 Nombre del cliente
- 📱 Teléfono del cliente
- 🎟️ Cantidad de entradas
- 💵 Monto pagado
- 🔗 Link directo al panel de admin

---

## ⚠️ SI NO FUNCIONA

1. **Verificá que enviaste el mensaje correcto a CallMeBot:**
   - Tiene que ser exactamente: `I allow callmebot to send me messages`
   - En inglés, sin cambios

2. **Verificá las variables en Netlify:**
   - Tienen que estar exactamente como arriba
   - Sin espacios extras
   - El teléfono con 54 adelante

3. **Hacé redeploy:**
   - Las variables nuevas solo funcionan después de hacer redeploy

4. **Mirá los logs:**
   - Si dice "CallMeBot no configurado" → falta agregar las variables
   - Si dice "Error respuesta CallMeBot" → verificá el API Key

---

## 💡 IMPORTANTE

- ✅ CallMeBot es **100% gratis**
- ✅ Tiene límite de **100 mensajes por día** (más que suficiente)
- ✅ Las notificaciones son **instantáneas**
- ✅ El cliente NO ve estas notificaciones (solo vos)

---

## 📊 RESUMEN DE LOS CAMBIOS

### Lo que ya funciona automáticamente:
1. ✅ Cliente paga en Mercado Pago
2. ✅ Mercado Pago confirma el pago
3. ✅ Tu sistema actualiza la orden a "aprobado"
4. ✅ **NUEVO:** Te llega WhatsApp automático
5. ✅ Cliente ve sus entradas QR
6. ✅ **NUEVO:** Cliente NO vuelve a ver opciones de pago

### Lo único que tenés que hacer:
1. Activar CallMeBot (2 minutos)
2. Agregar las 2 variables en Netlify (2 minutos)
3. Redeploy (1 minuto)
4. ¡Listo! Ya funciona 🚀

---

## 🔗 LINKS ÚTILES

- **Netlify Dashboard:** https://app.netlify.com
- **Firebase Console:** https://console.firebase.google.com
- **Panel Admin Preventa:** https://vytmusic.netlify.app/admin_preventa.html

---

**¿Dudas?** Revisá [SOLUCION_PROBLEMAS_MERCADOPAGO.md](SOLUCION_PROBLEMAS_MERCADOPAGO.md) para más detalles técnicos.
