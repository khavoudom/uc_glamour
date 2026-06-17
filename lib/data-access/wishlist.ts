import 'server-only';
import { db } from '@/lib/db';
import { wishlistItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getWishlistByUserId(userId: number) {
  const items = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));
  return items.map((i) => i.productId);
}

export async function addWishlistItem(userId: number, productId: number) {
  const [item] = await db.insert(wishlistItems).values({ userId, productId }).returning();
  return item;
}

export async function removeWishlistItem(userId: number, productId: number) {
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
}

export async function isInWishlist(userId: number, productId: number) {
  const [item] = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1);
  return !!item;
}
