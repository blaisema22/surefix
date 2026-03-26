const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAppts() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'surefix_db'
    });

    try {
        const [rows] = await connection.execute(`
            SELECT a.appointment_id, a.user_id, u.name, u.email, u.phone, a.booking_reference
            FROM appointments a
            JOIN users u ON a.user_id = u.user_id
            WHERE u.name LIKE '%Manishimwe%'
        `);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkAppts();
