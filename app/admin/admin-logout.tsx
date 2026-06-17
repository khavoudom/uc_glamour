'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ConfirmModal from '@/components/confirm-modal';

export default function AdminLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    setShowConfirm(false);
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={pending}
        className="px-4 py-1.5 rounded-lg border border-border bg-bg text-text text-xs cursor-pointer font-sans disabled:opacity-50"
      >
        {pending ? 'Logging out...' : 'Log out'}
      </button>
      <ConfirmModal
        open={showConfirm}
        title="Sign out?"
        message="Are you sure you want to sign out of the admin panel?"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
