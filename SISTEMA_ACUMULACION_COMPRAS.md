# 🎟️ Sistema de Acumulación de Compras Previas - Preventa

## 📌 PROBLEMA RESUELTO

**Situación anterior:**
- Vero compró 10 entradas → pagó $10,000 c/u ✅
- Vero quiere comprar 2 más → le cobraban $15,000 c/u ❌
- **INCORRECTO:** No consideraba las compras previas

**Situación ahora:**
- Vero compró 10 entradas → pagó $10,000 c/u ✅  
- Vero quiere comprar 2 más → **le cobran $10,000 c/u** ✅
- **CORRECTO:** Total acumulado = 10 + 2 = 12 entradas → precio reducido

---

## 🔧 CÓMO FUNCIONA

### 1️⃣ Verificación Automática de Compras Previas

Cuando el usuario completa **email** y **teléfono**:
- El sistema consulta Firebase automáticamente
- Busca órdenes aprobadas (`status: 'approved'`) del mismo evento
- Coincidencia por email **O** teléfono
- Suma todas las entradas compradas previamente

```javascript
// Ejemplo de búsqueda
Email: vero@example.com
Teléfono: 543413632329

Órdenes encontradas:
- Orden 1: 10 entradas (aprobada el 10/03)
- Orden 2: 5 entradas (aprobada el 15/03)

Total acumulado: 15 entradas
```

### 2️⃣ Cálculo de Precio con Total Acumulado

```javascript
// Lógica del cálculo
const accumulatedTotal = previousPurchasesCount + currentQuantity;

// Si total acumulado >= 5 → Precio anticipado ($10,000)
// Si total acumulado < 5 → Precio puerta ($15,000)

Ejemplo 1 (Vero):
- Previas: 10
- Actuales: 2
- Total acumulado: 12
- Precio: $10,000 c/u ✅

Ejemplo 2 (primer comprador):
- Previas: 0
- Actuales: 3
- Total acumulado: 3
- Precio: $15,000 c/u (menos de 5)

Ejemplo 3 (compra acumulada):
- Previas: 3
- Actuales: 2
- Total acumulado: 5
- Precio: $10,000 c/u ✅ (alcanzó el mínimo)
```

### 3️⃣ Avisos Visuales Dinámicos

El sistema muestra mensajes claros según la situación:

**Si tiene compras previas:**
```
✅ ¡Perfecto! Ya tenés 10 entradas compradas aprobadas.
💡 Las nuevas entradas se acumulan para el precio.
```

**Si faltan para alcanzar el mínimo:**
```
💡 Ya tenés 3 entradas. Te faltan 2 más para alcanzar 
el precio anticipado ($10,000 c/u). Con 3 el precio 
es de puerta ($15,000 c/u).
```

**Si alcanzó el mínimo con acumulación:**
```
✅ ¡Excelente! Con 5 entradas en total (3 previas + 2 nuevas) 
obtenés el precio anticipado de $10,000 c/u.
```

---

## 📊 CASOS DE USO REALES

### Caso 1: Vero (usuario ejemplo real)
1. **Primera compra:** 10 entradas → $100,000 total
2. **Segunda compra:** 2 entradas
   - Sistema detecta: "Ya tenés 10 entradas"
   - Total acumulado: 10 + 2 = 12
   - Precio: $10,000 c/u
   - **Total:** $20,000 ✅

### Caso 2: Usuario que va sumando
1. **Primera compra:** 2 entradas → $30,000 ($15k c/u)
2. **Segunda compra:** 2 entradas
   - Sistema detecta: "Ya tenés 2 entradas"
   - Total acumulado: 2 + 2 = 4
   - Precio: $15,000 c/u (todavía < 5)
   - **Total:** $30,000
3. **Tercera compra:** 1 entrada
   - Sistema detecta: "Ya tenés 4 entradas"
   - Total acumulado: 4 + 1 = 5
   - **Precio:** $10,000 c/u ✅ (alcanzó el mínimo)
   - **Total:** $10,000

### Caso 3: Primera compra directa de 5+
1. **Primera compra:** 6 entradas
   - Previas: 0
   - Actuales: 6
   - Total acumulado: 6
   - Precio: $10,000 c/u
   - **Total:** $60,000 ✅

---

