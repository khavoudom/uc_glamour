'use client';

import { useRouter } from 'next/navigation';
import { toggleVerifiedAction } from '@/app/actions/admin/reviews';

export default function ReviewToggleButton({
  id,
  isVerified,
}: {
  id: number;
  isVerified: boolean;
}) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await toggleVerifiedAction(id);
        router.refresh();
      }}
      className="px-3 py-1 rounded-[10px] border-none text-[10px] font-medium cursor-pointer font-sans"
      style={{
        background: isVerified ? 'var(--color-success-lt)' : 'var(--color-bg)',
        color: isVerified ? 'var(--color-success)' : 'var(--color-muted)',
      }}
    >
      {isVerified ? 'Verified' : 'Unverified'}
    </button>
  );
}
