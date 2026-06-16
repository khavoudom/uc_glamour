import { getOrderById } from '@/lib/data-access/orders';
import { notFound } from 'next/navigation';
import OrderConfirmation from './checkout-success-content';

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const id = parseInt(orderId, 10);
  if (isNaN(id)) notFound();

  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderConfirmation order={order} />;
}
