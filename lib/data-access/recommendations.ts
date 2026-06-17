import 'server-only';
import { db } from '@/lib/db';
import { orderItems, orders, products } from '@/lib/db/schema';
import { eq, desc, inArray, ne, and } from 'drizzle-orm';

export async function getPurchaseHistory(userId: number) {
  const rows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      category: products.category,
      brand: products.brand,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.userId, userId));
  return rows;
}

export async function getRecommendations(userId: number, category?: string) {
  const purchased = await db
    .select({
      category: products.category,
      productId: products.id,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.userId, userId));

  if (purchased.length === 0) {
    const result = await db
      .select()
      .from(products)
      .where(category ? eq(products.category, category) : undefined)
      .orderBy(desc(products.rating))
      .limit(5);
    return result;
  }

  const purchasedIds = purchased.map((p) => p.productId);
  const categories = [...new Set(purchased.map((p) => p.category))];
  const filterCategories = category ? [category] : categories;

  const result = await db
    .select()
    .from(products)
    .where(and(inArray(products.category, filterCategories), ne(products.id, purchasedIds[0])))
    .orderBy(desc(products.rating))
    .limit(5);
  return result;
}
