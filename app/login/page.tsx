'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError('Invalid credentials. Access denied.');
    else router.push('/dashboard');
  }

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '4px 10px' }}>
          <div style={{ width: '6px', height: '6px', background: '#ba1a1a', borderRadius: '50%' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Restricted Access</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#76777d', textTransform: 'uppercase', marginBottom: '4px' }}>Authentication Required</div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Investigator Login</h1>
          </div>
          <p style={{ color: '#76777d', fontSize: '13px', marginBottom: '28px' }}>Authorized personnel only. All access attempts are logged.</p>

          <div className="card" style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label-caps">Email Address</label>
                <input type="email" placeholder="investigator@organization.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginTop: '6px' }} />
              </div>
              <div>
                <label className="label-caps">Password</label>
                <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginTop: '6px' }} />
              </div>

              {error && (
                <div style={{ background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: '2px', padding: '10px 14px', color: '#ba1a1a', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '12px', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', borderLeft: '3px solid #76777d' }}>
            <div className="label-caps" style={{ marginBottom: '4px' }}>Investigation Protocol</div>
            <p style={{ fontSize: '12px', color: '#45464d', lineHeight: 1.5 }}>
              Not an investigator?{' '}
              <Link href="/report" style={{ color: '#131b2e', fontWeight: 600, textDecoration: 'underline' }}>Submit an anonymous report</Link> via the Whistleblower Portal.
            </p>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>SYSTEM STATUS: <span className="status-ok">OPTIMAL</span> · NODE: FW360-AUTH-01</span>
        <span>AUTHENTICATED SESSION REQUIRED</span>
      </div>
    </div>
  );
}