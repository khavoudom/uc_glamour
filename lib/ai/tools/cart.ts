import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { getCartByUserId } from '@/lib/data-access/cart';

export const showCartTool = tool({
  description: "Show items in the user's shopping cart.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    const items = await getCartByUserId(session.userId);
    return { products: items, count: items.length };
  },
});

export const checkAbandonedCartTool = tool({
  description: 'Check if user has items in their cart from a previous session.',
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { hasItems: false };
    const items = await getCartByUserId(session.userId);
    return { products: items, count: items.length, hasItems: items.length > 0 };
  },
});
