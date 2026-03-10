# 🔔 CONFIGURAR WEBHOOK IPN EN MERCADO PAGO

## ¿Qué es un Webhook?

Un webhook es una URL que Mercado Pago llama automáticamente cuando sucede un evento (pago aprobado, rechazado, etc.). Esto permite que tu sistema se entere inmediatamente cuando un usuario paga.

**Sin webhook:** Tienes que aprobar manualmente cada pago en el sistema.  
**Con webhook:** Los pagos se aprueban automáticamente en cuanto MP confirma el pago. ✨

---

## 🎯 PASO 1: Acceder al Dashboard de Mercado Pago

1. Ve a: **https://www.mercadopago.com.ar/developers**
2. Inicia sesión con tu cuenta de Mercado Pago
3. En el menú izquierdo, busca **"Tus aplicaciones"** o **"Your applications"**
4. Click en tu aplicación (ej: "VYTMUSIC Preventa")
   - Si no tienes una aplicación creada, créala:
     - Click **"Crear aplicación"**
     - Nombre: `VYTMUSIC Preventa`
     - Tipo: **Pagos online** → **Checkout Pro**
     - Click **Crear**

---

## 🔧 PASO 2: Configurar Notificaciones (IPN / Webhooks)

### Opción A: Si ves "Notificaciones IPN"

1. En tu aplicación, busca la sección **"Notificaciones IPN"** o **"IPN Notifications"**
2. Click en **"Configurar"** o **"Configure"**
3. En **"URL de notificaciones"**:
   ```
   https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook
   ```
4. **Eventos a notificar:** Marca **"Pagos"** (Payments)
5. Click **"Guardar"**

### Opción B: Si ves "Webhooks"

1. En tu aplicación, ve a **"Webhooks"**
2. Click **"Agregar webhook"** o **"Add webhook"**
3. Completa:
   - **URL:** `https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook`
   - **Eventos:** Selecciona **"payment"** (pago)
   - **Versión:** v1 (o la más reciente)
4. Click **"Crear"** o **"Create"**

### Opción C: Configuración Global (si no aparecen las opciones anteriores)

1. En el dashboard principal de MP, ve a **"Configuración"** → **"Integraciones"**
2. Busca **"Notificaciones Webhooks"**
3. Agrega la URL:
   ```
   https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook
   ```

---

## 📝 PASO 3: Verificar que se Guardó

Deberías ver algo como:

```
✅ Webhook configurado
URL: https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook
Eventos: payment
Estado: Activo
```

---

## 🧪 PASO 4: Probar el Webhook

### Hacer una Compra de Prueba

1. Ve a tu sitio de preventa
2. Completa el formulario de compra
3. Click en **"Pagar con Mercado Pago"**
4. En la página de MP, usa una **tarjeta de prueba**:

**Tarjeta que APRUEBA:**
```
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25 (cualquier fecha futura)
Nombre: APRO
```

**Tarjeta que RECHAZA:**
```
Número: 5031 4332 1540 6351
CVV: 123
Vencimiento: 11/25
Nombre: OTHE
```

### ¿Qué debería pasar?

1. ✅ Mercado Pago te muestra "Pago aprobado"
2. ✅ Te redirige de vuelta a tu sitio
3. ✅ **AUTOMÁTICAMENTE** el estado de la orden cambia a "approved" en Firebase
4. ✅ Puedes ver los QRs generados

Si NO cambia automáticamente → El webhook NO está funcionando.

---

## 🐛 DEBUGGING: ¿El Webhook No Funciona?

### Ver Logs del Webhook en Netlify

1. Ve a: **https://app.netlify.com**
2. Selecciona tu sitio "vytmusic"
3. Ve a **Functions**
4. Click en **mercadopago-webhook**
5. Click en **Function log**
6. Busca mensajes como:

**✅ Si funciona:**
```
🔔 Webhook recibido de Mercado Pago
💳 Payment ID recibido: 123456789
💰 Detalles del pago: {...}
✅ Pago APROBADO
✅ Orden XXX actualizada a APPROVED automáticamente
```

**❌ Si NO funciona:**
- No aparecen mensajes → Mercado Pago NO está enviando notificaciones
- Aparece error → Revisa el mensaje de error

### Ver Logs en Mercado Pago

1. En tu aplicación de MP, ve a **"Webhooks"** o **"Notificaciones"**
2. Busca una sección de **"Historial"** o **"Logs"**
3. Verifica si MP está enviando notificaciones:
   - ✅ Estado 200: Webhook recibido correctamente
   - ❌ Estado 4XX/5XX: Error en tu servidor

---

