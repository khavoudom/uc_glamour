'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FILTER_PRESETS, filterProducts } from '@/lib/filters';
import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import ProductModal from '@/components/product-modal';
import CartDrawer from '@/components/cart-drawer';
import Footer from '@/components/footer';
import Toast from '@/components/toast';
import type { Product } from '@/lib/types';

interface ProductsContentProps {
  products: Product[];
}

function ProductsContentInner({ products }: ProductsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filterKey = searchParams.get('filter') || '';
  const preset = FILTER_PRESETS[filterKey];
  const filtered = useMemo(
    () => (preset ? filterProducts(products, preset.filter) : products),
    [preset, products],
  );
  const pageTitle = preset ? preset.label : 'All Products';

  return (
    <div className="store min-h-screen">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="p-7">
        <button
          onClick={() => router.push('/')}
          className="mb-4 cursor-pointer border-none bg-none text-xs text-muted"
        >
          ← Back to Home
        </button>
        <h1 className="font-heading text-[26px] font-normal text-text mb-5">{pageTitle}</h1>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-10 text-center">
            <p className="text-sm text-muted mb-3">No products found in this category.</p>
            <button
              onClick={() => router.push('/products')}
              className="text-xs text-pink cursor-pointer border-none bg-none"
            >
              View all products →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3.5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      <CartDrawer />
      <Toast />
    </div>
  );
}

export default function ProductsContent({ products }: ProductsContentProps) {
  return (
    <Suspense fallback={null}>
      <ProductsContentInner products={products} />
    </Suspense>
  );
}
