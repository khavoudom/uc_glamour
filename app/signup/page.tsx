'use client';

import { Suspense, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signup, type SignupState } from '@/app/actions/auth';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [state, action, pending] = useActionState<SignupState, FormData>(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-5">
      <div className="w-full max-w-[380px] rounded-lg border border-border bg-white px-9 py-10">
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
              className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none"
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
              className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none"
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
              className="w-full rounded-sm border border-border-md px-3.5 py-[10px] text-[13px] text-text outline-none"
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
            className={`mt-1 w-full rounded-full py-[13px] text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

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
