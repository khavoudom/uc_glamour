'use client';

import type { CategoryFilter, Product } from '@/lib/types';

interface CategoryGridProps {
  onCategoryChange: (cat: CategoryFilter) => void;
  products: Product[];
}

const categories: {
  name: string;
  filter: CategoryFilter;
  icon: string;
  bg: string;
  color: string;
}[] = [
  { name: 'Lips', filter: 'Lips', icon: 'droplet', bg: '#fde8f0', color: '#c0305a' },
  { name: 'Skincare', filter: 'Skincare', icon: 'leaf', bg: '#eaf3de', color: '#3b6d11' },
  { name: 'Eyes', filter: 'Eyes', icon: 'eye', bg: '#eeedfe', color: '#534ab7' },
  { name: 'Face', filter: 'Face', icon: 'sun', bg: '#faeeda', color: '#7a4f00' },
  { name: 'Fragrance', filter: 'Perfume', icon: 'wind', bg: '#e1f5ee', color: '#0f6e56' },
  { name: 'Night Care', filter: 'Skincare', icon: 'moon', bg: '#fff0f4', color: '#9b1a3e' },
];

export default function CategoryGrid({ onCategoryChange, products }: CategoryGridProps) {
  return (
    <div className="section-wrap px-7 py-10">
      <div className="section-head flex items-baseline justify-between mb-5">
        <div>
          <h2 className="section-title font-heading text-[26px] font-normal text-(--color-text)">
            Shop by category
          </h2>
          <p className="text-xs text-(--color-muted) mt-0.5">Find your perfect beauty routine</p>
        </div>
      </div>
      <div className="category-grid grid grid-cols-6 gap-2.5">
        {categories.map((cat) => {
          const count = products.filter((p) => {
            if (cat.filter === 'Perfume') return p.category === 'Perfume';
            if (cat.name === 'Night Care')
              return p.category === 'Skincare' && p.name.toLowerCase().includes('night');
            return p.category === cat.filter;
          }).length;

          return (
            <div
              key={cat.name}
              onClick={() => onCategoryChange(cat.filter)}
              className="cat-card bg-white border-[0.5px] border-(--color-border) rounded-xl px-2.5 py-4 text-center cursor-pointer transition-all duration-150 hover:border-(--color-pink) hover:-translate-y-0.5"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center"
                style={{ background: cat.bg }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {cat.icon === 'droplet' && (
                    <>
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </>
                  )}
                  {cat.icon === 'leaf' && (
                    <>
                      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </>
                  )}
                  {cat.icon === 'eye' && (
                    <>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                  {cat.icon === 'sun' && (
                    <>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </>
                  )}
                  {cat.icon === 'wind' && (
                    <>
                      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </>
                  )}
                  {cat.icon === 'moon' && (
                    <>
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </>
                  )}
                </svg>
              </div>
              <div className="cat-name text-[11px] font-medium text-(--color-text) mb-0.5">
                {cat.name}
              </div>
              <div className="cat-count text-[10px] text-(--color-muted)">{count} products</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
