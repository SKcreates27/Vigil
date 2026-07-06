'use client';
import { useState } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

// Inline SVG icons — no external font dependency
const Icons = {
  inbox: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  folder: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  vault: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="3"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  security: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  help: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76777d', fontSize: '13px' }}>Authenticating...</div>;
  }
  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'Triage Queue', icon: Icons.inbox },
    { href: '/dashboard/active', label: 'Active Cases', icon: Icons.folder },
    { href: '/dashboard/evidence', label: 'Evidence Locker', icon: Icons.vault },
    { href: '/dashboard/reports', label: 'Executive Reports', icon: Icons.chart },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #c6c6cd', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 0', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Logo area */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', borderRight: '1px solid #c6c6cd', height: '100%', minWidth: '240px' }}>
            <Logo size={28} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>FraudWatch360</div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#76777d', textTransform: 'uppercase' }}>Internal Investigation Unit</div>
            </div>
          </Link>

          {/* Top nav tabs */}
          <nav style={{ display: 'flex', height: '100%', marginLeft: '8px' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 18px', fontSize: '13px', color: isActive(item.href) ? '#0b1c30' : '#76777d', fontWeight: isActive(item.href) ? 600 : 400, borderBottom: isActive(item.href) ? '2px solid #0b1c30' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.1s', whiteSpace: 'nowrap' }}>
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <button className="btn-ghost" style={{ padding: '8px', color: '#76777d' }} title="Search" onClick={() => setShowSearch(s => !s)}>{Icons.search}</button>
  
  {/* Updated Notification Button */}
  <button 
    className="btn-ghost" 
    style={{ padding: '8px', color: '#76777d', position: 'relative' }} 
    title="Notifications"
    onClick={() => setShowNotifications(s => !s)}
  >
    {Icons.bell}
    <div style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: '#ba1a1a', borderRadius: '50%', border: '1.5px solid white' }} />
  </button>

  {/* Interactive Notification Dropdown Box */}
  {showNotifications && (
    <div style={{ position: 'absolute', top: '50px', right: '60px', width: '280px', background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 110, padding: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0b1c30', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #c6c6cd', paddingBottom: '6px' }}>System Alerts</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: '#ba1a1a' }}>[ALERT]</span> New encrypted whistleblower case has entered the Triage Queue.
        </div>
        <div style={{ fontSize: '11px', color: '#76777d' }}>Just now</div>
      </div>
    </div>
  )}

  <button className="btn-ghost" style={{ padding: '8px', color: '#76777d' }} title="Settings">{Icons.settings}</button>
          <div style={{ width: '1px', height: '24px', background: '#c6c6cd', margin: '0 8px' }} />
          <div style={{ width: '32px', height: '32px', borderRadius: '2px', background: '#131b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', cursor: 'pointer', flexShrink: 0 }} onClick={() => signOut({ callbackUrl: '/login' })} title="Sign out">
            {session.user?.email?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Left sidebar */}
      <aside style={{ width: '240px', background: '#ffffff', borderRight: '1px solid #c6c6cd', position: 'fixed', top: '64px', left: 0, height: 'calc(100vh - 92px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Alert */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #c6c6cd' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ba1a1a', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <div style={{ width: '6px', height: '6px', background: '#ba1a1a', borderRadius: '50%' }}></div>
            High Priority Alert
          </div>
          <div style={{ fontSize: '10px', color: '#76777d', fontFamily: 'monospace', letterSpacing: '0.04em' }}>CASE ID: ACTIVE</div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
                <span style={{ color: isActive(item.href) ? '#0b1c30' : '#76777d' }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="divider" />

        {/* New Investigation CTA */}
        <div style={{ padding: '12px 16px' }}>
          <Link href="/report">
            <button className="btn-primary" style={{ width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {Icons.plus} NEW INVESTIGATION
            </button>
          </Link>
        </div>

        <div className="divider" />

        {/* Bottom links */}
        <div style={{ paddingBottom: '8px' }}>
          <div className="nav-item" style={{ color: '#76777d' }}>
            <span style={{ color: '#76777d' }}>{Icons.security}</span>
            Security Audit
          </div>
          <div className="nav-item" style={{ color: '#76777d' }}>
            <span style={{ color: '#76777d' }}>{Icons.help}</span>
            Help Center
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', flex: 1, minHeight: 'calc(100vh - 92px)', paddingBottom: '28px' }}>
        {children}
      </main>

      {/* Status bar */}
      <div className="status-bar" style={{ left: '240px' }}>
        <span>SYSTEM STATUS: <span className="status-ok">OPTIMAL</span> · ACTIVE NODE: FW360-TR-01</span>
        <span>LAST SYNC: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC · ENCRYPTION: AES-256-GCM</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider><DashboardShell>{children}</DashboardShell></SessionProvider>;
}