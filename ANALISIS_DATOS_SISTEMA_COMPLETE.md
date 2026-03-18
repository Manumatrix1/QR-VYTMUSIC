# 🔍 ANÁLISIS EXHAUSTIVO DE DATOS DEL SISTEMA VYTMUSIC
**Fecha:** 18 de marzo de 2026  
**Objetivo:** Control total de datos - Verificar que NO se pierda ningún dato importante

---

## 📊 MAPA COMPLETO DE COLECCIONES FIRESTORE

### 1. **DATOS DE EVENTOS** (`events/`)
```
events/
├── {eventId}/
│   ├── nombre_evento
│   ├── fecha
│   ├── lugar
│   ├── descripcion
│   ├── estado (activo/finalizado)
│   ├── ticketPrice_anticipado
│   ├── ticketPrice_puerta
│   ├── ticketDeadline
│   └── generacion (ej: "Generación 12", "Generación 13")
```

**✅ VERIFICACIÓN:**
- Generaciones correctamente etiquetadas
- Precios configurados
- Fechas límite establecidas

---

### 2. **ARTISTAS POR EVENTO** (`events/{eventId}/artists/`)
```
events/{eventId}/artists/{artistId}
├── nombre
├── nombre_normalizado
├── email
├── telefono
├── foto_url
├── estilo_cancion
├── grupo (opcional: "Generación 12", "Generación 13")
├── orden_presentacion
├── timestamp_registro
└── metadata_adicional
```

**✅ VERIFICACIÓN:**
- Cada artista tiene `grupo` definido (crucial para reportes por generación)
- Nombres normalizados para tracking cross-galas
- Metadata completa

**⚠️ ALERTA:**
- Verificar que TODOS los artistas tengan el campo `grupo` poblado
- Si falta, asignar manualmente según la generación del evento

---

### 3. **VOTACIÓN DE JURADOS** 

#### 3A. **Votos Individuales** (`events/{eventId}/jury_votes/`)
```
events/{eventId}/jury_votes/{voteId}
├── jurado_id
├── jurado_nombre
├── artista_id
├── artista_nombre
├── puntuacion (1-10)
├── categoria (voz/presencia/interpretacion/etc)
├── timestamp
└── modo (individual/colaborativo)
```

#### 3B. **Evaluaciones Completas** (`events/{eventId}/jury_evaluations/`)
```
events/{eventId}/jury_evaluations/{evaluationId}
├── jurado_id
├── artista_id
├── puntuaciones {
│   ├── voz: number
│   ├── presencia_escenica: number
│   ├── interpretacion: number
│   ├── repertorio: number
│   └── total_avg: number
├── }
├── comentarios
└── timestamp
```

**✅ VERIFICACIÓN:**
- Votos por categoría guardados
- Totales calculados correctamente
- Histórico completo de votaciones

**🎯 PARA REPORTES:**
- **Ranking Jurados por Artista:**
  ```javascript
  SELECT artista_nombre, AVG(total_avg) as promedio_jurados
  FROM jury_evaluations
  GROUP BY artista_id
  ORDER BY promedio_jurados DESC
  ```

---

### 4. **VOTACIÓN PÚBLICA** (`events/{eventId}/votes/`)
```
events/{eventId}/votes/{voteId}
├── ticket_id (único por entrada)
├── artista_id
├── artista_nombre
├── timestamp
├── ip_address (opcional)
└── user_agent (opcional)
```

**✅ VERIFICACIÓN:**
- Un voto por ticket/QR único
- Votos asociados a artista correcto
- Timestamp para análisis temporal

**🎯 PARA REPORTES:**
- **Ranking Voto Público por Artista:**
  ```javascript
  SELECT artista_nombre, COUNT(*) as total_votos_publico
  FROM votes
  GROUP BY artista_id
  ORDER BY total_votos_publico DESC
  ```

---

### 5. **ENTRADAS/TICKETS** 

