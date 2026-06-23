import 'server-only';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getTier } from '@/lib/types';

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      loyaltyPoints: users.loyaltyPoints,
      loyaltyTier: users.loyaltyTier,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.id));
}

export async function getUserById(id: number) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      loyaltyPoints: users.loyaltyPoints,
      loyaltyTier: users.loyaltyTier,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user || null;
}

export async function updateUserName(userId: number, name: string) {
  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name });
  return updated || null;
}

export async function updateLoyaltyPoints(userId: number, delta: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) return null;

  const newPoints = Math.max(0, user.loyaltyPoints + delta);
  const newTier = getTier(newPoints).name;

  const [updated] = await db
    .update(users)
    .set({
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
