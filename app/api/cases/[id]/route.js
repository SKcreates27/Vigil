import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { sanitizeInput } from '@/lib/security';

const VALID_STATUSES = ['new', 'under_investigation', 'pending_review', 'resolved'];

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing Case ID' }, { status: 400 });
    }

    // 1. Fetch case joined with report data (includes the whistleblower evidence collection column)
    const caseResult = await query(
      `SELECT c.*, r.fraud_type, r.severity, r.urgency, r.department, r.amount, 
              r.status as report_status, r.regulatory_flag, r.ai_summary, 
              r.created_at as report_date, r.description, r.anonymous_token, r.evidence
       FROM cases c 
       JOIN reports r ON c.report_id = r.id 
       WHERE c.id = $1`,
      [id]
    );

    if (caseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const currentCase = caseResult.rows[0];

    // Safely parse the whistleblower attachments array string
    if (currentCase.evidence) {
      try {
        currentCase.evidence = typeof currentCase.evidence === 'string' ? JSON.parse(currentCase.evidence) : currentCase.evidence;
      } catch (e) {
        currentCase.evidence = [];
      }
    }

    // Evidence is kept non-fatal: this prototype doesn't yet create rows in
    // this table (see README "Known limitations"), so an empty result here
    // is expected, not an error to hide.
    let evidenceRows = [];
    try {
      const evidenceResult = await query(
        'SELECT * FROM evidence WHERE case_id = $1 ORDER BY uploaded_at DESC',
        [id]
      );
      evidenceRows = evidenceResult.rows;
    } catch (err) {
      console.warn('Evidence query failed (table may not exist yet):', err.message);
    }

    const auditResult = await query(
      'SELECT * FROM audit_log WHERE target_id = $1 ORDER BY created_at DESC LIMIT 20',
      [currentCase.report_id]
    );
    const auditRows = auditResult.rows;

    const messagesResult = await query(
      'SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC',
      [currentCase.report_id]
    );
    const messageRows = messagesResult.rows;

    // 3. Return cleanly formatted response structures back to the UI interface
    return NextResponse.json({
      case: currentCase,
      evidence: evidenceRows || [],
      audit: auditRows || [],
      messages: messageRows || [],
    });

  } catch (err) {
    console.error('Case GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const { status, notes, is_legal_hold } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const caseResult = await query('SELECT * FROM cases WHERE id = $1', [id]);
    if (caseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const c = caseResult.rows[0];
    const newStatus = status ?? c.status;
    const newNotes = typeof notes === 'string' ? sanitizeInput(notes, 5000) : c.notes;
    const newLegalHold = typeof is_legal_hold === 'boolean' ? is_legal_hold : c.is_legal_hold;

    await query(
      'UPDATE cases SET status=$1, notes=$2, is_legal_hold=$3 WHERE id=$4',
      [newStatus, newNotes, newLegalHold, id]
    );

    if (status && status !== c.status) {
      await logAction('STATUS_CHANGED', session.user?.email || 'investigator', c.report_id, 'report', { from: c.status, to: status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Case PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}