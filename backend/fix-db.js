const mysql = require('mysql2/promise');

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'surefix_db'
  });

  try {
    // Add missing columns
    await connection.query('ALTER TABLE users ADD COLUMN name VARCHAR(100) AFTER id');
    console.log('Added name column');
    
    // Update existing users with name from email
    await connection.query("UPDATE users SET name = SUBSTRING_INDEX(email, '@', 1) WHERE name IS NULL OR name = ''");
    console.log('Updated existing users with names');
    
    console.log('Database fixed successfully!');
  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    connection.end();
  }
}

fixDatabase();

