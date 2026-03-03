# 🧹 ARCHIVOS CANDIDATOS PARA LIMPIEZA FUTURA

**Fecha de Análisis:** 3 de marzo de 2026  
**Nota Importante:** ⚠️ **NO BORRAR NADA AÚN** - Este documento solo identifica archivos potencialmente obsoletos o duplicados. Requiere revisión y confirmación antes de eliminar.

---

## 🔴 PRIORIDAD ALTA - Probables Obsoletos

### 1. Archivos de Debug en Producción
**Recomendación:** Mover a carpeta `/debug` o eliminar si ya no se usan

```
✗ gestion_votacion_DEBUG.html
  └─ Archivo debug que no debería estar en producción
  └─ Verificar si sigue siendo necesario para testing
```

### 2. Versiones "Mejorado" Obsoletas
**Recomendación:** Verificar si las versiones "finales" ya incluyen estas mejoras

```
✗ escaner_qr_mejorado.html
  └─ Posiblemente reemplazado por: escaner_qr_final.html o escaner_rapido.html
  └─ Verificar cuál se usa actualmente en panel_evento.html
```

### 3. Archivos Backup en Carpeta Principal
**Recomendación:** Mover a carpeta `/backups` separada

```
⚠️ generador_y_gestion_backup.html
⚠️ sistema_premios_backup.html
  └─ Los backups no deberían estar en la carpeta principal
  └─ Mover a: /backups/ o /archive/
```

---

## 🟠 PRIORIDAD MEDIA - Duplicados Potenciales

### 4. Múltiples Versiones de Paneles de Evento

```
⚠️ panel_evento.html          (Versión completa)
⚠️ panel_evento_SIMPLE.html    (Versión simplificada)
  
Análisis:
  - Verificar cuál se usa como principal
  - Posiblemente consolidar en una sola versión con toggle simple/avanzado
  - Documentar en GUIA_ARCHIVOS_QUE_USAR.md cuál usar
```

### 5. Múltiples Centros de Reportes

```
⚠️ centro_reportes_NUEVO.html
⚠️ centro_reportes_unificado.html
⚠️ reportes.html
  
Recomendación:
  - Verificar cuál es el actual
  - Renombrar "NUEVO" a un nombre definitivo
  - Eliminar versiones obsoletas
```

### 6. Múltiples Escáneres QR

```
✅ escaner_rapido.html              (RECOMENDADO - usado en panel)
⚠️ escaner_qr_final.html            (¿Backup? ¿Obsoleto?)
✗ escaner_qr_mejorado.html          (Probablemente obsoleto)
⚠️ escaner_inteligente_integrado.html (¿Experimental?)

Recomendación:
  - Mantener solo: escaner_rapido.html (principal)
  - Mantener: escaner_qr_final.html (como backup documentado)
  - Eliminar: escaner_qr_mejorado.html (si está obsoleto)
  - Decidir: escaner_inteligente_integrado.html (¿vale la pena mantenerlo?)
```

### 7. Reportes Duplicados

```
⚠️ reporte_final_certamen.html
⚠️ reporte_final_certamen_completo.html
⚠️ reporte_certamen_completo.html
  
Análisis:
  - Parecen hacer lo mismo
  - Verificar diferencias reales
  - Consolidar en uno solo si son equivalentes
```

### 8. Resultados Múltiples

```
⚠️ resultados.html
⚠️ resultados_jurados.html
⚠️ resultados_votacion.html
  
Recomendación:
  - Verificar si son para diferentes propósitos
  - Si hacen lo mismo, consolidar
```

---

## 🟡 PRIORIDAD BAJA - Archivos de Utilidad/Testing

### 9. Archivos de Testing
**Recomendación:** Mover a carpeta `/testing` o `/dev`

```
⚠️ sistema_testing_completo.html
⚠️ diagnostico.html
⚠️ prueba_sistema.html
⚠️ verificador_datos_criticos.html
  
Análisis:
  - Son útiles pero no deberían estar en raíz
  - Crear carpeta: /testing/ o /dev/
  - Mover todos los archivos de testing ahí
```

### 10. Archivos de Debug/Forcing
**Recomendación:** Mover a carpeta `/utils`

```
⚠️ force_reload_gestion.html
⚠️ forzar_actualizacion.html
⚠️ limpiar_grupos_duplicados.html
⚠️ restaurar_jurados_seguros.html
  
Análisis:
  - Son herramientas de administración
  - Crear carpeta: /admin-tools/ o /utils/
  - Mover todas las utilidades administrativas ahí
```

### 11. Solucionadores de Problemas
**Recomendación:** Mantener pero organizar

```
⚠️ solucion_camara.html
⚠️ protector_gala1_datos_reales.html
  
Análisis:
  - Son hotfixes para problemas específicos
  - Crear carpeta: /hotfixes/
  - Documentar qué problema soluciona cada uno
```

---

## 📁 ESTRUCTURA DE CARPETAS RECOMENDADA

