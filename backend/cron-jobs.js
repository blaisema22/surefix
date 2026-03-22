const cron = require('node-cron');
const { pool } = require('./config/db');
// const { sendAppointmentReminderEmail } = require('./utils/emailService'); // Placeholder for email utility
const { cleanupNotifications } = require('./utils/cleanup');

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

    // Job 2: Send appointment reminders (runs every hour at the 5-minute mark)
    cron.schedule('5 * * * *', async () => {
        console.log('CRON: Running hourly job: checking for appointment reminders...');
        try {
            // Find confirmed appointments happening in the next 24-25 hours that haven't had a reminder sent.
            const [appointments] = await pool.query(`
                SELECT 
                    a.appointment_id, 
                    a.appointment_date, 
                    a.appointment_time,
                    u.email as customer_email,
                    u.name as customer_name,
                    rc.name as centre_name
                FROM appointments a
                JOIN users u ON a.user_id = u.user_id
                JOIN repair_centres rc ON a.centre_id = rc.centre_id
                WHERE 
                    a.status = 'confirmed' AND 
                    (a.reminder_sent IS NULL OR a.reminder_sent = 0) AND
                    TIMESTAMP(a.appointment_date, a.appointment_time) BETWEEN NOW() + INTERVAL 24 HOUR AND NOW() + INTERVAL 25 HOUR
            `);

            if (appointments.length === 0) return;

            console.log(`CRON: Found ${appointments.length} reminder(s) to send.`);

            for (const appt of appointments) {
                try {
                    // --- Placeholder for actual email sending logic ---
                    console.log(`CRON: Simulating sending reminder email to ${appt.customer_email} for appointment ${appt.appointment_id}`);
                    // await sendAppointmentReminderEmail({ ...appt });
                    // --- End Placeholder ---

                    // If email sending is successful, mark it as sent in the DB
                    await pool.query('UPDATE appointments SET reminder_sent = 1 WHERE appointment_id = ?', [appt.appointment_id]);
                    console.log(`CRON: ✅ Reminder sent and marked for appointment ${appt.appointment_id}.`);

                } catch (emailError) {
                    console.error(`CRON: ❌ Failed to send reminder for appointment ${appt.appointment_id}:`, emailError);
                }
            }
        } catch (err) {
            console.error('CRON: ❌ Error during appointment reminder job:', err);
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
