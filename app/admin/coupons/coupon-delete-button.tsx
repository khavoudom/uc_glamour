'use client';

import { useRouter } from 'next/navigation';
import ConfirmDelete from '@/components/admin/confirm-delete';
import { deleteCouponAction } from '@/app/actions/admin/coupons';

export default function CouponDeleteButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <ConfirmDelete
      onConfirm={async () => {
        await deleteCouponAction(id);
        router.refresh();
      }}
    />
  );
}
