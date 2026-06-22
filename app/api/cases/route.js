import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');

  let q = `
    SELECT c.*, r.fraud_type, r.severity, r.urgency, r.department, r.amount, r.status as report_status,
           r.regulatory_flag, r.ai_summary, r.created_at as report_date, r.description
    FROM cases c
    JOIN reports r ON c.report_id = r.id
    WHERE 1=1
  `;
  const params = [];
  if (severity) { params.push(severity); q += ` AND r.severity = $${params.length}`; }
  if (status) { params.push(status); q += ` AND c.status = $${params.length}`; }
  q += ` ORDER BY CASE r.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, c.created_at DESC`;

  const result = await query(q, params);
  return NextResponse.json(result.rows);
}