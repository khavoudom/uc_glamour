import 'server-only';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

export async function verifyCustomerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  if (session.user.role === 'admin') {
    redirect('/admin');
  }
  return {
    userId: parseInt(session.user.id, 10),
    isAuth: true as const,
  };
}

export async function getOptionalSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    userId: parseInt(session.user.id, 10),
    isAuth: true as const,
  };
}

export async function getOptionalCustomerSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === 'admin') return null;
  return {
    userId: parseInt(session.user.id, 10),
    isAuth: true as const,
  };
}
