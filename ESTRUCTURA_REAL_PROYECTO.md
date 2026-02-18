# 🗂️ ESTRUCTURA REAL DEL PROYECTO VYTMUSIC

## ❌ PROBLEMA ACTUAL

**Netlify NO está leyendo los cambios de GitHub**

Razón: Hay 3 ubicaciones diferentes con archivos duplicados:

```
QR-VYTMUSIC-main/
├── index.html          ← Archivo en RAÍZ
├── panel_evento_SIMPLE.html  ← Archivo en RAÍZ
├── eventos.html        ← Archivo en RAÍZ
├── QR-VYTMUSIC/        ← SUBCARPETA (submódulo Git)
│   ├── index.html      ← ¡DUPLICADO!
│   ├── panel_evento_SIMPLE.html ← ¡DUPLICADO!
│   └── eventos.html    ← ¡DUPLICADO!
└── QR-VYTMUSIC-BACKUP/ ← BACKUP (NO USAR)
```

**Netlify probablemente está sirviendo desde `QR-VYTMUSIC/` (no la raíz)**

Por eso:
- ✅ Hacemos cambios en la raíz
- ✅ Commit a GitHub exitoso
- ❌ Netlify NO los toma porque lee otra carpeta

---

## ✅ SOLUCIÓN: Reorganizar en 3 pasos

### PASO 1: Verificar configuración Netlify

Necesitamos ver en el panel de Netlify:
- **Site settings → Build & deploy → Build settings**
- Fijarnos si dice: `Base directory: QR-VYTMUSIC` o está vacío

### PASO 2A: Si Netlify lee QR-VYTMUSIC/ (LO MÁS PROBABLE)

Hacer TODOS los cambios en esa carpeta y pushear:

```powershell
cd "QR-VYTMUSIC"
git add .
git commit -m "cambios"
git push origin main
```

### PASO 2B: Si Netlify lee la RAÍZ

Borrar la carpeta QR-VYTMUSIC/ y trabajar solo en raíz.

---

## 📋 ARCHIVOS CRÍTICOS QUE USA EL SISTEMA

### 🔑 Archivos Core (siempre necesarios)
1. **index.html** - Login admin/asistentes
2. **eventos.html** - Lista de eventos
3. **panel_evento_SIMPLE.html** - Panel control (el que queremos arreglar)
4. **firebase_config.js** - Conexión Firebase
5. **service-worker.js** - PWA y cache
6. **manifest.json** - Config PWA

### 🎯 Páginas funcionales que SÍ funcionan
7. **votacion_jurados_FINAL.html** - Votación jurados ✅
8. **voting_page.html** - Votación público ✅
9. **gestion_asistentes.html** - Gestión asistentes ✅
10. **perfiles_artistas.html** - Perfiles artistas ✅
11. **gestion_jurados_clean.html** - Gestión jurados ✅
12. **generador_y_gestion.html** - Generar entradas ✅

### 📊 Reportes (múltiples archivos)
13-20. **reporte_*.html** (8 archivos) - Varios reportes

### 🗑️ NO USAR (testing/backup/deprecados)
- Todo lo que empieza con `test_` o `debug_`
- `QR-VYTMUSIC-BACKUP/` (toda la carpeta)
- `panel_evento.html` (versión vieja, usar SIMPLE)

---

## 🚨 CAMBIO QUE ROMPIÓ TODO

**Lo que hiciste antes (funcionaba):**
- Botón "Compartir Acceso Directo" estaba en `eventos.html`
- Se abría modal, se copiaban links
- Todo funcionaba ✅

**Lo que cambié (se rompió):**
- Moví el botón a `panel_evento_SIMPLE.html`
- Ahora el modal tiene problemas responsive
- Los cambios no se ven en producción ❌

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### OPCIÓN A: Volver atrás (MÁS RÁPIDO - 10 min)
1. Revertir cambios con Git
2. Volver a tener botón en eventos.html
3. Todo funciona como antes
4. Modal se ve bien porque ya funcionaba

### OPCIÓN B: Reorganizar proyecto (1-2 horas)
1. Definir UNA carpeta como "la oficial"
2. Borrar duplicados
3. Configurar Netlify correctamente
4. Verificar que deploys funcionen
5. DESPUÉS recién ahí hacer cambios UI

---

## ❓ PREGUNTA PARA VOS

**¿Qué preferís?**

**A) VOLVER ATRÁS** - Te dejo el sistema como estaba antes (botón en eventos.html, todo funcionando)

**B) REORGANIZAR TODO** - Limpiamos estructura, definimos carpetas, y después arreglamos el modal

**C) ACCESO A NETLIFY** - Dame acceso al panel de Netlify para ver la config real

---

## 📝 NOTAS

- No es tu culpa que sea un lío
- Es normal que proyectos crezcan así
- Mejor parar y organizar que seguir parcheando
- Una vez ordenado, los cambios van a ser MUCHO más fáciles
