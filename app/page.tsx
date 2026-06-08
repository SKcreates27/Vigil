import Link from 'next/link';
import Logo from '@/components/Logo';

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column', paddingBottom: '32px' }}>

      {/* Top Nav */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={32} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#0b1c30' }}>FraudWatch360</div>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#76777d', textTransform: 'uppercase', marginTop: '-2px' }}>Internal Investigation Unit</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/check-status"><button className="btn-secondary">Status Check</button></Link>
          <Link href="/report"><button className="btn-secondary">Submit Report</button></Link>
          <Link href="/login"><button className="btn-primary">Investigator Access →</button></Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: '900px', margin: '80px auto 0', padding: '0 40px', width: '100%' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '4px 12px', marginBottom: '32px' }}>
          <div style={{ width: '6px', height: '6px', background: '#ba1a1a', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Zero-Trust Session Active</span>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '20px', color: '#0b1c30' }}>
          Enterprise Fraud<br />Reporting Infrastructure
        </h1>

        <p style={{ fontSize: '16px', color: '#45464d', maxWidth: '560px', lineHeight: 1.7, marginBottom: '40px' }}>
          A secure, anonymous whistleblower platform for internal fraud reporting. AI-powered triage, forensic investigation workflow, tamper-proof evidence chain, and regulatory SAR generation.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '72px' }}>
          <Link href="/report"><button className="btn-primary" style={{ padding: '13px 28px', fontSize: '12px' }}>SUBMIT ANONYMOUS REPORT</button></Link>
          <Link href="/check-status"><button className="btn-secondary" style={{ padding: '13px 24px', fontSize: '13px' }}>Check Report Status</button></Link>
        </div>

        {/* Trust badges — using inline SVGs */}
        <div style={{ display: 'flex', gap: '0', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden', marginBottom: '56px', background: '#ffffff' }}>
          {[
            {
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#45464d" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
              label: 'TOR-COMPATIBLE', desc: 'Anonymous routing'
            },
            {
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#45464d" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
              label: 'NO IP LOGGING', desc: 'Zero identity trace'
            },
            {
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#45464d" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
              label: 'AES-256 ENCRYPTED', desc: 'End-to-end encrypted'
            },
            {
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#45464d" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              label: 'SEBI COMPLIANT', desc: 'Regulatory ready'
            },
          ].map((b, i) => (
            <div key={b.label} style={{ flex: 1, padding: '20px 16px', borderLeft: i > 0 ? '1px solid #c6c6cd' : 'none', textAlign: 'center' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{b.svg}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#0b1c30', textTransform: 'uppercase', marginBottom: '3px' }}>{b.label}</div>
              <div style={{ fontSize: '12px', color: '#76777d' }}>{b.desc}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden', marginBottom: '48px' }}>
          {[
            { num: '43%', label: 'OF FRAUD DETECTED BY TIPS', sub: 'ACFE Report to the Nations 2024' },
            { num: '2×', label: 'DETECTION RATE IMPROVEMENT', sub: 'With structured reporting systems' },
            { num: '100%', label: 'ANONYMOUS SUBMISSIONS', sub: 'No identity data ever collected' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', padding: '28px 24px' }}>
              <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0b1c30', marginBottom: '8px' }}>{s.num}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#0b1c30', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: '#76777d' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#c6c6cd', border: '1px solid #c6c6cd', borderRadius: '2px', overflow: 'hidden' }}>
          {[
            {
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#545f73" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              title: 'AI-Powered Triage',
              desc: 'Gemini AI classifies fraud type, severity, urgency, and suggests investigation steps automatically on submission.'
            },
            {
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#545f73" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              title: 'Anonymous 2-Way Messaging',
              desc: 'Investigators communicate with reporters via secure token-based messaging — no identity revealed on either side.'
            },
            {
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#545f73" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="#545f73"/></svg>,
              title: 'Tamper-Proof Evidence Chain',
              desc: 'SHA-256 fingerprinting, append-only audit log, and legal hold functionality for court-admissible evidence handling.'
            },
            {
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#545f73" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
              title: 'SAR Auto-Generation',
              desc: 'One-click Suspicious Activity Report generation pre-populated by AI for SEBI, PMLA, and FinCEN compliance.'
            },
          ].map((f) => (
            <div key={f.title} style={{ background: '#ffffff', padding: '24px' }}>
              <div style={{ marginBottom: '12px' }}>{f.svg}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0b1c30', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: '#45464d', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '64px', borderTop: '1px solid #c6c6cd', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', fontSize: '12px', color: '#76777d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size={18} />
          <span>FraudWatch360 · Internal Investigation Unit · v1.0.0-STABLE</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ cursor: 'pointer' }}>Security Audit</span>
          <span style={{ cursor: 'pointer' }}>Transparency Report</span>
          <span style={{ cursor: 'pointer' }}>Legal Terms</span>
        </div>
      </div>
    </div>
  );
}