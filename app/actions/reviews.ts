'use server';

import { z } from 'zod';
import { verifyCustomerSession } from '@/lib/dal';
import { createReview, hasUserReviewedProduct, getUserName } from '@/lib/data-access/reviews';
import { getOrderInvoiceById } from '@/lib/data-access/orders';

const DELIVERED_STATUSES = ['Delivered', 'Completed'];

const ReviewSchema = z.object({
  productId: z.coerce.number().positive(),
  orderId: z.coerce.number().positive(),
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export type CreateReviewState =
  | {
      errors?: { rating?: string[]; body?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function createReviewAction(
  prevState: CreateReviewState,
  formData: FormData,
): Promise<CreateReviewState> {
  const { userId } = await verifyCustomerSession();

  const validated = ReviewSchema.safeParse({
    productId: formData.get('productId'),
    orderId: formData.get('orderId'),
    rating: Number(formData.get('rating')),
    body: formData.get('body'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { productId, orderId, rating, body } = validated.data;

  const order = await getOrderInvoiceById(orderId, userId);
  if (!order) {
    return { message: 'Order not found.' };
  }

  if (!DELIVERED_STATUSES.includes(order.fulfillmentStatus)) {
    return { message: 'You can only review products after they have been delivered.' };
  }

  const item = order.items.find((i) => i.productId === productId);
  if (!item) {
    return { message: 'This product is not part of your order.' };
  }

  const alreadyReviewed = await hasUserReviewedProduct(userId, productId);
  if (alreadyReviewed) {
    return { message: 'You have already reviewed this product.' };
  }

  const userName = await getUserName(userId);
  if (!userName) {
    return { message: 'User not found.' };
  }

  await createReview({
    productId,
    userId,
    reviewerName: userName,
    isVerified: true,
    rating,
    body,
  });

  return { success: true, message: 'Review submitted!' };
}
