'use server';

import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { verifySession } from '@/lib/dal';
import { eq, and, sql } from 'drizzle-orm';

export async function addSubscription(data: {
  productId: number;
  productName: string;
  productEmoji: string;
  shade: string | null;
  frequency: number;
  price: number;
}) {
  const { userId } = await verifySession();

  // Remove existing subscription for same product+shade
  await db
    .delete(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.productId, data.productId),
        data.shade ? eq(subscriptions.shade, data.shade) : sql`${subscriptions.shade} IS NULL`,
      ),
    );

  await db.insert(subscriptions).values({
    userId,
    productId: data.productId,
    productName: data.productName,
    productEmoji: data.productEmoji,
    shade: data.shade,
    frequency: data.frequency,
    price: String(data.price),
  });
}

export async function removeSubscription(productId: number, shade: string | null) {
  const { userId } = await verifySession();
  await db
    .delete(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.productId, productId),
        shade ? eq(subscriptions.shade, shade) : sql`${subscriptions.shade} IS NULL`,
      ),
    );
}

export async function updateSubscriptionFrequency(
  productId: number,
  shade: string | null,
  frequency: number,
) {
  const { userId } = await verifySession();
  await db
    .update(subscriptions)
    .set({ frequency })
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.productId, productId),
        shade ? eq(subscriptions.shade, shade) : sql`${subscriptions.shade} IS NULL`,
      ),
    );
}

export async function getSubscriptions() {
  const { userId } = await verifySession();
  return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
}
