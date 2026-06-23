import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllShippingServices } from '@/lib/data-access/shipping-services';
import ShippingContent from './shipping-content';

export const dynamic = 'force-dynamic';

export default async function AdminShippingServicesPage() {
  await verifyAdminSession();
  const allServices = await getAllShippingServices();

  return <ShippingContent services={allServices} />;
}
