'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, CategoryFilter } from '@/lib/types';
import PromoBanner from '@/components/promo-banner';
import Header from '@/components/header';
import SearchOverlay from '@/components/search-overlay';
import Hero from '@/components/hero';
import CategoryGrid from '@/components/category-grid';
import FeaturedBanner from '@/components/featured-banner';
import ProductCard from '@/components/product-card';
import ProductModal from '@/components/product-modal';
import CartDrawer from '@/components/cart-drawer';
import FeatureCards from '@/components/feature-cards';
import Testimonials from '@/components/testimonials';
import Footer from '@/components/footer';
import Toast from '@/components/toast';

interface HomeClientProps {
  products: Product[];
  coupons: { code: string; discountPercent: number; isActive: boolean }[];
}

export default function HomeClient({ products: allProducts, coupons }: HomeClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }
    return result;
  }, [activeCategory, allProducts]);

  const suggestions = allProducts.slice(0, 3);

  return (
    <div className="store min-h-screen">
      <PromoBanner couponCode={coupons[0]?.code} discountPercent={coupons[0]?.discountPercent} />
      <div className="mx-auto w-full max-w-[90%]">
        <Header
          onSearchToggle={() => setSearchOpen((prev) => !prev)}
          onCategoryChange={setActiveCategory}
        />
        <SearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onProductSelect={setSelectedProduct}
          products={allProducts}
        />

        <Hero />
        <CategoryGrid onCategoryChange={setActiveCategory} products={allProducts} />
        <FeaturedBanner />

        <div className="section-wrap px-7 pb-10 pt-0">
          <div className="section-head flex items-baseline justify-between mb-5">
            <div>
              <h2 className="section-title font-heading text-[26px] font-normal text-text">
                Bestsellers
              </h2>
              <p className="text-xs text-muted mt-0.5">Our most-loved products</p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="view-all text-xs text-pink cursor-pointer bg-transparent border-0 flex items-center gap-1"
            >
              View all{' '}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid grid grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-white border border-border/40 rounded-xl">
              <p className="text-[13px] text-muted">No products found in this category</p>
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

        <Testimonials />
        <FeatureCards />
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
