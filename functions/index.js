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
// FUNCIÓN: Notificar nueva audición — crea admin_notifications en Firestore
// Se dispara automáticamente cuando se crea un doc en /audiciones
// ==========================================
exports.notificarNuevaAudicion = functions.firestore
  .document('audiciones/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const docId = context.params.docId;

    const nombre   = data.nombre   || 'Sin nombre';
    const telefono = data.telefono || data.whatsapp || '—';
    const provincia = data.provincia || '';
    const ciudad   = data.localidad || data.ciudad || '';
    const video    = data.video_url || data.video_subido || data.videoURL || '';
    const docLink  = `${APP_URL}/admin_audiciones.html?id=${docId}`;

    const locationStr = provincia ? `${provincia}${ciudad ? ' · ' + ciudad : ''}` : '';
    const waMsg =
      `🎤 *Nueva audición — VYT MUSIC*\n\n` +
      `👤 *${nombre}*\n` +
      (locationStr ? `🗺️ ${locationStr}\n` : '') +
      `📱 ${telefono}\n` +
      (video ? `\n🎬 Video:\n${video}\n` : '') +
      `\n🔗 Ver inscripción:\n${docLink}`;

    try {
      await db.collection('admin_notifications').add({
        type: 'nueva_inscripcion',
        docId: docId,
        nombre: nombre,
        telefono: telefono,
        location: locationStr,
        message: `🎤 Nueva audición: ${nombre}${locationStr ? ' de ' + locationStr : ''}`,
        whatsappLink: `https://wa.me/5493413632329?text=${encodeURIComponent(waMsg)}`,
        adminLink: docLink,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        autoOpenWhatsApp: false
      });
      console.log(`✅ admin_notifications creado para nueva audición: ${nombre}`);
    } catch (e) {
      console.error(`❌ Error creando notificación para ${nombre}:`, e.message);
    }

    return null;
  });

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

    // Determinar si es inscripción o preventa
    const isInscripcion = orderId.startsWith('inscripcion_');
    const audicionId = isInscripcion ? orderId.replace('inscripcion_', '') : null;

    // Configurar back_urls según el tipo
    let backUrls;
    if (isInscripcion) {
      // Para inscripciones: redirigir a pago_inscripcion.html
      backUrls = {
        success: `${baseUrl}/pago_inscripcion.html?id=${audicionId}&payment=success`,
        failure: `${baseUrl}/pago_inscripcion.html?id=${audicionId}&payment=failure`,
        pending: `${baseUrl}/pago_inscripcion.html?id=${audicionId}&payment=pending`
      };
    } else {
      // Para preventa: redirigir a preventa_artistas.html
      backUrls = {
        success: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=success`,
        failure: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=failure`,
        pending: `${baseUrl}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=pending`
      };
    }

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
      notification_url: `https://us-central1-vyt-music.cloudfunctions.net/mercadopagoWebhookV2`,
      back_urls: backUrls,
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
// FUNCIÓN: Chat IA Público (Gemini) v3 flash-lite
// ==========================================
exports.chatPublico = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onRequest(async (req, res) => {

  res.set('Access-Control-Allow-Origin', 'https://vyt-music.web.app');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { pregunta } = req.body || {};

  if (!pregunta || typeof pregunta !== 'string' || pregunta.trim().length < 2) {
    res.status(400).json({ error: 'Pregunta vacía o inválida.' });
    return;
  }
  if (pregunta.trim().length > 500) {
    res.status(400).json({ error: 'Pregunta demasiado larga (máx 500 caracteres).' });
    return;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PEGAR_AQUI_TU_CLAVE_GEMINI') {
    res.status(503).json({ error: 'El asistente de IA no está configurado aún.' });
    return;
  }

  // Leer contexto personalizado desde Firestore
  let contextoPersonalizado = '';
  try {
    const snap = await db.collection('config_sitio').doc('inscripcion').get();
    if (snap.exists && snap.data().ia_contexto) {
      contextoPersonalizado = snap.data().ia_contexto;
    }
  } catch(e) {
    console.warn('No se pudo leer ia_contexto:', e.message);
  }

  const instruccion = contextoPersonalizado ||
    `Sos el asistente virtual de VYT MUSIC, un certamen de canto con más de 12 años de historia.
Respondé preguntas sobre el certamen, inscripciones, galas, fechas y costos de forma amable y concisa.
Si no sabés algo específico, decí que se pongan en contacto con el equipo por el chat en vivo.
Respondé siempre en español, de forma corta (máximo 3 oraciones).`;

  let respuesta = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: instruccion + '\n\nPregunta del usuario: ' + pregunta.trim() }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.65 }
        })
      }
    );
    const json = await r.json();
    if (!r.ok) {
      const geminiMsg = json?.error?.message || JSON.stringify(json);
      console.error('Gemini error:', geminiMsg);
      res.status(200).json({ error: 'No pude responder en este momento. Usá el chat en vivo para más info.' });
      return;
    }
    respuesta = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch(e) {
    console.error('Error Gemini:', e.message);
    res.status(200).json({ error: 'No pude responder en este momento. Usá el chat en vivo para más info.' });
    return;
  }

  // Detectar si la IA no tuvo la info y guardar la pregunta para el admin
  const sinRespuesta = /no se especifica|no tengo información|no cuento con|no está especificado|no dispongo|no lo menciona|no hay información|chat en vivo|ponerse en contacto|contactar al equipo/i.test(respuesta);
  if (sinRespuesta) {
    try {
      await db.collection('ia_preguntas_sin_respuesta').add({
        pregunta: pregunta.trim(),
        respuesta_ia: respuesta,
        fecha: new Date().toISOString()
      });
    } catch(e) {
      console.warn('No se pudo guardar pregunta sin respuesta:', e.message);
    }
  }

  res.status(200).json({ respuesta });
});

