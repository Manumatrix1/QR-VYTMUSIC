# 📚 ÍNDICE: Documentación Sistema de Pago Mercado Pago

**Fecha de análisis:** 9 de marzo de 2026  
**Problema reportado:** Sistema de pago no redirige a Mercado Pago  
**Estado:** ✅ Problema identificado - Solución documentada

---

## 🎯 INICIO RÁPIDO

**Si solo tienes 5 minutos, lee esto:**

👉 **[SOLUCION_RAPIDA_MP.txt](SOLUCION_RAPIDA_MP.txt)** - Resumen ejecutivo con los pasos exactos

---

## 📖 DOCUMENTOS CREADOS (Por Orden de Lectura)

### 1. 📄 SOLUCION_RAPIDA_MP.txt
**Lee esto primero** - Resumen ejecutivo en texto plano con los 3 pasos para solucionar el problema.

**Contenido:**
- Problema detectado
- Solución en 3 pasos
- Variables de entorno a configurar (copiar/pegar)
- Archivos creados

**Tiempo de lectura:** 2 minutos  
**Acción requerida:** Configurar variables en Netlify

---

### 2. 📘 GUIA_CONFIGURACION_NETLIFY.md
**Guía paso a paso detallada** - Instrucciones con capturas y explicaciones para configurar Netlify.

**Contenido:**
- Checklist antes de empezar
- 4 pasos detallados con screenshots mentales
- Cada variable explicada
- Cómo verificar que funcionó
- Debugging común
- Tiempo estimado: 10-15 minutos

**Tiempo de lectura:** 10 minutos  
**Acción requerida:** Seguir los pasos y configurar

---

### 3. 📊 ANALISIS_SISTEMA_PAGO_MERCADOPAGO.md
**Análisis técnico completo** - Diagnóstico profundo del problema y arquitectura del sistema.

**Contenido:**
- Estado actual de componentes
- Problemas identificados (con explicaciones técnicas)
- Soluciones detalladas
- Cómo probar cada componente
- Diagnóstico de errores comunes
- Notas técnicas

**Tiempo de lectura:** 20 minutos  
**Acción requerida:** Leer para entender el problema a fondo

---

### 4. 🔔 CONFIGURAR_WEBHOOK_MERCADOPAGO.md
**Configuración webhook IPN** - Cómo configurar notificaciones automáticas en Mercado Pago.

**Contenido:**
- Qué es un webhook y por qué es importante
- Paso a paso para configurar en MP Dashboard
- 3 opciones según la interfaz de MP
- Cómo probar con tarjetas de prueba
- Debugging de webhooks
- Ver logs en Netlify y MP
- Flujo completo explicado

**Tiempo de lectura:** 15 minutos  
**Acción requerida:** Configurar después de configurar variables

---

### 5. 🧪 test_mercadopago_diagnostico.html
**Herramienta de diagnóstico interactiva** - Página web para probar cada componente del sistema.

**Contenido:**
- Test de variables de entorno
- Test de función create-payment
- Test de compra completa
- Checklist interactivo
- Log de pruebas en tiempo real

**Cómo usar:**
1. Abre el archivo en tu navegador
2. Click en cada botón de prueba
3. Verifica resultados en tiempo real

**Tiempo de uso:** 5 minutos  
**Acción requerida:** Probar después de configurar variables

---

## 🗺️ FLUJO DE TRABAJO RECOMENDADO

```
1. Lee SOLUCION_RAPIDA_MP.txt (2 min)
   ↓
2. Sigue GUIA_CONFIGURACION_NETLIFY.md (10 min)
   ↓
3. Configura las 4 variables en Netlify
   ↓
4. Re-despliega el sitio
   ↓
5. Abre test_mercadopago_diagnostico.html (5 min)
   ↓
6. Verifica que todo esté ✅
   ↓
7. Sigue CONFIGURAR_WEBHOOK_MERCADOPAGO.md (15 min)
   ↓
8. Configura webhook en MP Dashboard
   ↓
9. Prueba con tarjeta de prueba
   ↓
10. ✅ SISTEMA FUNCIONANDO
```

**Tiempo total estimado:** 45 minutos (la mayoría es lectura)

---

## 🎯 PROBLEMA IDENTIFICADO

### ❌ El Problema

