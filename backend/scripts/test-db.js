const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'surefix_db'
  });

  try {
    const [columns] = await connection.query('DESCRIBE users');
    console.log('Users table columns:');
    console.log(columns);
  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    connection.end();
  }
}

checkDatabase();

