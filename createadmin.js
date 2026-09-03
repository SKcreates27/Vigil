const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_7iQCVqmjpE5I@ep-withered-dew-at4gqmk1-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  const hash = await bcrypt.hash('Admin@123', 10);
  const client = await pool.connect();
  await client.query(
    'INSERT INTO investigators (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2',
    ['admin@Vigil.com', hash, 'admin']
  );
  const result = await client.query('SELECT email FROM investigators');
  console.log('Investigators in Neon:', result.rows);
  client.release();
  await pool.end();
}

run().catch(console.error);