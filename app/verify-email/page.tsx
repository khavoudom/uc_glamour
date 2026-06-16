import Link from 'next/link';
import { ResendForm } from './resend-form';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const { status, email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-5">
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-white px-9 py-10 text-center">
        {status === 'success' ? (
          <>
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="font-heading mb-2 text-xl font-normal text-text">Email Verified!</h1>
            <p className="mb-6 text-xs text-muted">
              Your email has been verified. You can now sign in to your account.
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-full bg-pink py-[13px] text-[13px] font-medium text-white no-underline"
            >
              Sign In
            </Link>
          </>
        ) : status === 'error' ? (
          <>
            <div className="mb-4 text-4xl">⏳</div>
            <h1 className="font-heading mb-2 text-xl font-normal text-text">Link Expired or Invalid</h1>
            <p className="mb-6 text-xs text-muted">
              This verification link is no longer valid. Request a new one below.
            </p>
            <ResendForm email={email ?? ''} />
          </>
        ) : (
          <>
            <div className="mb-4 text-4xl">✉️</div>
            <h1 className="font-heading mb-2 text-xl font-normal text-text">Check Your Email</h1>
            <p className="mb-6 text-xs text-muted">
              We sent a verification link to your email. Click the link to activate your account.
            </p>
            <p className="text-[10px] text-hint">
              Didn&apos;t receive it? Check your spam folder or request a new link below.
            </p>
            <div className="mt-6">
              <ResendForm email={email ?? ''} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
