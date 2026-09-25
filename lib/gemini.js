import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function triageReport(description, amount, department) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: 'system',
          content: 'You are a senior fraud analyst. Always respond with valid JSON only. No markdown, no backticks, no explanation.',
        },
        {
          role: 'user',
          content: `Analyze this whistleblower report and return ONLY a JSON object.

Report: "${description}"
Amount: ${amount ? `INR ${amount}` : 'Not specified'}
Department: ${department || 'Not specified'}

Return exactly this JSON:
{
  "fraud_type": "one of: expense_fraud, bribery, embezzlement, insider_trading, data_theft, vendor_fraud, payroll_fraud, other",
  "severity": "one of: low, medium, high, critical",
  "urgency": "one of: routine, urgent, immediate",
  "department_likely": "most likely department",
  "ai_summary": "2 sentence professional summary of the allegation",
  "suggested_steps": ["step 1", "step 2", "step 3"]
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq triage error:', err.message);
    throw err;
  }
}

export async function generateSARContent(caseData, reportData, evidenceList) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: 'system',
          content: 'You are a compliance officer. Always respond with valid JSON only. No markdown, no backticks.',
        },
        {
          role: 'user',
          content: `Generate a Suspicious Activity Report for this fraud case. Return ONLY JSON.

Fraud Type: ${reportData.fraud_type}
Severity: ${reportData.severity}
Description: ${reportData.description}
Amount: ${reportData.amount ? `INR ${reportData.amount}` : 'Unknown'}
Department: ${reportData.department}
Status: ${caseData.status}
Evidence Count: ${evidenceList.length}

Return exactly this JSON:
{
  "sar_number": "SAR-${Date.now()}",
  "filing_date": "${new Date().toISOString().split('T')[0]}",
  "subject_entity": "Internal Employee / Unknown",
  "activity_type": "detailed fraud description",
  "date_of_activity": "approximate date",
  "amount_involved": "${reportData.amount || 'Undetermined'}",
  "description": "3-4 sentence formal SAR description",
  "basis_for_suspicion": "2-3 sentence explanation",
  "evidence_summary": "summary of evidence",
  "recommended_action": "recommended legal or regulatory action",
  "regulatory_references": ["SEBI LODR Regulations 2015", "PMLA 2002"]
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq SAR error:', err.message);
    throw err;
  }
}