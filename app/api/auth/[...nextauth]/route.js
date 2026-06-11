import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const handler = NextAuth({
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
          const client = await pool.connect();
          const result = await client.query(
            'SELECT * FROM investigators WHERE email = $1',
            [credentials.email.toLowerCase().trim()]
          );
          client.release();
          if (result.rows.length === 0) return null;
          const investigator = result.rows[0];
          const passwordMatch = await bcrypt.compare(credentials.password, investigator.password_hash);
          if (!passwordMatch) return null;
          return { id: String(investigator.id), email: investigator.email, role: investigator.role };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (token) { session.user.role = token.role; session.user.id = token.id; }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };