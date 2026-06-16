import 'server-only';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getActiveCoupons() {
  return db.select().from(coupons).where(eq(coupons.isActive, true));
}

export async function validateCoupon(code: string) {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)))
    .limit(1);
  return coupon || null;
}
