'use client';
import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

interface EvidenceItem {
  id: number; file_name: string; file_hash: string | null;
  is_privileged: boolean; uploaded_at: string; case_id: number;
  source: 'investigator' | 'reporter';
}

interface RawEvidenceRow {
  id?: number; file_name?: string; file_hash?: string;
  is_privileged?: boolean; uploaded_at?: string;
}
interface RawAttachment {
  name?: string; hash?: string;
}

function EvidenceContent() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all cases then collect both investigator and whistleblower evidence arrays
    fetch('/api/cases')
      .then(r => r.json())
      .then(async (cases) => {
        if (!Array.isArray(cases)) { setLoading(false); return; }
        const evidenceData: EvidenceItem[] = [];

        for (const c of cases.slice(0, 10)) {
          try {
            const res = await fetch(`/api/cases/${c.id}`);
            const data = await res.json();

            // 1. Evidence formally logged against the case (the `evidence`
            // table). There is currently no upload flow that writes rows
            // here — see README "Known limitations" — so in practice this
            // array is empty, but the rendering path is real.
            if (data.evidence && Array.isArray(data.evidence)) {
              evidenceData.push(...data.evidence.map((e: RawEvidenceRow) => ({
                id: e.id ?? 0,
                file_name: e.file_name ?? 'Unnamed file',
                file_hash: e.file_hash ?? null,
                is_privileged: e.is_privileged ?? false,
                uploaded_at: e.uploaded_at || c.report_date,
                case_id: c.id,
                source: 'investigator' as const,
              })));
            }

            // 2. Attachment metadata (filename/size/type only — no file
            // content) that the reporter listed at submission time.
            if (data.case && data.case.evidence && Array.isArray(data.case.evidence)) {
              evidenceData.push(...data.case.evidence.map((file: string | RawAttachment, index: number) => ({
                id: 10000 + c.id + index, // Generate safe temporary map keys
                file_name: typeof file === 'string' ? file : (file.name || 'Unnamed file'),
                file_hash: typeof file === 'object' ? (file.hash ?? null) : null,
                is_privileged: false,
                uploaded_at: c.report_date || new Date().toISOString(),
                case_id: c.id,
                source: 'reporter' as const,
              })));
            }
          } catch (err) {
            console.error('Failed processing evidence row map loops:', err);
          }
        }
        setEvidence(evidenceData);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #c6c6cd', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Evidence Registry</h1>
            <p style={{ color: '#76777d', fontSize: '13px' }}>Evidence metadata referenced against each case</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Info banner */}
        <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', borderLeft: '3px solid #131b2e', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#131b2e" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div>
            <div className="label-caps" style={{ marginBottom: '3px' }}>Prototype limitation</div>
            <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.5 }}>Evidence listed here is filename/size/type metadata supplied by the reporter or investigator — this prototype does not yet store or hash actual file content. Case actions are written to an append-oriented audit log.</p>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#f8f9ff', borderBottom: '1px solid #c6c6cd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="label-caps" style={{ margin: 0 }}>Evidence Registry — {evidence.length} item{evidence.length !== 1 ? 's' : ''}</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Artifact</th>
                <th>SHA-256 Hash</th>
                <th>Case Ref</th>
                <th>Privilege</th>
                <th>Uploaded</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>Loading evidence...</td></tr>
              ) : evidence.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#76777d' }}>No evidence metadata recorded yet.</td></tr>
              ) : evidence.map(ev => (
                <tr key={ev.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {/* No download: file content is never uploaded or stored in this
                          prototype, so there's nothing on the server to serve back. */}
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#131b2e' }}>{ev.file_name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#76777d' }}>
                    {ev.file_hash ? `${ev.file_hash.substring(0, 16)}...` : 'Not hashed'}
                  </td>
                  <td>
                    <a href={`/dashboard/cases/${ev.case_id}`} style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#131b2e', textDecoration: 'underline' }}>
                      #{ev.case_id}
                    </a>
                  </td>
                  <td>{ev.is_privileged ? <span className="badge badge-medium">PRIVILEGED</span> : <span style={{ fontSize: '11px', color: '#76777d' }}>—</span>}</td>
                  <td style={{ fontSize: '12px', color: '#76777d' }}>{new Date(ev.uploaded_at).toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '11px', color: '#76777d', textTransform: 'capitalize' }}>{ev.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function EvidencePage() {
  return <SessionProvider><EvidenceContent /></SessionProvider>;
}