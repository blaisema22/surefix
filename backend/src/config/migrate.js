const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });

    try {
        const schemaPath = path.join(__dirname, '../../sql/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.error('Query error:', err.message);
                    }
                }
            }
        }

        console.log('✅ Database initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
    } finally {
        await connection.end();
    }
}

initializeDatabase();