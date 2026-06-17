import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { getReviewsByProduct, getReviewStatsByProduct } from '@/lib/data-access/reviews';

export const getProductReviewsTool = tool({
  description: 'Get reviews for a product by product ID.',
  inputSchema: zodSchema(z.object({ productId: z.number() })),
  execute: async ({ productId }: { productId: number }) => {
    const reviews = await getReviewsByProduct(productId);
    return {
      reviews: reviews.slice(0, 10).map((r) => ({
        reviewerName: r.reviewerName,
        rating: r.rating,
        body: r.body,
        date: r.date,
        isVerified: r.isVerified,
      })),
    };
  },
});

export const summarizeReviewsTool = tool({
  description: 'Get review stats for a product.',
  inputSchema: zodSchema(z.object({ productId: z.number() })),
  execute: async ({ productId }: { productId: number }) => {
    const stats = await getReviewStatsByProduct(productId);
    return {
      averageRating: stats.average,
      totalReviews: stats.total,
      distribution: stats.distribution,
    };
  },
});
