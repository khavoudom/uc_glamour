import 'server-only';
import { db } from '@/lib/db';
import { orders, orderItems, users } from '@/lib/db/schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import type { OrderSummary, OrderInvoice, OrderItemLine } from '@/lib/types';

export async function getAllOrders() {
  return db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      couponDiscount: orders.couponDiscount,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      paymentMethod: orders.paymentMethod,
      paymentId: orders.paymentId,
      shippingName: orders.shippingName,
      shippingEmail: orders.shippingEmail,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingZip: orders.shippingZip,
      shippingCountry: orders.shippingCountry,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      couponDiscount: orders.couponDiscount,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      paymentMethod: orders.paymentMethod,
      paymentId: orders.paymentId,
      shippingName: orders.shippingName,
      shippingEmail: orders.shippingEmail,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingZip: orders.shippingZip,
      shippingCountry: orders.shippingCountry,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return { ...order, items };
}

export async function getOrderCount() {
  const [result] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  return Number(result?.count ?? 0);
}

export async function getTotalRevenue() {
  const [result] = await db
    .select({
      total: sql<string>`COALESCE(SUM(total), 0)`,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, 'Paid'));
  return Number(result?.total ?? 0);
}

export async function updateOrderPaymentStatus(orderId: number, paymentStatus: string) {
  const [order] = await db
    .update(orders)
    .set({ paymentStatus })
    .where(eq(orders.id, orderId))
    .returning();
  return order;
}

export async function updateOrderFulfillmentStatus(orderId: number, fulfillmentStatus: string) {
  const [order] = await db
    .update(orders)
    .set({ fulfillmentStatus })
    .where(eq(orders.id, orderId))
    .returning();
  return order;
}

export async function getOrdersByUserId(userId: number): Promise<OrderSummary[]> {
  const rawOrders = await db
    .select({
      id: orders.id,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      couponDiscount: orders.couponDiscount,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  if (rawOrders.length === 0) return [];

  const orderIds = rawOrders.map((o) => o.id);
  const counts = await db
    .select({
      orderId: orderItems.orderId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = new Map(counts.map((c) => [c.orderId, c.count]));

  return rawOrders.map((o) => ({
    ...o,
    paymentStatus: o.paymentStatus as OrderSummary['paymentStatus'],
    fulfillmentStatus: o.fulfillmentStatus as OrderSummary['fulfillmentStatus'],
    itemCount: countMap.get(o.id) ?? 0,
  }));
}

export async function getOrderInvoiceById(
  orderId: number,
  userId: number,
): Promise<OrderInvoice | null> {
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      couponDiscount: orders.couponDiscount,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      paymentMethod: orders.paymentMethod,
      paymentId: orders.paymentId,
      shippingName: orders.shippingName,
      shippingEmail: orders.shippingEmail,
      shippingPhone: orders.shippingPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingZip: orders.shippingZip,
      shippingCountry: orders.shippingCountry,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      emoji: orderItems.emoji,
      shade: orderItems.shade,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    paymentStatus: order.paymentStatus as OrderInvoice['paymentStatus'],
    fulfillmentStatus: order.fulfillmentStatus as OrderInvoice['fulfillmentStatus'],
    items,
  };
}
