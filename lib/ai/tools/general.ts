import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

export const setLanguageTool = tool({
  description: "Set the user's preferred language for future conversations.",
  inputSchema: zodSchema(
    z.object({
      language: z.string().describe('Language code (en, km, zh, fr, etc.)'),
    }),
  ),
  execute: async ({ language }: { language: string }) => {
    return { language, set: true };
  },
});

export const buildRoutineTool = tool({
  description: 'Build a multi-product routine or look based on user goals.',
  inputSchema: zodSchema(
    z.object({
      routineType: z.enum(['skincare', 'makeup', 'complete_look']),
      goal: z.string().describe('e.g., anti-aging, dry skin, bridal, everyday'),
    }),
  ),
  execute: async ({ routineType }: { routineType: string }) => {
    let categoryFilter: string[];
    if (routineType === 'skincare') {
      categoryFilter = ['Skincare'];
    } else if (routineType === 'makeup') {
      categoryFilter = ['Face', 'Eyes', 'Lips'];
    } else {
      categoryFilter = ['Lips', 'Face', 'Eyes', 'Skincare'];
    }
    const allProducts = await db
      .select()
      .from(products)
      .where(inArray(products.category, categoryFilter))
      .limit(10);
    return {
      routineType,
      products: allProducts.map((p) => ({
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
