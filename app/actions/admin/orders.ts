'use server';

import { requireAdmin } from '@/lib/admin-dal';
import { updateOrderPaymentStatus, updateOrderFulfillmentStatus } from '@/lib/data-access/orders';

const VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded', 'Failed'];
const VALID_FULFILLMENT_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Completed',
];

export async function updatePaymentStatusAction(orderId: number, status: string) {
  await requireAdmin();

  if (!VALID_PAYMENT_STATUSES.includes(status)) {
    throw new Error('Invalid payment status');
  }

  await updateOrderPaymentStatus(orderId, status);
}

export async function updateFulfillmentStatusAction(orderId: number, status: string) {
  await requireAdmin();

  if (!VALID_FULFILLMENT_STATUSES.includes(status)) {
    throw new Error('Invalid fulfillment status');
  }

  await updateOrderFulfillmentStatus(orderId, status);
}
