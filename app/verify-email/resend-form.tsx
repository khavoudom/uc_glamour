'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resendVerification } from '@/app/actions/auth';

export function ResendForm({ email: initialEmail }: { email: string }) {
  const [state, action, pending] = useActionState(resendVerification, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={initialEmail} />

      {!initialEmail && (
        <div className="mb-3">
          <label
            htmlFor="resend-email"
            className="mb-1 block text-left text-[11px] font-medium text-text"
          >
            Email
          </label>
          <input
            id="resend-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-sm border border-border-md px-3.5 py-2.5 text-[13px] text-text outline-none"
          />
        </div>
      )}

      {state?.message && (
        <p className="mb-3 rounded-sm bg-[#fde8e8] px-3 py-2 text-xs text-danger">
          {state.message}
        </p>
      )}
      {state?.success && (
        <p className="mb-3 rounded-sm bg-green-50 px-3 py-2 text-xs text-green-700">
          {state.success}
        </p>
      )}

      {!state?.success && (
        <button
          type="submit"
          disabled={pending}
          className={`w-full rounded-full py-3.25 text-[13px] font-medium text-white ${
            pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
          }`}
        >
          {pending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      )}

      {state?.success && (
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-block w-full rounded-full bg-pink py-3.25 text-[13px] font-medium text-white no-underline"
          >
            Go to Sign In
          </Link>
        </div>
      )}
    </form>
  );
}
