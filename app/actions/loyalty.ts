'use server';

import { db } from '@/lib/db';
import { loyaltyTransactions } from '@/lib/db/schema';
import { getOptionalCustomerSession } from '@/lib/dal';
import { updateLoyaltyPoints } from '@/lib/data-access/users';
import { eq } from 'drizzle-orm';

export async function addLoyaltyPoints(amount: number, reference?: string) {
  const session = await getOptionalCustomerSession();
  if (!session) return null;

  const user = await updateLoyaltyPoints(session.userId, amount);
  if (!user) return null;

  await db.insert(loyaltyTransactions).values({
    userId: session.userId,
    points: amount,
    type: 'earned',
    reference: reference ?? null,
  });

  return {
    points: user.loyaltyPoints,
    tier: user.loyaltyTier,
  };
}

export async function redeemLoyaltyPoints(points: number) {
  const session = await getOptionalCustomerSession();
  if (!session) return null;

  const user = await updateLoyaltyPoints(session.userId, -points);
  if (!user) return null;

  await db.insert(loyaltyTransactions).values({
    userId: session.userId,
    points: -points,
    type: 'redeemed',
    reference: null,
  });

  return {
    points: user.loyaltyPoints,
    tier: user.loyaltyTier,
  };
}

export async function getLoyaltyData() {
  const session = await getOptionalCustomerSession();
  if (!session) {
    return { points: 0, tier: 'Bronze' };
  }

  const { getUserById } = await import('@/lib/data-access/users');
  const user = await getUserById(session.userId);
  if (!user) return { points: 0, tier: 'Bronze' };

  return {
    points: user.loyaltyPoints,
    tier: user.loyaltyTier,
  };
}
