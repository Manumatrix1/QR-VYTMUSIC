const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Configuración hardcodeada temporalmente (mejor práctica: usar Firebase Config)
const MERCADOPAGO_TOKEN = 'APP_USR-7575962186897913-030906-df25368a0b2e0978194066d7ab64beff-192683624';
const APP_URL = 'https://vyt-music.web.app';

// Inicializar Firebase Admin (automático en Cloud Functions)
admin.initializeApp();
const db = admin.firestore();

// ==========================================
// FUNCIÓN: Crear Pago en Mercado Pago
// ==========================================
exports.createPaymentV2 = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
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

    console.log('📋 Datos recibidos:', { orderId, eventId, ticketCount, totalAmount });

    // Validar campos requeridos
    if (!orderId || !eventId || !ticketCount || !totalAmount) {
      res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['orderId', 'eventId', 'ticketCount', 'totalAmount']
      });
      return;
    }

    // Obtener token de Mercado Pago
    const mpAccessToken = MERCADOPAGO_TOKEN;

    if (!mpAccessToken) {
      console.error('❌ MERCADOPAGO_TOKEN no configurado');
      res.status(500).json({ error: 'Mercado Pago no configurado' });
      return;
    }

    // Obtener URL base del sitio
    const baseUrl = APP_URL;

    // Crear preferencia de pago para Mercado Pago
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
      external_reference: orderId, // CRÍTICO: enlaza pago con orden
      notification_url: `${baseUrl}/mercadopagoWebhook`,
      back_urls: {
        success: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=success`,
        failure: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=failure`,
        pending: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=pending`
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

    console.log('📤 Enviando preferencia a Mercado Pago...');

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

    console.log('✅ Preferencia creada:', data.id);

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
exports.mercadopagoWebhookV2 = functions.https.onRequest(async (req, res) => {
  console.log('🔔 Webhook recibido de Mercado Pago');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;
    console.log('📦 Body recibido:', body);

    // Mercado Pago envía notificaciones de tipo "payment"
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log(`💳 Payment ID recibido: ${paymentId}`);

      const mpAccessToken = process.env.MERCADOPAGO_TOKEN;
      
      if (!mpAccessToken) {
        console.error('❌ MERCADOPAGO_TOKEN no configurado');
        res.status(500).json({ error: 'Token no configurado' });
        return;
      }

      // Obtener detalles del pago desde Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      const payment = await paymentResponse.json();
      console.log('💰 Detalles del pago:', payment);

      // Verificar si el pago fue aprobado
      if (payment.status === 'approved') {
        console.log('✅ Pago APROBADO');

        const orderId = payment.external_reference;
        
        if (!orderId) {
          console.warn('⚠️ No se encontró external_reference en el pago');
          res.status(200).json({ received: true, warning: 'No external_reference' });
          return;
        }

        // Extraer eventId del orderId (formato: eventId_timestamp)
        const eventId = orderId.split('_')[0];
        
        console.log(`🔍 Buscando orden ${orderId} en evento ${eventId}`);

        // Actualizar la orden en Firestore
        const orderRef = db.collection(`ticket_orders_${eventId}`).doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          console.error(`❌ Orden ${orderId} no encontrada en Firebase`);
          res.status(404).json({ error: 'Order not found' });
          return;
        }

        // Actualizar estado a APPROVED automáticamente
        await orderRef.update({
          status: 'approved',
          paymentStatus: 'paid',
          mercadoPagoPaymentId: paymentId,
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'mercadopago_webhook_firebase',
          paymentDetails: {
            status: payment.status,
            statusDetail: payment.status_detail,
            paymentMethod: payment.payment_method_id,
            transactionAmount: payment.transaction_amount,
            dateApproved: payment.date_approved,
            payerEmail: payment.payer?.email || null
          }
        });

        console.log(`✅ Orden ${orderId} actualizada a APPROVED automáticamente`);

        res.status(200).json({ 
          success: true, 
          orderId: orderId,
          status: 'approved'
        });
      } else {
        console.log(`⏳ Pago en estado: ${payment.status}`);
        res.status(200).json({ 
          received: true, 
          status: payment.status 
        });
      }
    } else {
      console.log('📋 Notificación no es de tipo payment');
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
