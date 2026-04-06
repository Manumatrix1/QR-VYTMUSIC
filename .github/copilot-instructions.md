# VYTMUSIC QR - Sistema de Gestión de Eventos y Votación

## 🎯 Arquitectura del Sistema

Sistema web de gestión de eventos musicales con votación multi-canal (público + jurados). Arquitectura cliente-solo con Firebase como backend, desplegado en **Firebase Hosting** (`vyt-music.web.app`). **No hay servidor Node.js** - todos los archivos son HTML estáticos con JavaScript modular.

### Flujo de Navegación Principal
```
index.html (login) 
  → eventos.html (lista eventos)
    → panel_evento.html?eventId=X (dashboard)
      ├── gestion_jurados_clean.html (gestión jurados)
      ├── perfiles_artistas.html (gestión artistas)
      ├── gestion_votacion.html (config votación)
      ├── votacion_jurados_FINAL.html (votación jurados - RECOMENDADO)
      ├── voting_page.html (votación público)
      └── reportes.html (centro reportes)
```

### Módulos JavaScript Centralizados
- `firebase_config.js` - Configuración Firebase (versión 11.6.1, exports: app, auth, db, storage)
- `global-artists-manager.js` - Consolidación de artistas cross-galas, tracking global, normalización de nombres
- `gala-data-manager.js` - Gestión artistas por gala individual, asignaciones
- `progress-analytics-manager.js` - Análisis progreso artistas entre galas

## 🔥 Firebase: Estructura de Datos

**Collections pattern:** `{collection}_{eventId}` para aislamiento por evento.

```javascript
// Colecciones principales:
- eventos/
- artistas_{eventId}/
- votos_{eventId}/
- jurados_{eventId}/
- votaciones_publicas_{eventId}/
- votaciones_jurados_{eventId}/
```

**Importación estándar en HTML:**
```javascript
import { db, auth, storage } from './firebase_config.js';
import { getFirestore, collection, doc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
```

## 🎨 Stack Tecnológico

- **UI:** Tailwind CSS (vía CDN) - usado consistentemente en TODAS las páginas
- **Gráficos:** Chart.js para reportes
- **QR:** html5-qrcode, qrcodejs
- **Sonido:** Tone.js
- **Capture:** HTML2Canvas

## 🚨 Convenciones Críticas

### Parámetros URL
`?eventId=X&eventName=Y` - Requeridos en casi todas las páginas. Validar con:
```javascript
const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');
if (!eventId) { /* redirigir */ }
```

### IDs de Artistas
- **Local ID:** Único por gala (`artistas_{eventId}/`)
- **Global ID:** Cross-galas generado por `global-artists-manager.js` con formato `global_{normalized_name}_{timestamp}_{random}`
- **Normalización:** Lowercase, sin tildes, underscores para espacios

### Sistema de Votación Multi-Modo
- `votacion_jurados_FINAL.html` - Sistema principal, modo individual/colaborativo
- `votacion_colaborativa.html` - Modo exclusivo colaborativo
- `votacion_emergencia.html` - Backup (acceso directo manual)

### Responsive Design
Media queries para mobile en votación jurados: sliders más pequeños, botones táctiles optimizados. Verificar con `window.matchMedia('(max-width: 768px)')`.

## 📊 Reportes y Analytics

- `reporte_por_gala.html` - Reportes gala individual
- `reporte_final_certamen.html` - Consolidado completo usando `global-artists-manager.js`
- `reporte_jurados.html` - Análisis jurados
- `resultados_jurados.html` - Resultados públicos

## 🛠️ Desarrollo y Testing

### Archivos de Testing (NO incluir en producción)
- `test_*.html` - Páginas de testing
- `debug_*.html` - Debug tools
- `*_DEBUG.html` - Versiones debug

### Sistema de Mensajes
Patrón consistente para feedback usuario:
```javascript
function displayMessage(message, type = 'success') {
    const colors = { success: 'bg-green-500', error: 'bg-red-500' };
    messageContainer.innerHTML = `<div class="p-4 rounded-md ${colors[type]}">${message}</div>`;
    setTimeout(() => { messageContainer.innerHTML = ''; }, 5000);
}
```

### Validaciones Estándar
- Nombres jurados: 3-50 caracteres, prevención duplicados
- Nombres artistas: normalización antes de guardar
- EventID: siempre validar presencia antes de queries Firebase

## 🔒 Control de Acceso

### Roles
1. **Administrador:** Login email/password (`index.html`)
2. **Asistente:** Código evento (`gestion_asistentes.html`)
3. **Jurado:** Autenticación individual/colaborativa

### Parámetro `assistant=true`
Identifica sesión de asistente. Verificar en páginas sensibles:
```javascript
const isAssistant = params.get('assistant') === 'true';
```

## 📝 Documentación Existente

- `DOCUMENTACION_SISTEMA.md` - Arquitectura completa, estado archivos
- `ANALISIS_COMPLETO_SISTEMA.md` - Análisis conectividad, mejoras recomendadas
- `GUIA_TESTING_LUCIA.md` - Procedimientos testing en vivo
- `INSTRUCCIONES_JURADOS_SEGUROS.md` - Workflows jurados

## ⚠️ Anti-Patterns a Evitar

- **NO** usar versiones Firebase diferentes a 11.6.1
- **NO** hardcodear eventIDs (siempre desde URL params)
- **NO** duplicar lógica de firebase_config.js
- **NO** crear colecciones sin sufijo `_{eventId}`
- **NO** modificar archivos `*_clean.html` sin verificar versiones anteriores eliminadas
- **NO** ignorar normalización de nombres en comparaciones artistas

## 🚀 Deploy

Firebase Hosting — deploy manual vía CLI: `firebase deploy --only hosting`. Domain: `vyt-music.web.app`

Enlaces públicos pattern:
```javascript
const publicLink = `https://vyt-music.web.app/voting_page.html?eventId=${eventId}`;
const juryLink = `https://vyt-music.web.app/votacion_jurados_FINAL.html?eventId=${eventId}`;
```