## 🔍 IDENTIFICACIÓN DE USUARIOS

El sistema identifica usuarios por:

1. **Email** (case-insensitive, trimmed)
2. **Teléfono** (solo dígitos, ignora formato)

Ejemplos de coincidencias:
```
Email:
- vero@example.com === VERO@EXAMPLE.COM
- " lucia@gmail.com " === "lucia@gmail.com"

Teléfono:
- 3413632329
- 543413632329
- +54 341 363-2329
- +54 (341) 363 2329
Todos se comparan como: 3413632329
```

---

## ⚙️ INTEGRACIÓN CON SISTEMA EXISTENTE

### ✅ Lo que NO se tocó (100% intacto):
- Sistema de notificaciones WhatsApp
- Webhook de MercadoPago
- Aprobación de comprobantes
- Generación de QR codes
- Panel de admin
- Reportes de ventas

### ✨ Lo que se agregó:
1. Variable global `previousPurchasesCount`
2. Función `checkPreviousPurchases(email, phone)`
3. Listeners automáticos en email y teléfono
4. Lógica de cálculo actualizada en `updateTotal()`
5. Cálculo correcto en submit del formulario
6. Avisos visuales dinámicos

---

## 🚀 CÓMO PROBARLO

### Prueba rápida:
1. Ir a: https://vyt-music.web.app/preventa_artistas.html?eventId=XXX
2. Completar email: vero@example.com
3. Completar teléfono: 3413632329
4. **Observar:**
   - Si Vero ya compró antes, aparece: "✅ Ya tenés X entradas"
   - Al ingresar cantidad, el precio se calcula con el total acumulado
   - Aviso explica cuántas faltan o si ya tiene precio reducido

### Caso de prueba completo:
```javascript
Usuario: test@example.com
Teléfono: 3411234567

1. Primera compra: 2 entradas
   - Precio: $15,000 c/u
   - Total: $30,000
   - Aprobar orden

2. Segunda compra (mismo usuario):
   - Ingresar mismo email/teléfono
   - Sistema muestra: "Ya tenés 2 entradas"
   - Ingresar cantidad: 3
   - Mensaje: "Con 5 en total obtenés precio anticipado"
   - Precio: $10,000 c/u ✅
   - Total: $30,000
```

---

## 📝 LOGS PARA DEBUGGING

El sistema genera logs en consola:

```javascript
🔍 Verificando compras previas para: { email: 'vero@example.com', cleanPhone: '543413632329' }
✅ Compras previas encontradas: 10 entradas
💰 Cálculo de precio: 10 previas + 2 actuales = 12 total acumulado
💰 Orden final: 10 previas + 2 nuevas = 12 total → Precio: $10000
```

Para ver los logs:
1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Completar email y teléfono
4. Observar los mensajes con 🔍 y 💰

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Solo cuenta órdenes APROBADAS
- Status: `approved`
- Órdenes pendientes (`pending`) NO suman
- Órdenes rechazadas NO suman

### 2. Scope por evento
- Cada evento tiene su propia colección
- Compras de Gala 1 NO afectan precios de Gala 2
- Búsqueda: `ticket_orders_{eventId}`

### 3. Timeouts y performance
- Debounce de 800ms en listeners (no hace queries innecesarias)
- Consulta a Firebase solo cuando email Y teléfono válidos
- Cache en variable global `previousPurchasesCount`

### 4. Fecha límite prevalece
- Si pasó deadline → precio puerta SIEMPRE
- Acumulación solo aplica ANTES de deadline
- Lógica: `currentPrice >= 15000 || accumulatedTotal < 5`

---

## 🔐 SEGURIDAD

- Solo consulta órdenes del mismo evento
- Validación de formato email/teléfono
- No expone datos de otros usuarios
- Solo muestra cantidad total acumulada
- No muestra historial de órdenes en frontend

---

## 📞 SOPORTE

**Si algo no funciona:**
1. Verificar que el email/teléfono coincidan EXACTAMENTE con compras previas
2. Revisar que las órdenes previas estén APROBADAS
3. Verificar logs en consola (F12)
4. Confirmar que el `eventId` sea correcto en la URL

**Contacto técnico:**
- Sistema desplegado en: https://vyt-music.web.app
- Commit: 0c033a1
- Fecha: 18 de marzo de 2026
