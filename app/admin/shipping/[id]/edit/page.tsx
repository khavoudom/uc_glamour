import { verifyAdminSession } from '@/lib/admin-dal';
import { getShippingServiceById } from '@/lib/data-access/shipping-services';
import { notFound } from 'next/navigation';
import EditShippingServiceForm from './edit-form';

export const dynamic = 'force-dynamic';

export default async function EditShippingServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const serviceId = parseInt(id, 10);

  const service = await getShippingServiceById(serviceId);
  if (!service) notFound();

  return <EditShippingServiceForm service={service} />;
}
