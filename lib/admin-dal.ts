import 'server-only';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function verifyAdminSession() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return { userId: parseInt(session.user.id, 10) };
}

export async function getOptionalAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') return null;
  return { userId: parseInt(session.user.id, 10) };
}

/**
 * Guard for Server Actions — redirects unauthenticated or non-admin users.
 * Import from this module instead of duplicating the logic in every action file.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/');
}
