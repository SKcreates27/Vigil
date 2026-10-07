import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Single source of truth for the NextAuth config — this previously
// duplicated lib/auth.js with its own inline config and a separate `pg`
// Pool, which meant two different DB clients were used for the same
// purpose depending on which code path ran. Routed through lib/auth.js now.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