#### 5A. **Códigos QR Generados** (`events/{eventId}/qr_codes/`)
```
events/{eventId}/qr_codes/{qrId}
├── ticket_id (único)
├── codigo_qr
├── nombre_comprador
├── email
├── telefono
├── cantidad_entradas
├── precio_pagado
├── tipo_entrada (anticipada/puerta)
├── generado_por (admin/auto)
├── timestamp_generacion
├── estado (activo/usado/cancelado)
├── timestamp_escaneado (si fue usado)
└── artista_votado (null hasta que vote)
```

#### 5B. **Órdenes de Compra** (`ticket_orders_{eventId}/`)
```
ticket_orders_{eventId}/{orderId}
├── nombre
├── email
├── telefono
├── cantidad
├── precio_total
├── precio_unitario
├── tipo_pago (anticipado/puerta/manual)
├── estado_pago (pending/approved/rejected)
├── payment_id (de Mercado Pago si aplica)
├── comprobante_url (si es manual)
├── tickets[] (array de ticket_ids generados)
├── timestamp_orden
└── timestamp_pago
```

**✅ VERIFICACIÓN:**
- Cada orden tiene tickets generados
- Precios correctos según tipo
- Estado de pago actualizado

**🎯 PARA REPORTES ECONÓMICOS:**
- **Total Entradas Vendidas:**
  ```javascript
  SUM(cantidad) FROM ticket_orders WHERE estado_pago = 'approved'
  ```

- **Total Dinero Recaudado:**
  ```javascript
  SUM(precio_total) FROM ticket_orders WHERE estado_pago = 'approved'
  ```

- **Desglose por Tipo:**
  ```javascript
  SELECT tipo_pago, SUM(precio_total) as subtotal, SUM(cantidad) as entradas
  FROM ticket_orders
  WHERE estado_pago = 'approved'
  GROUP BY tipo_pago
  ```

---

### 6. **JURADOS** (`events/{eventId}/jurados/` o `jurados_{eventId}/`)
```
jurados_{eventId}/{juradoId}
├── nombre
├── email
├── password_hash (hashed)
├── modo (individual/colaborativo)
├── activo (boolean)
├── timestamp_creacion
└── votaciones_realizadas (count)
```

**✅ VERIFICACIÓN:**
- Todos los jurados activos
- Contraseñas seguras
- Tracking de participación

---

### 7. **PISTAS DE ARTISTAS** (`pistas_{eventId}/`)
```
pistas_{eventId}/{pistaId}
├── artista_id
├── artista_nombre
├── nombre_cancion
├── estilo_cancion
├── url (Firebase Storage)
├── storagePath
├── size
├── format (mp3/wav/mpeg)
├── trim_start (si fue recortada)
├── trim_end (si fue recortada)
├── pitch_shift (si fue modificada)
├── uploadedAt
└── uploadedBy
```

**✅ VERIFICACIÓN:**
- 2-3 pistas máximo por artista
- Metadata completa
- URLs válidas

---

### 8. **PISTAS DE ORGANIZACIÓN** (`pistas_organizacion_{eventId}/`)
```
pistas_organizacion_{eventId}/{pistaId}
├── name
├── artist
├── category (Fondo/Invitado/Presentación)
├── url
├── storagePath
├── size
├── format
├── trim_start
├── trim_end
├── pitch_shift
├── uploadedAt
└── uploadedBy (admin)
```

**✅ VERIFICACIÓN:**
- Sin límite de cantidad
- Categorización correcta
- Asociación clara al evento

---

## 🎯 REPORTES CRÍTICOS A IMPLEMENTAR

### 1. **REPORTE POR GENERACIÓN**
**Datos necesarios:**
- ✅ Campo `grupo` en artistas
- ✅ Campo `generacion` en eventos
- ✅ Filtrado por `grupo` en consultas

**Consultas:**
```javascript
// Artistas de Generación 12
SELECT * FROM artistas WHERE grupo = "Generación 12"

// Votos públicos Generación 12
SELECT artista_nombre, COUNT(*) 
FROM votes v 
JOIN artistas a ON v.artista_id = a.id
WHERE a.grupo = "Generación 12"
GROUP BY artista_id

// Votos jurados Generación 12
SELECT artista_nombre, AVG(total_avg)
FROM jury_evaluations je
JOIN artistas a ON je.artista_id = a.id
WHERE a.grupo = "Generación 12"
GROUP BY artista_id
```

