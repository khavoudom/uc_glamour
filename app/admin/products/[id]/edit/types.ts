export interface DbProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string | null;
  emoji: string;
  imageUrls: string | null;
  description: string;
  rating: string;
  reviewCount: number;
  badge: string | null;
  isNew: boolean;
  isSubscriptionEligible: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbShade {
  id: number;
  productId: number;
  name: string;
  hex: string;
  stock: number;
  sku: string | null;
}
