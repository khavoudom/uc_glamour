'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { lookupCollection, filterProducts } from '@/lib/filters';
import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import ProductModal from '@/components/product-modal';
import CartDrawer from '@/components/cart-drawer';
import Footer from '@/components/footer';
import Toast from '@/components/toast';
import type { Product } from '@/lib/types';

interface CollectionContentProps {
  products: Product[];
}

export default function CollectionContent({ products }: CollectionContentProps) {
  const router = useRouter();
  const { slug } = useParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const collectionDef = lookupCollection(slug as string);

  const filteredProducts = useMemo(() => {
    if (!collectionDef) return [];
    return filterProducts(products, collectionDef.filter);
  }, [collectionDef, products]);

  const suggestions = products.slice(0, 3);

  if (!collectionDef) {
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
          <h1 className="font-heading text-[26px] font-normal text-text mb-5">
            Collection Not Found
          </h1>
          <p className="text-sm text-muted mb-4">
            The collection you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="text-xs text-pink cursor-pointer border-none bg-none"
          >
            Browse all products →
          </button>
        </div>
        <Footer />
        <CartDrawer />
        <Toast />
      </div>
    );
  }

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
        <h1 className="font-heading text-[26px] font-normal text-text mb-1">
          {collectionDef.label}
        </h1>
        <p className="text-xs text-muted mb-5">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-white border border-border/40 rounded-xl">
            <p className="text-[13px] text-muted">
              Coming soon — we&apos;re expanding this collection.
            </p>
            <div className="mt-4">
              <p className="text-[11px] text-muted mb-2">You might like:</p>
              <div className="grid grid-cols-3 gap-2 max-w-100 mx-auto">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="p-3 border border-border/40 rounded-lg bg-bg cursor-pointer text-center"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <p className="mt-1 text-[10px] font-medium text-text">{p.name}</p>
                    <p className="text-[10px] text-muted">${p.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
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
