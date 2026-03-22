const { pool } = require('./config/db');

async function testCustomerDashboardQueries() {
    try {
        console.log("Testing appointments query...");
        const userId = 7; // Alice's user id from earlier test
        const [appointments] = await pool.query(
            `SELECT a.*, c.name as centre_name, s.service_name, d.brand as device_brand, d.model as device_model,
                    (SELECT rating FROM reviews WHERE appointment_id = a.appointment_id) as my_rating
             FROM appointments a
             JOIN repair_centres c ON a.centre_id = c.centre_id
             LEFT JOIN services s ON a.service_id = s.service_id
             JOIN devices d ON a.device_id = d.device_id
             WHERE a.user_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [userId]
        );
        console.log("Appointments query succeeded! Count:", appointments.length);

        console.log("Testing devices query...");
        const [devices] = await pool.query(
            'SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        console.log("Devices query succeeded! Count:", devices.length);
        
    } catch(err) {
        console.error("DB Query Error:", err);
    } finally {
        if(pool) await pool.end();
    }
}
testCustomerDashboardQueries();
