const mysql = require('mysql2/promise');
require('dotenv').config();

async function applyMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'surefix_db'
    });

    try {
        console.log('Applying Reviews migration...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS reviews (
                review_id      INT AUTO_INCREMENT PRIMARY KEY,
                appointment_id INT UNIQUE NOT NULL,
                user_id        INT NOT NULL,
                centre_id      INT NOT NULL,
                rating         TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment        TEXT,
                created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id)        REFERENCES users(user_id)            ON DELETE CASCADE,
                FOREIGN KEY (centre_id)      REFERENCES repair_centres(centre_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(createTableQuery);
        console.log('✅ Reviews table created or already exists.');

        // Also add indexes for performance
        await connection.query('CREATE INDEX idx_reviews_centre ON reviews(centre_id);');
        console.log('✅ Added index on centre_id.');

    } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️ Index already exists, skipping.');
        } else {
            console.error('❌ Migration failed:', err.message);
        }
    } finally {
        await connection.end();
    }
}

applyMigration();
