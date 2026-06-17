import 'server-only';
import { db } from '@/lib/db';
import { productAlerts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createAlert(data: {
  userId: number;
  productId: number;
  type: 'back_in_stock' | 'price_drop';
  targetPrice?: number | null;
}) {
  const [alert] = await db
    .insert(productAlerts)
    .values({
      userId: data.userId,
      productId: data.productId,
      type: data.type,
      targetPrice: data.targetPrice ? String(data.targetPrice) : null,
    })
    .returning();
  return alert;
}

export async function getAlertsByUserId(userId: number) {
  return db.select().from(productAlerts).where(eq(productAlerts.userId, userId));
}

export async function removeAlert(alertId: number) {
  await db.delete(productAlerts).where(eq(productAlerts.id, alertId));
}

export async function getAlertByProductAndUser(userId: number, productId: number) {
  const [alert] = await db
    .select()
    .from(productAlerts)
    .where(
      and(
        eq(productAlerts.userId, userId),
        eq(productAlerts.productId, productId),
        eq(productAlerts.isActive, true),
      ),
    )
    .limit(1);
  return alert ?? null;
}
