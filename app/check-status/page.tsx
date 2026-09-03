'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface Message { id: number; sender_role: string; content: string; created_at: string; }
interface ReportData { id: number; fraud_type: string; severity: string; status: string; ai_summary: string; created_at: string; department: string; amount: number; }

export default function CheckStatusPage() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<{ report: ReportData; messages: Message[] } | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/messages/${token.trim()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Token not found');
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid token. Check your access key and try again.');
    } finally { setLoading(false); }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setSent(false);
    try {
      const res = await fetch(`/api/messages/${token.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply, sender_role: 'reporter' }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setReply('');
      setSent(true);
      // Refresh messages
      const updated = await fetch(`/api/messages/${token.trim()}`);
      const updatedData = await updated.json();
      setData(updatedData);
    } catch { setError('Failed to send reply. Please try again.'); }
    finally { setSending(false); }
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
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link href="/report" style={{ fontSize: '13px', color: '#76777d', fontWeight: 500 }}>Submit Report</Link>
          <Link href="/check-status" style={{ fontSize: '13px', color: '#131b2e', fontWeight: 700, borderBottom: '2px solid #131b2e', paddingBottom: '2px' }}>Status Check</Link>
        </div>
        <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.06em' }}>ZERO-TRUST SESSION</div>
      </header>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 24px', width: '100%' }}>
        <div className="label-caps" style={{ marginBottom: '6px' }}>Anonymous Channel</div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>Report Status Check</h1>
        <p style={{ color: '#76777d', fontSize: '13px', marginBottom: '28px', lineHeight: 1.6 }}>
          Enter the secure access key you received after submitting your report. Your identity remains protected — we cannot see who you are.
        </p>

        {/* Token input */}
        <form onSubmit={handleCheck}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Enter your UUID token (e.g. a1b2c3d4-e5f6-...)"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.03em' }}
            />
            <button className="btn-primary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap', padding: '8px 20px' }}>
              {loading ? 'VERIFYING...' : 'AUTHENTICATE →'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#76777d', marginBottom: '24px' }}>
            Your token is the UUID shown on the submission success screen (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
          </p>
        </form>

        {error && (
          <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '12px 16px', color: '#ba1a1a', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Case summary */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div className="label-caps" style={{ marginBottom: '4px' }}>Case Reference</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>#{data.report.id} — {(data.report.fraud_type || 'UNDER REVIEW').replace(/_/g, ' ').toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge badge-${data.report.severity || 'new'}`}>{(data.report.severity || 'PENDING').toUpperCase()}</span>
                  <div style={{ fontSize: '11px', color: '#76777d', marginTop: '6px', textTransform: 'capitalize' }}>{(data.report.status || '').replace(/_/g, ' ')}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Department', value: data.report.department || 'Under Review' },
                  { label: 'Amount', value: data.report.amount ? `₹${Number(data.report.amount).toLocaleString('en-IN')}` : 'Not specified' },
                  { label: 'Filed', value: new Date(data.report.created_at).toLocaleDateString('en-IN') },
                ].map(r => (
                  <div key={r.label} style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '10px 12px' }}>
                    <div className="label-caps" style={{ marginBottom: '3px' }}>{r.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.value}</div>
                  </div>
                ))}
              </div>

              {data.report.ai_summary && (
                <div style={{ background: '#e5eeff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '12px' }}>
                  <div className="label-caps" style={{ marginBottom: '5px' }}>AI Analysis Summary</div>
                  <p style={{ fontSize: '13px', color: '#45464d', lineHeight: 1.65 }}>{data.report.ai_summary}</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#ba1a1a', borderRadius: '50%' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Anonymous Channel: Active</div>
                </div>
                <span style={{ fontSize: '11px', color: '#76777d', fontFamily: 'monospace' }}>CASE REF: #{data.report.id}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#76777d', marginBottom: '20px' }}>
                Messages are end-to-end anonymous. The investigator cannot see your identity.
              </p>

              {data.messages.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', color: '#76777d', fontSize: '13px', marginBottom: '16px' }}>
                  No messages yet. The Lead Investigator will reach out shortly after reviewing your report.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {data.messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', gap: '10px', flexDirection: m.sender_role === 'reporter' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '2px', background: m.sender_role === 'investigator' ? '#131b2e' : '#e5eeff', border: '1px solid #c6c6cd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {m.sender_role === 'investigator'
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#131b2e" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        }
                      </div>
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{ background: m.sender_role === 'investigator' ? '#e5eeff' : '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '10px 14px' }}>
                          <p style={{ fontSize: '13px', lineHeight: 1.65 }}>{m.content}</p>
                        </div>
                        <div style={{ fontSize: '10px', color: '#76777d', marginTop: '4px', textAlign: m.sender_role === 'reporter' ? 'right' : 'left', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                          {m.sender_role === 'investigator' ? 'LEAD INVESTIGATOR' : 'YOU (ANONYMOUS)'} · {new Date(m.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sent && (
                <div style={{ background: '#c8f5d0', border: '1px solid #1a6934', borderRadius: '2px', padding: '8px 14px', fontSize: '12px', color: '#1a6934', fontWeight: 600, marginBottom: '12px' }}>
                  ✓ Message sent anonymously
                </div>
              )}

              <div style={{ borderTop: '1px solid #c6c6cd', paddingTop: '16px' }}>
                <div className="label-caps" style={{ marginBottom: '8px' }}>Send Anonymous Reply</div>
                <form onSubmit={handleReply} style={{ display: 'flex', gap: '10px' }}>
                  <textarea
                    rows={3}
                    placeholder="Type your follow-up response to the investigator..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    style={{ resize: 'none', fontSize: '13px', flex: 1 }}
                  />
                  <button className="btn-primary" type="submit" disabled={sending || !reply.trim()} style={{ alignSelf: 'flex-end', padding: '10px 18px', whiteSpace: 'nowrap', opacity: !reply.trim() ? 0.5 : 1 }}>
                    {sending ? '...' : 'SEND →'}
                  </button>
                </form>
                <div style={{ fontSize: '11px', color: '#76777d', textAlign: 'center', marginTop: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Messages are automatically purged after case resolution
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="status-bar">
        <span>SYSTEM STATUS: <span className="status-ok">OPTIMAL</span> · NODE: FW360-WB-01</span>
        <span>ENCRYPTION: AES-256 · SESSION: ANONYMOUS</span>
      </div>
    </div>
  );
}