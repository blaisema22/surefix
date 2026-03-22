const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    // Connect without database first to create it
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL server');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schema);
        console.log('✅ Database schema created successfully!');

        // Verify tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables created:', tables.length);

        // Check repair_centres data
        const [centres] = await connection.query('SELECT COUNT(*) as count FROM repair_centres');
        console.log('Repair centres count:', centres[0].count);

        if (centres[0].count === 0) {
            console.log('⚠️ No repair centres found - seed data may not have been inserted');
        } else {
            console.log('✅ Seed data verified!');
        }

        console.log('\n✅ Database initialization complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        connection.end();
    }
}

initDatabase();