Las variables de entorno con las credenciales de Mercado Pago y Firebase **NO están configuradas en Netlify**. 

Aunque el archivo `.env.netlify` existe en tu proyecto local con todas las claves, Netlify **NO lee automáticamente** este archivo por seguridad. Las variables deben configurarse manualmente en el dashboard de Netlify.

### ✅ La Solución

Configurar 4 variables de entorno en Netlify:
1. `MERCADOPAGO_ACCESS_TOKEN`
2. `FIREBASE_PROJECT_ID`
3. `FIREBASE_CLIENT_EMAIL`
4. `FIREBASE_PRIVATE_KEY`

**Resultado:** Después de configurar y re-desplegar, el sistema funcionará correctamente.

---

## 🔧 CAMBIOS REALIZADOS EN EL CÓDIGO

### Archivo Modificado: `netlify/functions/mercadopago-webhook.js`

**Cambio realizado:**
```javascript
// ANTES:
const admin = require('firebase-admin');

// DESPUÉS:
const fetch = require('node-fetch');
const admin = require('firebase-admin');
```

**Razón:** La función usaba `fetch` pero no lo importaba. Ya no hay error.

### Estado del Código

| Archivo | Estado | Requiere Cambios |
|---------|--------|------------------|
| `preventa_artistas.html` | ✅ OK | No |
| `netlify/functions/create-payment.js` | ✅ OK | No |
| `netlify/functions/mercadopago-webhook.js` | ✅ ARREGLADO | No |
| `netlify/functions/package.json` | ✅ OK | No |
| `.env.netlify` | ✅ OK | No |
| `netlify.toml` | ✅ OK | No |

**Conclusión:** Todo el código está correcto. Solo falta configurar Netlify.

---

## 📊 ARQUITECTURA DEL SISTEMA DE PAGO

```
                    VYTMUSIC SYSTEM
                         |
        +----------------+----------------+
        |                |                |
   Frontend         Netlify        Mercado Pago
(HTML + Firebase)  Functions      (Payment Gateway)
        |                |                |
        |                |                |
        v                v                v
   
1. Usuario rellena formulario
2. Click "Pagar con Mercado Pago"
3. Frontend → /.netlify/functions/create-payment
4. Function → API Mercado Pago (crear preferencia)
5. MP devuelve init_point (URL de pago)
6. Usuario redirigido a MP
7. Usuario paga
8. MP envía webhook → /.netlify/functions/mercadopago-webhook
9. Webhook actualiza Firebase (status: approved)
10. Frontend detecta cambio (onSnapshot)
11. Usuario continúa con nombres y QRs
```

---

## 🧪 TESTING

### Test 1: Variables Configuradas
```bash
curl -X POST https://vytmusic.netlify.app/.netlify/functions/create-payment

# Respuesta esperada si variables OK:
{"error":"Faltan campos requeridos","required":["orderId","eventId","ticketCount","totalAmount"]}

# Respuesta si variables NO configuradas:
{"error":"Mercado Pago no configurado"}
```

### Test 2: Crear Preferencia de Pago
Usa `test_mercadopago_diagnostico.html` para hacer pruebas interactivas.

### Test 3: Flujo Completo
1. Configura variables
2. Re-despliega
3. Abre `preventa_artistas.html?eventId=test&eventName=Prueba`
4. Completa formulario
5. Click "Pagar con Mercado Pago"
6. Verifica redirección a MP

---

## 📞 SOPORTE Y CONTACTO

### Si el Problema Persiste

Después de seguir todas las guías, si sigue sin funcionar:

1. **Captura de pantalla de:**
   - Variables de entorno en Netlify (con valores censurados)
   - Error en consola del navegador (F12)
   - Logs de la función en Netlify

2. **Verifica:**
   - [ ] Las 4 variables están configuradas
   - [ ] El sitio fue re-desplegado después de agregar variables
   - [ ] El deploy terminó exitosamente (estado: Published)
   - [ ] No hay errores en los logs de Netlify Functions

3. **Prueba:**
   - Abre `test_mercadopago_diagnostico.html`
   - Click en "Verificar Variables"
   - Comparte el resultado

### Recursos Oficiales

- **Mercado Pago Docs:** https://www.mercadopago.com.ar/developers/es/docs
- **Netlify Functions:** https://docs.netlify.com/functions/overview/
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup

