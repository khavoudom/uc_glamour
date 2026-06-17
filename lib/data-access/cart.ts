import 'server-only';
import { db } from '@/lib/db';
import { cartItems, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface CartItemEnriched {
  productId: number;
  name: string;
  brand: string;
  price: number;
  emoji: string;
  imageUrls: string[];
  shade: string | null;
  quantity: number;
}

export async function getCartByUserId(userId: number): Promise<CartItemEnriched[]> {
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));

  if (items.length === 0) return [];

  const enriched = await Promise.all(
    items.map(async (item) => {
      const [product] = await db
        .select({
          name: products.name,
          brand: products.brand,
          price: products.price,
          emoji: products.emoji,
          imageUrls: products.imageUrls,
        })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      let parsedUrls: string[] = [];
      if (product?.imageUrls) {
        try {
          const u = JSON.parse(product.imageUrls);
          if (Array.isArray(u)) parsedUrls = u;
        } catch {}
      }

      return {
        productId: item.productId,
        name: product?.name ?? '',
        brand: product?.brand ?? '',
        price: product ? Number(product.price) : 0,
        emoji: product?.emoji ?? '',
        imageUrls: parsedUrls,
        shade: item.shade,
        quantity: item.quantity,
      };
    }),
  );

  return enriched;
}
