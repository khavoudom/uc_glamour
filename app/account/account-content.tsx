'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CartDrawer from '@/components/cart-drawer';
import Toast from '@/components/toast';
import type { OrderSummary } from '@/lib/types';

export default function AccountContent({ orders }: { orders: OrderSummary[] }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="mx-auto max-w-[800px] px-7 py-10 mb-12">
        <h1 className="font-heading mb-6 text-2xl font-medium text-text">My Orders</h1>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
                <ShoppingBag size={28} className="text-pink" />
              </div>
            </div>
            <h2 className="mb-2 text-base font-medium text-text">No orders yet</h2>
            <p className="mb-6 text-xs text-muted">
              When you place an order, you&apos;ll see it here.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="cursor-pointer rounded-full bg-pink min-w-max px-8 py-3 text-[13px] font-medium text-white font-sans border-none"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border">
                  <Th align="left">Order #</Th>
                  <Th align="left">Date</Th>
                  <Th align="left">Items</Th>
                  <Th align="left">Total</Th>
                  <Th align="left">Payment</Th>
                  <Th align="left">Fulfillment</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border">
                    <td className="px-3.5 py-[10px] font-semibold text-text font-mono">#{o.id}</td>
                    <td className="px-3.5 py-[10px] text-[11px] text-muted">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-3.5 py-[10px] text-muted">
                      {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-3.5 py-[10px] font-medium text-text">
                      ${Number(o.total).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-[10px]">
                      <StatusBadge status={o.paymentStatus} type="payment" />
                    </td>
                    <td className="px-3.5 py-[10px]">
                      <StatusBadge status={o.fulfillmentStatus} type="fulfillment" />
                    </td>
                    <td className="px-3.5 py-[10px] text-right">
                      <button
                        onClick={() => router.push(`/account/orders/${o.id}`)}
                        className="cursor-pointer rounded-sm border border-border bg-white px-[10px] py-1 text-[11px] text-text"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* <Footer /> */}
      <CartDrawer />
      <Toast />
    </div>
  );
}

function Th({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3.5 py-[10px] font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
