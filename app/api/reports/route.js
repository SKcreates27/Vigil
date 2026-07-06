import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { triageReport } from '@/lib/gemini';
import { sanitizeInput, sanitizeAmount } from '@/lib/security';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    // Never log or store the IP — this is by design
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

    // AI triage
    let aiData = {
      fraud_type: fraud_type || 'other',
      severity: 'medium',
      urgency: 'routine',
      department_likely: department || 'unknown',
      ai_summary: '',
      suggested_steps: [],
    };
    try {
      aiData = await triageReport(description, amount, department);
    } catch (aiErr) {
      console.error('AI triage failed:', aiErr.message);
    }

    // Severity escalation rules
    let finalSeverity = aiData.severity;
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
      [reportId, JSON.stringify(aiData.suggested_steps), 'Auto-created from anonymous report. AI triage complete.']
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