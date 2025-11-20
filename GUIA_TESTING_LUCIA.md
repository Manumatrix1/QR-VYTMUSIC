# 🧪 GUÍA DE TESTING EN VIVO
**Fecha:** 19 de noviembre de 2025  
**Estado:** TESTING EN PROGRESO con Lucia

---

## 🚀 **ORDEN DE TESTING RECOMENDADO**

### **PASO 1: TEST SISTEMA DE ASISTENTES** ⭐ CRÍTICO
```
1️⃣ Generar código asistente:
   → Ir a: panel_evento_mejorado.html?eventId=vIINfBwQaFsIhNOYWPtS
   → Clic "Gestión de Asistentes" 
   → Clic "Generar Nuevo Código"
   → Anotar código generado

2️⃣ Probar login asistente:
   → Abrir: index.html
   → Clic "Ingresar como Asistente"
   → Introducir el código
   → VERIFICAR: ¿Redirige con assistant=true?

3️⃣ Verificar identificación:
   → En el escáner, abrir F12 (consola)
   → BUSCAR: "✅ Configuración ASISTENTE"
   → VERIFICAR: ¿Muestra "Asistente (CÓDIGO)" y NO "Administrador"?
```

### **PASO 2: TEST RESPONSIVE MÓVIL** 📱
```
1️⃣ Simular móvil:
   → F12 → Toggle device toolbar (Ctrl+Shift+M)
   → Seleccionar iPhone/Android
   → Ir a votacion_jurados_FINAL.html

2️⃣ Verificar sliders:
   → ¿Los sliders son más pequeños?
   → ¿Los botones tienen buen tamaño?
   → ¿No hay scroll accidental al tocar?
```

### **PASO 3: TEST BLOQUEO PUNTUACIÓN** 🔒
```
1️⃣ Localizar checkboxes:
   → En votación, buscar 🔒 junto a cada criterio
   → Marcar checkbox de "Vestuario"
   → VERIFICAR: ¿Slider se vuelve gris y no se mueve?

2️⃣ Test persistencia:
   → Recargar página (F5)
   → VERIFICAR: ¿Checkbox sigue marcado?
```

### **PASO 4: TEST COMENTARIOS** 💬
```
1️⃣ En vista lista:
   → Escribir comentarios para un artista
   → Salir del campo
   → VERIFICAR: ¿Borde verde aparece momentáneamente?

2️⃣ Verificar guardado:
   → Recargar página
   → VERIFICAR: ¿Comentarios aparecen automáticamente?
```

---

## 📋 **CHECKLIST MIENTRAS PRUEBAS**

**SISTEMA ASISTENTES:**
- [ ] Código se genera correctamente
- [ ] Login redirige con assistant=true (NO admin=true)
- [ ] Escáner muestra "Asistente (CÓDIGO)"
- [ ] Consola muestra logs correctos

**RESPONSIVE MÓVIL:**
- [ ] Sliders más pequeños (35px altura)
- [ ] Botones tamaño táctil (44px min)
- [ ] No hay scroll accidental
- [ ] Textos legibles en móvil

**BLOQUEO PUNTUACIÓN:**
- [ ] Checkboxes 🔒 visibles
- [ ] Bloqueo funciona (slider gris)
- [ ] Otros sliders siguen funcionando
- [ ] Persistencia al recargar

**COMENTARIOS:**
- [ ] Feedback visual (borde verde)
- [ ] Guardado automático
- [ ] Persistencia localStorage
- [ ] Aparecen en reportes

---

## 🚨 **SI ENCUENTRAS PROBLEMAS:**

**Error 1: Asistente sigue apareciendo como admin**
→ Verificar URL: debe tener `assistant=true&assistantCode=XXX`
→ Limpiar caché del navegador

**Error 2: Sliders siguen muy grandes**
→ F12 → Console: escribir `window.location.reload(true)`
→ Verificar en modo móvil responsive

**Error 3: Checkboxes no aparecen**
→ Verificar en vista lista (no organizada)
→ Recargar página completamente

**Error 4: Comentarios no se guardan**
→ Verificar en console: buscar "📝 Comentarios guardados"
→ Verificar localStorage en F12 → Application

---

**¡Empieza con el PASO 1 (Sistema Asistentes) y avísame qué encuentras!** 🎯