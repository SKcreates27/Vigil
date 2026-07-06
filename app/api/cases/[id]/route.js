import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { headers } from 'next/headers';

export async function GET(req, { params }) {
  // Pass headers explicitly — stabilizes getServerSession on Vercel preview routes
  const headersList = await headers();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    let id = resolvedParams?.id;

    // Fallback: Check search/query string parameter interfaces (handles nxtPid routing mechanics)
    if (!id) {
      const { searchParams } = new URL(req.url);
      id = searchParams.get('id') || searchParams.get('nxtPid');
    }

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

    // 2. Defensive query executions to ensure a structural mismatch never crashes the session context
    let evidenceRows = [];
    try {
      const evidenceResult = await query(
        'SELECT * FROM evidence WHERE case_id = $1 ORDER BY uploaded_at DESC',
        [id]
      );
      evidenceRows = evidenceResult.rows;
    } catch (err) {
      console.warn('Non-fatal pipeline mismatch: evidence query skipped.', err.message);
    }

    let auditRows = [];
    try {
      const auditResult = await query('SELECT * FROM audit_logs WHERE target_id = $1 ORDER BY created_at DESC LIMIT 20', [currentCase.report_id]);
      auditRows = auditResult.rows;
    } catch (err) {
      try {
        const auditResult = await query('SELECT * FROM audit_log WHERE target_id = $1 ORDER BY created_at DESC LIMIT 20', [currentCase.report_id]);
        auditRows = auditResult.rows;
      } catch (innerErr) {
        console.warn('Non-fatal pipeline mismatch: audit query skipped.', innerErr.message);
      }
    }

    let messageRows = [];
    try {
      const messagesResult = await query('SELECT * FROM messages WHERE report_id = $1 ORDER BY created_at ASC', [currentCase.report_id]);
      messageRows = messagesResult.rows;
    } catch (err) {
      try {
        const messagesResult = await query('SELECT * FROM messages WHERE report_token = $1 ORDER BY created_at ASC', [currentCase.anonymous_token]);
        messageRows = messagesResult.rows;
      } catch (innerErr) {
        console.warn('Non-fatal pipeline mismatch: chat query skipped.', innerErr.message);
      }
    }

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

    const caseResult = await query('SELECT * FROM cases WHERE id = $1', [id]);
    if (caseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const c = caseResult.rows[0];
    const newStatus = status ?? c.status;
    const newNotes = notes ?? c.notes;
    const newLegalHold = is_legal_hold ?? c.is_legal_hold;

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