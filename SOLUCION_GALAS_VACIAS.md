# 🚨 SOLUCIÓN INMEDIATA - Recuperar Artistas en Galas Vacías

## ⚠️ PROBLEMA DETECTADO

Las galas "Domingo 10/5" y "Domingo 17/5" están vacías en el organizador porque:
1. No fueron cargadas en el selector inicial de eventos
2. Se agregaron manualmente después
3. El estado en Firebase tiene asignaciones vacías (`asig=0`)

## ✅ SOLUCIÓN PASO A PASO

### OPCIÓN 1: Script de Emergencia en Consola (RECOMENDADO)

1. **Abrí el organizador** en tu PC:
   - Ir a: https://vyt-music.web.app/organizador_certamen.html

2. **Abrí la consola del navegador**:
   - Presioná **F12** o **Ctrl+Shift+J**
   - Seleccioná la pestaña **"Console"**

3. **Copiá TODO el código** del archivo `RECUPERAR_GALAS_EMERGENCIA.js`

4. **Pegá el código en la consola** y presioná **Enter**

5. **Confirmá la recuperación** cuando aparezca el cuadro de diálogo

6. **Esperá** a que termine (verás logs en la consola)

7. **Verificá** que las galas ahora muestren los artistas

---

### OPCIÓN 2: Re-cargar Eventos desde Cero

Si el script de emergencia no funciona:

1. **Abrí el organizador**: https://vyt-music.web.app/organizador_certamen.html

2. **Refrescá la página** (Ctrl+F5 para limpiar cache)

3. **En el selector de galas inicial**, seleccioná TODAS las galas:
   - ✅ DOMINGO 12/4
   - ✅ DOMINGO 19/4
   - ✅ DOMINGO 26/4
   - ✅ **Domingo 10/5** ← IMPORTANTE
   - ✅ **Domingo 17/5** ← IMPORTANTE

4. **Cargá artistas**

5. Las columnas se crearán automáticamente con todos los artistas

6. **Presioná Guardar** 🟢

---

### OPCIÓN 3: Botón de Recuperación (si funciona)

1. Abrí el organizador
2. Click en **⋮** (tres puntitos) en la esquina superior derecha
3. Click en **"Recuperar galas vacías"** 🔶
4. Esperá el mensaje de confirmación
5. Presioná **Guardar** 🟢

---

## 🔍 VERIFICACIÓN

Después de ejecutar cualquier opción:

1. Las galas "Domingo 10/5" y "Domingo 17/5" deben mostrar artistas
2. El diagnóstico (⋮ → Diagnóstico) debe mostrar:
   ```
   Domingo 10/5: 13 artistas (en vez de 0)
   Domingo 17/5: 13 artistas (en vez de 0)
   ```

---

## 🆘 SI NADA FUNCIONA

Contactame con screenshot de:
1. La consola del navegador (F12)
2. El output del diagnóstico
3. El tablero mostrando las galas vacías

---

## 📌 PREVENCIÓN FUTURA

Cuando agregues nuevas galas:
1. Siempre cargalas desde el selector inicial de eventos
2. Si las agregás manualmente después, usá "Recuperar galas vacías" inmediatamente
3. Guardá después de cada cambio importante
