# Script de Migración Automática: Netlify → Firebase Hosting
# Sistema: VYTMUSIC QR
# Fecha: 9 de marzo de 2026

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 MIGRACIÓN A FIREBASE HOSTING - VYTMUSIC" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
Write-Host "📂 Directorio actual: $currentDir" -ForegroundColor Gray
Write-Host ""

# PASO 1: Verificar Firebase CLI
Write-Host "🔍 PASO 1: Verificando Firebase CLI..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instálalo con:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    exit
}

Write-Host ""

# PASO 2: Crear estructura de carpetas
Write-Host "📁 PASO 2: Creando estructura de Firebase..." -ForegroundColor Cyan

if (!(Test-Path "functions")) {
    New-Item -ItemType Directory -Path "functions" | Out-Null
    Write-Host "✅ Carpeta 'functions' creada" -ForegroundColor Green
} else {
    Write-Host "⚠️  Carpeta 'functions' ya existe" -ForegroundColor Yellow
}

Write-Host ""

# PASO 3: Crear functions/index.js
Write-Host "📝 PASO 3: Creando functions/index.js..." -ForegroundColor Cyan

$functionsCode = @'
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ==========================================
// FUNCIÓN: Crear Pago en Mercado Pago
// ==========================================
exports.createPayment = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { orderId, eventId, eventName, ticketCount, totalAmount, payerEmail } = req.body;

    if (!orderId || !eventId || !ticketCount || !totalAmount) {
      res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['orderId', 'eventId', 'ticketCount', 'totalAmount']
      });
      return;
    }

    const mpAccessToken = functions.config().mercadopago.token;

    if (!mpAccessToken) {
      console.error('❌ Token de Mercado Pago no configurado');
      res.status(500).json({ error: 'Mercado Pago no configurado' });
      return;
    }

    const preference = {
      items: [{
        id: orderId,
        title: `${ticketCount} entrada${ticketCount > 1 ? 's' : ''} - ${eventName || 'VYT-MUSIC'}`,
        description: `Preventa especial para ${eventName || 'VYT-MUSIC'}`,
        category_id: 'tickets',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(totalAmount)
      }],
      payer: {
        email: payerEmail || undefined
      },
      external_reference: orderId,
      notification_url: `${functions.config().app?.url || 'https://vyt-music.web.app'}/mercadopagoWebhook`,
      back_urls: {
        success: `${functions.config().app?.url || 'https://vyt-music.web.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=success`,
        failure: `${functions.config().app?.url || 'https://vyt-music.web.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=failure`,
        pending: `${functions.config().app?.url || 'https://vyt-music.web.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      },
      statement_descriptor: 'VYTMUSIC',
      metadata: {
        event_id: eventId,
        order_id: orderId,
        ticket_count: ticketCount
      }
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Mercado Pago:', data);
      res.status(response.status).json({ 
        error: 'Error creando preferencia',
        details: data
      });
      return;
    }

    res.status(200).json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// ==========================================
// FUNCIÓN: Webhook de Mercado Pago
// ==========================================
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const mpAccessToken = functions.config().mercadopago.token;
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` }
      });

      const payment = await paymentResponse.json();

      if (payment.status === 'approved') {
        const orderId = payment.external_reference;
        
        if (!orderId) {
          res.status(200).json({ received: true, warning: 'No external_reference' });
          return;
        }

        const eventId = orderId.split('_')[0];
        const orderRef = db.collection(`ticket_orders_${eventId}`).doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          res.status(404).json({ error: 'Order not found' });
          return;
        }

        await orderRef.update({
          status: 'approved',
          paymentStatus: 'paid',
          mercadoPagoPaymentId: paymentId,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'mercadopago_webhook',
          paymentDetails: {
            status: payment.status,
            statusDetail: payment.status_detail,
            paymentMethod: payment.payment_method_id,
            transactionAmount: payment.transaction_amount,
            dateApproved: payment.date_approved,
            payerEmail: payment.payer?.email || null
          }
        });

        res.status(200).json({ 
          success: true, 
          orderId: orderId,
          status: 'approved'
        });
      } else {
        res.status(200).json({ 
          received: true, 
          status: payment.status 
        });
      }
    } else {
      res.status(200).json({ received: true });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ 
      error: 'Error procesando webhook',
      message: error.message 
    });
  }
});
'@

Set-Content -Path "functions\index.js" -Value $functionsCode -Encoding UTF8
Write-Host "✅ functions/index.js creado" -ForegroundColor Green

Write-Host ""

# PASO 4: Crear functions/package.json
Write-Host "📦 PASO 4: Creando functions/package.json..." -ForegroundColor Cyan

$packageJson = @'
{
  "name": "vytmusic-functions",
  "version": "1.0.0",
  "description": "Firebase Cloud Functions para VYT-MUSIC",
  "main": "index.js",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0",
    "node-fetch": "^2.7.0"
  }
}
'@

Set-Content -Path "functions\package.json" -Value $packageJson -Encoding UTF8
Write-Host "✅ functions/package.json creado" -ForegroundColor Green

Write-Host ""

# PASO 5: Crear firebase.json
Write-Host "🔧 PASO 5: Creando firebase.json..." -ForegroundColor Cyan

$firebaseJson = @'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**",
      "netlify/**",
      "*.md",
      "test_*.html",
      "*.ps1"
    ],
    "rewrites": [
      {
        "source": "/createPayment",
        "function": "createPayment"
      },
      {
        "source": "/mercadopagoWebhook",
        "function": "mercadopagoWebhook"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
'@

Set-Content -Path "firebase.json" -Value $firebaseJson -Encoding UTF8
Write-Host "✅ firebase.json creado" -ForegroundColor Green

Write-Host ""

# PASO 6: Información sobre instalar dependencias
Write-Host "📚 PASO 6: Instalar dependencias..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejecuta estos comandos:" -ForegroundColor Yellow
Write-Host "  cd functions" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  cd .." -ForegroundColor White
Write-Host ""

# PASO 7: Instrucciones finales
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ARCHIVOS CREADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Instalar dependencias de functions:" -ForegroundColor Cyan
Write-Host "   cd functions" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host "   cd .." -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Login a Firebase:" -ForegroundColor Cyan
Write-Host "   firebase login" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Inicializar proyecto (si no está inicializado):" -ForegroundColor Cyan
Write-Host "   firebase init" -ForegroundColor White
Write-Host "   → Selecciona: Hosting y Functions" -ForegroundColor Gray
Write-Host "   → Proyecto: vyt-music" -ForegroundColor Gray
Write-Host "   → Public directory: . (punto)" -ForegroundColor Gray
Write-Host "   → Functions directory: functions (ya existe)" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Configurar token de Mercado Pago:" -ForegroundColor Cyan
Write-Host "   firebase functions:config:set mercadopago.token=`"APP_USR-7575962186897913-030906-df25368a0b2e097818f4066d7ab64bdf1-192683624`"" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣  Desplegar:" -ForegroundColor Cyan
Write-Host "   firebase deploy" -ForegroundColor White
Write-Host ""

Write-Host "6️⃣  Actualizar URLs en preventa_artistas.html:" -ForegroundColor Cyan
Write-Host "   Cambiar:" -ForegroundColor Gray
Write-Host "     '/.netlify/functions/create-payment'" -ForegroundColor Red
Write-Host "   Por:" -ForegroundColor Gray
Write-Host "     '/createPayment'" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎉 ¡TU SITIO ESTARÁ EN: https://vyt-music.web.app" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 NOTA: Lee el archivo MIGRACION_A_FIREBASE_HOSTING.md para más detalles" -ForegroundColor Gray
Write-Host ""
