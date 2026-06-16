import type { Product, Badge, Category } from './types';

export interface ProductFilter {
  badge?: Badge;
  isNew?: boolean;
  category?: Category;
  nameSearch?: string;
}

export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  return products.filter((p) => {
    if (filter.badge && p.badge !== filter.badge) return false;
    if (filter.isNew !== undefined && p.isNew !== filter.isNew) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (filter.nameSearch && !p.name.toLowerCase().includes(filter.nameSearch.toLowerCase()))
      return false;
    return true;
  });
}

export const FILTER_PRESETS: Record<string, { label: string; filter: ProductFilter }> = {
  'new-arrivals': { label: 'New Arrivals', filter: { isNew: true } },
  bestsellers: { label: 'Bestsellers', filter: {} },
  sale: { label: 'Sale', filter: { badge: 'SALE' } },
};

export interface CollectionDef {
  slug: string;
  label: string;
  filter: ProductFilter;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: 'night-cream',
    label: 'Night Cream',
    filter: { category: 'Skincare', nameSearch: 'night' },
  },
  {
    slug: 'skin-toner',
    label: 'Skin Toner',
    filter: { category: 'Skincare', nameSearch: 'toner' },
  },
  { slug: 'body-wash', label: 'Body Wash', filter: { category: 'Skincare', nameSearch: 'body' } },
  { slug: 'day-cream', label: 'Day Cream', filter: { category: 'Skincare', nameSearch: 'day' } },
];

export function lookupCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
