// One-off script to create or reset an investigator admin account.
// Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node createadmin.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}
if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function run() {
  const hash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO investigators (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2',
      [email.toLowerCase().trim(), hash, 'admin']
    );
    const result = await client.query('SELECT email FROM investigators');
    console.log('Investigators in database:', result.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
