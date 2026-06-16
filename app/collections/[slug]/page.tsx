import { getAllProducts } from '@/lib/data-access/products';
import { mapDbProductsToProducts } from '@/lib/db/mappers';
import CollectionContent from './collection-content';

export const dynamic = 'force-dynamic';

export default async function CollectionPage() {
  const dbProducts = await getAllProducts();
  const products = mapDbProductsToProducts(dbProducts);

  return <CollectionContent products={products} />;
}
