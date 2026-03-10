# 🎯 GUÍA PASO A PASO: Configurar Mercado Pago en Netlify

## ⚡ SOLUCIÓN RÁPIDA

**El problema:** Las variables de entorno NO están configuradas en Netlify.  
**La solución:** Configurarlas manualmente en el dashboard (toma 10 minutos).

---

## 📋 CHECKLIST ANTES DE EMPEZAR

- [ ] Tienes acceso a https://app.netlify.com
- [ ] Conoces el nombre de tu sitio en Netlify (probablemente "vytmusic")
- [ ] Archivo `.env.netlify` está en tu proyecto (ya lo tienes ✅)

---

## 🚀 PASO 1: Acceder a Netlify

1. Abre tu navegador
2. Ve a: **https://app.netlify.com**
3. Inicia sesión con tu cuenta
4. En la lista de sitios, busca y haz click en **"vytmusic"** (o el nombre que tenga)

---

## 🔧 PASO 2: Configurar Variables de Entorno

### 2.1. Navegar a Variables de Entorno

1. Una vez dentro de tu sitio, en el menú izquierdo busca:
   - **Site configuration** (o **Site settings**)
2. En el menú lateral, busca la sección **Environment variables**
3. Haz click en **Environment variables**

### 2.2. Agregar Variable #1: MERCADOPAGO_ACCESS_TOKEN

1. Click en botón **Add a variable** (o **Add environment variable**)
2. Completa:
   - **Key:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Values:** 
     - **Scopes:** Selecciona **"All deploys"** (Producción + Deploy Previews)
     - **Value:** `APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624`
3. Click **Create variable**

### 2.3. Agregar Variable #2: FIREBASE_PROJECT_ID

1. Click en **Add a variable** nuevamente
2. Completa:
   - **Key:** `FIREBASE_PROJECT_ID`
   - **Values:**
     - **Scopes:** **All deploys**
     - **Value:** `vyt-music`
3. Click **Create variable**

### 2.4. Agregar Variable #3: FIREBASE_CLIENT_EMAIL

1. Click en **Add a variable**
2. Completa:
   - **Key:** `FIREBASE_CLIENT_EMAIL`
   - **Values:**
     - **Scopes:** **All deploys**
     - **Value:** `firebase-adminsdk-fbsvc@vyt-music.iam.gserviceaccount.com`
3. Click **Create variable**

### 2.5. Agregar Variable #4: FIREBASE_PRIVATE_KEY (LA MÁS IMPORTANTE)

⚠️ **ATENCIÓN:** Esta es la más delicada porque contiene saltos de línea.

1. Click en **Add a variable**
2. Completa:
   - **Key:** `FIREBASE_PRIVATE_KEY`
   - **Values:**
     - **Scopes:** **All deploys**
     - **Value:** Copia TODO el siguiente texto (incluye las comillas dobles):

```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+jIcfkChri6Ch\n32yQsGJEsQX7iGtmfAwA1EHNl7/aK2LcieYu7AuEiJCkdmImP9958k0tlrqGRNs4\nHIfHwsJArahWMxudTJhGyGg/btdNh7ObnMKbtp/8QrICMnAg77M/9A0NqxXv/OPr\nQg0aAqeYAmdAA+4oyqwBcU4y4WYaS4ypi/mk2xVqbhCEtns1QOxnQXYyJ06aKPlC\njgeY1N5P49xJJyMFQ0ou9FIwov2wX/bmk4/XhFPG/LnAUBmdzoJiptTrouPdm+Ro\n4xgGAkpVI3pVro5Bo/3lk3MlzPddfC9sTLMTWsHM6LHkthuQn24SCfwnmGLjNwDQ\nOK7zRGwxAgMBAAECggEACiRIXlaRwiyZsXfm6zoKFuodnYZEoh0k1ef2MyM6Jbpk\nrgSEbPepAsYyfaBj57GDW1YZQ72HorUYPl+tXeVYqbDcem8Ir5n3ql/JBaRIfxLD\njVsd9AP3tqlVmF6XH3emkJc0mSdDmQT6nAdFU36z7Rgmpu52nvLvjfmZ/gUHZkuK\nrmRtB7l4Tx8TwQ5gKF7jvv2aN7tb+BWmsgTIV6m5pxZHMtL3J3Cu4Gqb6pGFRgl1\nXZ/qxUhKLeGpx0F6Bg6CcUXFl8rxx8WrP9hUOZ6GP3TArjCrRioPCynFQF55SGyJ\nl3LYBv5NmKhImZWFWDQinpKD2VOB9QvxVvzCispO6QKBgQD4S7ta+tv9TFHcsGW/\nnA6jGkQ0lc8A/B8A2vNiGi5aJBZ9JnNHVjWsYY+0KFRHV9ZWryoYk+hGCgupn5TI\nu653VnmSk9vWoUavN8Z0/Io0xC64Sn2IJdR48ffUvzCxVtKxkYT6CX56b27eYPhd\nIgzIrhH2sYjTXhueLYqgsriViQKBgQDEdhmKUHVYKeXda0OECClVSBVJOAyfFiBx\nw5feJefSMPaND+uqQuULTgp1YPEj3FK8YjciyzSvHTvymk4R63iU0fFmTNbjykIR\nu75Lr6WKuoX7NgR8nwd5fHXt2woOfoYwYZ/FmbiRKd8yvbiX5NYNFk90hh3Z6r5j\nRgr6DnefaQKBgBVo2k/e/6cYtJpV74AVIcH4mtb57+6Czt2RA5l67nJBWFsUPK5z\nBY/GndCIBbRdI5M36WZTIp0fcp/+raKdZE7P+w2jiDo6j9C9+3PM7tHb9LdZXPen\nY2nGW3tRvQ4dkW9UP+YbeXdvMl0keWX2cKnBMLVX25d2LuV1wdVXc8kZAoGAPlZm\n9j9fbJEm0eImMy/PxbKwpmH1h0kjFFYGy0Nl0okcwlfJ5GWDfdnOcb5H5aQUUJgt\nfInT9rik++7AVOlNgpM3MMmy6eaUnkHfOO7L7UAQIUzbkZt4aLD4TnfRMhYtiA6B\n/tYu/Ui2/Me8Wd4PmWl53rRrpmjY7nEcLIoIpPkCgYAO8b9b/cf/ZMMxNn5TAr8+\nbx/y47Vq6xF9M9mUiouuXZuGY9jZ+ziyIFciloOxcHRL8CJtmlGnV6agV4UrNuuX\nQMHBIYPojQeh7ZUYoM8eaVXxm7Z1hWBVPUfBlgUdlczxxMpVUwVwqUtBRvtZ+VZr\nKXVOEWpe430Owc75IdHxKg==\n-----END PRIVATE KEY-----\n"
```

