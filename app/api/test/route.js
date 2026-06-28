import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT email, role FROM investigators');
    client.release();
    return Response.json({ success: true, investigators: result.rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}