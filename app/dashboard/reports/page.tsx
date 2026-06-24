'use client';
import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

interface Case {
  id: number; fraud_type: string; severity: string; status: string;
  regulatory_flag: boolean; amount: number; report_date: string; department: string;
}

function ReportsContent() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases').then(r => r.json()).then(data => {
      setCases(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = cases.length;
  const critical = cases.filter(c => c.severity === 'critical').length;
  const regulatory = cases.filter(c => c.regulatory_flag).length;
  const resolved = cases.filter(c => c.status === 'resolved').length;
  const active = cases.filter(c => c.status === 'under_investigation').length;
  const totalAmount = cases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const sarAccuracy = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';

  const byType: Record<string, number> = {};
  cases.forEach(c => { byType[c.fraud_type || 'other'] = (byType[c.fraud_type || 'other'] || 0) + 1; });

  const byDept: Record<string, number> = {};
  cases.forEach(c => { byDept[c.department || 'Unknown'] = (byDept[c.department || 'Unknown'] || 0) + 1; });

  const bySeverity = {
    critical: cases.filter(c => c.severity === 'critical').length,
    high: cases.filter(c => c.severity === 'high').length,
    medium: cases.filter(c => c.severity === 'medium').length,
    low: cases.filter(c => c.severity === 'low').length,
  };

  const compliance = [
    { label: 'SEBI LODR Vigil Mechanism', status: 'compliant', date: 'Active' },
    { label: 'PMLA Reporting Obligation', status: regulatory > 0 ? 'action' : 'compliant', date: regulatory > 0 ? 'URGENT' : 'Current' },
    { label: 'Companies Act 2013 — Sec 177', status: 'compliant', date: 'Active' },
    { label: 'Audit Trail Integrity', status: 'compliant', date: 'Verified' },
    { label: 'Data Encryption — AES-256', status: 'compliant', date: 'Active' },
    { label: 'Anonymous Channel Availability', status: 'compliant', date: '24/7' },
  ];

  const maxBarValue = Math.max(...Object.values(byType), 1);

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #c6c6cd', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Executive Reporting Portal</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#76777d', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                FY2026 Audit Period
              </span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {regulatory} Pending Regulatory Filings
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Report
            </button>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden' }}>
          {[
            { label: 'Total Escalations', value: total, sub: `+${Math.max(0, total - 5)} vs LY`, color: '#0b1c30', subColor: '#1a6934' },
            { label: 'SAR Filing Accuracy', value: `${sarAccuracy}%`, sub: 'Stable', color: '#0b1c30', subColor: '#76777d' },
            { label: 'High Value Breaches', value: critical, sub: `₹${(totalAmount / 1e6).toFixed(1)}M Total`, color: '#ba1a1a', subColor: '#ba1a1a' },
            { label: 'Time to Compliance', value: '1.4d', sub: '-0.2d Improvement', color: '#0b1c30', subColor: '#1a6934' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', padding: '20px 24px' }}>
              <div className="label-caps" style={{ marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', color: s.color, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ height: '2px', background: '#e5eeff', borderRadius: '1px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (total / 20) * 100)}%`, height: '100%', background: s.color === '#ba1a1a' ? '#ba1a1a' : '#131b2e' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: s.subColor }}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
          {/* Fraud type breakdown */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Financial Threshold Exposure</div>
              <div style={{ fontSize: '11px', color: '#76777d', background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '3px 10px', fontWeight: 600 }}>BY TYPE</div>
            </div>

            {loading ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76777d', fontSize: '13px' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#45464d', textTransform: 'capitalize', width: '140px', flexShrink: 0 }}>{type.replace(/_/g, ' ')}</div>
                    <div style={{ flex: 1, height: '18px', background: '#f8f9ff', borderRadius: '1px', overflow: 'hidden', border: '1px solid #c6c6cd' }}>
                      <div style={{ width: `${(count / maxBarValue) * 100}%`, height: '100%', background: '#131b2e', transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0b1c30', width: '20px', textAlign: 'right' }}>{count}</div>
                  </div>
                ))}
                {Object.keys(byType).length === 0 && (
                  <div style={{ color: '#76777d', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data yet</div>
                )}
              </div>
            )}

            {/* Severity mini grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #c6c6cd' }}>
              {[
                { label: 'Critical', count: bySeverity.critical, color: '#ba1a1a', bg: '#ffdad6' },
                { label: 'High', count: bySeverity.high, color: '#7a3900', bg: '#ffddb3' },
                { label: 'Medium', count: bySeverity.medium, color: '#7a5500', bg: '#fff3cd' },
                { label: 'Low', count: bySeverity.low, color: '#1a6934', bg: '#c8f5d0' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '2px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance status */}
          <div className="card" style={{ background: '#131b2e', border: '1px solid #213145' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', marginBottom: '16px' }}>Compliance Status</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {compliance.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #213145' }}>
                  <div style={{ flexShrink: 0 }}>
                    {c.status === 'compliant' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#e5eeff' }}>{c.label}</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: c.status === 'action' ? '#fbbf24' : '#4ade80', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{c.date}</div>
                </div>
              ))}
            </div>

            {/* Global risk score */}
            <div style={{ background: '#0d1220', borderRadius: '2px', padding: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8899bb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Global Risk Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: critical > 2 ? '#ba1a1a' : '#4ade80', letterSpacing: '-0.02em' }}>
                  {critical > 2 ? '8.4' : critical > 0 ? '4.2' : '2.4'}
                </span>
                <span style={{ fontSize: '13px', color: '#8899bb' }}>{critical > 2 ? 'High' : critical > 0 ? 'Medium' : 'Low'}</span>
              </div>
              <div style={{ height: '4px', background: '#213145', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: critical > 2 ? '84%' : critical > 0 ? '42%' : '24%', height: '100%', background: critical > 2 ? '#ba1a1a' : critical > 0 ? '#fbbf24' : '#4ade80', transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Department breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Department Risk Distribution</div>
            {Object.keys(byDept).length === 0 ? (
              <div style={{ color: '#76777d', fontSize: '13px' }}>No data</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Reports</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, count]) => {
                    const deptCritical = cases.filter(c => c.department === dept && c.severity === 'critical').length;
                    return (
                      <tr key={dept}>
                        <td style={{ fontWeight: 500 }}>{dept}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{count}</td>
                        <td>
                          <span className={`badge badge-${deptCritical > 0 ? 'critical' : count > 2 ? 'high' : 'medium'}`}>
                            {deptCritical > 0 ? 'CRITICAL' : count > 2 ? 'HIGH' : 'MEDIUM'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* SAR Template Generator */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>SAR Template Generator</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#e5eeff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '3px 10px' }}>
                <div style={{ width: '6px', height: '6px', background: '#131b2e', borderRadius: '50%' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#131b2e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Pre-Populated</span>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {[
                { n: 1, label: 'Subject Identity', sub: 'Verified via case token' },
                { n: 2, label: 'Activity Detail', sub: `${total} transaction${total !== 1 ? 's' : ''} flagged` },
                { n: 3, label: 'Institution Info', sub: 'Internal nodes' },
                { n: 4, label: 'Review & Certify', sub: 'Signature required' },
              ].map((step, i) => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i < 2 ? '#131b2e' : '#e5eeff', border: `1px solid ${i < 2 ? '#131b2e' : '#c6c6cd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: i < 2 ? 'white' : '#76777d', flexShrink: 0 }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: i < 2 ? '#0b1c30' : '#76777d' }}>{step.label}</div>
                    <div style={{ fontSize: '11px', color: '#76777d' }}>{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* SAR preview box */}
            <div style={{ background: '#f8f9ff', border: '1px solid #c6c6cd', borderRadius: '2px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#0b1c30', marginBottom: '4px' }}>FINANCIAL CRIMES ENFORCEMENT NETWORK</div>
              <div style={{ fontSize: '10px', color: '#76777d', marginBottom: '6px' }}>SUSPICIOUS ACTIVITY REPORT (Form FinCEN 111)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#76777d' }}>
                <span>BSA ID: {Math.floor(Math.random() * 900000000) + 100000000}-X</span>
                <span>Draft Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #c6c6cd', margin: '8px 0' }} />
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#0b1c30' }}>PART I — SUBJECT INFORMATION</div>
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '10px' }}
              onClick={() => { if (total > 0) window.location.href = `/dashboard/cases/1`; }}>
              GENERATE CONSOLIDATED SAR →
            </button>
          </div>
        </div>

        {/* Recent activity table */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Recent Escalations Log</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Fraud Type</th>
                <th>Severity</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Regulatory</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#76777d' }}>Loading...</td></tr>
              ) : cases.slice(0, 8).map(c => (
                <tr key={c.id} onClick={() => window.location.href = `/dashboard/cases/${c.id}`}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>FW-{new Date(c.report_date).getFullYear()}-{String(c.id).padStart(4, '0')}</td>
                  <td style={{ textTransform: 'capitalize', fontSize: '12px' }}>{c.fraud_type?.replace(/_/g, ' ')}</td>
                  <td><span className={`badge badge-${c.severity}`}>{c.severity?.toUpperCase()}</span></td>
                  <td style={{ fontSize: '12px' }}>{c.department || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{c.amount ? `₹${Number(c.amount).toLocaleString('en-IN')}` : '—'}</td>
                  <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{c.status?.replace(/_/g, ' ')}</td>
                  <td>
                    {c.regulatory_flag
                      ? <span className="badge badge-critical">⚠ FLAGGED</span>
                      : <span style={{ fontSize: '11px', color: '#76777d' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return <SessionProvider><ReportsContent /></SessionProvider>;
}