3. Click **Create variable**

### ✅ Verificar que se Agregaron las 4 Variables

Deberías ver en la lista:
- ✅ `MERCADOPAGO_ACCESS_TOKEN`
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_CLIENT_EMAIL`
- ✅ `FIREBASE_PRIVATE_KEY`

---

## 🔄 PASO 3: Re-desplegar el Sitio

**IMPORTANTE:** Las variables de entorno solo se aplican en el próximo deploy.

### Opción A: Hacer un Re-deploy Manual (RECOMENDADO)

1. En el menú superior, click en **Deploys**
2. Click en el botón **Trigger deploy** (esquina superior derecha)
3. Selecciona **Deploy site**
4. Espera 2-3 minutos mientras se despliega

### Opción B: Hacer un Push a GitHub

Si tu sitio está conectado a GitHub:
1. Haz un cambio mínimo (ej: modificar un comentario)
2. Commit y push
3. Netlify desplegará automáticamente

---

## 🧪 PASO 4: Probar que Funcione

### 4.1. Esperar a que termine el Deploy

En la página de **Deploys**, espera a que aparezca:
- **Published** (con un check verde ✅)
- Esto significa que el deploy terminó

### 4.2. Probar una Compra

1. Abre tu sitio: `https://vytmusic.netlify.app/preventa_artistas.html?eventId=TU_EVENT_ID&eventName=Prueba`
2. Completa el formulario de compra
3. Click en **"Pagar Ahora con Mercado Pago"**
4. **DEBE REDIRIGIRTE** a la página de pago de Mercado Pago

### ¿Qué debería pasar?

✅ **SI FUNCIONA:**
- Te redirige a `checkout.mercadopago.com.ar`
- Ves un formulario de pago con el monto correcto
- Puedes completar el pago

❌ **SI NO FUNCIONA:**
- No redirige / se queda cargando
- Aparece error "Mercado Pago no configurado"
- → Verifica que las variables se agregaron correctamente

---

## 🐛 PASO 5: Debugging (Si No Funciona)

### Ver Logs de las Funciones

1. En Netlify, ve a **Functions** (menú lateral)
2. Click en **create-payment**
3. En la derecha, click en **Function log**
4. Busca mensajes de error:

**Error esperado si variables NO están:**
```
❌ MERCADOPAGO_ACCESS_TOKEN no configurado
```

**Si las variables están OK:**
```
📤 Enviando preferencia a Mercado Pago...
✅ Preferencia creada: XXXX-XXXX-XXXX
```

### Ver Errores en el Navegador

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer una compra
4. Busca errores en rojo

**Error común:**
```javascript
❌ Error con Mercado Pago: Mercado Pago no configurado
```

Si ves esto, las variables NO están en Netlify.

---

## 🎉 COMPLETADO

Si seguiste todos los pasos:
- ✅ Variables configuradas en Netlify
- ✅ Sitio re-desplegado
- ✅ Compra de prueba exitosa

**¡Tu sistema de pago con Mercado Pago está funcionando!** 🚀

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir esta guía sigue sin funcionar:
1. Toma captura de pantalla de:
   - Variables de entorno en Netlify
   - Error en la consola del navegador (F12)
   - Logs de la función en Netlify
2. Comparte las capturas para diagnosticar el problema específico

---

## 🔐 Seguridad

⚠️ **NUNCA** compartas:
- Tu `MERCADOPAGO_ACCESS_TOKEN` en público
- Tu `FIREBASE_PRIVATE_KEY` en GitHub/público
- Las variables de entorno son secretas

✅ Ya están seguras en Netlify (solo tú puedes verlas).

---

## 📝 Resumen Ejecutivo

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Acceder a Netlify | 1 min |
| 2 | Agregar 4 variables | 5-7 min |
| 3 | Re-desplegar sitio | 2-3 min |
| 4 | Probar compra | 2 min |
| **TOTAL** | | **~10-15 min** |

**Después de esto, tu sistema de pago debería funcionar perfectamente.** ✨
