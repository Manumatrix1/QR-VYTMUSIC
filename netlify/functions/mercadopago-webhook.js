// Netlify Function: Webhook de Mercado Pago
const fetch = require('node-fetch');
const admin = require('firebase-admin');

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  console.log('🔔 Webhook recibido de Mercado Pago');
  
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('📦 Body recibido:', body);

    // Mercado Pago envía notificaciones de tipo "payment"
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log(`💳 Payment ID recibido: ${paymentId}`);

      // Obtener detalles del pago desde Mercado Pago API
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      
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

        // Buscar la orden relacionada por external_reference
        const orderId = payment.external_reference;
        
        if (!orderId) {
          console.warn('⚠️ No se encontró external_reference en el pago');
          return {
            statusCode: 200,
            body: JSON.stringify({ received: true, warning: 'No external_reference' })
          };
        }

        // Extraer eventId del orderId (formato: eventId_timestamp)
        const eventId = orderId.split('_')[0];
        
        console.log(`🔍 Buscando orden ${orderId} en evento ${eventId}`);

        // Actualizar la orden en Firebase
        const orderRef = db.collection(`ticket_orders_${eventId}`).doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          console.error(`❌ Orden ${orderId} no encontrada en Firebase`);
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Order not found' })
          };
        }

        // Actualizar estado a APPROVED automáticamente
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

        console.log(`✅ Orden ${orderId} actualizada a APPROVED automáticamente`);

        // 📱 NOTIFICACIÓN WHATSAPP AL ADMIN
        try {
          const orderData = orderDoc.data();
          const clientName = orderData.artistName || 'Cliente';
          const clientPhone = orderData.artistPhone || 'N/A';
          const totalAmount = orderData.totalAmount || 0;
          const quantity = orderData.quantity || 0;
          const eventName = orderData.eventName || 'Evento';
          
          // URL del admin panel
          const adminLink = `https://vytmusic.netlify.app/admin_preventa.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}`;
          
          // Mensaje para WhatsApp
          const whatsappMessage = `🎉 *PAGO APROBADO - MERCADO PAGO*\n\n` +
            `💰 Cliente: ${clientName}\n` +
            `📱 Teléfono: ${clientPhone}\n` +
            `🎟️ Entradas: ${quantity}\n` +
            `💵 Monto: $${totalAmount.toLocaleString()}\n` +
            `📦 Orden: ${orderId.substring(0, 8).toUpperCase()}\n` +
            `🎪 Evento: ${eventName}\n\n` +
            `✅ El pago fue confirmado automáticamente por Mercado Pago.\n\n` +
            `Ver detalles:\n${adminLink}`;
          
          // OPCIÓN 1: CallMeBot (GRATIS)
          // Para activar: agregar CALLMEBOT_API_KEY y ADMIN_PHONE en variables de entorno
          const callMeBotKey = process.env.CALLMEBOT_API_KEY;
          const adminPhone = process.env.ADMIN_PHONE;
          
          if (callMeBotKey && adminPhone) {
            try {
              // CallMeBot tiene límite de caracteres, hacer mensaje más corto
              const shortMessage = `🎉 PAGO APROBADO MP\n${clientName}\n${quantity} entradas - $${totalAmount.toLocaleString()}\nVer: ${adminLink}`;
              
              const callMeBotURL = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(shortMessage)}&apikey=${callMeBotKey}`;
              
              console.log('📲 Enviando notificación WhatsApp con CallMeBot...');
              
              const response = await fetch(callMeBotURL);
              
              if (response.ok) {
                console.log('✅ Notificación WhatsApp enviada exitosamente');
                await orderRef.update({
                  whatsappNotificationSent: true,
                  whatsappNotificationMethod: 'callmebot',
                  whatsappNotificationTimestamp: admin.firestore.FieldValue.serverTimestamp()
                });
              } else {
                const errorText = await response.text();
                console.error('❌ Error respuesta CallMeBot:', errorText);
              }
            } catch (callMeBotError) {
              console.error('❌ Error enviando con CallMeBot:', callMeBotError);
            }
          } else {
            console.log('⚠️ CallMeBot no configurado (falta CALLMEBOT_API_KEY o ADMIN_PHONE)');
          }
          
          // Guardar mensaje en Firebase como backup (siempre)
          const whatsappURL = `https://wa.me/${adminPhone || '543413632329'}?text=${encodeURIComponent(whatsappMessage)}`;
          
          await orderRef.update({
            whatsappNotificationURL: whatsappURL,
            whatsappNotificationMessage: whatsappMessage,
            whatsappNotificationPrepared: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('✅ Datos de notificación WhatsApp guardados en Firebase');
          
        } catch (whatsappError) {
          console.error('⚠️ Error preparando notificación WhatsApp:', whatsappError);
          // No bloqueamos el flujo si falla la notificación
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            orderId: orderId,
            status: 'approved',
            notification: 'whatsapp_prepared'
          })
        };
      } else {
        console.log(`⏳ Pago en estado: ${payment.status}`);
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            received: true, 
            status: payment.status 
          })
        };
      }
    }

    // Otro tipo de notificación
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, type: body.type })
    };

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
