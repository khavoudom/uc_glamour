import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { getOrdersByUserId, getOrderInvoiceById } from '@/lib/data-access/orders';

export const getOrderHistoryTool = tool({
  description: "Get the authenticated user's order history.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    const orders = await getOrdersByUserId(session.userId);
    return {
      orders: orders.map((o) => ({
        id: o.id,
        total: Number(o.total).toFixed(2),
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        itemCount: o.itemCount,
        createdAt: o.createdAt,
      })),
    };
  },
});

export const getOrderStatusTool = tool({
  description: 'Get status of a specific order by ID.',
  inputSchema: zodSchema(z.object({ orderId: z.number() })),
  execute: async ({ orderId }: { orderId: number }) => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    const order = await getOrderInvoiceById(orderId, session.userId);
    if (!order) return { error: 'Order not found.' };
    return {
      id: order.id,
      total: Number(order.total).toFixed(2),
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      items: order.items.map((i: { productName: string; quantity: number }) => ({
        productName: i.productName,
        quantity: i.quantity,
      })),
    };
  },
});

export const trackOrderTool = tool({
  description: 'Get shipping/fulfillment tracking info for an order.',
  inputSchema: zodSchema(z.object({ orderId: z.number() })),
  execute: async ({ orderId }: { orderId: number }) => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    const order = await getOrderInvoiceById(orderId, session.userId);
    if (!order) return { error: 'Order not found.' };
    return {
      fulfillmentStatus: order.fulfillmentStatus,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      createdAt: order.createdAt,
    };
  },
});
