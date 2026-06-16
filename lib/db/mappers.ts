import type { Product, Review, Shade as ShadeType } from '@/lib/types';
import type { DbProduct } from '@/lib/data-access/products';
import type { getReviewsByProduct } from '@/lib/data-access/reviews';

export function mapDbProductToProduct(
  dbProduct: DbProduct & {
    shades: {
      id: number;
      productId: number;
      name: string;
      hex: string;
      stock: number;
      sku: string | null;
    }[];
  },
): Product {
  return {
    id: String(dbProduct.id),
    name: dbProduct.name,
    brand: dbProduct.brand,
    category: dbProduct.category as Product['category'],
    price: Number(dbProduct.price),
    originalPrice: dbProduct.originalPrice ? Number(dbProduct.originalPrice) : undefined,
    emoji: dbProduct.emoji,
    imageUrls: dbProduct.imageUrls
      ? (() => {
          try {
            const parsed = JSON.parse(dbProduct.imageUrls);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [dbProduct.imageUrls];
          }
        })()
      : undefined,
    description: dbProduct.description,
    rating: Number(dbProduct.rating),
    reviewCount: dbProduct.reviewCount,
    shades: dbProduct.shades.map((s) => ({
      name: s.name,
      hex: s.hex,
      stock: s.stock,
      sku: s.sku ?? undefined,
    })),
    badge: dbProduct.badge as Product['badge'],
    isNew: dbProduct.isNew,
    isSubscriptionEligible: dbProduct.isSubscriptionEligible ?? undefined,
  };
}

export function mapDbProductsToProducts(
  dbProducts: (DbProduct & {
    shades: {
      id: number;
      productId: number;
      name: string;
      hex: string;
      stock: number;
      sku: string | null;
    }[];
  })[],
): Product[] {
  return dbProducts.map(mapDbProductToProduct);
}
