# 🔑 Cómo Obtener tu Access Token de Mercado Pago

## ❌ PROBLEMA DETECTADO
```
Error: invalid access token
El token actual no es válido o expiró
```

## ✅ SOLUCIÓN: Obtener un nuevo Access Token

### 📝 PASO 1: Entrar al Panel de Mercado Pago

1. Ve a: **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta de developer, créala en: https://www.mercadopago.com.ar/developers/

---

### 🔧 PASO 2: Crear/Ver tu Aplicación

1. En el panel, ve a **"Tus Aplicaciones"**
2. Si no tienes una aplicación:
   - Haz clic en **"Crear Aplicación"**
   - Nombre: `VYTMUSIC` (o el nombre que prefieras)
   - Selecciona: **"Pagos en línea"** / **"Checkout PRO"**
   - Guarda la aplicación

3. Si ya tienes una aplicación, selecciónala

---

### 🔐 PASO 3: Copiar el Access Token

#### Para TESTING (Pruebas):
1. Ve a la sección **"Credenciales de prueba"**
2. Copia el **"Access Token de prueba"**
3. Formato: `TEST-XXXXXXXX-XXXXXX-XXXXXXXX`

#### Para PRODUCCIÓN (Real):
1. Ve a la sección **"Credenciales de producción"**
2. **IMPORTANTE**: Necesitas tener tu cuenta verificada
3. Copia el **"Access Token de producción"**
4. Formato: `APP_USR-XXXXXXXX-XXXXXX-XXXXXXXX`

---

### 💡 IDENTIFICAR QUÉ TOKEN NECESITAS

#### 🧪 Token de PRUEBA (Testing):
- **Úsalo para**: Probar el sistema sin cobrar dinero real
- Los pagos de prueba usan tarjetas de prueba de Mercado Pago
- No se cobra dinero real a las personas
- **Formato**: `TEST-7575962186897913-030906-...`

#### 💰 Token de PRODUCCIÓN (Real):
- **Úsalo para**: Cobrar dinero real
- Los pagos se cobran de verdad
- Necesitas cuenta verificada en Mercado Pago
- **Formato**: `APP_USR-7575962186897913-030906-...`

---

### 🔄 PASO 4: Actualizar el Sistema Firebase

Una vez que tengas tu nuevo token:

1. **Abre el archivo**: `functions\.env`

2. **Reemplaza la línea** del token:
   ```env
   MERCADOPAGO_TOKEN=TU_NUEVO_TOKEN_AQUI
   ```

3. **Guarda el archivo**

4. **Abre PowerShell** y ejecuta:
   ```powershell
   cd "C:\Users\lucia\Desktop\creacion web\vyt.web\VYTMUSIC QR\QR-VYTMUSIC-main"
   firebase deploy --only functions
   ```

5. **Espera 2-3 minutos** a que se complete el deploy

6. **Prueba nuevamente** en: https://vyt-music.web.app/preventa_artistas.html

---

### 🎯 RESUMEN RÁPIDO

```
1. Panel MP: https://www.mercadopago.com.ar/developers/panel
2. Copiar Access Token (prueba o producción)
3. Pegar en: functions\.env
4. Ejecutar: firebase deploy --only functions
5. Probar pago en la web
```

---

### ⚠️ IMPORTANTE: Tarjetas de Prueba

Si usas el **token de prueba**, usa estas tarjetas para probar:

**✅ APROBADA:**
- Tarjeta: `4509 9535 6623 3704`
- CVV: `123`
- Fecha: Cualquiera futura
- Nombre: APRO

**❌ RECHAZADA:**
- Tarjeta: `4000 0000 0000 0002`
- CVV: `123`
- Fecha: Cualquiera futura
- Nombre: OTHE

Más tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing

---

### 📞 Si tienes problemas:

- Verifica que tu cuenta MP esté activa
- Para producción, necesitas cuenta verificada
- El token debe tener permisos de "write" y "read"
- No compartas tu token de producción públicamente

---

**Última actualización**: 9 de marzo de 2026
