const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function testLoginLogic() {
    try {
        console.log("Starting DB connection test...");
        const email = 'customer@example.com'; // or anything
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log("Query 'SELECT * FROM users' successful. Users returned:", users.length);
        
        if (users.length > 0) {
            const user = users[0];
            console.log(`User found: ${user.email}, role: ${user.role}`);
            
            if (user.role === 'repairer') {
                console.log("Querying repair_centres...");
                const [centres] = await pool.query('SELECT centre_id FROM repair_centres WHERE owner_id = ?', [user.user_id]);
                console.log("Query repair_centres successful. Centres:", centres.length);
            }
        }
        console.log("All DB queries for login passed.");
    } catch(err) {
        console.error("Test Logic Error:", err);
    } finally {
        if(pool) await pool.end();
    }
}
testLoginLogic();
