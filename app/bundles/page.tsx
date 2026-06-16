import { getAllProducts } from '@/lib/data-access/products';
import { mapDbProductsToProducts } from '@/lib/db/mappers';
import BundlesContent from './bundles-content';

export default async function BundlesPage() {
  const dbProducts = await getAllProducts();
  const products = mapDbProductsToProducts(dbProducts);

  return <BundlesContent products={products} />;
}
