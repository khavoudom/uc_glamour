import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { lte } from 'drizzle-orm';

export const findGiftsTool = tool({
  description: 'Find gift ideas based on occasion, budget, and preferences.',
  inputSchema: zodSchema(
    z.object({
      occasion: z.enum(['birthday', 'anniversary', 'holiday', 'wedding', 'just_because']),
      budget: z.number(),
      recipient: z.enum(['friend', 'partner', 'parent', 'coworker', 'other']).optional(),
      preferences: z.string().optional(),
    }),
  ),
  execute: async ({ budget }: { budget: number }) => {
    const giftProducts = await db
      .select()
      .from(products)
      .where(lte(products.price, String(budget)))
      .limit(8);
    return {
      products: giftProducts.map((p) => ({
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
