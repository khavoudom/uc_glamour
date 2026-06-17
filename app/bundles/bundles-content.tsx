'use client';

import { openCart } from '@/components/cart-drawer';
import { useStore } from '@/lib/store';
import ContentPageLayout from '@/components/content-page-layout';
import type { Product } from '@/lib/types';

interface Bundle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  productIds: string[];
  discount: number;
}

const BUNDLES: Bundle[] = [
  {
    id: 'b1',
    name: 'Skincare Starter Kit',
    emoji: '🧴',
    description:
      'Hydrating Serum + Overnight Retinol Cream — the perfect duo for a glowing routine.',
    productIds: ['2', '6'],
    discount: 0.15,
  },
  {
    id: 'b2',
    name: 'Lip Collection',
    emoji: '💄',
    description:
      'Velvet Matte Lipstick, Rose Petal Lip Balm & Velvet Lip Gloss. Three essential lip looks.',
    productIds: ['1', '8', '11'],
    discount: 0.1,
  },
  {
    id: 'b3',
    name: 'Scent of the Season',
    emoji: '🌸',
    description:
      'Midnight Bloom & Island Breeze — two enchanting fragrances at one beautiful price.',
    productIds: ['3', '13'],
    discount: 0.2,
  },
];

function resolveProducts(bundle: Bundle, products: Product[]): Product[] {
  return bundle.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);
}

function bundlePrice(bundle: Bundle, products: Product[]): number {
  const items = resolveProducts(bundle, products);
  const total = items.reduce((sum, p) => sum + p.price, 0);
  return total * (1 - bundle.discount);
}

function bundleSavings(bundle: Bundle, products: Product[]): number {
  const items = resolveProducts(bundle, products);
  const total = items.reduce((sum, p) => sum + p.price, 0);
  return total - bundlePrice(bundle, products);
}

interface BundlesContentProps {
  products: Product[];
}

export default function BundlesContent({ products }: BundlesContentProps) {
  const { addToCart, showToast } = useStore();

  const handleAddAll = (bundle: Bundle) => {
    const items = resolveProducts(bundle, products);
    for (const product of items) {
      addToCart(product, null, 1);
    }
    openCart();
    showToast(`Added ${bundle.name} to cart!`);
  };

  return (
    <ContentPageLayout title="Bundles & Sets">
      <p className="text-xs text-muted mb-4">
        Curated sets at exclusive bundle prices. Save more when you buy together.
      </p>
      <div className="space-y-5">
        {BUNDLES.map((bundle) => {
          const items = resolveProducts(bundle, products);
          const total = items.reduce((sum, p) => sum + p.price, 0);
          return (
            <div key={bundle.id} className="border border-border rounded-xl p-5 bg-white">
              <div className="flex items-start gap-4">
                <span className="text-3xl" aria-hidden="true">
                  {bundle.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-normal text-text">{bundle.name}</h3>
                  <p className="text-[11px] text-muted mt-1">{bundle.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {items.map((p) => (
                      <span
                        key={p.id}
                        className="text-[10px] bg-bg border border-border/40 rounded-full px-2.5 py-1 text-text"
                      >
                        {p.emoji} {p.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-sm font-medium text-text">
                      ${bundlePrice(bundle, products).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-muted line-through">${total.toFixed(2)}</span>
                    <span className="text-[10px] text-pink font-medium">
                      Save ${bundleSavings(bundle, products).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddAll(bundle)}
                    className="mt-3 bg-pink text-white border-none rounded-lg px-4 py-2 text-[11px] font-medium cursor-pointer"
                  >
                    Add All to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ContentPageLayout>
  );
}
