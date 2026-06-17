'use client';

import { Suspense, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn as googleSignIn } from 'next-auth/react';
import { signup, type SignupState } from '@/app/actions/auth';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [state, action, pending] = useActionState<SignupState, FormData>(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-5">
      <div className="w-full max-w-95 rounded-lg border border-border bg-white px-9 py-10">
        <div className="mb-7 text-center">
          <h1 className="font-heading mb-1.5 text-[28px] font-normal text-text">
            Glam<em className="text-pink not-italic">our</em>
          </h1>
          <p className="text-xs text-muted">Create your account and start shopping</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="name" className="mb-1 block text-[11px] font-medium text-text">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full rounded-sm border border-border-md px-3.5 py-2.5 text-[13px] text-text outline-none"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-[11px] text-danger">{state.errors.name.join(', ')}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] font-medium text-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-sm border border-border-md px-3.5 py-2.5 text-[13px] text-text outline-none"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-[11px] text-danger">{state.errors.email.join(', ')}</p>
            )}
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
              placeholder="••••••••"
              className="w-full rounded-sm border border-border-md px-3.5 py-2.5 text-[13px] text-text outline-none"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-[11px] text-danger">{state.errors.password.join(', ')}</p>
            )}
            <p className="mt-1 text-[10px] text-hint">
              At least 8 characters with a letter and a number
            </p>
          </div>

          {state?.message && !state?.errors && (
            <p className="rounded-sm bg-[#fde8e8] px-3 py-2 text-xs text-danger">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`mt-1 w-full rounded-full py-3.25 text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-md" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-hint">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => googleSignIn('google', { redirectTo: callbackUrl || '/' })}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-border-md bg-white py-3.25 text-[13px] font-medium text-text transition-colors hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center text-xs text-muted">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="cursor-pointer border-none bg-none text-xs font-medium text-pink"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
