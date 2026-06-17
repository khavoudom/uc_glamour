'use server';

import { db } from '@/lib/db';
import { cartItems, products } from '@/lib/db/schema';
import { verifyCustomerSession, getOptionalCustomerSession } from '@/lib/dal';
import { eq, and, sql } from 'drizzle-orm';

export async function addToCart(productId: number, shade: string | null, quantity: number) {
  const { userId } = await verifyCustomerSession();

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId),
        shade ? eq(cartItems.shade, shade) : sql`${cartItems.shade} IS NULL`,
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      userId,
      productId,
      shade,
      quantity,
    });
  }
}

export async function removeFromCart(productId: number, shade: string | null) {
  const { userId } = await verifyCustomerSession();

  await db
    .delete(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId),
        shade ? eq(cartItems.shade, shade) : sql`${cartItems.shade} IS NULL`,
      ),
    );
}

export async function updateCartQuantity(productId: number, shade: string | null, delta: number) {
  const { userId } = await verifyCustomerSession();

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId),
        shade ? eq(cartItems.shade, shade) : sql`${cartItems.shade} IS NULL`,
      ),
    )
    .limit(1);

  if (existing.length === 0) return;

  const newQty = existing[0].quantity + delta;
  if (newQty <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing[0].id));
  }
}

export async function getCart() {
  const { userId } = await verifyCustomerSession();

  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));

  // Attach product details
  const enriched = await Promise.all(
    items.map(async (item) => {
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

  return enriched;
}

export async function clearCart() {
  const { userId } = await verifyCustomerSession();
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function mergeGuestCart(
  guestItems: { productId: number; shade: string | null; quantity: number }[],
) {
  const session = await getOptionalCustomerSession();
  if (!session) return;

  const { userId } = session;

  for (const item of guestItems) {
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, item.productId),
          item.shade ? eq(cartItems.shade, item.shade) : sql`${cartItems.shade} IS NULL`,
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + item.quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({
        userId,
        productId: item.productId,
        shade: item.shade,
        quantity: item.quantity,
      });
    }
  }
}
