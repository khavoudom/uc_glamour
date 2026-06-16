import { getAllProducts } from '@/lib/data-access/products';
import { mapDbProductsToProducts } from '@/lib/db/mappers';
import WishlistContent from './wishlist-content';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const dbProducts = await getAllProducts();
  const products = mapDbProductsToProducts(dbProducts);

  return <WishlistContent products={products} />;
}
