'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, FileText } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import ReviewForm from '@/components/review-form';
import Header from '@/components/header';
import CartDrawer from '@/components/cart-drawer';
import Toast from '@/components/toast';
import type { OrderInvoice } from '@/lib/types';

export default function OrderInvoiceContent({ order }: { order: OrderInvoice }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null);
  const [reviewSubmittedIds, setReviewSubmittedIds] = useState<Set<number>>(new Set());

  const canReview =
    order.fulfillmentStatus === 'Delivered' || order.fulfillmentStatus === 'Completed';

  const payMethod =
    order.paymentMethod === 'paypal'
      ? 'PayPal'
      : order.paymentMethod === 'khqr'
        ? 'Bakong KHQR'
        : (order.paymentMethod ?? '—');

  return (
    <div className="min-h-screen bg-bg">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="mx-auto max-w-200 px-7 py-10">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/account')}
          className="mb-6 flex cursor-pointer items-center gap-1 border-none bg-none text-xs text-muted"
        >
          <ChevronLeft size={14} />
          Back to My Orders
        </button>

        {/* Order header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-medium text-text">Order #{order.id}</h1>
            <p className="mt-1 text-xs text-muted">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={order.paymentStatus} type="payment" />
            <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Items */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Package size={16} className="text-pink" />
              <h2 className="text-sm font-semibold text-text">Items ({order.items.length})</h2>
            </div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border">
                  <Th align="left">Item</Th>
                  <Th align="left">Shade</Th>
                  <Th align="center">Qty</Th>
                  <Th align="right">Price</Th>
                  {canReview && <Th align="center">Review</Th>}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-2 py-1.5 text-text">
                      {item.emoji} {item.productName}
                    </td>
                    <td className="px-2 py-1.5 text-muted">{item.shade ?? '—'}</td>
                    <td className="px-2 py-1.5 text-center text-muted">{item.quantity}</td>
                    <td className="px-2 py-1.5 text-right text-text">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </td>
                    {canReview && (
                      <td className="px-2 py-1.5 text-center">
                        {reviewSubmittedIds.has(item.productId) ? (
                          <span className="text-[11px] text-success font-medium">
                            Review submitted
                          </span>
                        ) : reviewingProductId === item.productId ? (
                          <ReviewForm
                            productId={item.productId}
                            orderId={order.id}
                            onSuccess={() => {
                              setReviewingProductId(null);
                              setReviewSubmittedIds((prev) => new Set(prev).add(item.productId));
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => setReviewingProductId(item.productId)}
                            className="cursor-pointer rounded-full border border-border-md bg-none px-3 py-1 text-[11px] font-medium text-text font-sans whitespace-nowrap"
                          >
                            Write a Review
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Order Summary */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-text">Order Summary</h2>
            <div className="flex flex-col gap-2 text-xs">
              <Row label="Subtotal" value={`$${Number(order.subtotal).toFixed(2)}`} />
              <Row
                label="Shipping"
                value={
                  Number(order.shippingCost) > 0
                    ? `$${Number(order.shippingCost).toFixed(2)}`
                    : 'Free'
                }
              />
              <Row
                label="Discount"
                value={
                  Number(order.couponDiscount) > 0
                    ? `-$${Number(order.couponDiscount).toFixed(2)}`
                    : '—'
                }
              />
              <Row label="Total" value={`$${Number(order.total).toFixed(2)}`} bold />
            </div>
          </Card>

          {/* Payment Info */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <FileText size={16} className="text-pink" />
              <h2 className="text-sm font-semibold text-text">Payment</h2>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <Row label="Method" value={payMethod} />
              {order.paymentId && <Row label="Transaction ID" value={order.paymentId} />}
            </div>
          </Card>

          {/* Shipping Info */}
          {order.shippingName && (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <Truck size={16} className="text-pink" />
                <h2 className="text-sm font-semibold text-text">Shipping To</h2>
              </div>
              <div className="text-[13px] text-text">
                <p className="m-0 mb-0.5 font-medium">{order.shippingName}</p>
                {order.shippingAddress && (
                  <p className="m-0 mb-0.5 text-muted">{order.shippingAddress}</p>
                )}
                <p className="m-0 text-muted">
                  {[order.shippingCity, order.shippingState, order.shippingZip]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.shippingCountry && <p className="m-0 text-muted">{order.shippingCountry}</p>}
              </div>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2.5">
          <button
            onClick={() => router.push('/products')}
            className="flex-1 cursor-pointer rounded-full border border-border-md bg-none p-3.25 text-[13px] font-medium font-sans text-text"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/account')}
            className="flex-1 cursor-pointer rounded-full bg-pink p-3.25 text-[13px] font-medium font-sans text-white border-none"
          >
            Back to My Orders
          </button>
        </div>
      </div>
      <CartDrawer />
      <Toast />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-white p-5">{children}</div>;
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <th className={`px-2 py-1.5 font-medium text-muted ${alignClass}`}>{children}</th>;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} text-text`}>{value}</span>
    </div>
  );
}