---

### 2. **REPORTE ECONÓMICO COMPLETO**
**Datos necesarios:**
- ✅ `ticket_orders_{eventId}` con estado_pago
- ✅ Precios por tipo
- ✅ Timestamp de compras

**Métricas:**
- Total entradas anticipadas vendidas
- Total entradas en puerta vendidas
- Dinero recaudado anticipado
- Dinero recaudado puerta
- Dinero total
- Promedio por entrada
- Gráfico temporal de ventas

---

### 3. **RANKING ARTISTAS INTEGRADO**
**Cálculo:**
```javascript
// Peso: 50% votos jurados + 50% votos público

Puntaje Final = (
  (Promedio Votos Jurados / 10) * 0.5 + 
  (Votos Público / Max Votos Público) * 0.5
) * 100
```

**Incluir:**
- Ranking combinado
- Ranking solo jurados
- Ranking solo público  
- Desglose por generación

---

### 4. **REPORTE DE PARTICIPACIÓN**
**Métricas:**
- Total artistas registrados (por generación)
- Total entradas vendidas
- Total votos públicos emitidos (% participación)
- Total jurados activos
- Total votaciones de jurados completadas

---

## ⚠️ PUNTOS CRÍTICOS A VERIFICAR

### 1. **Integridad de Datos:**
- [ ] Todos los artistas tienen `grupo` definido
- [ ] Todos los tickets tienen `ticket_id` único
- [ ] Todos los votos tienen `artista_id` válido
- [ ] Todas las órdenes aprobadas tienen tickets generados

### 2. **Relaciones Entre Colecciones:**
- [ ] `votes.artista_id` → existe en `artists`
- [ ] `jury_evaluations.artista_id` → existe en `artists`
- [ ] `qr_codes.artista_votado` → existe en `artists` o es null
- [ ] `ticket_orders.tickets[]` → existen en `qr_codes`

### 3. **Consistencia de Totales:**
- [ ] SUM(ticket_orders.cantidad) = COUNT(qr_codes)
- [ ] COUNT(votes) ≤ COUNT(qr_codes con estado='usado')
- [ ] Dinero recaudado = SUM(precio_total WHERE estado='approved')

---

## 📋 CHECKLIST DE AUDITORÍA

### **ANTES DE CADA GALA:**
- [ ] Verificar artistas con grupo asignado
- [ ] Verificar jurados activos creados
- [ ] Verificar configuración de precios
- [ ] Verificar generación de QR codes

### **DURANTE LA GALA:**
- [ ] Monitorear votos en tiempo real
- [ ] Verificar escaneos de QR
- [ ] Backup de datos cada hora

### **DESPUÉS DE LA GALA:**
- [ ] Exportar todos los votos
- [ ] Calcular rankings finales
- [ ] Generar reporte económico
- [ ] Archivar datos completos
- [ ] Backup completo a Drive/local

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### 1. **Dashboard de Auditoría** (A crear)
**Archivo:** `dashboard_auditoria_datos.html`
- Vista de todas las colecciones
- Contadores en tiempo real
- Alertas de inconsistencias
- Botón de exportación masiva

### 2. **Reportes Automáticos**
- Reporte por generación (semanal)
- Reporte económico (diario)
- Reporte de participación (post-gala)
- Ranking final (post-certamen)

### 3. **Backup Automático**
- Cloud Functions para backup diario
- Exportación JSON de todas las colecciones
- Almacenamiento en Google Drive
- Versión local descargable

---

## 🎯 PRÓXIMOS PASOS

1. **Verificar campo `grupo` en todos los artistas existentes**
2. **Crear dashboard de auditoría de datos**
3. **Implementar sistema de backup automático**
4. **Generar reportes por generación**
5. **Crear reporte económico detallado**
6. **Implementar ranking integrado (jurados + público)**

---

## 📞 CONTACTO Y SOPORTE
Para consultas sobre datos, reportar inconsistencias o solicitar nuevos reportes, documentar aquí los procesos de validación implementados.

---

**✅ Este documento debe actualizarse con cada cambio en la estructura de datos**
