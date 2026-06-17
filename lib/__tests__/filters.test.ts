import { describe, it, expect } from 'vitest';
import { filterProducts, FILTER_PRESETS, COLLECTIONS, lookupCollection } from '@/lib/filters';
import { products } from '@/lib/data';

describe('filterProducts()', () => {
  it('returns all products when filter is empty', () => {
    const result = filterProducts(products, {});
    expect(result).toEqual(products);
  });

  it('filters by category', () => {
    const result = filterProducts(products, { category: 'Lips' });
    expect(result.every((p) => p.category === 'Lips')).toBe(true);
  });

  it('filters by badge', () => {
    const result = filterProducts(products, { badge: 'SALE' });
    expect(result.every((p) => p.badge === 'SALE')).toBe(true);
  });

  it('filters by isNew', () => {
    const result = filterProducts(products, { isNew: true });
    expect(result.every((p) => p.isNew === true)).toBe(true);
  });

  it('filters by name search (case-insensitive)', () => {
    const result = filterProducts(products, { nameSearch: 'lip' });
    expect(result.every((p) => p.name.toLowerCase().includes('lip'))).toBe(true);
  });

  it('combines multiple filters with AND logic', () => {
    const result = filterProducts(products, { category: 'Lips', badge: 'SALE' });
    expect(result.every((p) => p.category === 'Lips' && p.badge === 'SALE')).toBe(true);
  });

  it('returns empty array when no products match', () => {
    const result = filterProducts(products, { nameSearch: 'xyznonexistent' });
    expect(result).toHaveLength(0);
  });
});

describe('FILTER_PRESETS', () => {
  it('has new-arrivals, bestsellers, and sale presets', () => {
    expect(FILTER_PRESETS['new-arrivals']).toBeDefined();
    expect(FILTER_PRESETS.bestsellers).toBeDefined();
    expect(FILTER_PRESETS.sale).toBeDefined();
  });

  it('new-arrivals filters for isNew', () => {
    expect(FILTER_PRESETS['new-arrivals'].filter.isNew).toBe(true);
  });

  it('sale filters for SALE badge', () => {
    expect(FILTER_PRESETS.sale.filter.badge).toBe('SALE');
  });
});

describe('COLLECTIONS', () => {
  it('has all skincare collections', () => {
    expect(COLLECTIONS).toHaveLength(4);
  });

  it('each collection has a slug, label, and filter', () => {
    for (const c of COLLECTIONS) {
      expect(c.slug).toBeDefined();
      expect(c.label).toBeDefined();
      expect(c.filter).toBeDefined();
    }
  });
});

describe('lookupCollection()', () => {
  it('returns the matching collection', () => {
    const c = lookupCollection('night-cream');
    expect(c).toBeDefined();
    expect(c?.label).toBe('Night Cream');
  });

  it('returns undefined for unknown slug', () => {
    expect(lookupCollection('unknown')).toBeUndefined();
  });
});
