# 🎵 VYTMUSIC - Sistema de Gestión de Certámenes Musicales

Sistema completo para la gestión de eventos musicales, control de entradas QR, votación de jurados y público, y generación de reportes.

## 🚀 Inicio Rápido

### 1. **Acceso al Sistema**
```
https://[tu-dominio]/QR-VYTMUSIC/index.html
```

### 2. **Credenciales**
- **Administrador:** Acceso completo al sistema
- **Asistente:** Solo escáner de entradas (código de evento requerido)
- **Jurado:** Acceso mediante enlace directo
- **Público:** Votación mediante entrada QR

### 3. **Flujo Principal**
```
📱 Login (index.html)
    └─→ 📅 Gestor de Eventos (eventos.html)
         └─→ 🎛️ Panel de Control (panel_evento.html)
              ├─→ 👥 Gestión (artistas, jurados, asistentes)
              ├─→ 🗳️ Votación (jurados y público)
              ├─→ 📱 Escáner (control de entradas)
              ├─→ 📊 Reportes (análisis y estadísticas)
              └─→ 🔧 Utilidades (herramientas auxiliares)
```

---

## 📂 Estructura del Proyecto

```
QR-VYTMUSIC/
│
├─ 🏠 CORE (Archivos Principales)
│  ├─ index.html                    # Login y autenticación
│  ├─ eventos.html                  # Gestor central de eventos
│  ├─ panel_evento.html             # Dashboard principal del evento
│  └─ firebase_config.js            # Configuración de Firebase
│
├─ 👥 GESTIÓN
│  ├─ gestion/
│  │  ├─ perfiles_artistas.html              # Gestión de artistas
│  │  ├─ gestion_jurados_clean.html          # Gestión de jurados
│  │  ├─ gestion_asistentes.html             # Gestión de asistentes
│  │  └─ gestion_votacion.html               # Configuración de votaciones
│
├─ 🗳️ VOTACIÓN
│  ├─ votacion/
│  │  ├─ votacion_jurados_FINAL.html         # Sistema de votación jurados
│  │  ├─ votacion_publico_simple.html        # Votación del público
│  │  ├─ voting_page.html                    # Página de votación pública
│  │  ├─ resultados_votacion.html            # Resultados en vivo
│  │  └─ emergencia/
│  │      ├─ votacion_emergencia.html        # Sistema de respaldo
│  │      └─ votacion_colaborativa.html      # Modo colaborativo
│
├─ 📱 ESCÁNER
│  ├─ escaner/
│  │  ├─ escaner_qr_final.html               # Escáner de entradas QR
│  │  ├─ generador_y_gestion.html            # Generador de códigos QR
│  │  ├─ lista_artistas_qr.html              # Lista con códigos QR
│  │  └─ buscador_invitados.html             # Buscador de invitados
│
├─ 📊 REPORTES
│  ├─ reportes/
│  │  ├─ centro_reportes_unificado.html      # Hub central de reportes
│  │  ├─ reporte_final_certamen_completo.html
│  │  ├─ reporte_por_gala.html
│  │  ├─ reporte_administrativo_completo.html
│  │  ├─ reporte_individual_artista.html
│  │  ├─ reporte_jurado_individual.html
│  │  └─ reporte_ventas_entradas.html
│
├─ 🔧 UTILIDADES
│  ├─ utilidades/
│  │  ├─ verificador_datos_criticos.html     # Auditoría de integridad
│  │  ├─ sistema_premios.html                # Sistema de premios
│  │  ├─ limpiar_grupos_duplicados.html      
│  │  └─ restaurar_jurados_seguros.html
│
├─ 🔗 ACCESOS DIRECTOS
│  ├─ accesos/
│  │  ├─ acceso_directo.html                 # Acceso rápido jurados
│  │  ├─ acceso_evento_activo.html           # Link al evento activo
│  │  └─ acceso_reportes_gala.html           # Acceso a reportes
│
└─ 💬 FEEDBACK
   ├─ feedback/
   │  ├─ feedback_en_vivo.html               # Feedback en tiempo real
   │  └─ devolucion_participantes.html       # Sistema de devolución
```

---

## 🎯 Funcionalidades Principales

### 📅 Gestión de Eventos
- Crear y administrar eventos/galas
- Configurar fechas, horarios y detalles
- Activar/desactivar eventos
- Compartir enlaces de acceso por rol

### 👥 Gestión de Participantes
- **Artistas:** Registro, perfiles, categorías, fotos
- **Jurados:** Asignación, credenciales, control de acceso
- **Asistentes:** Control de personal de entrada
- **Público:** Gestión de entradas y votaciones

### 🎫 Sistema de Entradas QR
- Generación de códigos QR únicos por entrada
- Validación en tiempo real
- Control de entradas usadas/disponibles
- Seguimiento de asistencia

### 🗳️ Sistema de Votación
- **Votación de Jurados:**
  - Calificaciones por criterios (voz, presencia, interpretación, etc.)
  - Sistema de puntuación configurable
  - Validación de jurados autorizados
  - Resultados en tiempo real

- **Votación del Público:**
  - Votación mediante código QR de entrada
  - Una votación por entrada válida
  - Resultados en tiempo real

### 📊 Reportes y Estadísticas
- Reporte final del certamen
- Reportes por gala individual
- Análisis de votaciones de jurados
- Estadísticas de entradas vendidas/usadas
- Reportes administrativos completos
- Análisis de progreso individual por artista

