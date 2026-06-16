import { getAllProducts } from '@/lib/data-access/products';
import { getActiveCoupons } from '@/lib/data-access/coupons';
import { mapDbProductsToProducts, mapDbProductToProduct } from '@/lib/db/mappers';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [allDbProducts, activeCoupons] = await Promise.all([getAllProducts(), getActiveCoupons()]);

  const products = mapDbProductsToProducts(allDbProducts);

  return <HomeClient products={products} coupons={activeCoupons} />;
}
