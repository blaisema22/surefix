const { pool } = require('./config/db');
const fs = require('fs');

async function check() {
    try {
        const [appCols] = await pool.query('DESCRIBE appointments');
        const [userCols] = await pool.query('DESCRIBE users');
        const output = {
            appointments: appCols,
            users: userCols
        };
        fs.writeFileSync('schema-output.json', JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

check();
