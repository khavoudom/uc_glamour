import 'server-only';
import { db } from '@/lib/db';
import { products, shades, cartItems, reviews, wishlistItems, subscriptions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { clearCatalogCache } from '@/lib/chat/catalog';

export async function getAllProductsAdmin() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  return Promise.all(
    allProducts.map(async (p) => {
      const productShades = await db.select().from(shades).where(eq(shades.productId, p.id));
      return { ...p, shades: productShades };
    }),
  );
}

export async function getProductAdminById(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!product) return null;

  const productShades = await db.select().from(shades).where(eq(shades.productId, product.id));

  return { ...product, shades: productShades };
}

export async function createProduct(data: {
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice?: string | null;
  emoji: string;
  imageUrls?: string | null;
  description: string;
  rating?: string;
  reviewCount?: number;
  badge?: string | null;
  isNew?: boolean;
  isSubscriptionEligible?: boolean;
}) {
  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      brand: data.brand,
      category: data.category,
      price: data.price,
      originalPrice: data.originalPrice ?? null,
      emoji: data.emoji,
      imageUrls: data.imageUrls ?? null,
      description: data.description,
      rating: data.rating ?? '0',
      reviewCount: data.reviewCount ?? 0,
      badge: data.badge ?? null,
      isNew: data.isNew ?? false,
      isSubscriptionEligible: data.isSubscriptionEligible ?? false,
    })
    .returning();
  clearCatalogCache();
  return product;
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    brand: string;
    category: string;
    price: string;
    originalPrice: string | null;
    emoji: string;
    imageUrls: string | null;
    description: string;
    rating: string;
    reviewCount: number;
    badge: string | null;
    isNew: boolean;
    isSubscriptionEligible: boolean;
  }>,
) {
  const [product] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  clearCatalogCache();
  return product;
}

export async function deleteProduct(id: number) {
  await db.delete(cartItems).where(eq(cartItems.productId, id));
  await db.delete(reviews).where(eq(reviews.productId, id));
  await db.delete(wishlistItems).where(eq(wishlistItems.productId, id));
  await db.delete(shades).where(eq(shades.productId, id));
  await db.delete(subscriptions).where(eq(subscriptions.productId, id));
  await db.delete(products).where(eq(products.id, id));
  clearCatalogCache();
}

export async function addShade(
  productId: number,
  data: { name: string; hex: string; stock: number; sku?: string | null },
) {
  const [shade] = await db
    .insert(shades)
    .values({
      productId,
      name: data.name,
      hex: data.hex,
      stock: data.stock,
      sku: data.sku ?? null,
    })
    .returning();
  clearCatalogCache();
  return shade;
}

export async function updateShade(
  shadeId: number,
  data: Partial<{ name: string; hex: string; stock: number; sku: string | null }>,
) {
  const [shade] = await db.update(shades).set(data).where(eq(shades.id, shadeId)).returning();
  clearCatalogCache();
  return shade;
}

export async function deleteShade(shadeId: number) {
  await db.delete(shades).where(eq(shades.id, shadeId));
  clearCatalogCache();
}
