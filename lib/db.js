import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from environment variables.');
}

const sql = neon(process.env.DATABASE_URL);

// Fix the invocation method to support standard ($1, $2) parameterized placeholders
export async function query(text, params = []) {
  try {
    // Explicitly call .query() as required by the latest Neon driver update
    const rows = await sql.query(text, params);
    return { rows };
  } catch (error) {
    console.error('Neon Database Query Error:', error);
    throw error;
  }
}

export default sql;