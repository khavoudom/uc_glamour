import { verifyAdminSession } from '@/lib/admin-dal';
import { getOrderById } from '@/lib/data-access/orders';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/admin/status-badge';
import OrderStatusForm from './order-status-form';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const orderId = parseInt(id, 10);

  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">Order #{order.id}</h1>

      <div className="grid max-w-[800px] grid-cols-2 gap-4">
        {/* Order Summary */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text">Order Summary</h2>
          <div className="flex flex-col gap-2 text-xs">
            <Row label="Order ID" value={`#${order.id}`} />
            <Row label="Date" value={new Date(order.createdAt).toLocaleString()} />
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

        {/* Customer Info */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text">Customer</h2>
          <div className="flex flex-col gap-2 text-xs">
            <Row label="Name" value={order.userName ?? '—'} />
            <Row label="Email" value={order.userEmail ?? '—'} />
          </div>
        </Card>

        {/* Items */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text">Items ({order.items.length})</h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Item</Th>
                <Th align="left">Shade</Th>
                <Th align="center">Qty</Th>
                <Th align="right">Price</Th>
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
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Status Management */}
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-text">Payment Status</h2>
            <div className="mb-3">
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
            <OrderStatusForm
              orderId={order.id}
              type="payment"
              currentStatus={order.paymentStatus}
              options={['Pending', 'Paid', 'Refunded', 'Failed']}
            />
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-text">Fulfillment Status</h2>
            <div className="mb-3">
              <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
            </div>
            <OrderStatusForm
              orderId={order.id}
              type="fulfillment"
              currentStatus={order.fulfillmentStatus}
              options={['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed']}
            />
          </Card>
        </div>
      </div>
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
