import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, users } from '@/lib/db/schema';
import { getOptionalSession } from '@/lib/dal';
import {
  BakongOpenAPIError,
  createBakongKHQRPayment,
  getBakongOpenAPIConfig,
} from '@/lib/payment/bakong-open-api';
import { logger } from '@/lib/logger';
import { eq } from 'drizzle-orm';

const log = logger('api/khqr/create-payment');

interface CreatePaymentRequest {
  items: Array<{
    productId: number;
    productName: string;
    emoji: string;
    shade: string | null;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  total: number;
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
  shippingServiceId?: number | null;
}

export async function POST(request: Request) {
  let createdOrderId: number | null = null;

  try {
    const body: CreatePaymentRequest = await request.json();

    log.info('Incoming request', {
      itemCount: body.items?.length,
      total: body.total,
      shipping: body.shippingInfo?.fullName,
    });

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }
    if (!body.total || body.total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }
    if (!body.shippingInfo?.fullName?.trim()) {
      return NextResponse.json({ error: 'Shipping name is required' }, { status: 400 });
    }

    const config = getBakongOpenAPIConfig();
    log.info('Bakong Open API config', {
      configured: config.configured,
      baseUrl: config.baseUrl,
      merchantType: config.merchantType,
    });
    if (!config.configured) {
      return NextResponse.json({ error: 'Bakong Open API is not configured' }, { status: 503 });
    }

    const session = await getOptionalSession();
    let userId = session?.userId ?? null;

    if (userId) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) userId = null;
    }

    const [order] = await db
      .insert(orders)
      .values({
        userId,
        subtotal: body.subtotal.toFixed(2),
        shippingCost: body.shippingCost.toFixed(2),
        couponDiscount: body.couponDiscount.toFixed(2),
        total: body.total.toFixed(2),
        paymentStatus: 'Pending',
        fulfillmentStatus: 'Pending',
        paymentMethod: 'khqr',
        paymentId: null,
        shippingName: body.shippingInfo.fullName,
        shippingEmail: body.shippingInfo.email,
        shippingPhone: body.shippingInfo.phone,
        shippingAddress: body.shippingInfo.address,
        shippingCity: body.shippingInfo.city,
        shippingState: body.shippingInfo.state,
        shippingZip: body.shippingInfo.zip,
        shippingCountry: body.shippingInfo.country,
        shippingServiceId: body.shippingServiceId ?? null,
      })
      .returning();
    createdOrderId = order.id;

    if (body.items.length > 0) {
      await db.insert(orderItems).values(
        body.items.map((item) => ({
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

    log.info('Calling createBakongKHQRPayment', {
      orderId: order.id,
      total: body.total,
      totalFormatted: body.total.toFixed(2),
      itemCount: body.items.length,
    });

    const qrResult = await createBakongKHQRPayment({
      orderId: order.id,
      amount: body.total,
      currency: 'USD',
      customerPhone: body.shippingInfo.phone,
    });

    log.info('QR result', {
      orderId: order.id,
      md5: qrResult.md5,
      hasQrImage: true,
      hasQrString: true,
    });

    await db.update(orders).set({ paymentId: qrResult.md5 }).where(eq(orders.id, order.id));

    return NextResponse.json({
      orderId: order.id,
      qrImage: qrResult.qrImage,
      qrString: qrResult.qrString,
      md5: qrResult.md5,
    });
  } catch (error) {
    if (createdOrderId) {
      try {
        await db.delete(orders).where(eq(orders.id, createdOrderId));
        log.info('Rolled back KHQR order after payment creation failure', {
          orderId: createdOrderId,
        });
      } catch (rollbackError) {
        log.error(
          'Failed to roll back KHQR order',
          rollbackError instanceof Error
            ? {
                orderId: createdOrderId,
                message: rollbackError.message,
                stack: rollbackError.stack,
              }
            : { orderId: createdOrderId, error: rollbackError },
        );
      }
    }

    log.error(
      'Create payment failed',
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
