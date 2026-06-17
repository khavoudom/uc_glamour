import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllOrders } from '@/lib/data-access/orders';
import Link from 'next/link';
import StatusBadge from '@/components/admin/status-badge';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  await verifyAdminSession();
  const allOrders = await getAllOrders();

  return (
    <div>
      <div className="mb-6 flex items-center">
        <h1 className="font-heading text-2xl font-medium text-text">Orders</h1>
      </div>

      {allOrders.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Order #</Th>
                <Th align="left">Customer</Th>
                <Th align="left">Total</Th>
                <Th align="left">Payment</Th>
                <Th align="left">Fulfillment</Th>
                <Th align="left">Date</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 font-semibold text-text font-mono">#{o.id}</td>
                  <td className="px-3.5 py-2.5 text-text">
                    <div>{o.userName}</div>
                    <div className="text-[10px] text-muted">{o.userEmail}</div>
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <StatusBadge status={o.paymentStatus} type="payment" />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <StatusBadge status={o.fulfillmentStatus} type="fulfillment" />
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] text-text no-underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3.5 py-2.5 font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
