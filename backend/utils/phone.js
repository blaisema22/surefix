/**
 * Normalizes a phone number to E.164 format required by Twilio.
 * Handles Rwanda (+250) local formats automatically.
 * @param {string|number} phone
 * @returns {string|null} E.164 formatted phone e.g. +250781234567
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    let p = phone.toString().replace(/\s+/g, '').replace(/-/g, '');
    if (p.startsWith('+'))   return p;           // already E.164
    if (p.startsWith('250')) return `+${p}`;     // Rwanda code without +
    if (p.startsWith('0'))   return `+250${p.slice(1)}`; // local 07xx → +25078...
    return `+250${p}`;                           // fallback: assume Rwanda
};

module.exports = { normalizePhone };
