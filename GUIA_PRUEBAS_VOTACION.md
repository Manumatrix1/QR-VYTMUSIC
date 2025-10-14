# 🧪 GUÍA DE PRUEBAS - Sistema de Votación VYTMUSIC QR

## 🌐 **Servidor Local Activo**
- **URL Base**: http://127.0.0.1:8080/
- **Estado**: ✅ Corriendo en puerto 8080

---

## 📝 **PLAN DE PRUEBAS SISTEMÁTICO**

### **FASE 1: Votación del Público** 🗳️

1. **Abrir votación pública**: http://127.0.0.1:8080/votacion_directa.html
   - ✅ Seleccionar un evento activo
   - ✅ Elegir un artista
   - ✅ Votar en todas las categorías (Canto, Transmisión, Actitud, etc.)
   - ✅ Confirmar que se guarda correctamente

2. **Generar varios votos**:
   - Repetir el proceso 3-5 veces con diferentes puntuaciones
   - Usar diferentes navegadores o modo incógnito para simular diferentes usuarios

### **FASE 2: Evaluación de Jurados** ⚖️

1. **Abrir votación de jurados**: http://127.0.0.1:8080/votacion_jurados_FINAL.html
   - ✅ Loguearse como jurado
   - ✅ Evaluar el mismo artista que votaste como público
   - ✅ Agregar comentarios específicos
   - ✅ Confirmar que se guarda la evaluación

2. **Crear múltiples evaluaciones**:
   - Loguearse como diferentes jurados si es posible
   - Evaluar el mismo artista con diferentes puntuaciones

### **FASE 3: Verificar Reportes** 📊

1. **Reporte Individual de Artista**: http://127.0.0.1:8080/reporte_artista_publico.html
   
   **Pruebas a realizar**:
   - ✅ **Pestaña "Votación Público" (Azul)**:
     - Verificar que muestra los votos del público
     - Comprobar puntuaciones por categoría
     - Ver el análisis de fortalezas
   
   - ✅ **Pestaña "Evaluación Jurado" (Verde)**:
     - Verificar que carga las evaluaciones de jurados
     - Ver puntuaciones individuales de cada jurado
     - Comprobar comentarios específicos
   
   - ✅ **Pestaña "Voto Secreto" (Morado)**:
     - Verificar que muestra "SECRETO"
     - Confirmar que está bloqueado visualmente

2. **Acceso Grupal**: http://127.0.0.1:8080/acceso_reportes_gala.html
   - ✅ Verificar lista de artistas
   - ✅ Probar redirección a reportes individuales

---

## 🔍 **PUNTOS ESPECÍFICOS A VERIFICAR**

### **Sistema de Pestañas**
- [ ] Las pestañas cambian correctamente al hacer clic
- [ ] Solo una pestaña está activa a la vez
- [ ] Los estilos CSS se aplican correctamente (colores azul, verde, morado)

### **Carga de Datos**
- [ ] Los datos del público se muestran inmediatamente
- [ ] Los datos del jurado se cargan de forma asíncrona
- [ ] Se manejan correctamente los casos sin datos

### **Interfaz Visual**
- [ ] Los iconos se muestran correctamente (FontAwesome)
- [ ] El diseño es responsive en diferentes tamaños
- [ ] Los colores distinguen claramente cada tipo de votación

### **Funcionalidad Firebase**
- [ ] Se conecta correctamente a la base de datos
- [ ] Lee los eventos y artistas disponibles
- [ ] Guarda y recupera votos del público
- [ ] Guarda y recupera evaluaciones de jurados

---

## 🚨 **PROBLEMAS COMUNES A VERIFICAR**

### **Si no aparecen datos**:
1. Verificar conexión a Firebase en la consola del navegador (F12)
2. Comprobar que hay eventos activos en la base de datos
3. Verificar que los artistas están registrados correctamente

### **Si las pestañas no funcionan**:
1. Revisar errores JavaScript en la consola
2. Verificar que los IDs de los elementos coinciden
3. Comprobar que las funciones `showTab()` están definidas

### **Si no se cargan evaluaciones de jurado**:
1. Verificar que existen documentos en la colección `jury_evaluations`
2. Comprobar que los `eventId` y `artistId` coinciden
3. Revisar permisos de Firebase en la consola

---

## 📱 **PRUEBAS EN DISPOSITIVOS**

- **Desktop**: Probar en pantalla completa
- **Tablet**: Verificar diseño responsive
- **Móvil**: Comprobar navegación táctil

---

## ✅ **CHECKLIST FINAL**

- [ ] ✅ Votación pública funciona y guarda datos
- [ ] ✅ Votación de jurados funciona y guarda evaluaciones
- [ ] ✅ Reporte individual muestra pestaña pública correctamente
- [ ] ✅ Reporte individual muestra pestaña de jurado correctamente
- [ ] ✅ Reporte individual muestra voto secreto bloqueado
- [ ] ✅ Sistema de pestañas funciona sin errores
- [ ] ✅ Acceso grupal permite ver lista y redirige correctamente
- [ ] ✅ Diseño es consistente y responsive

---

## 🎯 **PRÓXIMOS PASOS DESPUÉS DE LAS PRUEBAS**

1. **Si todo funciona**: Desplegar a producción
2. **Si hay errores**: Documentar y corregir uno por uno
3. **Mejoras adicionales**: Implementar revelación de voto secreto al final del certamen