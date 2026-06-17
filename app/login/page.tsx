'use client';

import { Suspense, useEffect, useState, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { login, type LoginState } from '@/app/actions/auth';
import { Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(session?.user?.role === 'admin' ? '/admin' : '/');
    }
  }, [status, session, router]);

  // Clear password field when login fails (keep email)
  useEffect(() => {
    if (state?.message) {
      setPassword('');
    }
  }, [state]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-5">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-5">
      <div className="w-full max-w-[380px] rounded-lg border border-border bg-white px-9 py-10">
        <div className="mb-7 text-center">
          <h1 className="font-heading mb-1.5 text-[28px] font-normal text-text">
            Glam<em className="text-pink not-italic">our</em>
          </h1>
          <p className="text-xs text-muted">Welcome back — sign in to your account</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] font-medium text-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-[11px] font-medium text-text">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none"
            />
          </div>

          {state?.message && (
            <p className="rounded-sm bg-[#fde8e8] px-3 py-2 text-xs text-danger">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`mt-1 w-full rounded-full py-[13px] text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="cursor-pointer border-none bg-none text-xs font-medium text-pink"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
