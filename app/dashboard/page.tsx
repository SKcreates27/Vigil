'use client';
import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';

interface Case {
  id: number; report_id: number; fraud_type: string; severity: string;
  urgency: string; department: string; amount: number; status: string;
  regulatory_flag: boolean; report_date: string; description: string;
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'CRITICAL', high: 'HIGH-SEVERITY', medium: 'MEDIUM', low: 'LOW',
};

function TriageContent() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchCases(); }, [severityFilter]);

  async function fetchCases() {
    setLoading(true);
    const params = new URLSearchParams();
    if (severityFilter) params.set('severity', severityFilter);
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    setCases(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const filtered = cases.filter(c => {
  if (activeTab === 'new') return c.status === 'new';
  if (activeTab === 'active') return c.status === 'under_investigation';
  if (activeTab === 'hold') return c.status === 'pending_review';
  if (activeTab === 'resolved') return c.status === 'resolved';
  return true;
}).filter(c => {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  return (
    c.description?.toLowerCase().includes(query) ||
    c.fraud_type?.toLowerCase().includes(query) ||
    c.department?.toLowerCase().includes(query) ||
    String(c.id).includes(query)
  );
});

  const stats = {
    total: cases.length,
    critical: cases.filter(c => c.severity === 'critical').length,
    active: cases.filter(c => c.status === 'under_investigation').length,
    regulatory: cases.filter(c => c.regulatory_flag).length,
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: '28px 32px 0', borderBottom: '1px solid #c6c6cd', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Triage Queue</h1>
            <p style={{ color: '#76777d', fontSize: '13px' }}>
              Review and assign <strong style={{ color: '#0b1c30' }}>{cases.length} incidents</strong> from automated detection streams.
            </p>
          </div>
         <div style={{ display: 'flex', gap: '10px' }}>
  <input 
    type="text" 
    placeholder="Search incidents..." 
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    style={{ padding: '4px 12px', fontSize: '13px', border: '1px solid #c6c6cd', borderRadius: '2px', width: '180px' }}
  />
  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>filter_list</span>
    Filter
  </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' }}>
          {[
            { label: 'Total Escalations', value: stats.total, sub: 'All time', color: '#0b1c30' },
            { label: 'Critical', value: stats.critical, sub: 'Immediate action', color: '#ba1a1a' },
            { label: 'Under Investigation', value: stats.active, sub: 'Active cases', color: '#7a3900' },
            { label: 'Regulatory Flags', value: stats.regulatory, sub: 'SEBI/PMLA triggered', color: '#ba1a1a' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', padding: '16px 20px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0b1c30', marginTop: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#76777d', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Regulatory alert */}
        {stats.regulatory > 0 && (
          <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a' }}>warning</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stats.regulatory} case{stats.regulatory > 1 ? 's' : ''} exceed regulatory threshold</span>
            <span style={{ fontSize: '12px', color: '#76777d' }}>— SEBI/PMLA reporting may be required. Immediate review recommended.</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'all', label: 'UNASSIGNED TRIAGE' },
            { key: 'active', label: 'ACTIVE INVESTIGATIONS' },
            { key: 'hold', label: 'UNDER LEGAL HOLD' },
            { key: 'resolved', label: 'RESOLVED' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', background: 'transparent', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #0b1c30' : '2px solid transparent', color: activeTab === tab.key ? '#0b1c30' : '#76777d', cursor: 'pointer', transition: 'all 0.1s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px', background: '#ffffff' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" /></th>
              <th>Incident ID</th>
              <th>AI Severity Tier</th>
              <th>Auto-Classified Dept.</th>
              <th>Description</th>
              <th>Date Received</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>Loading cases...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>No cases in this queue</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.regulatory_flag && <div style={{ width: '6px', height: '6px', background: '#ba1a1a', borderRadius: '50%', flexShrink: 0 }} />}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>FW-{new Date(c.report_date).getFullYear()}-{String(c.id).padStart(4, '0')}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${c.severity === 'high' ? 'high-severity' : c.severity}`}>{SEVERITY_LABEL[c.severity] || c.severity?.toUpperCase()}</span></td>
                  <td style={{ fontSize: '13px' }}>{c.department || '—'}</td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description?.substring(0, 55)}...</div>
                    <div style={{ fontSize: '11px', color: '#76777d', textTransform: 'capitalize', marginTop: '2px' }}>{c.fraud_type?.replace(/_/g, ' ')}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76777d' }}>{new Date(c.report_date).toISOString().replace('T', ' ').substring(0, 19)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{c.amount ? `₹${Number(c.amount).toLocaleString('en-IN')}` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link href={`/dashboard/cases/${c.id}`}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0b1c30', cursor: 'pointer', textDecoration: 'underline' }}>Investigate</span>
                      </Link>
                      <span style={{ fontSize: '13px', color: '#76777d', cursor: 'pointer' }}>Dismiss</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <SessionProvider><TriageContent /></SessionProvider>;
}
