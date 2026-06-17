import { auth } from '@/auth';
import { db } from '@/lib/db';
import { cartItems, wishlistItems, subscriptions, products, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === 'admin') {
    return Response.json({
      cart: [],
      wishlist: [],
      subscriptions: [],
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
    });
  }

  const userId = parseInt(session.user.id, 10);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  const cart = await db.select().from(cartItems).where(eq(cartItems.userId, userId));

  // Enrich cart with product details
  const enrichedCart = await Promise.all(
    cart.map(async (item) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);
      return {
        productId: item.productId,
        name: product?.name ?? '',
        brand: product?.brand ?? '',
        price: Number(product?.price ?? 0),
        originalPrice: product?.originalPrice ? Number(product.originalPrice) : undefined,
        emoji: product?.emoji ?? '',
        shade: item.shade,
        quantity: item.quantity,
      };
    }),
  );

  const wishlist = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  const userSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return Response.json({
    cart: enrichedCart,
    wishlist: wishlist.map((w) => w.productId),
    subscriptions: userSubscriptions.map((s) => ({
      productId: s.productId,
      productName: s.productName,
      productEmoji: s.productEmoji,
      shade: s.shade,
      frequency: s.frequency,
      price: Number(s.price),
    })),
    loyaltyPoints: user?.loyaltyPoints ?? 0,
    loyaltyTier: user?.loyaltyTier ?? 'Bronze',
  });
}
