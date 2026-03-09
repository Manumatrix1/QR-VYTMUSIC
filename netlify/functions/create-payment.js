// Netlify Function: Crear preferencia de pago Mercado Pago
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🛒 Solicitud de preferencia de pago recibida');

  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      orderId, 
      eventId,
      eventName, 
      ticketCount, 
      totalAmount, 
      payerEmail 
    } = JSON.parse(event.body);

    console.log('📋 Datos recibidos:', { orderId, eventId, ticketCount, totalAmount });

    // Validar campos requeridos
    if (!orderId || !eventId || !ticketCount || !totalAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Faltan campos requeridos',
          required: ['orderId', 'eventId', 'ticketCount', 'totalAmount']
        })
      };
    }

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!mpAccessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Mercado Pago no configurado' })
      };
    }

    // Crear preferencia de pago
    const preference = {
      items: [
        {
          id: orderId,
          title: `${ticketCount} entrada${ticketCount > 1 ? 's' : ''} - ${eventName || 'VYT-MUSIC'}`,
          description: `Preventa especial para ${eventName || 'VYT-MUSIC'}`,
          category_id: 'tickets',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: parseFloat(totalAmount)
        }
      ],
      payer: {
        email: payerEmail || undefined
      },
      external_reference: orderId, // ⚡ CRÍTICO: enlaza pago con orden
      notification_url: `${process.env.URL || 'https://vytmusic.netlify.app'}/.netlify/functions/mercadopago-webhook`,
      back_urls: {
        success: `${process.env.URL || 'https://vytmusic.netlify.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=success`,
        failure: `${process.env.URL || 'https://vytmusic.netlify.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=failure`,
        pending: `${process.env.URL || 'https://vytmusic.netlify.app'}/preventa_artistas.html?eventId=${eventId}&orderId=${orderId}&payment=pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1 // Solo 1 cuota
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Error creando preferencia',
          details: data
        })
      };
    }

    console.log('✅ Preferencia creada:', data.id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        preferenceId: data.id,
        initPoint: data.init_point, // URL para redireccionar al usuario
        sandboxInitPoint: data.sandbox_init_point
      })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error.message 
      })
    };
  }
};
