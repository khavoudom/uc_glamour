import 'dotenv/config';
import { db } from '../lib/db';
import { products, shades, reviews, coupons, users, shippingServices } from '../lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import {
  products as staticProducts,
  reviews as staticReviews,
  coupons as staticCoupons,
} from '../lib/data';
import { logger } from '../lib/logger';

const log = logger('scripts/seed');

async function seed() {
  log.info('Seeding database...');

  // Clear existing data
  await db.delete(shades);
  await db.delete(reviews);
  await db.delete(coupons);
  await db.delete(shippingServices);
  await db.delete(products);

  // Seed products with their shades
  for (const p of staticProducts) {
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

    // Store mapping from static id to db id
    idMap.set(p.id, inserted.id);

    // Insert shades for this product
    for (const s of p.shades) {
      await db.insert(shades).values({
        productId: inserted.id,
        name: s.name,
        hex: s.hex,
        stock: s.stock,
        sku: s.sku ?? null,
      });
    }

    log.info(`✓ ${p.name}`);
  }

  // Seed reviews using the id mapping
  for (const r of staticReviews) {
    const dbProductId = idMap.get(r.productId);
    if (!dbProductId) continue;

    await db.insert(reviews).values({
      productId: dbProductId,
      reviewerName: r.reviewerName,
      isVerified: r.isVerified,
      date: r.date,
      rating: r.rating,
      body: r.body,
      helpful: r.helpful,
      notHelpful: r.notHelpful,
    });
  }
  log.info(`✓ ${staticReviews.length} reviews`);

  // Seed coupons
  for (const c of staticCoupons) {
    await db.insert(coupons).values({
      code: c.code,
      discountPercent: c.discountPercent,
      isActive: c.isActive,
    });
  }
  log.info(`✓ ${staticCoupons.length} coupons`);

  // Seed shipping services
  const defaultServices = [
    { name: 'Standard Shipping', price: '0', estimatedDelivery: '5-7 business days', isActive: true },
    { name: 'Express Shipping', price: '9.99', estimatedDelivery: '2-3 business days', isActive: true },
    { name: 'Next Day Delivery', price: '19.99', estimatedDelivery: 'Next business day', isActive: true },
  ];
  for (const svc of defaultServices) {
    await db.insert(shippingServices).values(svc);
  }
  log.info(`✓ ${defaultServices.length} shipping services`);

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  if (adminEmail) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing) {
      // Promote existing user to admin
      await db.update(users).set({ role: 'admin' }).where(eq(users.email, adminEmail));
      log.info(`✓ Promoted ${adminEmail} to admin`);
    } else {
      // Create admin user
      const hashedPassword = await hash(adminPassword, 12);
      await db.insert(users).values({
        name: 'Admin',
        email: adminEmail,
        hashedPassword,
        role: 'admin',
      });
      log.info(`✓ Created admin user: ${adminEmail} / ${adminPassword}`);
    }
  }

  log.info('Seed complete!');
}

const idMap = new Map<string, number>();

seed()
  .catch((e) => {
    log.error(
      'Seed failed',
      e instanceof Error ? { message: e.message, stack: e.stack } : { error: e },
    );
    process.exit(1);
  })
  .then(() => process.exit(0));
