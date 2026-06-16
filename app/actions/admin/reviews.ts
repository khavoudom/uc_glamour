'use server';

import { requireAdmin } from '@/lib/admin-dal';
import { toggleReviewVerified, deleteReview } from '@/lib/data-access/reviews';

export async function toggleVerifiedAction(reviewId: number) {
  await requireAdmin();
  await toggleReviewVerified(reviewId);
}

export async function deleteReviewAction(reviewId: number) {
  await requireAdmin();
  await deleteReview(reviewId);
}