// onAudicionCreada fue unificado con notificarNuevaAudicion (ver arriba)

// ==========================================
// FUNCIÓN: Avisar comprobante de pago al admin — crea admin_notifications
// Llamado desde preventa_artistas.html cuando el artista sube su comprobante
// ==========================================
exports.avisarPagoAdmin = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { artistName, artistPhone, guestCount, amount, orderId, eventId, eventName } = req.body || {};

  if (!eventId || !orderId) {
    res.status(400).json({ error: 'Faltan eventId u orderId' });
    return;
  }

  const adminLink = `https://vyt-music.web.app/admin_preventa.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName || '')}`;
  const amountFmt = parseInt(amount || 0).toLocaleString('es-AR');
  const waMsg =
    `🎟️ *NUEVO COMPROBANTE DE PAGO*\n\n` +
    `✅ El artista subió su comprobante\n\n` +
    `👤 ${artistName || 'Artista'}\n` +
    (artistPhone ? `📱 ${artistPhone}\n` : '') +
    `🎫 ${guestCount || 0} entradas\n` +
    `💰 $${amountFmt}\n` +
    `📦 Orden: ${String(orderId).substring(0, 8).toUpperCase()}\n\n` +
    `📋 Aprobar pago:\n${adminLink}`;

  try {
    await db.collection('admin_notifications').add({
      type: 'comprobante_subido',
      eventId: eventId,
      eventName: eventName || '',
      orderId: orderId,
      clientName: artistName || 'Artista',
      clientPhone: artistPhone || 'N/A',
      quantity: guestCount || 0,
      amount: parseInt(amount || 0),
      message: `🎟️ Comprobante de pago: ${artistName || 'Artista'} — ${guestCount || 0} entradas — $${amountFmt}`,
      whatsappLink: `https://wa.me/5493413632329?text=${encodeURIComponent(waMsg)}`,
      adminLink: adminLink,
      whatsappMessage: waMsg,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      autoOpenWhatsApp: false
    });
    console.log(`✅ admin_notifications creado para comprobante: ${artistName}`);
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('❌ Error creando notificación de pago:', e.message);
    res.status(500).json({ error: e.message });
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

        // ============================================
        // CASO 1: INSCRIPCIÓN DE ARTISTA
        // ============================================
        if (orderId.startsWith('inscripcion_')) {
          const audicionId = orderId.replace('inscripcion_', ''); // Extraer ID real
          console.log(`🎤 Es una inscripción. ID: ${audicionId}`);

          // Buscar la audición en Firestore
          const audicionRef = db.collection('audiciones').doc(audicionId);
          const audicionDoc = await audicionRef.get();

          if (!audicionDoc.exists) {
            console.error(`❌ Audición ${audicionId} no encontrada`);
            res.status(404).json({ error: 'Audicion not found' });
            return;
          }

          const audicionData = audicionDoc.data();

          // Actualizar estado de pago
          await audicionRef.update({
            estadoPago: 'pagado',
            mercadoPagoPaymentId: paymentId,
            fechaPagoConfirmado: admin.firestore.FieldValue.serverTimestamp(),
            paymentDetails: {
              status: payment.status,
              statusDetail: payment.status_detail,
              paymentMethod: payment.payment_method_id,
              transactionAmount: payment.transaction_amount,
              dateApproved: payment.date_approved,
              payerEmail: payment.payer?.email || null
            }
          });

          console.log(`✅ Inscripción ${audicionId} marcada como PAGADA`);

          // Enviar WhatsApp al artista (opcional - comentar si no quieres)
          // Si tienes función de envío de WhatsApp programático, descomentar:
          /*
          const phone = audicionData.telefono?.replace(/\D/g, '');
          if (phone) {
            const msg = `🎉 ¡PAGO CONFIRMADO!\n\nTu inscripción a VYT MUSIC está completa ✅\n\nTe agregaremos al grupo de WhatsApp de participantes con todos los detalles.\n\n¡Preparate para brillar en el escenario! 🎤`;
            // Aquí puedes usar un servicio de WhatsApp API si lo tienes configurado
          }
          */

          res.status(200).json({ 
            success: true, 
            type: 'inscripcion',
            audicionId: audicionId,
            status: 'pagado'
          });
          return;
        }

        // ============================================
        // CASO 2: COMPRA DE ENTRADAS (PREVENTA)
        // ============================================
        const eventId = orderId.split('_')[0];
        console.log(`🎟️ Es una preventa. Evento: ${eventId}, Orden: ${orderId}`);

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

        // � CREAR NOTIFICACIÓN PARA EL ADMIN PANEL
        try {
          const orderData = orderDoc.data();
          const clientName = orderData.artistName || 'Cliente';
          const clientPhone = orderData.artistPhone || 'N/A';
          const totalAmount = orderData.totalAmount || 0;
          const quantity = orderData.quantity || 0;
          const eventName = orderData.eventName || 'Evento';
          
          // Link directo al admin panel
          const adminLink = `https://vyt-music.web.app/admin_preventa.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}`;
          
          // Mensaje para WhatsApp
          const whatsappMessage = `💳 *PAGO APROBADO - MERCADO PAGO*\n\n✅ Pago confirmado automáticamente\n\nDatos:\n👤 ${clientName}\n📱 ${clientPhone}\n🎫 ${quantity} entradas\n💰 $${totalAmount.toLocaleString()}\n📦 Orden: ${orderId.substring(0, 8).toUpperCase()}\n\n📋 Ver detalles:\n${adminLink}`;
          
          const whatsappLink = `https://wa.me/543413632329?text=${encodeURIComponent(whatsappMessage)}`;
          
          // Crear documento de notificación en Firestore
          await db.collection('admin_notifications').add({
            type: 'payment_approved',
            eventId: eventId,
            eventName: eventName,
            orderId: orderId,
            clientName: clientName,
            clientPhone: clientPhone,
            quantity: quantity,
            amount: totalAmount,
            message: `💰 Nuevo pago aprobado: ${clientName} - ${quantity} entradas - $${totalAmount.toLocaleString()}`,
            whatsappMessage: whatsappMessage,
            whatsappLink: whatsappLink,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentMethod: 'mercadopago',
            autoOpenWhatsApp: true
          });
          
          console.log('✅ Notificación para admin panel creada');
          
          // Guardar en la orden
          await orderRef.update({
            adminNotificationCreated: true,
            adminNotificationTimestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          
        } catch (notifError) {
          console.error('⚠️ Error creando notificación admin:', notifError);
          // No bloqueamos el flujo si falla la notificación
        }

        res.status(200).json({ 
          success: true,
          type: 'preventa', 
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
