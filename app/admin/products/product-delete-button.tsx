'use client';

import { useRouter } from 'next/navigation';
import ConfirmDelete from '@/components/admin/confirm-delete';
import { deleteProductAction } from '@/app/actions/admin/products';

export default function ProductDeleteButton({ productId }: { productId: number }) {
  const router = useRouter();

  return (
    <ConfirmDelete
      onConfirm={async () => {
        await deleteProductAction(productId);
        router.refresh();
      }}
    />
  );
}
