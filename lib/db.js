import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from environment variables.');
}

// Creates an atomic HTTP client connection instead of a persistent TCP stream
const sql = neon(process.env.DATABASE_URL);

export async function query(text, params = []) {
  try {
    // Neon HTTP driver expects parameterized values passed cleanly
    const rows = await sql(text, params);
    return { rows }; // Returns identical structural response so you don't have to rewrite your API routes!
  } catch (error) {
    console.error('Neon Database Query Error:', error);
    throw error;
  }
}

export default sql;