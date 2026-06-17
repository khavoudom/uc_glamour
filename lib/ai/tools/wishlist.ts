import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import {
  getWishlistByUserId,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
} from '@/lib/data-access/wishlist';

async function getUserId(): Promise<number | null> {
  const { getOptionalCustomerSession } = await import('@/lib/dal');
  const session = await getOptionalCustomerSession();
  return session?.userId ?? null;
}

export const getWishlistTool = tool({
  description: "Show the user's wishlist.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    const productIds = await getWishlistByUserId(userId);
    return { productIds, count: productIds.length };
  },
});

export const addToWishlistTool = tool({
  description: 'Add a product to the wishlist.',
  inputSchema: zodSchema(z.object({ productId: z.number() })),
  execute: async ({ productId }: { productId: number }) => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    await addWishlistItem(userId, productId);
    return { success: true, productId };
  },
});

export const removeFromWishlistTool = tool({
  description: 'Remove a product from the wishlist.',
  inputSchema: zodSchema(z.object({ productId: z.number() })),
  execute: async ({ productId }: { productId: number }) => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    await removeWishlistItem(userId, productId);
    return { success: true, productId };
  },
});

export const checkWishlistTool = tool({
  description: 'Check if a product is in the wishlist.',
  inputSchema: zodSchema(z.object({ productId: z.number() })),
  execute: async ({ productId }: { productId: number }) => {
    const userId = await getUserId();
    if (!userId) return { inWishlist: false, productId };
    const inList = await isInWishlist(userId, productId);
    return { inWishlist: inList, productId };
  },
});
