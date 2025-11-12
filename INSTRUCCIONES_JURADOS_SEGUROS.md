# 🔐 DOCUMENTACIÓN SEGURA - JURADOS VYT MUSIC

## 📋 INFORMACIÓN CRÍTICA DE JURADOS

### **USUARIOS JURADOS OFICIALES**

#### **1. EZE Y CECI - JURADO GRUPAL**
- **Nombre de usuario:** `eze_ceci_grupal`
- **Nombre para mostrar:** "Eze y Ceci"
- **Tipo:** Jurado Grupal
- **Características:**
  - ✅ Pueden votar juntos (voto conjunto)
  - ✅ Tienen acceso a comentarios
  - ✅ Pueden ver reportes
  - ✅ Peso de voto: 1.0 (normal)

#### **2. LUCIANO - JURADO SECRETO**
- **Nombre de usuario:** `luciano_secreto`
- **Nombre para mostrar:** "Luciano"
- **Tipo:** Jurado Secreto
- **Características:**
  - ✅ Voto individual y confidencial
  - ✅ Puede votar y comentar
  - ❌ NO tiene acceso a reportes (para mantener confidencialidad)
  - ✅ Peso de voto: 1.0 (normal)
  - 🔒 **CONFIDENCIAL:** Sus votos no se muestran públicamente

---

## 🚀 CÓMO USAR EL SISTEMA DE BACKUP

### **PASO 1: VERIFICAR ESTADO ACTUAL**
1. Abrir `restaurar_jurados_seguros.html`
2. Hacer clic en "🔍 VERIFICAR JURADOS EXISTENTES"
3. Ver en el log si los jurados ya están en Firebase

### **PASO 2: RESTAURAR JURADOS (SI NO EXISTEN)**
1. Hacer clic en "♻️ RESTAURAR JURADOS A FIREBASE"
2. Esperar confirmación de éxito
3. Los jurados quedarán disponibles para el sistema de votación

### **PASO 3: VERIFICAR EN VOTACIÓN**
1. Ir a `votacion_jurados_FINAL.html`
2. Verificar que aparezcan en la lista:
   - "Eze y Ceci"
   - "Luciano"
3. Confirmar que pueden hacer login correctamente

---

## 🛡️ SEGURIDAD Y BACKUP

### **ARCHIVOS DE SEGURIDAD CREADOS:**
1. **`BACKUP_JURADOS_SEGUROS.json`** - Backup en formato JSON
2. **`restaurar_jurados_seguros.html`** - Script de restauración
3. **`INSTRUCCIONES_JURADOS_SEGUROS.md`** - Este documento

### **UBICACIÓN EN FIREBASE:**
```
events/vIINfBwQaFsIhNOYWPtS/jury_users/
├── eze_ceci_grupal
└── luciano_secreto
```

### **DATOS ALMACENADOS POR JURADO:**
```json
{
  "id": "eze_ceci_grupal",
  "name": "Eze y Ceci",
  "displayName": "Eze y Ceci",
  "username": "eze_ceci_grupal",
  "type": "grupal",
  "category": "Jurado Grupal",
  "active": true,
  "canVote": true,
  "canComment": true,
  "eventId": "vIINfBwQaFsIhNOYWPtS",
  "backup": true
}
```

---

## ⚠️ INSTRUCCIONES DE EMERGENCIA

### **SI SE PIERDEN LOS JURADOS:**
1. **NUNCA BORRAR** los archivos de backup
2. Usar `restaurar_jurados_seguros.html` para restaurar
3. Verificar que funcionen en el sistema de votación
4. Crear nuevo backup si es necesario

### **SI HAY PROBLEMAS DE ACCESO:**
1. Verificar que el `eventId` sea correcto: `vIINfBwQaFsIhNOYWPtS`
2. Comprobar conexión a Firebase
3. Verificar permisos de Firebase
4. Contactar al administrador del sistema

### **ANTES DE CADA EVENTO:**
1. ✅ Verificar que los jurados existen
2. ✅ Probar login de cada jurado
3. ✅ Confirmar que pueden votar
4. ✅ Crear backup preventivo

---

## 📞 CONTACTO DE EMERGENCIA

**Si hay problemas con el sistema de jurados:**
1. Usar el sistema de restauración automática
2. Verificar logs en la consola del navegador
3. Comprobar estado de Firebase
4. Documentar cualquier error para análisis

---

## 🔄 HISTORIAL DE CAMBIOS

- **2025-11-11:** Creación inicial del sistema de backup seguro
- **Evento:** GALA 1 CON PUNTUACIÓN. G12 VYTMUSIC
- **Estado:** ACTIVO y FUNCIONAL

---

**IMPORTANTE:** Mantener estos archivos seguros y no eliminarlos. Son críticos para el funcionamiento del sistema de votación.