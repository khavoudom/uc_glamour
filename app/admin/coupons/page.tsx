import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllCoupons } from '@/lib/data-access/coupons-admin';
import CouponsContent from './coupons-content';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  await verifyAdminSession();
  const allCoupons = await getAllCoupons();

  return <CouponsContent coupons={allCoupons} />;
}
