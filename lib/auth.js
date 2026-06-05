import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Validate email format before DB query
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) return null;

        // Limit email length to prevent abuse
        if (credentials.email.length > 254 || credentials.password.length > 128) return null;

        const result = await query(
          'SELECT * FROM investigators WHERE email = $1',
          [credentials.email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
          // Run bcrypt anyway to prevent timing attacks
          await bcrypt.compare('dummy', '$2b$10$dummyhashtopreventtimingattack00000000000');
          return null;
        }

        const investigator = result.rows[0];
        const passwordMatch = await bcrypt.compare(credentials.password, investigator.password_hash);
        if (!passwordMatch) return null;

        return {
          id: String(investigator.id),
          email: investigator.email,
          role: investigator.role,
        };
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
  session: {
  strategy: 'jwt',
  maxAge: 8 * 60 * 60,
},
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,    // JS cannot access the cookie
        sameSite: 'strict', // CSRF protection
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        path: '/',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};