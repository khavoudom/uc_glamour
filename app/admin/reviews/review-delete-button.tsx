'use client';

import { useRouter } from 'next/navigation';
import ConfirmDelete from '@/components/admin/confirm-delete';
import { deleteReviewAction } from '@/app/actions/admin/reviews';

export default function ReviewDeleteButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <ConfirmDelete
      onConfirm={async () => {
        await deleteReviewAction(id);
        router.refresh();
      }}
    />
  );
}
