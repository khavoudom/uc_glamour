import 'server-only';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllCoupons() {
  return db.select().from(coupons).orderBy(desc(coupons.id));
}

export async function getCouponById(id: number) {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return coupon ?? null;
}

export async function createCoupon(data: {
  code: string;
  discountPercent: number;
  isActive?: boolean;
}) {
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: data.code,
      discountPercent: data.discountPercent,
      isActive: data.isActive ?? true,
    })
    .returning();
  return coupon;
}

export async function updateCoupon(
  id: number,
  data: Partial<{
    code: string;
    discountPercent: number;
    isActive: boolean;
  }>,
) {
  const [coupon] = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
  return coupon;
}

export async function deleteCoupon(id: number) {
  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function toggleCouponActive(id: number) {
  const [coupon] = await db
    .select({ isActive: coupons.isActive })
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);
  if (!coupon) return null;

  const [updated] = await db
    .update(coupons)
    .set({ isActive: !coupon.isActive })
    .where(eq(coupons.id, id))
    .returning();
  return updated;
}
