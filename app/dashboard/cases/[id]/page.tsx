'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CaseData {
  id: number; report_id: number; status: string; notes: string;
  ai_steps: string[]; is_legal_hold: boolean; fraud_type: string;
  severity: string; urgency: string; department: string; amount: number;
  regulatory_flag: boolean; ai_summary: string; report_date: string;
  description: string; anonymous_token: string;
}
interface Message { id: number; sender_role: string; content: string; created_at: string; }
interface AuditEntry { id: number; action: string; actor: string; created_at: string; }
interface Evidence { id: number; file_name: string; file_hash: string; is_privileged: boolean; uploaded_at: string; }

const STATUS_OPTIONS = ['new', 'under_investigation', 'pending_review', 'resolved'];

// Inline SVG icons
const BackIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const DocIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const BoltIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ChainIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const UploadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const FileIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const SendIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const DotIcon = ({ color }: { color: string }) => <div style={{ width: '8px', height: '8px', background: color, borderRadius: '50%', flexShrink: 0 }} />;
const InfoIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCase(); }, [id]);

  async function fetchCase() {
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      const c = data.case;
      if (typeof c.ai_steps === 'string') { try { c.ai_steps = JSON.parse(c.ai_steps); } catch { c.ai_steps = []; } }
      if (!Array.isArray(c.ai_steps)) c.ai_steps = [];
      setCaseData(c);
      setEvidence(data.evidence || []);
      setAudit(data.audit || []);
      setMessages(data.messages || []);
      setNotes(c.notes || '');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateCase(updates: Partial<CaseData>) {
    setSaving(true);
    await fetch(`/api/cases/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    await fetchCase();
    setSaving(false);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !caseData) return;
    await fetch(`/api/messages/${caseData.anonymous_token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, sender_role: 'investigator' }),
    });
    setNewMessage(''); fetchCase();
  }

  async function generateSAR() {
    const res = await fetch(`/api/cases/${id}/sar`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `SAR-Case-${id}.txt`; a.click();
    }
  }

  if (loading) return <div style={{ padding: '32px', color: '#76777d', fontSize: '13px' }}>Loading case...</div>;
  if (!caseData) return <div style={{ padding: '32px' }}><div style={{ color: '#ba1a1a' }}>Case not found</div></div>;

  const riskScore = caseData.severity === 'critical' ? 94 : caseData.severity === 'high' ? 72 : caseData.severity === 'medium' ? 45 : 20;
  const riskColor = riskScore > 80 ? '#ba1a1a' : riskScore > 60 ? '#7a3900' : '#1a6934';
  const caseRef = `FW-${new Date(caseData.report_date).getFullYear()}-${String(caseData.id).padStart(4, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 92px)' }}>

      {/* Case header — fixed height, no wrapping */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', padding: '12px 20px', flexShrink: 0 }}>
        {/* Row 1: breadcrumb + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard">
              <button className="btn-ghost" style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#76777d', fontSize: '12px' }}>
                <BackIcon /> All Cases
              </button>
            </Link>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#76777d', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
              CASE ID: {caseRef}
            </div>
            {caseData.regulatory_flag && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <DotIcon color="#ba1a1a" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>High Priority Alert</span>
              </div>
            )}
          </div>

          {/* Action buttons — all in one row, no overflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <select value={caseData.status} onChange={e => updateCase({ status: e.target.value })}
              style={{ fontSize: '11px', padding: '6px 10px', width: 'auto', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <button onClick={() => updateCase({ is_legal_hold: !caseData.is_legal_hold })} className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <LockIcon /> {caseData.is_legal_hold ? 'REMOVE HOLD' : 'LEGAL HOLD'}
            </button>
            <button onClick={generateSAR} className="btn-primary"
              style={{ fontSize: '11px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <DocIcon /> GENERATE SAR
            </button>
            {saving && <span style={{ fontSize: '11px', color: '#76777d' }}>Saving...</span>}
          </div>
        </div>

        {/* Row 2: badges */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge badge-${caseData.severity}`}>{caseData.severity?.toUpperCase()}</span>
          {caseData.urgency === 'immediate' && <span className="badge badge-urgent">URGENT</span>}
          {caseData.is_legal_hold && <span className="badge" style={{ background: '#ffddb3', color: '#7a3900' }}>🔒 LEGAL HOLD</span>}
          <span style={{ fontSize: '12px', color: '#76777d', textTransform: 'capitalize' }}>
            {caseData.fraud_type?.replace(/_/g, ' ')} · {caseData.department} · {new Date(caseData.report_date).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>

      {/* 3-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', flex: 1, overflow: 'hidden' }}>

        {/* COL 1: Forensic Intake */}
        <div style={{ borderRight: '1px solid #c6c6cd', overflow: 'auto', background: '#ffffff' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #c6c6cd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Forensic Intake</div>
            {caseData.urgency === 'immediate' && <span className="badge badge-urgent">URGENT</span>}
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Report text */}
            <div style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '14px' }}>
              <div className="label-caps" style={{ marginBottom: '8px' }}>Initial Whistleblower Report</div>
              <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#45464d' }}>{caseData.description}</p>
              {caseData.amount && (
                <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffddb3', border: '1px solid #e09000', borderRadius: '2px', padding: '4px 10px' }}>
                  <span style={{ fontSize: '12px', color: '#7a3900', fontWeight: 600 }}>Amount: ₹{Number(caseData.amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* AI Analysis dark box */}
            <div style={{ background: '#131b2e', border: '1px solid #213145', borderRadius: '2px', padding: '16px', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <BoltIcon />
                <div style={{ fontSize: '13px', fontWeight: 700 }}>AI Analysis</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: riskColor, letterSpacing: '-0.02em' }}>{riskScore}</span>
                  <span style={{ fontSize: '13px', color: '#8899bb' }}>/100</span>
                </div>
                <div style={{ height: '3px', background: '#213145', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ width: `${riskScore}%`, height: '100%', background: riskColor }} />
                </div>
              </div>

              {caseData.ai_summary && (
                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #213145' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>AI Summary</div>
                  <p style={{ fontSize: '12px', color: '#bcc7de', lineHeight: 1.65 }}>{caseData.ai_summary}</p>
                </div>
              )}

              {caseData.ai_steps && caseData.ai_steps.length > 0 && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8899bb', textTransform: 'uppercase', marginBottom: '8px' }}>Recommended Steps</div>
                  {caseData.ai_steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, marginTop: '1px' }}><CheckIcon /></span>
                      <span style={{ fontSize: '12px', color: '#bcc7de', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {!caseData.ai_summary && (!caseData.ai_steps || caseData.ai_steps.length === 0) && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#8899bb', fontSize: '12px' }}>
                  <InfoIcon /> AI triage pending or unavailable for this case
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div className="label-caps" style={{ marginBottom: '6px' }}>Secure Case Note</div>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add a secure case note..." style={{ resize: 'vertical', fontSize: '13px', marginBottom: '8px' }} />
              <button onClick={() => updateCase({ notes })} className="btn-primary" style={{ fontSize: '11px', padding: '8px 16px' }}>
                COMMIT NOTE
              </button>
            </div>
          </div>
        </div>

        {/* COL 2: Audit Trail + Messages */}
        <div style={{ borderRight: '1px solid #c6c6cd', overflow: 'auto', background: '#ffffff' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #c6c6cd' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Activity Audit Trail</div>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Audit timeline */}
            <div>
              {audit.length === 0 ? (
                <div style={{ color: '#76777d', fontSize: '13px', padding: '16px', textAlign: 'center', background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px' }}>No audit entries yet</div>
              ) : (
                audit.map((entry, i) => (
                  <div key={entry.id} style={{ display: 'flex', gap: '12px', marginBottom: i < audit.length - 1 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e5eeff', border: '1px solid #c6c6cd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '6px', height: '6px', background: '#131b2e', borderRadius: '50%' }} />
                      </div>
                      {i < audit.length - 1 && <div style={{ width: '1px', height: '28px', background: '#c6c6cd' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < audit.length - 1 ? '0' : '0', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{entry.action.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '10px', color: '#76777d', fontFamily: 'monospace' }}>{new Date(entry.created_at).toLocaleTimeString('en-IN')} UTC</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#76777d' }}>{entry.actor}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Anonymous messaging */}
            <div style={{ border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f8f9ff', borderBottom: '1px solid #c6c6cd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Anonymous Channel</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <DotIcon color="#ba1a1a" />
                  <span style={{ fontSize: '10px', color: '#ba1a1a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active</span>
                </div>
              </div>

              <div style={{ padding: '12px', maxHeight: '220px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div style={{ color: '#76777d', fontSize: '13px', textAlign: 'center', padding: '16px' }}>No messages. Send a message to the reporter.</div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} style={{ marginBottom: '12px' }}>
                      <div style={{ background: m.sender_role === 'investigator' ? '#e5eeff' : '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '10px 12px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{m.content}</p>
                      </div>
                      <div style={{ fontSize: '10px', color: '#76777d', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                        {m.sender_role === 'investigator' ? 'LEAD INVESTIGATOR' : 'REPORTER (ANONYMOUS)'} · {new Date(m.created_at).toLocaleTimeString('en-IN')} UTC
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '10px', borderTop: '1px solid #c6c6cd', display: 'flex', gap: '8px' }}>
                <textarea rows={2} value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Send a secure message to the reporter..." style={{ resize: 'none', fontSize: '13px', flex: 1 }} />
                <button onClick={sendMessage} className="btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <SendIcon /> SEND
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COL 3: Evidence Vault */}
        <div style={{ overflow: 'auto', background: '#ffffff' }}>
          <div style={{ padding: '16px 16px', borderBottom: '1px solid #c6c6cd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Evidence Vault</div>
            <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UploadIcon /> INGEST
            </button>
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ border: '1px solid #c6c6cd', borderRadius: '2px', padding: '10px 12px' }}>
                <div className="label-caps" style={{ marginBottom: '8px' }}>Attorney Privilege</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '18px', background: '#131b2e', borderRadius: '9px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>ON</span>
                </div>
              </div>
              <div style={{ border: '1px solid #c6c6cd', borderRadius: '2px', padding: '10px 12px' }}>
                <div className="label-caps" style={{ marginBottom: '8px' }}>Legal Hold</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => updateCase({ is_legal_hold: !caseData.is_legal_hold })}>
                  <div style={{ width: '34px', height: '18px', background: caseData.is_legal_hold ? '#131b2e' : '#c6c6cd', borderRadius: '9px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: caseData.is_legal_hold ? '2px' : 'auto', left: caseData.is_legal_hold ? 'auto' : '2px', transition: 'all 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{caseData.is_legal_hold ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            {/* Evidence list */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '5px 0', borderBottom: '1px solid #c6c6cd', marginBottom: '6px' }}>
                <div className="label-caps">Artifact</div>
                <div className="label-caps">SHA-256</div>
              </div>
              {evidence.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', background: '#f8f9ff', border: '1px dashed #c6c6cd', borderRadius: '2px', color: '#76777d', fontSize: '12px' }}>
                  No evidence uploaded yet
                </div>
              ) : (
                evidence.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #c6c6cd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FileIcon />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{ev.file_name}</div>
                        {ev.is_privileged && <span className="badge badge-medium" style={{ fontSize: '10px', padding: '1px 5px' }}>PRIVILEGED</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#76777d' }}>{ev.file_hash?.substring(0, 8)}...</div>
                  </div>
                ))
              )}
            </div>

            {/* Chain of custody */}
            <div style={{ border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <ChainIcon />
                <div className="label-caps" style={{ margin: 0 }}>Legal Chain of Custody</div>
              </div>
              {[
                { label: 'Custodian', value: 'Internal Audit (HQ)' },
                { label: 'Collected By', value: 'System (Auto)' },
                { label: 'Collection Date', value: new Date(caseData.report_date).toLocaleDateString('en-IN') },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #c6c6cd', fontSize: '12px' }}>
                  <span style={{ color: '#76777d' }}>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <button className="btn-secondary" style={{ width: '100%', marginTop: '10px', fontSize: '11px', padding: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }} onClick={generateSAR}>
                GENERATE CERTIFICATE
              </button>
            </div>

            {/* Case metadata */}
            <div style={{ border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px' }}>
              <div className="label-caps" style={{ marginBottom: '8px' }}>Case Metadata</div>
              {[
                { label: 'Fraud Type', value: caseData.fraud_type?.replace(/_/g, ' ') || '—' },
                { label: 'Department', value: caseData.department || 'Unknown' },
                { label: 'Severity', value: caseData.severity },
                { label: 'Urgency', value: caseData.urgency },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #c6c6cd', fontSize: '12px' }}>
                  <span style={{ color: '#76777d' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}