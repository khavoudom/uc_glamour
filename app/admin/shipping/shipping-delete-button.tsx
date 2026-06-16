'use client';

import { useRouter } from 'next/navigation';
import ConfirmDelete from '@/components/admin/confirm-delete';
import { deleteShippingServiceAction } from '@/app/actions/admin/shipping';

export default function ShippingDeleteButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <ConfirmDelete
      onConfirm={async () => {
        await deleteShippingServiceAction(id);
        router.refresh();
      }}
    />
  );
}
