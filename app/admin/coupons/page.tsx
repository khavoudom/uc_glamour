import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllCoupons } from '@/lib/data-access/coupons-admin';
import Link from 'next/link';
import CouponToggleButton from './coupon-toggle-button';
import CouponDeleteButton from './coupon-delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  await verifyAdminSession();
  const allCoupons = await getAllCoupons();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="rounded-full bg-pink px-[18px] py-2 text-xs font-medium text-white no-underline"
        >
          + New Coupon
        </Link>
      </div>

      {allCoupons.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No coupons yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white max-w-[700px]">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Code</Th>
                <Th align="left">Discount</Th>
                <Th align="left">Active</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {allCoupons.map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="px-3.5 py-[10px] font-semibold text-text font-mono">{c.code}</td>
                  <td className="px-3.5 py-[10px] text-text">{c.discountPercent}%</td>
                  <td className="px-3.5 py-[10px]">
                    <CouponToggleButton id={c.id} isActive={c.isActive} />
                  </td>
                  <td className="px-3.5 py-[10px] text-right">
                    <div className="inline-flex gap-1.5">
                      <Link
                        href={`/admin/coupons/${c.id}/edit`}
                        className="rounded-sm border border-border bg-white px-[10px] py-1 text-[11px] text-text no-underline"
                      >
                        Edit
                      </Link>
                      <CouponDeleteButton id={c.id} />
                    </div>
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
      className={`px-3.5 py-[10px] font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
