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

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/');
}