### 🔒 Sistema de Seguridad
- Autenticación Firebase
- Roles y permisos diferenciados
- Códigos de acceso únicos por evento
- Verificación de integridad de datos

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, Tailwind CSS, JavaScript ES6+
- **Backend:** Firebase (Firestore Database, Authentication, Storage)
- **QR:** html5-qrcode, qrcode.js
- **Gráficos:** Chart.js
- **Audio:** Tone.js
- **Capturas:** html2canvas
- **PWA:** Service Workers, Manifest

---

## 🔐 Roles y Accesos

### 👨‍💼 Administrador
- Acceso completo a todas las funcionalidades
- Gestión de eventos, artistas, jurados
- Configuración del sistema
- Generación de reportes
- Acceso a herramientas de auditoría

### 🎫 Asistente de Entrada
- Acceso mediante código de evento
- Solo escáner QR de entradas
- Visualización de datos básicos de invitados
- Sin acceso a votaciones ni reportes

### ⚖️ Jurado
- Acceso mediante enlace directo con ID
- Solo panel de votación
- Sin acceso a resultados globales
- Calificación de artistas asignados

### 👥 Público
- Acceso mediante código QR de entrada
- Solo votación de favoritos
- Visualización de resultados públicos
- Una votación por entrada válida

---

## 🚦 Flujos de Trabajo

### 📝 Crear Nuevo Evento
1. Login como administrador
2. Ir a Gestor de Eventos
3. Crear nuevo evento
4. Configurar nombre, fecha, detalles
5. Acceder al Panel de Control del evento

### 🎤 Agregar Artistas
1. Desde Panel de Control → Gestión de Artistas
2. Agregar artista con foto, nombre, categoría
3. Asignar a gala específica
4. Generar código QR (opcional)

### ⚖️ Configurar Jurados
1. Panel de Control → Gestión de Jurados
2. Agregar jurados con email y nombre
3. Copiar enlace de acceso personal
4. Compartir con cada jurado

### 🎫 Generar Entradas
1. Panel de Control → Generador de Entradas
2. Especificar cantidad y tipo de entrada
3. Generar códigos QR
4. Descargar e imprimir

### 🗳️ Activar Votación
1. Panel de Control → Gestión de Votaciones
2. Configurar tipo de votación (jurados/público)
3. Activar votación
4. Compartir enlaces según el rol

### 📊 Ver Resultados
1. Panel de Control → Centro de Reportes
2. Seleccionar tipo de reporte
3. Filtrar por gala, artista o criterio
4. Descargar o imprimir

---

## 🔧 Configuración

### Firebase Setup
1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Copiar configuración al archivo `firebase_config.js`

### Estructura de Colecciones Firestore
```
eventos/                          # Colección de eventos
artistas_{eventId}/              # Artistas por evento
jurados_{eventId}/               # Jurados por evento
votos_{eventId}/                 # Votos del público por evento
votaciones_jurados_{eventId}/    # Votaciones de jurados por evento
entradas_{eventId}/              # Entradas generadas por evento
```

---

## 📱 Instalación como PWA

El sistema puede instalarse como aplicación web progresiva (PWA):

1. Abrir en navegador móvil (Chrome/Safari)
2. Buscar opción "Agregar a pantalla de inicio"
3. Confirmar instalación
4. Usar como app nativa

---

## 🆘 Solución de Problemas

### El escáner QR no funciona
- Verificar permisos de cámara en el navegador
- Probar en modo HTTPS (requerido para cámara)
- Usar escáner alternativo si hay problemas

### No se cargan los datos
- Verificar conexión a internet
- Revisar configuración Firebase
- Comprobar reglas de seguridad en Firestore

### Errores de autenticación
- Verificar credenciales de Firebase
- Revisar que Authentication esté habilitado
- Comprobar formato de email y contraseña

### Enlaces rotos después de reorganización
- Verificar rutas relativas en archivos movidos
- Actualizar referencias a `firebase_config.js`
- Probar navegación completa después de cambios

---

## 📖 Documentación Adicional

- **AUDITORIA_SISTEMA_2026.md** - Análisis completo del sistema
- **PLAN_IMPLEMENTACION.md** - Guía de reorganización
- **DOCUMENTACION_SISTEMA.md** - Documentación técnica detallada
- **GUIA_TESTING_LUCIA.md** - Guía de pruebas

---

## 🤝 Contribución

Para reportar bugs o sugerir mejoras:
1. Documentar el problema claramente
2. Incluir pasos para reproducir
3. Adjuntar capturas de pantalla si es posible
4. Especificar navegador y versión

---

## 📄 Licencia

Sistema desarrollado para uso interno de VYTMUSIC.

---

## 📞 Soporte

Para asistencia técnica o consultas:
- Revisar documentación en `/docs/`
- Consultar guías de solución de problemas
- Contactar al administrador del sistema

---

## 🔄 Historial de Versiones

### v2.0 - Febrero 2026
- Reorganización completa de archivos
- Mejoras en navegación
- Sistema de reportes unificado
- Optimización de rendimiento

### v1.5 - Octubre 2025
- Sistema de premios automatizado
- Mejoras en votación de jurados
- Reportes mejorados

### v1.0 - Lanzamiento inicial
- Sistema básico de gestión
- Escáner QR
- Votación simple

---

**Desarrollado con ❤️ para la gestión de eventos musicales**  
**© 2026 VYTMUSIC - Todos los derechos reservados**
