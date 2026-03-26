const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPhone() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'surefix_db'
    });

    try {
        const phone = '+250785470311';
        const [res] = await connection.execute("UPDATE users SET phone = ? WHERE name = 'Manishimwe Blaise'", [phone]);
        console.log(`Updated ${res.affectedRows} user(s) with phone: ${phone}`);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

fixPhone();