```
📦 VYTMUSIC QR
├── 📄 index.html (Login principal)
├── 📄 eventos.html (Gestor central)
├── 📄 panel_evento.html (Dashboard principal) ⭐
│
├── 📁 /votacion/
│   ├── votacion_jurados_FINAL.html ⭐
│   ├── votacion_colaborativa.html
│   ├── votacion_emergencia.html
│   └── voting_page.html (público)
│
├── 📁 /reportes/
│   ├── reportes.html (Centro principal) ⭐
│   ├── reporte_por_gala.html
│   ├── reporte_final_certamen.html ⭐
│   ├── reporte_jurados.html
│   └── resultados_jurados.html
│
├── 📁 /gestion/
│   ├── gestion_jurados_clean.html ⭐
│   ├── perfiles_artistas.html
│   ├── gestion_votacion.html
│   └── gestion_asistentes.html
│
├── 📁 /escaner/
│   ├── escaner_rapido.html ⭐
│   └── escaner_qr_final.html (backup)
│
├── 📁 /admin-tools/
│   ├── force_reload_gestion.html
│   ├── forzar_actualizacion.html
│   ├── limpiar_grupos_duplicados.html
│   └── restaurar_jurados_seguros.html
│
├── 📁 /testing/
│   ├── diagnostico.html
│   ├── prueba_sistema.html
│   ├── sistema_testing_completo.html
│   └── verificador_datos_criticos.html
│
├── 📁 /backups/
│   ├── generador_y_gestion_backup.html
│   └── sistema_premios_backup.html
│
├── 📁 /hotfixes/
│   ├── solucion_camara.html
│   └── protector_gala1_datos_reales.html
│
└── 📁 /docs/
    └── (todos los archivos .md)
```

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### PASO 1: Crear Estructura de Carpetas (Sin mover archivos aún)
```bash
# Solo crear las carpetas:
mkdir admin-tools
mkdir testing
mkdir backups
mkdir hotfixes
```

### PASO 2: Documentar Archivos Principales
```markdown
En GUIA_ARCHIVOS_QUE_USAR.md, agregar:

✅ ARCHIVOS PRINCIPALES A USAR:
- votacion_jurados_FINAL.html (NO usar votacion_emergencia salvo problemas)
- escaner_rapido.html (NO usar escaner_qr_mejorado)
- panel_evento.html (Usar SIMPLE solo si es asistente)
- reporte_final_certamen.html (NO usar reporte_final_certamen_completo)
```

### PASO 3: Verificar Antes de Mover
Para cada archivo candidato:
1. ✅ Buscar referencias en otros archivos
2. ✅ Verificar última fecha de modificación
3. ✅ Confirmar que no está en uso activo
4. ✅ Hacer prueba moviendo a carpeta temporal

### PASO 4: Mover Gradualmente (NO ELIMINAR)
```bash
# NO hacer esto aún, solo ejemplo:
# mv gestion_votacion_DEBUG.html testing/
# mv generador_y_gestion_backup.html backups/
```

---

## ⚠️ ARCHIVOS QUE **NO SE DEBEN TOCAR**

### Archivos Críticos del Sistema
```
✅ index.html
✅ eventos.html
✅ firebase_config.js ⭐ (¡RECIÉN MEJORADO!)
✅ votacion_jurados_FINAL.html ⭐ (¡RECIÉN MEJORADO!)
✅ global-artists-manager.js
✅ gala-data-manager.js
✅ progress-analytics-manager.js
✅ panel_evento.html (o panel_evento_SIMPLE.html)
✅ gestion_jurados_clean.html
✅ perfiles_artistas.html
✅ escaner_rapido.html
✅ reportes.html
✅ reporte_final_certamen.html
✅ voting_page.html
✅ manifest.json
✅ service-worker.js
✅ netlify.toml
```

---

## 📊 ESTADÍSTICAS DE ARCHIVOS

```
Total archivos HTML en raíz: ~80
Archivos JavaScript: 4
Archivos de documentación (.md): ~20

Candidatos para reorganizar:
🔴 Alta prioridad: 5 archivos
🟠 Media prioridad: 15 archivos
🟡 Baja prioridad: 12 archivos

Total candidatos: ~32 archivos (40% del sistema)
```

---

## ✅ PRÓXIMOS PASOS

1. **Revisar este documento** con el equipo
2. **Confirmar qué archivos están en uso** actualmente
3. **Actualizar GUIA_ARCHIVOS_QUE_USAR.md** con decisiones
4. **Crear carpetas de organización** (sin mover aún)
5. **Mover gradualmente** archivos confirmados como obsoletos
6. **Actualizar enlaces** si es necesario
7. **Testing completo** después de cada cambio

---

## 🔍 COMANDOS ÚTILES PARA ANÁLISIS

```bash
# Buscar referencias a un archivo:
grep -r "escaner_qr_mejorado" *.html

# Ver última modificación:
ls -lt *.html | head -20

# Buscar archivos no modificados en >6 meses:
find . -name "*.html" -mtime +180
```

---

**Recuerda:** Este documento es solo una guía. **NO borres nada sin confirmar primero** y siempre mantén backups antes de hacer cambios estructurales.

---

*Documento generado automáticamente por análisis del sistema*  
*Fecha: 3 de marzo de 2026*
