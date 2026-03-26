/**
 * SureFix DB Migration Script
 * Adds missing columns to existing tables without dropping data.
 * Run once: node migrate.js
 */
require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
  console.log('🔧 Running SureFix DB migrations...\n');

  const migrations = [
    // 1. users.dnd_until — queried by notifications route
    {
      desc: "Add 'dnd_until' column to users",
      check: "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='dnd_until'",
      sql: "ALTER TABLE users ADD COLUMN dnd_until DATETIME DEFAULT NULL"
    },
    // 2. services.base_price — new field added to ManageServices UI
    {
      desc: "Add 'base_price' column to services",
      check: "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='services' AND COLUMN_NAME='base_price'",
      sql: "ALTER TABLE services ADD COLUMN base_price DECIMAL(10,2) DEFAULT NULL"
    },
  ];

  for (const m of migrations) {
    const [rows] = await pool.query(m.check);
    if (rows[0].cnt > 0) {
      console.log(`  ✅ SKIP  — ${m.desc} (already exists)`);
    } else {
      await pool.query(m.sql);
      console.log(`  ✔  DONE  — ${m.desc}`);
    }
  }

  console.log('\n✅ All migrations complete.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
