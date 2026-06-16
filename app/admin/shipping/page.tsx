import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllShippingServices } from '@/lib/data-access/shipping-services';
import Link from 'next/link';
import ShippingToggleButton from './shipping-toggle-button';
import ShippingDeleteButton from './shipping-delete-button';

export default async function AdminShippingServicesPage() {
  await verifyAdminSession();
  const allServices = await getAllShippingServices();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Shipping Services</h1>
        <Link
          href="/admin/shipping/new"
          className="rounded-full bg-pink px-[18px] py-2 text-xs font-medium text-white no-underline"
        >
          + New Service
        </Link>
      </div>

      {allServices.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No shipping services yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white max-w-[700px]">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Name</Th>
                <Th align="left">Price</Th>
                <Th align="left">Est. Delivery</Th>
                <Th align="left">Active</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {allServices.map((s) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="px-3.5 py-[10px] font-medium text-text">{s.name}</td>
                  <td className="px-3.5 py-[10px] text-text">
                    {Number(s.price) === 0 ? 'Free' : `$${Number(s.price).toFixed(2)}`}
                  </td>
                  <td className="px-3.5 py-[10px] text-muted">{s.estimatedDelivery}</td>
                  <td className="px-3.5 py-[10px]">
                    <ShippingToggleButton id={s.id} isActive={s.isActive} />
                  </td>
                  <td className="px-3.5 py-[10px] text-right">
                    <div className="inline-flex gap-1.5">
                      <Link
                        href={`/admin/shipping/${s.id}/edit`}
                        className="rounded-sm border border-border bg-white px-[10px] py-1 text-[11px] text-text no-underline"
                      >
                        Edit
                      </Link>
                      <ShippingDeleteButton id={s.id} />
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
