import { getAllProducts } from '@/lib/data-access/products';
import { mapDbProductsToProducts } from '@/lib/db/mappers';
import BundlesContent from './bundles-content';

export const dynamic = 'force-dynamic';

export default async function BundlesPage() {
  const dbProducts = await getAllProducts();
  const products = mapDbProductsToProducts(dbProducts);

  return <BundlesContent products={products} />;
}
