import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db'; // Import your optimized serverless query wrapper
import bcrypt from 'bcryptjs';

export const authOptions = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // Use your centralized Neon serverless query engine (bypasses TCP connection limits)
          const result = await query(
            'SELECT * FROM investigators WHERE email = $1',
            [credentials.email.toLowerCase().trim()]
          );
          
          if (result.rows.length === 0) return null;
          const investigator = result.rows[0];
          
          const passwordMatch = await bcrypt.compare(credentials.password, investigator.password_hash);
          if (!passwordMatch) return null;
          
          return { id: String(investigator.id), email: investigator.email, role: investigator.role };
        } catch (err) {
          console.error('Auth error inside serverless authorize:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { 
        token.role = user.role; 
        token.id = user.id; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token) { 
        session.user.role = token.role; 
        session.user.id = token.id; 
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};