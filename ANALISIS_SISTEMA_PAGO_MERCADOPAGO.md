# 🔍 ANÁLISIS COMPLETO: Sistema de Pago Mercado Pago

**Fecha:** 9 de marzo de 2026  
**Problema reportado:** "No entra a Mercado Pago, y ya está todo generado con las claves"

---

## ✅ ESTADO ACTUAL: Componentes Implementados

### 1. ✅ Archivo de Configuración (`.env.netlify`)
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624
```
- **Token tipo:** `APP_USR-` (PRODUCCIÓN - NO es de prueba)
- **Estado:** Token configurado correctamente
- **Ubicación:** Raíz del proyecto

### 2. ✅ Funciones Netlify Creadas

#### `netlify/functions/create-payment.js`
- **Propósito:** Crea preferencia de pago en Mercado Pago
- **Endpoint:** `/.netlify/functions/create-payment`
- **Método:** POST
- **Estado:** Código implementado correctamente

#### `netlify/functions/mercadopago-webhook.js`
- **Propósito:** Recibe notificaciones de pago de Mercado Pago
- **Endpoint:** `/.netlify/functions/mercadopago-webhook`
- **Estado:** Código implementado correctamente

#### `netlify/functions/package.json`
```json
{
  "name": "vytmusic-functions",
  "version": "1.0.0",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "node-fetch": "^2.7.0"
  }
}
```
- **Estado:** Dependencias correctas

### 3. ✅ Integración Frontend (`preventa_artistas.html`)
- Botón "Pagar con Mercado Pago" implementado (ID: `pay-with-mp-btn`)
- Llamada AJAX al endpoint: `/.netlify/functions/create-payment`
- Manejo de respuestas y redirección
- **Estado:** Código correcto

### 4. ✅ Configuración Netlify (`netlify.toml`)
```toml
[build]
  functions = "netlify/functions"
  command = "cd netlify/functions && npm install"
```
- **Estado:** Configuración correcta para compilar funciones

---

## 🚨 PROBLEMAS IDENTIFICADOS

### ⚠️ PROBLEMA CRÍTICO #1: Variables de Entorno NO Configuradas en Netlify

**EL PROBLEMA PRINCIPAL:** Aunque el archivo `.env.netlify` existe en tu proyecto local, **Netlify NO lee ese archivo automáticamente**. Las variables de entorno deben configurarse manualmente en el dashboard de Netlify.

#### ¿Qué está pasando?
```javascript
// En create-payment.js línea 38:
const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!mpAccessToken) {
  console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
  return { statusCode: 500, body: JSON.stringify({ error: 'Mercado Pago no configurado' }) };
}
```

Cuando un usuario hace clic en "Pagar con Mercado Pago":
1. ✅ Frontend envía datos a `/.netlify/functions/create-payment`
2. ❌ La función intenta leer `process.env.MERCADOPAGO_ACCESS_TOKEN`
3. ❌ No encuentra la variable (porque no está en Netlify)
4. ❌ Devuelve error 500: "Mercado Pago no configurado"
5. ❌ Usuario no es redirigido a Mercado Pago

### ⚠️ PROBLEMA #2: Endpoint de Webhook Incorrecto (Posible)

**Ubicación:** `create-payment.js` línea 65
```javascript
notification_url: `${process.env.URL || 'https://vytmusic.netlify.app'}/.netlify/functions/mercadopago-webhook`
```

- Si `process.env.URL` no está configurado, usa el hardcoded URL
- **Potencial problema:** Mercado Pago necesita este webhook para confirmar pagos
- Si el webhook falla, los pagos no se confirmarán automáticamente

### ⚠️ PROBLEMA #3: Firebase Admin SDK NO Inicializado en Funciones

**Ubicación:** `mercadopago-webhook.js`
```javascript
// ❌ NO hay importación de Firebase Admin SDK
// ❌ NO hay inicialización de Firebase
```

El webhook necesita Firebase para actualizar el estado de las órdenes, pero no está inicializado.

### ⚠️ PROBLEMA #4: CORS Posible (Si usas dominio personalizado)

Las funciones están configuradas con:
```javascript
'Access-Control-Allow-Origin': '*'
```

Esto está bien, pero si usas un dominio personalizado, puede haber problemas.

---

## 🛠️ SOLUCIONES PASO A PASO

### 🔧 SOLUCIÓN #1: Configurar Variables de Entorno en Netlify (CRÍTICO)

#### Paso 1: Acceder al Dashboard de Netlify
1. Ve a: https://app.netlify.com
2. Selecciona tu sitio "vytmusic"
3. Ve a **Site settings** → **Environment variables**

#### Paso 2: Agregar TODAS estas variables

**Variable 1: MERCADOPAGO_ACCESS_TOKEN**
```
Key: MERCADOPAGO_ACCESS_TOKEN
Value: APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624
Scopes: All deploys (Production & Deploy Previews)
```

**Variable 2: FIREBASE_PROJECT_ID**
```
Key: FIREBASE_PROJECT_ID
Value: vyt-music
Scopes: All deploys
```

**Variable 3: FIREBASE_CLIENT_EMAIL**
```
Key: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@vyt-music.iam.gserviceaccount.com
Scopes: All deploys
```

**Variable 4: FIREBASE_PRIVATE_KEY**
```
Key: FIREBASE_PRIVATE_KEY
Value: (copia el contenido completo del .env.netlify - desde -----BEGIN PRIVATE KEY----- hasta -----END PRIVATE KEY-----)
Scopes: All deploys
```

⚠️ **IMPORTANTE:** Al copiar `FIREBASE_PRIVATE_KEY`, asegúrate de:
- Incluir las comillas dobles `"` al principio y al final
- Mantener los `\n` (saltos de línea escapados)
- No cambiar ningún carácter

