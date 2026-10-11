'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const CATEGORIES = [
  { type: 'Type 01', label: 'Financial Malpractice', value: 'expense_fraud', desc: 'Expense fraud, embezzlement, false invoicing, misappropriation of funds' },
  { type: 'Type 02', label: 'Internal Corruption', value: 'bribery', desc: 'Bribery, kickbacks, conflicts of interest, vendor collusion' },
  { type: 'Type 03', label: 'Securities Violations', value: 'insider_trading', desc: 'Insider trading, market manipulation, unauthorized disclosures' },
  { type: 'Type 04', label: 'Data Breach / Info Theft', value: 'data_theft', desc: 'Unauthorized data access, IP theft, confidential info leaks' },
  { type: 'Type 05', label: 'Payroll & HR Fraud', value: 'payroll_fraud', desc: 'Ghost employees, time fraud, benefits manipulation' },
  { type: 'Type 06', label: 'Other Violations', value: 'other', desc: 'Any other ethical, legal, or regulatory violations' },
];

const DEPARTMENTS = ['Finance', 'HR', 'Procurement', 'IT', 'Executive', 'Operations', 'Legal', 'Sales', 'Other'];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<{
    fraud_type: string;
    description: string;
    department: string;
    amount: string;
    date: string;
    evidence: Array<{ name: string; size: number; type: string }>;
  }>({ fraud_type: '', description: '', department: '', amount: '', date: '', evidence: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; fraud_type: string; severity: string; ai_summary: string } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (form.description.length < 50) { setError('Please provide more detail — minimum 50 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo size={28} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>Vigil</div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#76777d', textTransform: 'uppercase' }}>Internal Investigation Unit</div>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/report" style={{ fontSize: '13px', color: '#131b2e', fontWeight: 700, borderBottom: '2px solid #131b2e', paddingBottom: '2px' }}>Submit Report</Link>
            <Link href="/check-status" style={{ fontSize: '13px', color: '#76777d', fontWeight: 500 }}>Status Check</Link>
          </div>
          <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.06em' }}>ANONYMOUS SESSION</div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: '#131b2e', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'white' }}>check</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '10px' }}>Report Submitted Anonymously</h2>
          <p style={{ color: '#45464d', fontSize: '14px', textAlign: 'center', maxWidth: '500px', marginBottom: '40px', lineHeight: 1.6 }}>
            Your submission has been received by the Internal Investigation Unit. No name, IP address, or session identifier was collected with it.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '760px' }}>
            {/* Access Key */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: '12px' }}>Secure Access Key</div>
              <div style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#0b1c30', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', wordBreak: 'break-all' }}>
  <span style={{ flex: 1, fontSize: '12px', letterSpacing: '0.05em' }}>{result.token}</span>
  <button onClick={() => {
    navigator.clipboard.writeText(result.token).then(() => {
      alert('Token copied to clipboard');
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = result.token;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('Token copied');
    });
  }} style={{ background: '#131b2e', border: 'none', borderRadius: '2px', padding: '6px 12px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, letterSpacing: '0.04em' }}>
    COPY
  </button>
</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px', background: '#fff3cd', borderRadius: '2px', marginBottom: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#7a5500', marginTop: '1px', flexShrink: 0 }}>warning</span>
                <p style={{ fontSize: '12px', color: '#7a5500', lineHeight: 1.5 }}>Record this key immediately — it is shown only once. If lost, there is no recovery mechanism and you will permanently lose access to this investigation.</p>
              </div>
              <div style={{ fontSize: '11px', color: '#76777d', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderTop: '1px solid #c6c6cd', paddingTop: '10px' }}>Security Protocol</div>
              <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.5, marginTop: '4px' }}>Do not share this key. Avoid accessing this portal on corporate networks or managed devices.</p>
            </div>

            {/* Anonymous Channel */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#ba1a1a', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Anonymous Channel: Active</span>
                </div>
                <span style={{ fontSize: '11px', color: '#76777d' }}>AI TRIAGE COMPLETE</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px' }}>
                  <div className="label-caps" style={{ marginBottom: '4px' }}>Classification</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{result.fraud_type?.replace(/_/g, ' ') || 'Analyzing...'}</div>
                </div>
                <div style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px' }}>
                  <div className="label-caps" style={{ marginBottom: '4px' }}>Severity</div>
                  <span className={`badge badge-${result.severity}`}>{result.severity?.toUpperCase()}</span>
                </div>
              </div>

              {result.ai_summary && (
                <div style={{ background: '#e5eeff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px', marginBottom: '16px' }}>
                  <div className="label-caps" style={{ marginBottom: '6px' }}>AI Analysis</div>
                  <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.6 }}>{result.ai_summary}</p>
                </div>
              )}

              <Link href="/check-status">
                <button className="btn-primary" style={{ width: '100%' }}>ACCESS ANONYMOUS CHANNEL →</button>
              </Link>
            </div>
          </div>

          {/* Bottom metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden', marginTop: '20px', width: '100%', maxWidth: '760px' }}>
            {[
              { label: 'Connection', value: 'HTTPS (TLS) in transit' },
              { label: 'IP Address', value: 'Not stored by this application' },
              { label: 'Data Retention', value: <span style={{ color: '#ba1a1a', fontWeight: 600 }}>Retained until case is resolved</span> },
            ].map(m => (
              <div key={m.label} style={{ background: '#ffffff', padding: '14px 16px' }}>
                <div className="label-caps" style={{ marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="status-bar">
          <span>VIGIL · PROTOTYPE BUILD</span>
          <span>LAST SYNC: {new Date().toISOString()} UTC</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column', paddingBottom: '32px' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={28} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>Vigil</div>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#76777d', textTransform: 'uppercase' }}>Internal Investigation Unit</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '32px' }}>
          <Link href="/report" style={{ fontSize: '13px', color: '#131b2e', fontWeight: 700, borderBottom: '2px solid #131b2e', paddingBottom: '2px' }}>Submit Report</Link>
          <Link href="/check-status" style={{ fontSize: '13px', color: '#76777d', fontWeight: 500 }}>Status Check</Link>
        </div>
        <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.06em' }}>ANONYMOUS SESSION</div>
      </header>

      {/* Trust badges */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', padding: '12px 40px', display: 'flex', gap: '40px', alignItems: 'center' }}>
        {[
          { icon: 'visibility_off', label: 'NO IP LOGGING' },
          { icon: 'badge', label: 'NO ACCOUNT REQUIRED' },
          { icon: 'lock', label: 'HTTPS ONLY' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#45464d' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#76777d' }}>{b.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', background: '#e5eeff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#131b2e', letterSpacing: '0.06em' }}>NO IDENTITY DATA COLLECTED</div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', padding: '0 40px' }}>
        <div style={{ display: 'flex', gap: '0', maxWidth: '640px', margin: '0 auto' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', background: step >= s ? '#131b2e' : '#e5eeff', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 40px', width: '100%' }}>

        {step === 1 && (
          <div>
            <div className="label-caps" style={{ marginBottom: '6px' }}>Step 1 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>Nature of Investigation</h2>
            <p style={{ color: '#76777d', fontSize: '13px', marginBottom: '28px' }}>Select the primary category that aligns with your disclosure.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden', marginBottom: '24px' }}>
              {CATEGORIES.map(c => (
                <div key={c.value} onClick={() => setForm(f => ({ ...f, fraud_type: c.value }))}
                  style={{ background: form.fraud_type === c.value ? '#e5eeff' : '#ffffff', padding: '20px', cursor: 'pointer', borderLeft: form.fraud_type === c.value ? '3px solid #131b2e' : '3px solid transparent', transition: 'all 0.1s' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#76777d', textTransform: 'uppercase', marginBottom: '4px' }}>{c.type}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '4px' }}>{c.label}</div>
                  <div style={{ fontSize: '12px', color: '#76777d', lineHeight: 1.4 }}>{c.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.fraud_type} style={{ opacity: form.fraud_type ? 1 : 0.4 }}>
                NEXT: CASE DETAILS →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="label-caps" style={{ marginBottom: '6px' }}>Step 2 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>Case Details</h2>
            <p style={{ color: '#76777d', fontSize: '13px', marginBottom: '28px' }}>Provide as much detail as possible. More detail enables more accurate AI triage.</p>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="label-caps">Describe what happened <span style={{ color: '#ba1a1a' }}>*</span></label>
                <textarea rows={7} placeholder="Describe the fraudulent activity in detail. Include who is involved, what happened, when it started, specific amounts or transactions you observed, and any evidence you have access to..." value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
                <div style={{ fontSize: '11px', color: form.description.length < 50 ? '#76777d' : '#1a6934', marginTop: '4px', fontWeight: 500 }}>
                  {form.description.length} chars {form.description.length < 50 ? `— ${50 - form.description.length} more required` : '— ✓ Sufficient detail'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label-caps">Department Involved</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={{ marginTop: '6px' }}>
                    <option value="">Unknown / Not sure</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps">Approximate Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginTop: '6px' }} />
                </div>
              </div>

              <div>
                <label className="label-caps">Estimated Amount Involved (₹)</label>
                <input type="number" placeholder="e.g. 500000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ marginTop: '6px' }} />
                <div style={{ fontSize: '11px', color: '#76777d', marginTop: '4px' }}>Cases exceeding ₹10,00,000 are auto-escalated to critical severity</div>
              </div>

              {/* FIXED PLACEHOLDER: EVIDENCE UPLOAD INSIDE THE CARD DESIGN CONTAINER CONTAINER CONTAINER */}
              <div style={{ marginTop: '10px', borderTop: '1px solid #c6c6cd', paddingTop: '16px' }}>
                <label className="label-caps">Evidence Upload (Evidence Locker)</label>
                <div style={{ border: '1px dashed #c6c6cd', borderRadius: '2px', padding: '16px', textAlign: 'center', background: '#f8f9ff', marginTop: '6px' }}>
                  <input 
                    type="file" 
                    multiple 
                    id="file-upload"
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files) {
                        const fileArray = Array.from(e.target.files).map(file => ({
                          name: file.name,
                          size: file.size,
                          type: file.type
                        }));
                        setForm(f => ({ ...f, evidence: fileArray }));
                      }
                    }}
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#76777d' }}>cloud_upload</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#131b2e' }}>Click to attach supporting files</span>
                    <span style={{ fontSize: '11px', color: '#76777d' }}>PDF, Images, CSV, or Text Logs (Max 10MB total)</span>
                  </label>
                </div>
                {form.evidence && form.evidence.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {form.evidence.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0b1c30' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#76777d' }}>description</span>
                          <span style={{ fontWeight: 500 }}>{file.name}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#76777d' }}>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← BACK</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={form.description.length < 50} style={{ opacity: form.description.length >= 50 ? 1 : 0.4 }}>
                NEXT: REVIEW & SUBMIT →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="label-caps" style={{ marginBottom: '6px' }}>Step 3 of 3</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>Review & Submit</h2>
            <p style={{ color: '#76777d', fontSize: '13px', marginBottom: '28px' }}>Review your submission before encrypting and sending to the Investigation Unit.</p>

            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #c6c6cd' }}>
                {[
                  { label: 'Category', value: CATEGORIES.find(c => c.value === form.fraud_type)?.label || '—' },
                  { label: 'Department', value: form.department || 'Unknown' },
                  { label: 'Amount', value: form.amount ? `₹${Number(form.amount).toLocaleString('en-IN')}` : 'Not specified' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="label-caps" style={{ marginBottom: '4px' }}>{r.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <div className="label-caps" style={{ marginBottom: '6px' }}>Description</div>
              <p style={{ fontSize: '13px', color: '#45464d', lineHeight: 1.6 }}>{form.description}</p>

              {/* DYNAMIC CONFIRMATION ON STEP 3 SUMMARY PANEL AREA */}
              {form.evidence && form.evidence.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #c6c6cd' }}>
                  <div className="label-caps" style={{ marginBottom: '6px' }}>Attached Evidence ({form.evidence.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {form.evidence.map((file, idx) => (
                      <div key={idx} style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#131b2e' }}>attachment</span>
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', borderLeft: '3px solid #131b2e', marginBottom: '20px' }}>
              <div className="label-caps" style={{ marginBottom: '4px' }}>Investigation Protocol</div>
              <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.5 }}>Upon submission, you will receive a secure access key. This is the <strong>only</strong> way to track progress or receive messages from the Internal Investigation Unit. We do not store email addresses or personal identifiers.</p>
            </div>

            {error && (
              <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '10px 14px', color: '#ba1a1a', fontSize: '12px', marginBottom: '16px' }}>{error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← BACK</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.7 : 1, padding: '10px 28px' }}>
                {loading ? 'ENCRYPTING & SUBMITTING...' : 'SUBMIT ENCRYPTED REPORT →'}
              </button>
            </div>
          </div>
        )}

        {/* Protocol notice */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', display: 'flex', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#76777d', flexShrink: 0, marginTop: '1px' }}>info</span>
          <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.6 }}>
            Upon submission, you will receive a secure access key (a UUID). This is the <strong>only</strong> way to track progress or receive messages from the Internal Investigation Unit. We do not store email addresses or personal identifiers.
          </p>
        </div>
      </div>

      <div className="status-bar">
        <span>VIGIL · PROTOTYPE BUILD</span>
        <span>LAST SYNC: {new Date().toUTCString()}</span>
      </div>
    </div>
  );
}