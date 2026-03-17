# ⚡ LEEME PRIMERO - Solución Problemas Mercado Pago

## 🎯 SITUACIÓN

Tu sistema está en **FIREBASE** (no Netlify):
- **Dominio:** https://vyt-music.web.app
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting

## ✅ PROBLEMAS SOLUCIONADOS

1. ✅ Cliente ya NO vuelve a ver opciones de pago después de pagar
2. ✅ Sistema de notificaciones WhatsApp implementado (requiere 5 min de config)
3. ✅ TODAS las URLs corregidas de netlify.app → vyt-music.web.app

## 📖 GUÍA COMPLETA

👉 **Lee este archivo:** [SOLUCION_CORRECTA_FIREBASE.md](SOLUCION_CORRECTA_FIREBASE.md)

## ⚡ CONFIGURACIÓN RÁPIDA (5 minutos)

### 1. Activar CallMeBot
- Agregar contacto: `+34 644 44 80 61`
- Enviar mensaje: `I allow callmebot to send me messages`
- Guardar el API Key que te responde

### 2. Configurar Firebase
- Ir a: https://console.firebase.google.com
- Proyecto: **vyt-music**
- **Functions** → **⚙️ Configuración** → **Variables de entorno**
- Agregar:
  ```
  CALLMEBOT_PHONE = 543413632329
  CALLMEBOT_APIKEY = [tu API key]
  ```

### 3. Re-desplegar
```bash
firebase deploy --only functions:mercadopagoWebhookV2
```

## 🚀 YA FUNCIONA

- ✅ Los cambios ya están desplegados
- ✅ Solo falta configurar CallMeBot (paso 1 y 2)

## 📞 LINKS IMPORTANTES

- **Tu sitio:** https://vyt-music.web.app
- **Firebase Console:** https://console.firebase.google.com
- **Admin Preventa:** https://vyt-music.web.app/admin_preventa.html

---

⚠️ **IGNORAR estos archivos** (eran para Netlify, no aplican):
- `ACTIVAR_WHATSAPP_RAPIDO.md` (instrucciones incorrectas)
- `SOLUCION_PROBLEMAS_MERCADOPAGO.md` (instrucciones Netlify)
- `GUIA_NOTIFICACIONES_WHATSAPP.md` (parte correcta, parte incorrecta)

✅ **LEER SOLO:** `SOLUCION_CORRECTA_FIREBASE.md`
