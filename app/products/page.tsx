import { getAllProducts } from '@/lib/data-access/products';
import { mapDbProductsToProducts } from '@/lib/db/mappers';
import ProductsContent from './products-content';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const dbProducts = await getAllProducts();
  const products = mapDbProductsToProducts(dbProducts);

  return <ProductsContent products={products} />;
}
