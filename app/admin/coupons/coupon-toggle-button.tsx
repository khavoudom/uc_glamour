'use client';

import { useRouter } from 'next/navigation';
import { toggleCouponAction } from '@/app/actions/admin/coupons';

export default function CouponToggleButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await toggleCouponAction(id);
        router.refresh();
      }}
      className="px-3 py-1 rounded-[10px] border-none text-[10px] font-medium cursor-pointer font-sans"
      style={{
        background: isActive ? 'var(--color-success-lt)' : 'var(--color-bg)',
        color: isActive ? 'var(--color-success)' : 'var(--color-muted)',
      }}
    >
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}
