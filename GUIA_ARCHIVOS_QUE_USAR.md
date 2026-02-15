# 📱 GUÍA DE USO - VYTMUSIC (Actualizado Feb 2026)

## 🎯 CAMBIO IMPORTANTE: PANEL SIMPLIFICADO

✅ **AHORA CUANDO ENTRÁS A UN EVENTO, VAS A VER EL PANEL SIMPLIFICADO**

- Muestra SOLO las 8 funciones principales que usás
- Sin opciones confusas
- Breadcrumbs (migas de pan) para saber dónde estás
- Todo más grande y fácil de encontrar

---

## 📂 ARCHIVOS QUE TENÉS QUE USAR

### 🏠 ENTRADA AL SISTEMA
```
✅ USAR: QR-VYTMUSIC/index.html
   └─→ Login simple que te lleva a eventos.html
   
❌ NO USAR: index.html (el de la raíz)
   └─→ Es muy complejo, deja ese archivado
```

### 📅 GESTIÓN DE EVENTOS
```
✅ USAR: eventos.html
   └─→ Crear, editar, activar eventos
   └─→ Ahora te lleva al PANEL SIMPLIFICADO
```

### 🎛️ PANEL DE CONTROL
```
✅ USAR: panel_evento_SIMPLE.html (NUEVO!)
   └─→ Panel limpio con solo lo que usás
   └─→ Se abre automáticamente desde eventos.html
   
⚠️ VIEJO: panel_evento.html
   └─→ Está ahí pero ya no se usa
   └─→ Tiene demasiadas opciones confusas
```

---

## 🎭 FUNCIONES PRINCIPALES (Las que usás todos los días)

### 1. Gestión de Artistas
```
✅ USAR: perfiles_artistas.html
   └─→ Agregar, editar, eliminar artistas
   └─→ Subir fotos, asignar categorías
```

### 2. Gestión de Jurados
```
✅ USAR: gestion_jurados_clean.html
   └─→ Este es el CORRECTO (clean = limpio)
   └─→ Crear jurados, copiar enlaces
   
❌ NO USAR: gestion_jurados.html (viejo)
   └─→ Tenía errores, no lo uses
```

### 3. Votación de Jurados
```
✅ USAR: votacion_jurados_FINAL.html
   └─→ Sistema de votación para jurados
   └─→ Calificaciones por criterios
   └─→ Este es el que FUNCIONA bien
   
⚠️ ALTERNATIVA DE EMERGENCIA: votacion_emergencia.html
   └─→ Solo si la FINAL no funciona
   
⚠️ ALTERNATIVA COLABORATIVA: votacion_colaborativa.html
   └─→ Para modo especial, raramente se usa
```

### 4. Votación del Público
```
✅ USAR: voting_page.html
   └─→ Página donde vota el público
   └─→ Con código QR de entrada
   └─→ ⚠️ NO TOCAR, funciona perfecto
```

### 5. Generador de Entradas
```
✅ USAR: generador_y_gestion.html
   └─→ Crear entradas con código QR
   └─→ Descargar, imprimir entradas
```

### 6. Gestión de Asistentes
```
✅ USAR: gestion_asistentes.html
   └─→ Crear asistentes para control de puerta
   └─→ Dar acceso a escáner solamente
```

---

## 📱 ESCÁNERES QR (TU PROBLEMA ACTUAL)

**ESTADO ACTUAL:** Hay 3 versiones y ninguna lee bien los QR

### Escáner Principal (el que intentás usar)
```
✅ USAR: escaner_qr_final.html
   └─→ Es el que está en el panel simplificado
   └─→ PROBLEMA: No lee bien los QR
   └─→ 💡 NECESITA ARREGLO (próximo paso)
   
⚠️ ALTERNATIVAS (no mejores):
   - escaner_qr_mejorado.html (versión anterior)
   - escaner_inteligente_integrado.html (versión anterior)
   
❌ RECOMENDACIÓN: Los 3 tienen problemas
   └─→ Hay que ARREGLAR el escáner_qr_final.html
   └─→ O crear uno nuevo que funcione bien
```

**🔧 PRÓXIMO PASO:** Arreglar el sistema de lectura de QR

---

## 📊 REPORTES (Los 5 que más usás)

### 1. Reporte por Gala Individual
```
✅ USAR: reporte_por_gala.html
   └─→ Resultados de una sola gala
```

### 2. Reporte Final del Certamen
```
✅ USAR: reporte_final_certamen_completo.html
   └─→ Este es el MÁS COMPLETO
   └─→ Resultados finales con todo
   
⚠️ ALTERNATIVA: reporte_final_certamen.html
   └─→ Es una versión anterior, menos completa
```

### 3. Reporte de Jurados
```
✅ USAR: reportes_jurado_artistas.html
   └─→ Análisis de calificaciones de jurados
```

### 4. Reporte Administrativo
```
✅ USAR: reporte_administrativo_completo.html
   └─→ Datos administrativos del evento
```

### 5. Reporte de Ventas
```
✅ USAR: reporte_ventas_entradas.html
   └─→ Cuántas entradas vendidas/usadas
```

