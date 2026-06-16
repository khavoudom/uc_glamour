import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export type UserRole = 'customer' | 'admin';

declare module 'next-auth' {
  interface User {
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
  }
}
