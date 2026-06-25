import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { logger } from '../logger';
import { users, products, shades } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { products as staticProducts } from '../data';

const log = logger('lib/seed/auto-seed');

export async function autoSeed(db: BetterSQLite3Database<typeof import('../db/schema')>) {
  log.info('Running auto-seed...');

  // --- seed admin ---
  try {
    const adminEmail = 'admin@glamour.com';
    const adminPassword = '12345678';
    const hashedPassword = await hash(adminPassword, 12);
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing) {
      await db
        .update(users)
        .set({ hashedPassword, role: 'admin' })
        .where(eq(users.email, adminEmail));
    } else {
      await db.insert(users).values({
        name: 'Admin',
        email: adminEmail,
        hashedPassword,
        role: 'admin',
        emailVerified: true,
      });
    }
    log.info('Admin user ready');
  } catch (e) {
    log.error('seed-admin failed', { message: (e as Error).message });
  }

  // --- seed products & shades ---
  try {
    const existing = await db.select({ name: products.name }).from(products);
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

    for (const p of staticProducts) {
      if (existingNames.has(p.name.toLowerCase())) continue;

      const [inserted] = await db
        .insert(products)
        .values({
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: String(p.price),
          originalPrice: p.originalPrice ? String(p.originalPrice) : null,
          emoji: p.emoji,
          description: p.description,
          rating: String(p.rating),
          reviewCount: p.reviewCount,
          badge: p.badge,
          isNew: p.isNew,
          isSubscriptionEligible: p.isSubscriptionEligible ?? false,
        })
        .returning();

      for (const s of p.shades) {
        await db.insert(shades).values({
          productId: inserted.id,
          name: s.name,
          hex: s.hex,
          stock: s.stock,
          sku: s.sku ?? null,
        });
      }
    }
    log.info('Products seeded');
  } catch (e) {
    log.error('seed-products failed', { message: (e as Error).message });
  }

  log.info('Auto-seed complete');
}
