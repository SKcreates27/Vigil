import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { triageReport } from '@/lib/groq';
import { sanitizeInput, sanitizeAmount } from '@/lib/security';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

// 1. POST HANDLER: Submits a new whistleblower report
export async function POST(req) {
  try {
    // Never log or store the IP — this is by design. We do use it transiently
    // for in-memory rate limiting below, but it is never persisted anywhere.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`report-submit:${ip}`, 5)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();

    // Sanitize all inputs before touching the DB
    const description = sanitizeInput(body.description, 5000);
    const department = sanitizeInput(body.department, 100);
    const fraud_type = sanitizeInput(body.fraud_type, 100);
    const amount = sanitizeAmount(body.amount);
    
    // Safely capture the incoming whistleblower evidence array
    const evidenceFiles = Array.isArray(body.evidence) ? body.evidence : [];

    if (!description || description.length < 10) {
      return NextResponse.json({ error: 'Description too short' }, { status: 400 });
    }

    // Validate fraud_type is one of our known types
    const validTypes = ['expense_fraud', 'bribery', 'embezzlement', 'insider_trading', 'data_theft', 'vendor_fraud', 'payroll_fraud', 'other', ''];
    if (fraud_type && !validTypes.includes(fraud_type)) {
      return NextResponse.json({ error: 'Invalid fraud type' }, { status: 400 });
    }

    const token = randomUUID();

    // Insert with parameterized query (Includes evidence array serialized as a JSON string)
    const reportResult = await query(
      `INSERT INTO reports (anonymous_token, description, department, fraud_type, amount, status, evidence)
       VALUES ($1, $2, $3, $4, $5, 'new', $6) RETURNING id`,
      [token, description, department || null, fraud_type || null, amount, JSON.stringify(evidenceFiles)]
    );
    const reportId = reportResult.rows[0].id;

    // AI triage properties mapped cleanly to structural state defaults
    let aiData = {
      fraud_type: fraud_type || 'other',
      severity: 'medium',
      urgency: 'routine',
      department_likely: department || 'unknown',
      ai_summary: 'AI triage was unavailable for this report — please review manually.',
      suggested_steps: [],
    };

    try {
      const generatedTriage = await triageReport(description, amount, department);
      if (generatedTriage) {
        aiData = {
          ...aiData,
          ...generatedTriage,
          // Extra safeguard: Ensure key fallback mapping aligns perfectly
          department_likely: generatedTriage.department_likely || generatedTriage.department || department || 'unknown'
        };
      }
    } catch (aiErr) {
      console.error('AI triage failed, falling back to default classification:', aiErr.message);
    }

    // Severity escalation rules
    let finalSeverity = aiData.severity || 'medium';
    let regulatoryFlag = false;
    if (amount && amount > 1000000) finalSeverity = 'critical';
    if (aiData.fraud_type === 'insider_trading') { finalSeverity = 'critical'; regulatoryFlag = true; }
    if (aiData.fraud_type === 'bribery' && amount && amount > 500000) regulatoryFlag = true;

    await query(
      `UPDATE reports SET fraud_type=$1, severity=$2, urgency=$3, department=$4, ai_summary=$5, regulatory_flag=$6 WHERE id=$7`,
      [aiData.fraud_type, finalSeverity, aiData.urgency, aiData.department_likely, aiData.ai_summary, regulatoryFlag, reportId]
    );

    await query(
      `INSERT INTO cases (report_id, status, ai_steps, notes) VALUES ($1, 'new', $2, $3)`,
      [reportId, JSON.stringify(aiData.suggested_steps || []), 'Auto-created from anonymous report. AI triage complete.']
    );

    // Audit log — no IP stored, actor is 'anonymous'
    await logAction('REPORT_SUBMITTED', 'anonymous', reportId, 'report', {
      fraud_type: aiData.fraud_type,
      severity: finalSeverity,
    });
    await logAction('AI_TRIAGE_COMPLETE', 'system', reportId, 'report', {
      severity: finalSeverity,
      regulatory_flag: regulatoryFlag,
    });

    return NextResponse.json({
      token,
      fraud_type: aiData.fraud_type,
      severity: finalSeverity,
      urgency: aiData.urgency,
      ai_summary: aiData.ai_summary,
    });

  } catch (err) {
    console.error('Report submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 2. GET HANDLER: Loads the triage queue for the investigator dashboard.
// Requires an authenticated investigator session — this is the list of every
// whistleblower report in the system, so it must never be reachable
// anonymously. The anonymous_token column is intentionally left out of the
// SELECT: investigators work off case/report IDs, not tokens, and the token
// is the reporter's sole credential — it should never leave the server in
// bulk like this.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT r.id, c.id AS case_id, r.description, r.department, r.fraud_type, r.amount,
              r.status, r.severity, r.urgency, r.regulatory_flag, r.evidence,
              r.created_at AS report_date
       FROM reports r
       LEFT JOIN cases c ON c.report_id = r.id
       ORDER BY r.created_at DESC`
    );

    return NextResponse.json(result.rows || []);
  } catch (err) {
    console.error('Failed to fetch triage queue reports:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}