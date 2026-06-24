import { verifySession } from '@/lib/dal';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getOrdersByUserId } from '@/lib/data-access/orders';
import { getUserById } from '@/lib/data-access/users';
import { getAllProducts } from '@/lib/data-access/products';
import AccountContent from './account-content';
import type { Category, Product } from '@/lib/types';

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { userId } = await verifySession();
  const session = await auth();
  if (session?.user?.role === 'admin') redirect('/admin');
  const orders = await getOrdersByUserId(userId);
  const user = await getUserById(userId);
  const dbProducts = await getAllProducts();
  const allProducts: Product[] = dbProducts.map((p) => ({
    ...p,
    id: String(p.id),
    price: Number(p.price),
    rating: Number(p.rating),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    imageUrls: parseImageUrls(p.imageUrls),
    category: p.category as Category,
    badge: p.badge as Product['badge'],
    isSubscriptionEligible: p.isSubscriptionEligible ?? undefined,
    shades: p.shades.map((s) => ({ name: s.name, hex: s.hex, stock: s.stock })),
  }));

  return <AccountContent orders={orders} user={user} products={allProducts} />;
}