#### Paso 3: Re-desplegar
Después de agregar las variables:
1. Ve a **Deploys** en Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Espera que termine el deploy (2-3 minutos)

### 🔧 SOLUCIÓN #2: Agregar Inicialización de Firebase en el Webhook

Actualiza `netlify/functions/mercadopago-webhook.js` para inicializar Firebase Admin SDK.

### 🔧 SOLUCIÓN #3: Configurar Notificaciones IPN en Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers
2. Selecciona tu aplicación "VYTMUSIC Preventa"
3. Ve a **Notificaciones** (o **Webhooks**)
4. Configura:
   - **URL:** `https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook`
   - **Eventos:** Marcar "Pagos" (payment)
   - **Método:** POST

### 🔧 SOLUCIÓN #4: Validar que el Access Token sea válido

Prueba tu Access Token haciendo una llamada de prueba:

```bash
curl -X GET \
  "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624"
```

Si devuelve un JSON con métodos de pago, el token es válido.  
Si devuelve error 401/403, el token es inválido o expiró.

---

## 🧪 CÓMO PROBAR QUE FUNCIONE

### Test 1: Verificar que las Funciones están Desplegadas
```bash
# Probar create-payment (debería devolver error 405 porque es POST)
curl https://vytmusic.netlify.app/.netlify/functions/create-payment

# Respuesta esperada:
{"error":"Method not allowed"}
```

### Test 2: Verificar Variables de Entorno (desde el frontend)
1. Abre `preventa_artistas.html`
2. Abre consola del navegador (F12)
3. Intenta hacer una compra
4. Revisa la respuesta del fetch:
   - ❌ Si dice "Mercado Pago no configurado" → Variables NO configuradas
   - ✅ Si redirige a Mercado Pago → Todo OK

### Test 3: Ver Logs de las Funciones
1. Ve a Netlify Dashboard
2. **Functions** → `create-payment`
3. Click **Function log**
4. Busca mensajes de error

---

## 📊 DIAGNÓSTICO: ¿Qué Error Estás Viendo?

### Error más probable: "no entra a mercado pago"

**Síntomas:**
- Click en botón "Pagar con Mercado Pago"
- Loading spinner aparece
- Nada pasa / Error genérico
- No redirige a Mercado Pago

**Causa:** Variables de entorno NO configuradas en Netlify

**Solución:** Seguir [SOLUCIÓN #1](#-solución-1-configurar-variables-de-entorno-en-netlify-crítico)

### ¿Cómo confirmarlo?
Abre la consola del navegador (F12) después de hacer click en el botón y busca:

```javascript
// Error esperado:
❌ Error con Mercado Pago: Mercado Pago no configurado

// Si ves esto, confirma que las variables NO están en Netlify
```

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual
| Componente | Estado | Requiere Acción |
|------------|--------|----------------|
| Código Frontend | ✅ OK | No |
| Funciones Netlify | ✅ OK | No |
| `package.json` | ✅ OK | No |
| Access Token MP | ✅ Válido | No |
| Variables Netlify | ❌ NO CONFIGURADAS | **SÍ - CRÍTICO** |
| Firebase en Webhook | ❌ NO INICIALIZADO | **SÍ - Importante** |
| Webhook IPN MP | ⚠️ Desconocido | Verificar |

### Acción Inmediata Requerida
1. **URGENTE:** Configurar variables de entorno en Netlify ([ver SOLUCIÓN #1](#-solución-1-configurar-variables-de-entorno-en-netlify-crítico))
2. **IMPORTANTE:** Inicializar Firebase en webhook
3. **VERIFICAR:** Configurar notificaciones IPN en Mercado Pago

### Tiempo Estimado de Solución
- **Configurar variables:** 5-10 minutos
- **Re-deploy:** 2-3 minutos
- **Prueba:** 2 minutos
- **TOTAL:** ~15-20 minutos

---

## 📞 SIGUIENTE PASO

**HAZLO AHORA:**
1. Ve a Netlify Dashboard: https://app.netlify.com
2. Configura las 4 variables de entorno ([SOLUCIÓN #1](#-solución-1-configurar-variables-de-entorno-en-netlify-crítico))
3. Haz un nuevo deploy
4. Prueba hacer una compra

**Si después de esto sigue sin funcionar:**
- Revisa los logs de las funciones en Netlify
- Verifica la consola del navegador (F12)
- Comparte el error específico que aparece

---

## 📝 NOTAS TÉCNICAS

### ¿Por qué `.env.netlify` no funciona?
Los archivos `.env.*` son para desarrollo local. Netlify **ignora** estos archivos en producción por seguridad. Debes configurar las variables manualmente en el dashboard.

### ¿El token de Mercado Pago expira?
Los Access Tokens pueden expirar o revocarse. Si configuraste todo y sigue sin funcionar, genera un nuevo token desde el dashboard de Mercado Pago.

### ¿Necesito un servidor?
NO. Netlify Functions actúa como tu servidor backend serverless.

---

**Autor:** GitHub Copilot  
**Sistema:** VYTMUSIC QR - Sistema de Gestión de Eventos
