import 'server-only';
import { db } from '@/lib/db';
import { products, shades } from '@/lib/db/schema';
import { eq, like, or, desc, inArray } from 'drizzle-orm';

export type DbProduct = typeof products.$inferSelect;

export async function getAllProducts() {
  const result = await db.select().from(products).orderBy(desc(products.createdAt));
  const productIds = result.map((p) => p.id);

  const allShades =
    productIds.length > 0
      ? await db.select().from(shades).where(inArray(shades.productId, productIds))
      : [];
  const shadesByProduct = new Map<number, typeof allShades>();
  for (const s of allShades) {
    const arr = shadesByProduct.get(s.productId) ?? [];
    arr.push(s);
    shadesByProduct.set(s.productId, arr);
  }

  return result.map((product) => ({
    ...product,
    shades: shadesByProduct.get(product.id) ?? [],
  }));
}

export async function getProductById(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!product) return null;

  const productShades = await db.select().from(shades).where(eq(shades.productId, product.id));

  return { ...product, shades: productShades };
}

export async function searchProducts(query: string) {
  const pattern = `%${query}%`;
  const result = await db
    .select()
    .from(products)
    .where(or(like(products.name, pattern), like(products.brand, pattern)))
    .limit(5);

  const productIds = result.map((p) => p.id);
  const allShades =
    productIds.length > 0
      ? await db.select().from(shades).where(inArray(shades.productId, productIds))
      : [];
  const shadesByProduct = new Map<number, typeof allShades>();
  for (const s of allShades) {
    const arr = shadesByProduct.get(s.productId) ?? [];
    arr.push(s);
    shadesByProduct.set(s.productId, arr);
  }

  return result.map((product) => ({
    ...product,
    shades: shadesByProduct.get(product.id) ?? [],
  }));
}
