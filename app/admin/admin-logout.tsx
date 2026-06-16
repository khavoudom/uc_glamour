'use client';

import { useActionState } from 'react';
import { logout } from '@/app/actions/auth';

export default function AdminLogout() {
  const [, action, pending] = useActionState(logout, undefined);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-[6px] rounded-lg border border-border bg-bg text-text text-[12px] cursor-pointer font-sans disabled:opacity-50"
      >
        {pending ? 'Logging out...' : 'Log out'}
      </button>
    </form>
  );
}
