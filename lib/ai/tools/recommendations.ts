import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { getRecommendations } from '@/lib/data-access/recommendations';

export const getRecommendationsTool = tool({
  description: 'Get personalized product recommendations based on purchase history.',
  inputSchema: zodSchema(
    z.object({
      category: z.string().optional().describe('Optional category filter'),
    }),
  ),
  execute: async ({ category }: { category?: string }) => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    const recs = await getRecommendations(session.userId, category);
    return {
      products: recs.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.price),
        emoji: p.emoji,
        rating: Number(p.rating),
      })),
    };
  },
});
