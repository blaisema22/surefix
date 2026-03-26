require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
    console.log('Running DB migrations...');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sms_simulator (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'general',
            appointment_id INT DEFAULT NULL,
            status VARCHAR(20) DEFAULT 'sent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ sms_simulator table ready');

    await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent TINYINT(1) DEFAULT 0`);
    console.log('✅ reminder_24h_sent column ready');

    await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_1h_sent TINYINT(1) DEFAULT 0`);
    console.log('✅ reminder_1h_sent column ready');

    console.log('✅ All migrations done!');
    process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
