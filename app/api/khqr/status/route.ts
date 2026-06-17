import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOrderById } from '@/lib/data-access/orders';
import { updateOrderPaymentStatus } from '@/lib/data-access/orders';
import { checkBakongTransactionByMd5, BakongOpenAPIError } from '@/lib/payment/bakong-open-api';
import { sendReceiptEmail } from '@/lib/receipt-email';
import { sendTelegramNotification } from '@/lib/telegram-notify';
import { logger } from '@/lib/logger';

const log = logger('api/khqr/status');

export async function GET(request: NextRequest) {
  try {
    const orderIdParam = request.nextUrl.searchParams.get('orderId');
    if (!orderIdParam) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'Paid') {
      return NextResponse.json({
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        isPaid: true,
      });
    }

    if (!order.paymentId) {
      return NextResponse.json({
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        isPaid: false,
        message: 'Order does not have a Bakong transaction reference yet',
      });
    }

    const bakongStatus = await checkBakongTransactionByMd5(order.paymentId);
    log.info('Bakong transaction check result', {
      orderId: order.id,
      paid: bakongStatus.paid,
      responseCode: bakongStatus.responseCode,
      errorCode: bakongStatus.errorCode,
      message: bakongStatus.message,
      hasTransactionData: !!bakongStatus.transaction,
    });
    if (bakongStatus.paid) {
      await updateOrderPaymentStatus(order.id, 'Paid');
      sendReceiptEmail(order.id).catch(() => {});
      sendTelegramNotification(order.id).catch(() => {});
    }

    return NextResponse.json({
      orderId: order.id,
      paymentStatus: bakongStatus.paid ? 'Paid' : order.paymentStatus,
      isPaid: bakongStatus.paid,
      bakong: {
        responseCode: bakongStatus.responseCode,
        errorCode: bakongStatus.errorCode,
        message: bakongStatus.message,
      },
    });
  } catch (error) {
    log.error(
      'Status check error',
      error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    );
    const message =
      error instanceof BakongOpenAPIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Internal server error';
    const status = error instanceof BakongOpenAPIError ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
