const mysql = require('mysql2/promise');

async function fixDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'surefix_db'
    });

    try {
        // Check if 'name' column exists
        const [columns] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'name';");

        if (columns.length === 0) {
            // Add missing 'name' column. The schema has `user_id`, not `id`.
            await connection.query('ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL AFTER user_id');
            console.log('Added name column to users table.');

            // Update existing users with a default name from their email
            await connection.query("UPDATE users SET name = SUBSTRING_INDEX(email, '@', 1) WHERE name IS NULL OR name = ''");
            console.log('Updated existing users with default names.');
        } else {
            console.log('Column "name" already exists in users table.');
        }

        // Check/Add Index for geospatial optimization on repair_centres
        const [indexes] = await connection.query("SHOW INDEX FROM `repair_centres` WHERE Key_name = 'idx_lat_lng'");
        if (indexes.length === 0) {
            await connection.query('CREATE INDEX idx_lat_lng ON repair_centres(latitude, longitude)');
            console.log('Added composite index (latitude, longitude) to repair_centres.');
        } else {
            console.log('Index idx_lat_lng already exists.');
        }

        // Check/Add dnd_until column to users
        const [dndCols] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'dnd_until'");
        if (dndCols.length === 0) {
            await connection.query('ALTER TABLE users ADD COLUMN dnd_until DATETIME DEFAULT NULL');
            console.log('Added dnd_until column to users table.');
        }

        // Check/Add reviews table
        const [reviewsTable] = await connection.query("SHOW TABLES LIKE 'reviews'");
        if (reviewsTable.length === 0) {
            await connection.query(`
                CREATE TABLE reviews (
                    review_id INT AUTO_INCREMENT PRIMARY KEY,
                    appointment_id INT NOT NULL UNIQUE,
                    centre_id INT NOT NULL,
                    user_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                    FOREIGN KEY (centre_id) REFERENCES repair_centres(centre_id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            `);
            console.log('Created reviews table.');
        } else {
            console.log('Table "reviews" already exists.');
        }

        console.log('Database schema check complete.');
    } catch (err) {
        console.log('Error:', err.message);
    } finally {
        connection.end();
    }
}

fixDatabase();