### Centro de Reportes (Hub)
```
✅ USAR: centro_reportes_unificado.html
   └─→ Acceso a TODOS los reportes desde un lugar
   └─→ Está en el botón "Centro de Reportes"
```

---

## 🔧 HERRAMIENTAS EXTRAS (Uso ocasional)

```
✅ sistema_premios.html
   └─→ Sistema de asignación de premios
   
✅ feedback_en_vivo.html
   └─→ Feedback en tiempo real
   
✅ analisis_progreso_artistas.html
   └─→ Análisis de progreso individual
   
✅ verificador_datos_criticos.html
   └─→ Verificar integridad de datos
```

---

## ❌ ARCHIVOS QUE NO TENÉS QUE USAR

### NO tocar estos:
```
❌ gestion_votacion_DEBUG.html
   └─→ Archivo de desarrollo, no funciona
   
❌ escaner_qr_mejorado_OLD.html
   └─→ Versión vieja archivada
   
❌ escaner_inteligente_OLD.html
   └─→ Versión vieja archivada
   
❌ index_PORTAL_COMPLETO_OLD.html
   └─→ Panel viejo muy complejo
   
❌ Cualquier archivo con "_OLD" o "_BACKUP"
   └─→ Son versiones archivadas
```

---

## 🗺️ FLUJO DE NAVEGACIÓN CORRECTO

### Flujo Normal:
```
1. QR-VYTMUSIC/index.html (Login)
   ↓
2. eventos.html (Gestor de eventos)
   ↓
3. panel_evento_SIMPLE.html (Panel simplificado)
   ↓
4. [Función específica que necesites]
   
SIEMPRE tenés:
- Breadcrumbs arriba (🏠 Inicio > 📅 Eventos > 🎛️ Panel)
- Botón "Volver a Eventos"
- Todo claro y visible
```

### Ejemplo: Gestionar Artistas
```
index.html 
  → eventos.html 
    → panel_evento_SIMPLE.html 
      → Click en "🎭 Gestión de Artistas"
        → perfiles_artistas.html
```

### Ejemplo: Ver Votaciones
```
index.html 
  → eventos.html 
    → panel_evento_SIMPLE.html 
      → Click en "🗳️ Votación de Jurados"
        → votacion_jurados_FINAL.html
```

---

## 🚨 PROBLEMAS CONOCIDOS Y SOLUCIONES

### 1. Los Escáneres QR no leen bien
```
⚠️ PROBLEMA CONOCIDO
   └─→ Los 3 escáneres tienen problemas
   └─→ Próximo arreglo: Mejorar lectura de QR
   
💡 WORKAROUND TEMPORAL:
   └─→ Intentar con buena luz
   └─→ Limpiar lente de cámara
   └─→ Enfocar bien el código
```

### 2. Me pierdo en la navegación
```
✅ SOLUCIONADO
   └─→ Nuevo panel simplificado
   └─→ Breadcrumbs en todas las páginas
   └─→ Solo 8 funciones principales visibles
```

### 3. No sé qué archivo usar
```
✅ SOLUCIONADO
   └─→ Esta guía tiene todos los archivos correctos
   └─→ Panel simplificado usa los archivos correctos
```

---

## ✅ CHECKLIST DE USO DIARIO

**Inicio de Evento:**
- [ ] Login en QR-VYTMUSIC/index.html
- [ ] Seleccionar evento en eventos.html
- [ ] Entrar al panel_evento_SIMPLE.html

**Preparación:**
- [ ] Agregar artistas (perfiles_artistas.html)
- [ ] Configurar jurados (gestion_jurados_clean.html)
- [ ] Generar entradas (generador_y_gestion.html)
- [ ] Crear asistentes para puerta (gestion_asistentes.html)

**Durante el Evento:**
- [ ] Escáner de entradas (escaner_qr_final.html) ⚠️
- [ ] Votación de jurados (votacion_jurados_FINAL.html)
- [ ] Votación del público (voting_page.html)

**Después del Evento:**
- [ ] Ver reportes (centro_reportes_unificado.html)
- [ ] Reporte final (reporte_final_certamen_completo.html)
- [ ] Sistema de premios (sistema_premios.html)

---

## 💡 PRÓXIMOS ARREGLOS PLANIFICADOS

1. **✅ HECHO:** Panel de navegación simplificado
2. **✅ HECHO:** Breadcrumbs en todas las páginas
3. **⏳ PENDIENTE:** Arreglar lectura de códigos QR
4. **⏳ PENDIENTE:** Consolidar escáneres en uno solo que funcione

---

## 📞 RECORDATORIOS IMPORTANTES

✅ **Lo que FUNCIONA BIEN (no tocar):**
- votacion_jurados_FINAL.html
- voting_page.html
- perfiles_artistas.html
- gestion_jurados_clean.html
- El nuevo panel_evento_SIMPLE.html

⚠️ **Lo que NECESITA ARREGLO:**
- escaner_qr_final.html (no lee bien QR)

❌ **Lo que NO USAR:**
- Archivos con _OLD
- Archivos con _DEBUG
- panel_evento.html (viejo)

---

**Última actualización:** 15 de febrero de 2026  
**Versión del sistema:** 2.0 Simplificada  
**Autor:** GitHub Copilot para Lucía
