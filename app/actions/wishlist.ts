'use server';

import { db } from '@/lib/db';
import { wishlistItems } from '@/lib/db/schema';
import { getOptionalCustomerSession } from '@/lib/dal';
import { eq, and } from 'drizzle-orm';

export async function toggleWishlist(productId: number) {
  const session = await getOptionalCustomerSession();
  if (!session) return { added: false, removed: false };

  const existing = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, session.userId), eq(wishlistItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
    return { added: false, removed: true };
  }

  await db.insert(wishlistItems).values({
    userId: session.userId,
    productId,
  });
  return { added: true, removed: false };
}

export async function getWishlist() {
  const session = await getOptionalCustomerSession();
  if (!session) return [];
  const items = await db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, session.userId));
  return items.map((i) => i.productId);
}
