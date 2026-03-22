const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'surefix_db'
    });

    try {
        console.log('Adding is_authorized column to users table...');
        await connection.query('ALTER TABLE users ADD COLUMN is_authorized BOOLEAN DEFAULT TRUE AFTER is_verified');
        console.log('✅ Column added successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('⚠️ Column already exists.');
        } else {
            console.error('❌ Error:', err.message);
        }
    } finally {
        await connection.end();
    }
}

migrate();
