import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOrderById, updateOrderPaymentStatus } from '@/lib/data-access/orders';
import { sendReceiptEmail } from '@/lib/receipt-email';
import { sendTelegramNotification } from '@/lib/telegram-notify';
import { logger } from '@/lib/logger';

const log = logger('api/khqr/dev-mark-paid');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'number') {
      return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus !== 'Paid') {
      await updateOrderPaymentStatus(order.id, 'Paid');
      log.info('Dev: marked order as paid', { orderId: order.id });
    }

    sendTelegramNotification(order.id).catch(() => {});
    sendReceiptEmail(order.id).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    log.error(
      'Dev mark-paid error',
      error instanceof Error ? { message: error.message } : { error },
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