---

## 🔐 SEGURIDAD

### Variables Sensibles

Las siguientes variables son **secretas** y NO deben compartirse:
- ❌ `MERCADOPAGO_ACCESS_TOKEN`
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_CLIENT_EMAIL`

### Dónde están seguras

✅ **Netlify Dashboard** (Environment Variables) - Solo tú puedes verlas  
✅ **Archivo local** `.env.netlify` - No se sube a GitHub  
❌ **NO** compartir en capturas de pantalla  
❌ **NO** subir a repositorios públicos

---

## ✅ CHECKLIST FINAL

Antes de dar por terminado:

- [ ] Variables de entorno configuradas en Netlify
- [ ] Sitio re-desplegado
- [ ] Deploy exitoso (estado: Published)
- [ ] Test de variables ✅ (usando test_mercadopago_diagnostico.html)
- [ ] Test de función ✅
- [ ] Compra de prueba exitosa ✅
- [ ] Redirección a Mercado Pago funciona ✅
- [ ] Webhook configurado en MP Dashboard
- [ ] Prueba con tarjeta de prueba exitosa ✅
- [ ] Orden aprobada automáticamente ✅

**Si todos los checks están marcados: ¡SISTEMA FUNCIONANDO!** 🎉

---

## 📝 NOTAS ADICIONALES

### ¿Por qué `.env.netlify` no funciona?

Los archivos `.env` son para desarrollo local. En producción, las variables deben configurarse en el dashboard del proveedor de hosting (Netlify, Vercel, etc.) por seguridad y aislamiento entre ambientes.

### ¿El token de MP expira?

Los Access Tokens pueden expirar o revocarse. Si después de un tiempo deja de funcionar, genera un nuevo token desde el dashboard de Mercado Pago y actualiza la variable en Netlify.

### ¿Puedo usar modo TEST primero?

Sí, recomendado. Para usar modo TEST:
1. Ve a MP Dashboard → Credenciales de prueba
2. Copia el token que empieza con `TEST-xxx`
3. Actualiza `MERCADOPAGO_ACCESS_TOKEN` en Netlify
4. Usa tarjetas de prueba
5. Cuando esté todo OK, cambia a token de producción `APP_USR-xxx`

---

## 🎓 APRENDIZAJE

**Lecciones de este problema:**

1. ✅ **Variables de entorno:** Deben configurarse en el servidor, no solo localmente
2. ✅ **Netlify Functions:** Actúan como backend serverless
3. ✅ **Webhooks:** Permiten automatización con proveedores externos
4. ✅ **Testing:** Usar herramientas de diagnóstico para verificar cada componente
5. ✅ **Documentación:** Tener guías claras acelera la resolución de problemas

---

## 🚀 PRÓXIMOS PASOS

Después de que el sistema de pago esté funcionando:

1. **Monitoreo:**
   - Revisar logs de Netlify Functions regularmente
   - Verificar que los webhooks se reciban correctamente

2. **Optimizaciones:**
   - Agregar manejo de errores más detallado
   - Implementar reintentos en caso de fallo del webhook
   - Agregar notificaciones por email cuando hay problemas

3. **Seguridad:**
   - Verificar firma del webhook (x-signature) de MP
   - Implementar rate limiting si es necesario
   - Rotar credenciales periódicamente

---

**Sistema:** VYTMUSIC QR - Sistema de Gestión de Eventos  
**Módulo:** Preventa de Entradas con Mercado Pago  
**Última actualización:** 9 de marzo de 2026  
**Autor:** GitHub Copilot

---

## 📌 RESUMEN EJECUTIVO

| Aspecto | Estado |
|---------|--------|
| **Problema identificado** | ✅ Variables no configuradas en Netlify |
| **Código del sistema** | ✅ Correcto (1 fix aplicado) |
| **Solución** | ✅ Documentada y simple |
| **Tiempo estimado** | 45 minutos (lectura + configuración) |
| **Dificultad** | 🟢 Fácil (copiar/pegar) |
| **Riesgo** | 🟢 Bajo (no requiere cambios de código) |

**Recomendación:** Seguir las guías en orden y verificar con las herramientas de testing.

---

¡Éxito con la implementación! 🚀
