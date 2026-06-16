import { verifyAdminSession } from '@/lib/admin-dal';
import { getCouponById } from '@/lib/data-access/coupons-admin';
import { notFound } from 'next/navigation';
import EditCouponForm from './edit-form';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const couponId = parseInt(id, 10);

  const coupon = await getCouponById(couponId);
  if (!coupon) notFound();

  return <EditCouponForm coupon={coupon} />;
}
