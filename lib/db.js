import { Pool } from 'pg';

// Maintain a cached reference to the pool globally across hot-reloads and serverless invocations
let pool;

if (!global._postgresPool) {
  global._postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Limit maximum connections per serverless container function
    idleTimeoutMillis: 30000, // Close idle connections quickly to free up slots in Neon
    connectionTimeoutMillis: 2000, // Fail fast if connection stalls
  });
}
pool = global._postgresPool;

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;