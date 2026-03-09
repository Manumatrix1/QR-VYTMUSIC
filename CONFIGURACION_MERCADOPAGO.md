# 🚀 CONFIGURACIÓN MERCADO PAGO - GUÍA COMPLETA

## 📋 PASO 1: Crear cuenta en Mercado Pago Developers

1. Ve a: https://www.mercadopago.com.ar/developers
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a "Tus aplicaciones" → "Crear aplicación"
4. Nombre: "VYTMUSIC Preventa"
5. Selecciona: "Pagos online" (Checkout Pro)

## 🔑 PASO 2: Obtener credenciales

### Modo TEST (para pruebas):
1. En tu aplicación, ve a "Credenciales"
2. Copia el **Access Token de prueba** (empieza con `TEST-`)

### Modo PRODUCCIÓN (para cobrar de verdad):
1. Activa tu cuenta completando verificaciones
2. Copia el **Access Token de producción** (empieza con `APP_USR-`)

## ⚙️ PASO 3: Configurar variables en Netlify

Ve a tu dashboard de Netlify:
1. Selecciona el sitio "vytmusic"
2. Ve a **Site settings** → **Environment variables**
3. Agrega estas variables:

### Variables REQUERIDAS:

```
MERCADOPAGO_ACCESS_TOKEN
Valor: TEST-1234567890-abcdef... (tu token de MP)
```

```
FIREBASE_PROJECT_ID
Valor: vytmusic-qr (o el ID de tu proyecto Firebase)
```

```
FIREBASE_CLIENT_EMAIL
Valor: firebase-adminsdk-xxxxx@vytmusic-qr.iam.gserviceaccount.com
```

```
FIREBASE_PRIVATE_KEY
Valor: -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...
(completo, incluyendo -----BEGIN y -----END)
```

### Cómo obtener las credenciales de Firebase:

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto "vytmusic-qr"
3. Ve a ⚙️ **Configuración** → **Cuentas de servicio**
4. Click "Generar nueva clave privada"
5. Se descarga un archivo JSON con:
   - `project_id` → copia a FIREBASE_PROJECT_ID
   - `client_email` → copia a FIREBASE_CLIENT_EMAIL
   - `private_key` → copia a FIREBASE_PRIVATE_KEY (completo)

## 🧪 PASO 4: Probar con usuarios de prueba

En modo TEST, usa estos datos de tarjeta de prueba:

**Tarjeta aprobada:**
- Número: 5031 7557 3453 0604
- CVV: 123
- Fecha: cualquier fecha futura
- Nombre: APRO (cualquier nombre)

**Tarjeta rechazada:**
- Número: 5031 4332 1540 6351
- CVV: 123
- Nombre: OTHE

## 📱 PASO 5: Activar Notificaciones IPN en Mercado Pago

1. En tu aplicación de MP, ve a "Notificaciones IPN"
2. URL de notificaciones: `https://vytmusic.netlify.app/.netlify/functions/mercadopago-webhook`
3. Marca "Pagos" como evento a notificar
4. Guarda

## 🔄 FLUJO COMPLETO

```
Usuario solicita entradas
    ↓
Sistema crea orden en Firebase (status: 'pending')
    ↓
Sistema llama a /.netlify/functions/create-payment
    ↓
Mercado Pago genera link de pago (init_point)
    ↓
Usuario hace click y paga en Mercado Pago
    ↓
Mercado Pago envía webhook a /.netlify/functions/mercadopago-webhook
    ↓
Webhook actualiza orden a status: 'approved'
    ↓
Firebase onSnapshot detecta cambio en preventa_artistas.html
    ↓
Usuario avanza automáticamente a cargar nombres
    ↓
Genera QRs y listo!
```

## ⚠️ IMPORTANTE

- **TEST MODE**: Usa `TEST-xxx` token primero para probar
- **PRODUCCIÓN**: Cambia a `APP_USR-xxx` cuando esté todo OK
- **Webhook**: Netlify debe estar desplegado para recibir webhooks
- **Variables**: Se aplican después del próximo deploy

## 🐛 Debugging

Ver logs de funciones:
```
Netlify Dashboard → Functions → mercadopago-webhook → Ver logs
```

## 📞 Soporte Mercado Pago

- Documentación: https://www.mercadopago.com.ar/developers/es/docs
- Soporte: https://www.mercadopago.com.ar/developers/es/support

---

**Una vez configurado todo, haz un push a GitHub y Netlify desplegará las funciones automáticamente** 🚀
