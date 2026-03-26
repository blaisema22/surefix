/**
 * SureFix SMS Templates
 * Rich, contextual SMS message templates for all appointment events.
 */

const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long'
    });
};

const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    try {
        const str = String(timeStr);
        if (!str.includes(':')) return str;
        const [h, m] = str.split(':');
        const hour = parseInt(h);
        if (isNaN(hour)) return str;
        return `${hour > 12 ? hour - 12 : hour || 12}:${m.slice(0,2)} ${hour >= 12 ? 'PM' : 'AM'}`;
    } catch (e) {
        return 'TBD';
    }
};

const templates = {

    bookingConfirmed: (a) =>
`Hi ${a.customer_name}! ✅ Your SureFix repair request has been received.

📍 Centre: ${a.centre_name}
🔧 Service: ${a.service_name || 'General Repair'}
📅 Date: ${formatDate(a.appointment_date)}
⏰ Time: ${formatTime(a.appointment_time)}
📱 Device: ${a.device_brand || ''} ${a.device_model || ''}
🔖 Ref: #${a.booking_reference}

We'll confirm shortly!`,

    shopNewBooking: (a) =>
`SureFix: New repair request received! 🔔

👤 Customer: ${a.customer_name}
🔧 Service: ${a.service_name || 'General Repair'}
📅 ${formatDate(a.appointment_date)} at ${formatTime(a.appointment_time)}
🔖 Ref: #${a.booking_reference}

Log in to confirm or manage this appointment.`,

    statusConfirmed: (a) =>
`Great news, ${a.customer_name}! 🎉

Your repair at ${a.centre_name} has been CONFIRMED.

📅 ${formatDate(a.appointment_date)} at ${formatTime(a.appointment_time)}
🔖 Ref: #${a.booking_reference}

Please arrive a few minutes early.`,

    repairStarted: (a) =>
`Your repair has started! 🔧

Hi ${a.customer_name}, the technician at ${a.centre_name} is now working on your ${a.device_brand || 'device'} ${a.device_model || ''}.

🔖 Ref: #${a.booking_reference}

We'll notify you when it's ready!`,

    repairCompleted: (a) =>
`Your device is ready! ✅

Hi ${a.customer_name}, your ${a.device_brand || 'device'} ${a.device_model || ''} repair at ${a.centre_name} is COMPLETE.

🔖 Ref: #${a.booking_reference}

Please collect it at your convenience. Thank you for choosing SureFix! 🙏`,

    appointmentCancelled: (a) =>
`Appointment Cancelled — SureFix

Hi ${a.customer_name}, your appointment on ${formatDate(a.appointment_date)} at ${a.centre_name} has been cancelled.

🔖 Ref: #${a.booking_reference}

To rebook, visit SureFix anytime.`,

    shopCancelled: (a) =>
`SureFix: Customer cancelled appointment.

👤 ${a.customer_name} — Ref: #${a.booking_reference}
📅 ${formatDate(a.appointment_date)} at ${formatTime(a.appointment_time)}

The time slot is now available.`,

    reminder24h: (a) =>
`SureFix Reminder ⏰ — Appointment Tomorrow

Hi ${a.customer_name}, your repair is scheduled for tomorrow:

📅 ${formatDate(a.appointment_date)} at ${formatTime(a.appointment_time)}
📍 ${a.centre_name}
🔖 Ref: #${a.booking_reference}

Please arrive on time. See you soon!`,

    reminder1h: (a) =>
`SureFix Reminder 🔔

Hi ${a.customer_name}, your appointmnet starts in 1 hour!

⏰ ${formatTime(a.appointment_time)} — ${a.centre_name}
🔖 Ref: #${a.booking_reference}

See you soon!`,
};

module.exports = { templates, formatDate, formatTime };
