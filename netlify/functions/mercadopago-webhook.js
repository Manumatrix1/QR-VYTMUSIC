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

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            orderId: orderId,
            status: 'approved'
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
