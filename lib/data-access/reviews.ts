import 'server-only';
import { db } from '@/lib/db';
import { reviews, products, users } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export async function getReviewsByProduct(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.date));
}

export async function createReview(data: {
  productId: number;
  userId?: number;
  reviewerName: string;
  isVerified?: boolean;
  rating: number;
  body: string;
}) {
  const [review] = await db
    .insert(reviews)
    .values({
      productId: data.productId,
      userId: data.userId,
      reviewerName: data.reviewerName,
      isVerified: data.isVerified ?? false,
      date: new Date().toISOString().split('T')[0],
      rating: data.rating,
      body: data.body,
    })
    .returning();
  return review;
}

export async function getAllReviews() {
  return db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      productName: products.name,
      productEmoji: products.emoji,
      reviewerName: reviews.reviewerName,
      isVerified: reviews.isVerified,
      date: reviews.date,
      rating: reviews.rating,
      body: reviews.body,
      helpful: reviews.helpful,
      notHelpful: reviews.notHelpful,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.date));
}

export async function toggleReviewVerified(id: number) {
  const [review] = await db
    .select({ isVerified: reviews.isVerified })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) return null;

  const [updated] = await db
    .update(reviews)
    .set({ isVerified: !review.isVerified })
    .where(eq(reviews.id, id))
    .returning();
  return updated;
}

export async function deleteReview(id: number) {
  await db.delete(reviews).where(eq(reviews.id, id));
}

export async function getReviewStatsByProduct(productId: number) {
  const rows = await db
    .select({
      rating: reviews.rating,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .groupBy(reviews.rating);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;

  for (const row of rows) {
    distribution[row.rating] = row.count;
    total += row.count;
    sum += row.rating * row.count;
  }

  return {
    average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    total,
    distribution,
  };
}

export async function hasUserReviewedProduct(userId: number, productId: number) {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));

  return (result?.count ?? 0) > 0;
}

export async function getUserName(userId: number) {
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.name ?? null;
}
