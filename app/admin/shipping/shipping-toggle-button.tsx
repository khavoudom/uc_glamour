'use client';

import { useRouter } from 'next/navigation';
import { toggleShippingServiceAction } from '@/app/actions/admin/shipping';

export default function ShippingToggleButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await toggleShippingServiceAction(id);
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
