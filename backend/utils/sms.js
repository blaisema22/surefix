require('dotenv').config();
const { pool } = require('../config/db');

/**
 * Normalize any phone number to E.164 format (Rwanda default).
 * Efficiently handles Rwanda numbers (+250, 07..., 7...) and international ones.
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return `+250${cleaned.slice(1)}`;
    if (cleaned.startsWith('250')) return `+${cleaned}`;
    if (cleaned.length === 9 && cleaned.startsWith('7')) return `+250${cleaned}`;
    return `+250${cleaned}`;
};

const getTwilioClient = () => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
    try {
        return require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch { return null; }
};

/**
 * Send an SMS. 
 * Priority: Africa's Talking → Twilio → Dev terminal log
 * Always saves to sms_simulator DB for the in-app inbox.
 */
const sendSMS = async (to, body, meta = {}) => {
    const phone = normalizePhone(to);
    if (!phone || !body) {
        console.warn('[SMS] Skipping: No valid phone or body');
        return;
    }

    const { appointment_id = null, type = 'general' } = meta;

    // ── 1. Always save to simulator (In-app Inbox) ─────────────────
    try {
        await pool.query(
            `INSERT INTO sms_simulator (phone_number, message, type, appointment_id, status)
             VALUES (?, ?, ?, ?, 'sent')`,
            [phone, body, type, appointment_id]
        );
    } catch (err) {
        console.error(`[SMS] DB Log error for ${phone}:`, err.message);
    }

    // ── 2. Africa's Talking (Best for Rwanda — free sandbox) ───────
    const { AT_API_KEY, AT_USERNAME, AT_SENDER_ID } = process.env;
    if (AT_API_KEY && AT_USERNAME) {
        try {
            const AfricasTalking = require('africastalking');
            const client = AfricasTalking({ apiKey: AT_API_KEY, username: AT_USERNAME });
            const sms = client.SMS;
            const result = await sms.send({
                to: [phone],
                message: body,
                ...(AT_SENDER_ID && { from: AT_SENDER_ID }),
            });
            const recipient = result.SMSMessageData?.Recipients?.[0];
            console.log(`[SMS AT] ✅ Sent to ${phone} — Status: ${recipient?.status} | ID: ${recipient?.messageId}`);
            return recipient?.messageId;
        } catch (err) {
            console.error(`[SMS AT] ❌ Failed for ${phone}:`, err.message);
        }
        // If AT creds exist but failed, we stop here to avoid cross-provider confusion/costs
        // unless you specifically want to fall through. For now, we return.
        return; 
    }

    // ── 3. Twilio Fallback ──────────────────────────────────────────
    const { TWILIO_MESSAGING_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_MESSAGING_SERVICE_SID) {
        try {
            const client = getTwilioClient();
            if (client) {
                const message = await client.messages.create({
                    messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
                    to: phone,
                    body,
                });
                console.log(`[SMS Twilio] ✅ Sent to ${phone} — SID: ${message.sid}`);
                return message.sid;
            }
        } catch (err) {
            console.error(`[SMS Twilio] ❌ Failed for ${phone}:`, err.message);
        }
        return;
    }

    // ── 4. Dev mode — terminal log only ─────────────────────────────
    console.log(`
[SMS DEV MODE] ──────────────────────────
  To   : ${phone}
  Type : ${type}
  Body :
${body}
─────────────────────────────────────────
  `);
};

module.exports = { sendSMS, normalizePhone };