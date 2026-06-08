export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#131b2e"/>
      <path d="M16 4L28 9V17C28 23.6 22.6 27.8 16 30C9.4 27.8 4 23.6 4 17V9L16 4Z" fill="none" stroke="#4da3ff" strokeWidth="1.5"/>
      <path d="M16 4L28 9V17C28 23.6 22.6 27.8 16 30C9.4 27.8 4 23.6 4 17V9L16 4Z" fill="rgba(77,163,255,0.08)"/>
      <circle cx="16" cy="16" r="4" fill="#4da3ff" opacity="0.9"/>
      <line x1="16" y1="12" x2="16" y2="8" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="14" x2="23" y2="11" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="18" x2="23" y2="21" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="20" x2="16" y2="24" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="9" y2="21" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="9" y2="11" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}