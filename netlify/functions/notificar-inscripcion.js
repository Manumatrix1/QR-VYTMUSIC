// Netlify Function: Notificación automática por WhatsApp al recibir una nueva inscripción
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { nombre, provincia, ciudad, telefono } = body;

    const callMeBotKey = process.env.CALLMEBOT_API_KEY;
    const adminPhone   = process.env.ADMIN_PHONE;

    if (!callMeBotKey || !adminPhone) {
      console.log('⚠️ CallMeBot no configurado (falta CALLMEBOT_API_KEY o ADMIN_PHONE)');
      return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'not_configured' }) };
    }

    const adminURL = 'https://vytmusic.netlify.app/admin_audiciones.html?nuevo=1';
    const lugar = [provincia, ciudad].filter(Boolean).join(' - ');
    const msg = `🎤 NUEVA INSCRIPCION VYT\n👤 ${nombre || 'Sin nombre'}${lugar ? `\n📍 ${lugar}` : ''}\n📱 WA: ${telefono || 'N/D'}\n\nVer en admin:\n${adminURL}`;

    const callMeBotURL = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(msg)}&apikey=${callMeBotKey}`;

    console.log('📲 Enviando notificación WhatsApp por nueva inscripción...');
    const response = await fetch(callMeBotURL);

    if (response.ok) {
      console.log('✅ Notificación de inscripción enviada exitosamente');
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } else {
      const errorText = await response.text();
      console.error('❌ Error respuesta CallMeBot:', errorText);
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: errorText }) };
    }

  } catch (e) {
    console.error('❌ Error en notificar-inscripcion:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
