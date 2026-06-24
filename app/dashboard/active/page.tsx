'use client';
import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';

interface Case {
  id: number; fraud_type: string; severity: string; status: string;
  regulatory_flag: boolean; amount: number; report_date: string;
  department: string; description: string; notes: string;
}

function ActiveCasesContent() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases?status=under_investigation')
      .then(r => r.json())
      .then(data => { setCases(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #c6c6cd', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Active Cases</h1>
            <p style={{ color: '#76777d', fontSize: '13px' }}>Cases currently under active investigation</p>
          </div>
          <Link href="/report"><button className="btn-primary">+ NEW INVESTIGATION</button></Link>
        </div>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Description</th>
                <th>Fraud Type</th>
                <th>Severity</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>Loading...</td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>No active investigations</td></tr>
              ) : cases.map(c => (
                <tr key={c.id} onClick={() => window.location.href = `/dashboard/cases/${c.id}`} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>FW-{new Date(c.report_date).getFullYear()}-{String(c.id).padStart(4, '0')}</td>
                  <td style={{ maxWidth: '260px' }}>
                    <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description?.substring(0, 55)}...</div>
                  </td>
                  <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{c.fraud_type?.replace(/_/g, ' ')}</td>
                  <td><span className={`badge badge-${c.severity}`}>{c.severity?.toUpperCase()}</span></td>
                  <td style={{ fontSize: '12px' }}>{c.department || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{c.amount ? `₹${Number(c.amount).toLocaleString('en-IN')}` : '—'}</td>
                  <td style={{ fontSize: '12px', color: '#76777d' }}>{new Date(c.report_date).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ActiveCasesPage() {
  return <SessionProvider><ActiveCasesContent /></SessionProvider>;
}