import { GoogleGenAI } from '@google/genai';

// Explicitly bind the API key context to catch both standard and alternative variable names
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("CRITICAL: Gemini API Key is missing from your environment variables!");
}

const ai = new GoogleGenAI({ apiKey: apiKey }); 
const MODEL = 'gemini-1.5-flash-8b';

// Schema setups configured according to updated SDK properties
const triageSchema = {
  type: "object",
  properties: {
    fraud_type: { 
      type: "string", 
      enum: ["expense_fraud", "bribery", "embezzlement", "insider_trading", "data_theft", "vendor_fraud", "payroll_fraud", "other"] 
    },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    urgency: { type: "string", enum: ["routine", "urgent", "immediate"] },
    department_likely: { type: "string" },
    ai_summary: { type: "string" },
    suggested_steps: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["fraud_type", "severity", "urgency", "department_likely", "ai_summary", "suggested_steps"]
};

const sarSchema = {
  type: "object",
  properties: {
    sar_number: { type: "string" },
    filing_date: { type: "string" },
    subject_entity: { type: "string" },
    activity_type: { type: "string" },
    date_of_activity: { type: "string" },
    amount_involved: { type: "string" },
    description: { type: "string" },
    basis_for_suspicion: { type: "string" },
    evidence_summary: { type: "string" },
    recommended_action: { type: "string" },
    regulatory_references: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["sar_number", "filing_date", "subject_entity", "activity_type", "amount_involved", "description", "basis_for_suspicion", "evidence_summary", "recommended_action", "regulatory_references"]
};

export async function triageReport(description, amount, department) {
  try {
    const prompt = `You are a senior fraud analyst. Analyze this whistleblower report.
Report: "${description}"
Reported Amount: ${amount ? `INR ${amount}` : 'Not specified'}
Department: ${department || 'Not specified'}`;

    // Executing the updated model generation pattern for structured JSON
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: triageSchema,
      }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error('Gemini triage error:', err.message);
    throw err;
  }
}

export async function generateSARContent(caseData, reportData, evidenceList) {
  try {
    const prompt = `You are a compliance officer. Generate a Suspicious Activity Report based on this fraud investigation.
Case Details:
- Fraud Type: ${reportData.fraud_type}
- Severity: ${reportData.severity}
- Description: ${reportData.description}
- Amount Involved: ${reportData.amount ? `INR ${reportData.amount}` : 'Unknown'}
- Department: ${reportData.department}
- Case Status: ${caseData.status}
- Evidence Count: ${evidenceList.length} items

Generate default fields such as sar_number following 'SAR-${Date.now()}' format and filing_date as '${new Date().toISOString().split('T')[0]}'.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sarSchema,
      }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error('Gemini SAR error:', err.message);
    throw err;
  }
}