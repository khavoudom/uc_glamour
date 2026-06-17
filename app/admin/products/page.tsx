import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllProductsAdmin, deleteProduct } from '@/lib/data-access/products-admin';
import Link from 'next/link';
import ProductDeleteButton from './product-delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  await verifyAdminSession();
  const allProducts = await getAllProductsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-pink px-4.5 py-2 text-xs font-medium text-white no-underline"
        >
          + New Product
        </Link>
      </div>

      {allProducts.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No products yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Image</Th>
                <Th align="left">Name</Th>
                <Th align="left">Brand</Th>
                <Th align="left">Category</Th>
                <Th align="left">Price</Th>
                <Th align="left">Badge</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5">
                    {p.imageUrls ? (
                      <img
                        src={(() => {
                          try {
                            const p2 = JSON.parse(p.imageUrls);
                            return Array.isArray(p2) ? p2[0] : p2;
                          } catch {
                            return p.imageUrls;
                          }
                        })()}
                        alt={p.name}
                        className="h-8 w-8 rounded-sm border border-border object-cover"
                      />
                    ) : (
                      <span className="text-xl">{p.emoji}</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text">{p.name}</td>
                  <td className="px-3.5 py-2.5 text-muted">{p.brand}</td>
                  <td className="px-3.5 py-2.5 text-muted">{p.category}</td>
                  <td className="px-3.5 py-2.5 text-text">${Number(p.price).toFixed(2)}</td>
                  <td className="px-3.5 py-2.5">
                    {p.badge && (
                      <span className="rounded bg-pink-lt px-2 py-0.5 text-[10px] font-medium text-pink-dk">
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="inline-flex gap-1.5">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] text-text no-underline"
                      >
                        Edit
                      </Link>
                      <ProductDeleteButton productId={p.id} />
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
      className={`px-3.5 py-2.5 font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
