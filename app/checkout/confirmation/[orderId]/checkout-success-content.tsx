'use client';

import { useRouter } from 'next/navigation';
import { Package, Truck } from 'lucide-react';
import type { getOrderById } from '@/lib/data-access/orders';

type OrderPayload = Awaited<ReturnType<typeof getOrderById>>;
type OrderItemPayload = NonNullable<OrderPayload>['items'][number];

function OrderItem({
  item,
}: {
  item: {
    productName: string;
    emoji: string;
    shade: string | null;
    quantity: number;
    unitPrice: string;
  };
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-bg text-[22px]"
        aria-hidden="true"
      >
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-text">{item.productName}</div>
        <div className="text-[11px] text-muted">
          {item.shade || 'Standard'} &times; {item.quantity}
        </div>
      </div>
      <div className="whitespace-nowrap text-[13px] font-medium text-text">
        ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}

function AnimatedCheckCircle() {
  const circleLen = 2 * Math.PI * 32; // ~201
  const checkLen = 70; // approximate polyline length

  return (
    <div className="relative mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center">
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        {/* Circle — draws in */}
        <circle
          cx="36"
          cy="36"
          r="32"
          stroke="var(--color-success)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={circleLen}
          strokeDashoffset={circleLen}
          style={{
            animation: 'ccDrawIn 0.4s ease-out 0.1s forwards',
          }}
        />
        {/* Checkmark — draws in after circle */}
        <polyline
          points="22,38 32,48 50,28"
          stroke="var(--color-success)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={checkLen}
          strokeDashoffset={checkLen}
          style={{
            animation: 'ccDrawIn 0.3s ease-out 0.5s forwards',
          }}
        />
      </svg>
      <style>{`
        @keyframes ccDrawIn {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmation({ order }: { order: NonNullable<OrderPayload> }) {
  const router = useRouter();

  const payMethod = order.paymentMethod === 'paypal' ? 'PayPal' : 'Bakong KHQR';

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[640px] px-7 py-10">
        {/* Success header */}
        <div className="mb-5 rounded-lg border border-border bg-white px-6 py-12 text-center">
          <AnimatedCheckCircle />
          <h1 className="font-heading m-0 mb-1 text-2xl font-medium text-text">Order Confirmed!</h1>
          <p className="m-0 text-xs text-muted">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <div className="mt-5 flex justify-center gap-6 border-t border-border pt-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5px] text-muted">Order Number</div>
              <div className="mt-[2px] text-base font-semibold text-text">#{order.id}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.5px] text-muted">Total</div>
              <div className="mt-[2px] text-base font-semibold text-pink">
                ${Number(order.total).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.5px] text-muted">Payment</div>
              <div className="mt-[2px] text-base font-medium text-text">{payMethod}</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-5 rounded-lg border border-border bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Package size={16} className="text-pink" />
            <h3 className="m-0 text-[15px] font-medium text-text">Order Items</h3>
          </div>
          {order.items && order.items.length > 0 ? (
            <div className="flex flex-col">
              {order.items.map((item: OrderItemPayload, idx: number) => (
                <OrderItem key={idx} item={item} />
              ))}
            </div>
          ) : (
            <p className="m-0 text-xs text-muted">No items found for this order.</p>
          )}
        </div>

        {/* Shipping */}
        {order.shippingName && (
          <div className="mb-5 rounded-lg border border-border bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Truck size={16} className="text-pink" />
              <h3 className="m-0 text-[15px] font-medium text-text">Shipping To</h3>
            </div>
            <div className="text-[13px] text-text">
              <p className="m-0 mb-[2px] font-medium">{order.shippingName}</p>
              <p className="m-0 mb-[2px] text-muted">{order.shippingAddress}</p>
              <p className="m-0 text-muted">
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p className="m-0 text-muted">{order.shippingCountry}</p>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex gap-[10px]">
          <button
            onClick={() => router.push('/products')}
            className="flex-1 cursor-pointer rounded-full border border-border-md bg-none p-[13px] text-[13px] font-medium font-sans text-text"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 cursor-pointer rounded-full bg-pink p-[13px] text-[13px] font-medium font-sans text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
