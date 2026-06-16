import { verifySession } from '@/lib/dal';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getOrderInvoiceById } from '@/lib/data-access/orders';
import { notFound } from 'next/navigation';
import OrderInvoiceContent from './order-invoice-content';

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await verifySession();
  const session = await auth();
  if (session?.user?.role === 'admin') redirect('/admin');
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) notFound();

  const order = await getOrderInvoiceById(orderId, userId);
  if (!order) notFound();

  return <OrderInvoiceContent order={order} />;
}
