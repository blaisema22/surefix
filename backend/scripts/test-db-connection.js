const { pool } = require('./config/db');

async function test() {
    try {
        const [rows] = await pool.query('SELECT * FROM repair_centres WHERE is_active = TRUE AND is_visible = TRUE LIMIT 5');
        console.log('✅ DB Connected. Centres found:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('❌ DB Error:', err.message);
        process.exit(1);
    }
}

test();