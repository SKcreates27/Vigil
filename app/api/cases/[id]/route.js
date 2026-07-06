import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req) {
  // Pass headers explicitly — stabilizes getServerSession token checks across Vercel deployments
  const headersList = await headers();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    // Added r.evidence to the select query string so the dashboard cards see whistleblower attachments
    let q = `
      SELECT c.*, r.fraud_type, r.severity, r.urgency, r.department, r.amount, r.status as report_status,
             r.regulatory_flag, r.ai_summary, r.created_at as report_date, r.description, r.evidence
      FROM cases c
      JOIN reports r ON c.report_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    if (severity) { 
      params.push(severity); 
      q += ` AND r.severity = $${params.length}`; 
    }
    if (status) { 
      params.push(status); 
      q += ` AND c.status = $${params.length}`; 
    }
    
    q += ` ORDER BY CASE r.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, c.created_at DESC`;

    const result = await query(q, params);
    
    // Always fall back to an empty array to prevent frontend mapping crashes
    return NextResponse.json(result.rows || []);

  } catch (err) {
    console.error('Failed to fetch dashboard global cases list:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}