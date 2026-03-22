const { pool } = require('./config/db');
async function check() {
  try {
    const [centres] = await pool.query('SELECT * FROM repair_centres');
    console.log('Total Centres:', centres.length);
    centres.forEach(c => {
      console.log(`- ${c.name} (active=${c.is_active}, visible=${c.is_visible}, lat=${c.latitude}, lng=${c.longitude})`);
    });
    const [verifiedUsers] = await pool.query('SELECT user_id, name, is_verified FROM users WHERE role="repairer"');
    console.log('Verified Repairers:', verifiedUsers.filter(u => u.is_verified).map(u => u.name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
check();
