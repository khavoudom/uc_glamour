import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) return null;

        const isValid = await compare(password, user.hashedPassword!);
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role as 'customer' | 'admin',
        };
      },
    }),
    Google,
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const email = user.email!;
          const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

          if (existing) {
            await db
              .update(users)
              .set({
                emailVerified: true,
                image: user.image ?? existing.image,
              })
              .where(eq(users.id, existing.id));
            user.id = String(existing.id);
            user.role = existing.role as 'customer' | 'admin';
          } else {
            const [newUser] = await db
              .insert(users)
              .values({
                name: user.name ?? 'User',
                email,
                emailVerified: true,
                image: user.image,
              })
              .returning({ id: users.id, role: users.role });
            user.id = String(newUser.id);
            user.role = newUser.role as 'customer' | 'admin';
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'admin';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});
