# 📱 Cómo Actualizar el Organizador en el Celular

## 🚨 PROBLEMA
El celular tiene cacheado el código viejo y muestra todas las galas (vacías) en vez de solo las seleccionadas.

---

## ✅ SOLUCIÓN RÁPIDA (3 opciones)

### **OPCIÓN 1: Recarga Forzada** ⚡ MÁS RÁPIDO
1. Abrí Chrome en el celular
2. Andá a: https://vyt-music.web.app/organizador_certamen.html
3. Tocá el **menú ⋮** (3 puntitos arriba a la derecha del navegador)
4. Tocá **"Configuración"**
5. Tocá **"Privacidad y seguridad"**
6. Tocá **"Borrar datos de navegación"**
7. Seleccioná **"Imágenes y archivos en caché"** ✅
8. Tocá **"Borrar datos"**
9. Volvé a abrir el organizador

---

### **OPCIÓN 2: Modo Incógnito** 🕵️ TEMPORAL
1. Abrí Chrome
2. Tocá menú ⋮
3. Tocá **"Nueva pestaña de incógnito"**
4. Andá a: https://vyt-music.web.app/organizador_certamen.html
5. Esta pestaña NO usa cache
6. Seleccioná tus galas y cargá

**Nota:** Tendrás que usar incógnito cada vez hasta que se actualice el cache normal.

---

### **OPCIÓN 3: Desinstalar PWA** 🔧 DEFINITIVA
Si instalaste el organizador como "app" en el celular:

1. Mantené presionado el ícono de VYTMUSIC en tu celular
2. Tocá **"Desinstalar"** o **"Eliminar"**
3. Abrí Chrome normalmente
4. Andá a: https://vyt-music.web.app/organizador_certamen.html
5. Si te pregunta "¿Instalar app?", tocá **"No, gracias"**

---

## 🔍 VERIFICAR QUE FUNCIONÓ

Después de aplicar cualquier opción:

1. Seleccioná **solo 2 galas** (ej: DOMINGO 12/4 y 19/4)
2. Click "Cargar artistas"
3. **Resultado esperado:**
   - ✅ Solo esas 2 columnas con artistas
   - ❌ NO deberían aparecer columnas vacías

---

## 🆘 SI NINGUNA OPCIÓN FUNCIONA

Enviame screenshot de:
1. La consola del navegador (menú → Más herramientas → Herramientas para desarrolladores)
2. Las galas que seleccionaste
3. Las columnas que aparecen

---

## 🔄 ¿POR QUÉ PASA ESTO?

El navegador del celular guarda una copia del código en cache para que cargue más rápido. Cuando actualizo el código, el celular sigue usando la versión vieja hasta que se limpia el cache.

El **service worker** (versión actual: **v27**) maneja este cache. Ya configuré para que se actualice automáticamente, pero a veces necesita ayuda manual.
