import 'server-only';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Verify the user is authenticated. Redirects to login if not.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function verifySession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return {
    userId: parseInt(session.user.id, 10),
    isAuth: true as const,
  };
}

/**
 * Get the current session without redirecting.
 * Returns null if the user is not authenticated.
 */
export async function getOptionalSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    userId: parseInt(session.user.id, 10),
    isAuth: true as const,
  };
}
