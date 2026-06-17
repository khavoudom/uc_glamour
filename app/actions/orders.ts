'use server';

import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { getOptionalCustomerSession } from '@/lib/dal';
import { sendReceiptEmail } from '@/lib/receipt-email';
import { sendTelegramNotification } from '@/lib/telegram-notify';
import { redirect } from 'next/navigation';

export interface CreateOrderInput {
  items: {
    productId: number;
    productName: string;
    emoji: string;
    shade: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  total: number;
  paymentMethod: 'paypal' | 'khqr';
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentId?: string;
  shippingServiceId?: number | null;
}

export async function createOrder(input: CreateOrderInput) {
  const session = await getOptionalCustomerSession();
  const userId = session?.userId ?? null;

  const [order] = await db
    .insert(orders)
    .values({
      userId,
      subtotal: input.subtotal.toFixed(2),
      shippingCost: input.shippingCost.toFixed(2),
      couponDiscount: input.couponDiscount.toFixed(2),
      total: input.total.toFixed(2),
      paymentStatus: input.paymentMethod === 'paypal' ? 'Paid' : 'Pending',
      fulfillmentStatus: 'Pending',
      paymentMethod: input.paymentMethod,
      paymentId: input.paymentId ?? null,
      shippingName: input.shippingInfo.fullName,
      shippingEmail: input.shippingInfo.email,
      shippingPhone: input.shippingInfo.phone,
      shippingAddress: input.shippingInfo.address,
      shippingCity: input.shippingInfo.city,
      shippingState: input.shippingInfo.state,
      shippingZip: input.shippingInfo.zip,
      shippingCountry: input.shippingInfo.country,
      shippingServiceId: input.shippingServiceId ?? null,
    })
    .returning();

  if (input.items.length > 0) {
    await db.insert(orderItems).values(
      input.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        emoji: item.emoji,
        shade: item.shade,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
      })),
    );
  }

  // Fire-and-forget: send receipt email if we have the user's email
  sendReceiptEmail(order.id).catch(() => {});
  sendTelegramNotification(order.id).catch(() => {});

  return { orderId: order.id };
}

export async function createOrderAndRedirect(input: CreateOrderInput) {
  const result = await createOrder(input);
  redirect(`/checkout/confirmation/${result.orderId}`);
}
