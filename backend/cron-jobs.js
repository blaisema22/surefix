const cron = require('node-cron');
const { pool } = require('./config/db');
const { cleanupNotifications } = require('./utils/cleanup');
const smsService = require('./services/appointmentSMS.service');

/**
 * Initialize all cron jobs for the system
 */
const initCronJobs = () => {
    console.log('Initializing Cron Jobs with node-cron...');

    // Job 1: Clean up expired password reset tokens (runs daily at midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('CRON: Running daily cleanup: clearing expired reset tokens...');
        try {
            const [result] = await pool.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE reset_token_expires < NOW()');
            if (result.affectedRows > 0) {
                console.log(`CRON: ✅ Cleared ${result.affectedRows} expired reset tokens.`);
            }
        } catch (err) {
            console.error('CRON: ❌ Error during daily token cleanup:', err);
        }
    });

    // Job 2: SMS reminders — runs every minute to check for 24h and 1h upcoming appointments
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // ─── 24-hour reminder ───────────────────────────────────────────
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            // Format YYYY-MM-DD in LOCAL time
            const target24Date = in24h.getFullYear() + '-' + 
                              String(in24h.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(in24h.getDate()).padStart(2, '0');
            
            const target24Time = `${String(in24h.getHours()).padStart(2,'0')}:${String(in24h.getMinutes()).padStart(2,'0')}`;

            const [upcoming24] = await pool.query(
                `SELECT a.appointment_id, a.booking_reference, a.appointment_date, a.appointment_time,
                        u.phone AS customer_phone, u.name AS customer_name, rc.name AS centre_name
                 FROM appointments a
                 JOIN users u ON a.user_id = u.user_id
                 JOIN repair_centres rc ON a.centre_id = rc.centre_id
                 WHERE a.appointment_date = ?
                   AND LEFT(a.appointment_time, 5) = ?
                   AND a.status IN ('confirmed','pending')
                   AND (a.reminder_24h_sent IS NULL OR a.reminder_24h_sent = 0)`,
                [target24Date, target24Time]
            );

            for (const appt of upcoming24) {
                await smsService.onReminder24h(appt, appt.customer_phone);
                await pool.query('UPDATE appointments SET reminder_24h_sent = 1 WHERE appointment_id = ?', [appt.appointment_id]);
                console.log(`CRON: ✅ 24h SMS reminder sent for appointment #${appt.appointment_id} to ${appt.customer_phone}`);
            }

            // ─── 1-hour reminder ────────────────────────────────────────────
            const in1h = new Date(now.getTime() + 60 * 60 * 1000);
            
            // Format YYYY-MM-DD in LOCAL time
            const target1hDate = in1h.getFullYear() + '-' + 
                              String(in1h.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(in1h.getDate()).padStart(2, '0');
                              
            const target1hTime = `${String(in1h.getHours()).padStart(2,'0')}:${String(in1h.getMinutes()).padStart(2,'0')}`;

            const [upcoming1h] = await pool.query(
                `SELECT a.appointment_id, a.booking_reference, a.appointment_date, a.appointment_time,
                        u.phone AS customer_phone, u.name AS customer_name, rc.name AS centre_name
                 FROM appointments a
                 JOIN users u ON a.user_id = u.user_id
                 JOIN repair_centres rc ON a.centre_id = rc.centre_id
                 WHERE a.appointment_date = ?
                   AND LEFT(a.appointment_time, 5) = ?
                   AND a.status IN ('confirmed','pending')
                   AND (a.reminder_1h_sent IS NULL OR a.reminder_1h_sent = 0)`,
                [target1hDate, target1hTime]
            );

            for (const appt of upcoming1h) {
                await smsService.onReminder1h(appt, appt.customer_phone);
                await pool.query('UPDATE appointments SET reminder_1h_sent = 1 WHERE appointment_id = ?', [appt.appointment_id]);
                console.log(`CRON: ✅ 1h SMS reminder sent for appointment #${appt.appointment_id} to ${appt.customer_phone}`);
            }

        } catch (err) {
            console.error('CRON: ❌ Reminder job error:', err.message);
        }
    });

    // Job 3: Clean up old read notifications (runs weekly on Sunday at midnight)
    cron.schedule('0 0 * * 0', async () => {
        console.log('CRON: Running weekly cleanup: deleting old read notifications...');
        try {
            const deletedCount = await cleanupNotifications(30, true);
            if (deletedCount > 0) {
                console.log(`CRON: ✅ Deleted ${deletedCount} old read notifications.`);
            }
        } catch (err) {
            console.error('CRON: ❌ Error during notification cleanup:', err);
        }
    });

    console.log('✅ Cron jobs registered.');
};

module.exports = initCronJobs;
