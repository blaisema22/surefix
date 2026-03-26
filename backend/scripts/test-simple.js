const fs = require('fs');
const path = require('path');

let output = [];

function log(msg) {
    output.push(msg);
    console.log(msg);
}

async function test() {
    try {
        log('Starting test...');

        // Load db config
        const db = require('./config/db');
        log('DB module loaded');

        // Test connection
        log('Testing connection...');
        const conn = await db.pool.getConnection();
        log('✅ Connected to MySQL');

        // Check tables
        const [tables] = await conn.query('SHOW TABLES');
        log('Tables: ' + JSON.stringify(tables));

        // Check centres
        const [centres] = await conn.query('SELECT * FROM repair_centres WHERE is_active = TRUE AND is_visible = TRUE');
        log('Centres found: ' + centres.length);

        conn.release();
        log('Test completed successfully!');
    } catch (err) {
        log('❌ Error: ' + err.message);
    }

    // Write to file
    fs.writeFileSync(path.join(__dirname, 'test-output.txt'), output.join('\n'));
}

test();