## ⚠️ PROBLEMAS COMUNES

### Problema 1: "URL no válida"

**Causa:** La URL tiene un error de escritura o el sitio no está desplegado.

**Solución:**
- Verifica que la URL sea exactamente: `https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook`
- Verifica que tu sitio esté desplegado en Netlify

### Problema 2: "Webhook retorna 500"

**Causa:** Variables de entorno NO configuradas en Netlify.

**Solución:**
- Verifica que las 4 variables estén configuradas (ver GUIA_CONFIGURACION_NETLIFY.md)
- Haz un re-deploy del sitio

### Problema 3: "No recibo notificaciones"

**Causa:** MP puede tardar unos minutos en empezar a enviar webhooks.

**Solución:**
- Espera 5-10 minutos después de configurar
- Haz otra compra de prueba

### Problema 4: "Webhook funciona, pero orden no se actualiza"

**Causa:** El `external_reference` no coincide con el `orderId`.

**Solución:**
- Verifica en el log del webhook que aparezca: `🔍 Buscando orden XXX en evento YYY`
- Si dice "Orden no encontrada" → El orderId no coincide

---

## 📊 FLUJO COMPLETO (Como Debería Funcionar)

```
1. Usuario completa formulario
   ↓
2. Sistema crea orden en Firebase (status: 'pending')
   ↓
3. Sistema llama a /.netlify/functions/create-payment
   ↓
4. Función crea preferencia en Mercado Pago
   ↓
5. Usuario es redirigido a MP (init_point)
   ↓
6. Usuario paga con tarjeta
   ↓
7. Mercado Pago aprueba el pago
   ↓
8. 🔔 MP envía webhook a /.netlify/functions/mercadopago-webhook
   ↓
9. Webhook actualiza orden en Firebase (status: 'approved')
   ↓
10. Frontend detecta cambio (onSnapshot) y muestra siguiente paso
   ↓
11. Usuario carga nombres y genera QRs
   ↓
12. ✅ COMPLETADO
```

---

## 🎯 CHECKLIST DE CONFIGURACIÓN

- [ ] Aplicación creada en Mercado Pago Developers
- [ ] Webhook configurado con URL correcta
- [ ] Eventos "payment" seleccionados
- [ ] Webhook guardado y activo
- [ ] Variables de entorno configuradas en Netlify
- [ ] Sitio re-desplegado después de agregar variables
- [ ] Compra de prueba realizada con tarjeta de prueba
- [ ] Webhook recibió notificación (ver logs)
- [ ] Orden actualizada a "approved" automáticamente

---

## 💡 TIPS

### Tip 1: Modo Prueba vs Producción

- **Modo TEST:** Usa `TEST-xxx` token y tarjetas de prueba
- **Modo PRODUCCIÓN:** Usa `APP_USR-xxx` token y tarjetas reales

Tu token actual: `APP_USR-7575962186897913-030906-...` → **PRODUCCIÓN**

Si quieres probar sin cobrar de verdad, primero cambia a modo TEST.

### Tip 2: Webhook en Desarrollo Local

Para probar el webhook localmente:
1. Usa **ngrok** o **Netlify Dev**
2. Configura tu URL local en MP
3. Haz pruebas

### Tip 3: Múltiples Webhooks

Puedes configurar múltiples URLs de webhook si necesitas:
- Una para producción
- Una para testing
- Una para desarrollo local

---

## 📞 SOPORTE

Si después de configurar el webhook sigue sin funcionar:

1. **Revisa los logs:**
   - Netlify Functions → mercadopago-webhook → Function log
   - Mercado Pago Dashboard → Webhooks → Historial

2. **Verifica:**
   - Variables de entorno configuradas ✅
   - URL del webhook correcta ✅
   - Sitio desplegado ✅

3. **Prueba con tarjeta de prueba:**
   - Haz una compra con la tarjeta APRO
   - Verifica los logs inmediatamente después

---

## 📚 RECURSOS

- **Documentación oficial MP:** https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
- **Tarjetas de prueba:** https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards
- **Logs Netlify:** https://app.netlify.com → Functions → mercadopago-webhook

---

## ✅ RESUMEN

**Lo más importante:**
1. Configura el webhook en MP con la URL de tu función de Netlify
2. Selecciona eventos de "payment"
3. Haz una prueba con tarjeta de prueba
4. Verifica los logs para confirmar que funciona

**Una vez configurado, los pagos se aprobarán automáticamente sin intervención manual.** 🚀

---

**Última actualización:** 9 de marzo de 2026  
**Sistema:** VYTMUSIC QR - Sistema de Gestión de Eventos
