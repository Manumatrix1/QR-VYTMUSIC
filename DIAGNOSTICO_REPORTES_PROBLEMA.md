# 🚨 DIAGNÓSTICO: Problema en Reportes del Sistema

## Fecha: 18 de marzo de 2026

---

## ❌ PROBLEMA IDENTIFICADO

Los reportes muestran **"pocas cosas" y "quedan en blanco"** porque el sistema actual **NO está implementando la lógica del esquema JSON** que requiere el certamen.

---

## 📋 LÓGICA QUE FALTA (según esquema JSON proporcionado)

### 1. **Puntaje Mínimo Automático por Gala**
```javascript
// REQUERIDO:
puntaje_minimo_calculado = Math.min(...puntajes_de_artistas_que_cantaron)

// ACTUAL:
❌ NO SE CALCULA
```

### 2. **Sistema de Estados de Artistas**
```javascript
// REQUERIDO en cada artista:
{
  estado: "canto" | "ausente",
  confirmado: true | false,
  puntaje_final: numero | "auto_minimo"
}

// ACTUAL:
❌ NO EXISTE este campo en Firestore
```

### 3. **Asignación Automática de Puntaje a Ausentes**
```javascript
// REQUERIDO:
if (estado == "ausente" && confirmado == true) {
  puntaje_final = puntaje_minimo_calculado;
}

// ACTUAL:
❌ NO SE ASIGNA - Los ausentes NO aparecen en el reporte
```

### 4. **Conteo de Participaciones**
```javascript
// REQUERIDO:
participaciones = cantidad_de_galas_donde_canto; // (NO incluir ausentes)
requeridas = 4;

// ACTUAL:
✅ Parcialmente implementado (cuenta galas, pero sin validar estado)
```

### 5. **Cálculo de Promedio**
```javascript
// REQUERIDO:
promedio = suma(puntajes) / cantidad_de_puntajes;

// ACTUAL:
✅ FUNCIONA (pero solo cuenta los que cantaron)
```

---

## 🔍 LO QUE EL SISTEMA ACTUAL **SÍ HACE**

✅ Carga artistas de cada gala seleccionada
✅ Carga evaluaciones de jurados (jury_evaluations)
✅ Calcula promedio de puntajes de jurados por artista
✅ Acumula puntajes entre galas
✅ Unifica nombres duplicados (Estefi/Estefania)
✅ Cuenta cantidad de galas donde participó
✅ Genera ranking final ordenado

---

## ❌ LO QUE EL SISTEMA ACTUAL **NO HACE**

❌ **NO calcula** el puntaje mínimo de cada gala
❌ **NO verifica** si el artista cantó o estuvo ausente
❌ **NO asigna** puntaje compensatorio a ausentes confirmados
❌ **NO valida** si el artista tiene estado/confirmado
❌ **NO muestra** en el reporte a artistas ausentes (por eso "pocas cosas")
❌ **NO diferencia** entre "no participó" y "ausente confirmado"

---

## 🎯 POR QUÉ SE VEN "POCAS COSAS" Y "QUEDAN EN BLANCO"

**Ejemplo:**

### Gala A - Grupo A (2026-03-12)
- **Cantaron**: Artista2 (6.0), Artista3 (8.5)
- **Ausente confirmado**: Artista1 (debería aparecer con 6.0 automático)

### Reporte Actual:
```
🏆 Ranking:
1. Artista3 - 8.5 pts
2. Artista2 - 6.0 pts

❌ Artista1 NO APARECE (por eso "quedan en blanco")
```

### Reporte Esperado:
```
🏆 Ranking:
1. Artista3 - 8.5 pts
2. Artista1 - 6.0 pts (ausente confirmado - puntaje mínimo automático)
3. Artista2 - 6.0 pts

✅ TODOS los artistas aparecen
```

---

## 📊 DATOS QUE FALTAN EN FIRESTORE

### Estructura Actual (events/{galaId}/artists):
```javascript
{
  id: "artista_001",
  name: "Nombre Apellido",
  photoURL: "...",
  totalScore: 85,
  totalRatingsCount: 10
}
```

### Estructura Requerida:
```javascript
{
  id: "artista_001",
  name: "Nombre Apellido",
  photoURL: "...",
  totalScore: 85,
  totalRatingsCount: 10,
  
  // ⚠️ CAMPOS QUE FALTAN:
  estado: "canto" | "ausente",           // ← NO EXISTE
  confirmado: true | false,               // ← NO EXISTE
  puntaje_jurados_final: 7.5,            // ← NO EXISTE (se calcula en tiempo real)
  galas_cantadas: 2                       // ← NO EXISTE (se cuenta en código)
}
```

---

## 🛠️ SOLUCIONES POSIBLES

### **Opción 1: Implementar Sistema Completo (RECOMENDADO)**
1. Agregar campos `estado` y `confirmado` a la colección de artistas
2. Crear interfaz para marcar ausentes confirmados
3. Modificar reportes para calcular puntaje mínimo automático
4. Asignar puntaje compensatorio a ausentes

**Ventajas:**
- ✅ Sistema automático y robusto
- ✅ No requiere intervención manual en reportes
- ✅ Cumple con lógica del esquema JSON

**Desventajas:**
- ⏰ Requiere tiempo de desarrollo (2-3 horas)
- 🔧 Necesita migración de datos existentes

---

### **Opción 2: Solución Manual Temporal (RÁPIDA)**
Mantener el sistema actual pero agregar en el reporte:
1. Filtro para "mostrar solo artistas con puntaje"
2. Botón manual "Agregar ausente confirmado" que permita:
   - Seleccionar artista
   - Asignar puntaje mínimo de la gala manualmente
3. Advertencia si un artista tiene menos de 4 participaciones

**Ventajas:**
- ⚡ Rápido de implementar (30 minutos)
- 🔄 No requiere cambios en Firestore

**Desventajas:**
- ⚠️ Requiere intervención manual
- 🐛 Propenso a errores humanos

---

## 🔥 PREGUNTA CRÍTICA PARA LUCÍA

**¿Qué prefieres?**

### A) Sistema Automático Completo
"Quiero que el sistema calcule automáticamente el puntaje mínimo y lo asigne a los ausentes confirmados. También necesito una página donde pueda marcar quién cantó y quién estuvo ausente."

### B) Solución Manual Rápida
"Por ahora está bien agregar manualmente los ausentes en el reporte. Solo necesito que me deje seleccionar artistas y asignarles el puntaje mínimo."

---

## 📝 DATOS QUE NECESITO SABER

1. **¿Ya tienes en algún lado la información de quién cantó y quién estuvo ausente?** 
   - ¿En Excel?
   - ¿En papel?
   - ¿Or solo lo sabes de memoria?

2. **¿Cuántas galas ya pasaron que necesitan este sistema?**
   - Si son muchas, conviene la solución manual
   - Si son pocas, mejor implementar el sistema completo

3. **¿Los artistas saben de antemano si van a faltar, o se enteran el día de la gala?**
   - Esto define si necesitas marcar "confirmado" antes o después

---

## 📌 CONCLUSIÓN

**El problema NO es que los datos no carguen.**  
**El problema es que el sistema NO está diseñado para manejar ausentes confirmados.**

Los reportes funcionan perfectamente para mostrar quién cantó y sus puntajes, pero **no muestran** a los ausentes con puntaje compensatorio porque:
1. No hay campos para marcar ausentes
2. No hay lógica para calcular puntaje mínimo
3. No hay asignación automática de puntaje a ausentes

---

**Esperando tu decisión para proceder 🚀**
