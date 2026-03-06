const mysql = require('mysql2/promise');

const DEMO_HASH = '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe'; // Password@123
const DEMO_EMAILS = [
  'admin@surefix.com',
  'techfix@surefix.com',
  'irepair@surefix.com',
  'smartfix@surefix.com',
  'digi@surefix.com',
  'elite@surefix.com',
  'alice@example.com',
];

async function resetDemoPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'surefix_db',
  });

  try {
    const placeholders = DEMO_EMAILS.map(() => '?').join(', ');
    const query = `UPDATE users SET password_hash = ? WHERE email IN (${placeholders})`;
    const [result] = await connection.query(query, [DEMO_HASH, ...DEMO_EMAILS]);
    console.log(`Updated ${result.affectedRows} demo user password(s) to Password@123`);
  } finally {
    await connection.end();
  }
}

resetDemoPasswords().catch((err) => {
  console.error('Failed to reset demo passwords:', err.message);
  process.exit(1);
});
