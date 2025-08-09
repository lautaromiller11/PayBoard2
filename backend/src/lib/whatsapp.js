const twilio = require('twilio');
const prisma = require('../config/prisma');

// Configura tus credenciales de Twilio aquí
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // Ej: 'whatsapp:+14155238886'

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function sendWhatsAppAlert(to, message) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        throw new Error('Twilio config missing');
    }
    return client.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${to}`,
        body: message,
    });
}

// Verifica servicios vencidos y envía alerta si corresponde
async function checkAndSendAlertsForUser(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { servicios: true },
    });
    if (!user || !user.whatsappAlertsEnabled || !user.phoneNumber) return;
    const vencidos = user.servicios.filter(s => s.estado === 'vencido');
    if (vencidos.length === 0) return;
    for (const servicio of vencidos) {
        const msg = `¡Alerta! El servicio "${servicio.nombre}" está vencido. Monto: $${servicio.monto}. Vencimiento: ${servicio.vencimiento}`;
        await sendWhatsAppAlert(user.phoneNumber, msg);
    }
}

module.exports = { sendWhatsAppAlert, checkAndSendAlertsForUser };
