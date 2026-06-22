import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const caseResult = await query(
    `SELECT c.*, r.fraud_type, r.severity, r.urgency, r.department, r.amount, r.status as report_status,
            r.regulatory_flag, r.ai_summary, r.created_at as report_date, r.description, r.anonymous_token
     FROM cases c JOIN reports r ON c.report_id = r.id WHERE c.id = $1`, [id]
  );
  if (caseResult.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const evidenceResult = await query('SELECT * FROM evidence WHERE case_id = $1 ORDER BY uploaded_at DESC', [id]);
  const auditResult = await query('SELECT * FROM audit_log WHERE target_id = $1 ORDER BY created_at DESC LIMIT 20', [caseResult.rows[0].report_id]);
  const messagesResult = await query('SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC', [caseResult.rows[0].report_id]);

  return NextResponse.json({
    case: caseResult.rows[0],
    evidence: evidenceResult.rows,
    audit: auditResult.rows,
    messages: messagesResult.rows,
  });
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, notes, is_legal_hold } = body;

  const caseResult = await query('SELECT * FROM cases WHERE id = $1', [id]);
  if (caseResult.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const c = caseResult.rows[0];

  const newStatus = status ?? c.status;
  const newNotes = notes ?? c.notes;
  const newLegalHold = is_legal_hold ?? c.is_legal_hold;

  await query('UPDATE cases SET status=$1, notes=$2, is_legal_hold=$3 WHERE id=$4', [newStatus, newNotes, newLegalHold, id]);

  if (status && status !== c.status) await logAction('STATUS_CHANGED', session.user?.email || 'investigator', c.report_id, 'report', { from: c.status, to: status });
  if (is_legal_hold !== undefined && is_legal_hold !== c.is_legal_hold) await logAction(is_legal_hold ? 'LEGAL_HOLD_SET' : 'LEGAL_HOLD_REMOVED', session.user?.email || 'investigator', c.report_id, 'report');

  return NextResponse.json({ success: true });
}