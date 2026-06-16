import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sanitizeInput, isValidToken } from '@/lib/security';

export async function GET(req, { params }) {
  const { token } = await params;

  // Validate token format before any DB query
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
  }

  const reportResult = await query(
    'SELECT * FROM reports WHERE anonymous_token = $1',
    [token]
  );
  if (reportResult.rows.length === 0) {
    // Return generic error — don't reveal whether token exists or not
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const report = reportResult.rows[0];
  const messages = await query(
    'SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC',
    [report.id]
  );

  // Strip the actual token from the response — never echo it back
  const { anonymous_token: _stripped, ...safeReport } = report;

  return NextResponse.json({ report: safeReport, messages: messages.rows });
}

export async function POST(req, { params }) {
  const { token } = await params;

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
  }

  const body = await req.json();
  const content = sanitizeInput(body.content, 2000);
  const sender_role = body.sender_role === 'investigator' ? 'investigator' : 'reporter';

  if (!content || content.length < 1) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const reportResult = await query(
    'SELECT id FROM reports WHERE anonymous_token = $1',
    [token]
  );
  if (reportResult.rows.length === 0) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  await query(
    'INSERT INTO messages (report_id, sender_role, content) VALUES ($1, $2, $3)',
    [reportResult.rows[0].id, sender_role, content]
  );

  return NextResponse.json({ success: true });
}