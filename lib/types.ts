export type Category = 'Lips' | 'Skincare' | 'Perfume' | 'Eyes' | 'Face';
export type CategoryFilter = Category | 'All';
export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'top_rated' | 'newest';
export type Badge = 'NEW' | 'SALE' | 'HOT' | null;
export type FulfillmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Completed';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface Shade {
  name: string;
  hex: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  emoji: string;
  imageUrls?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  shades: Shade[];
  badge: Badge;
  isNew: boolean;
  isSubscriptionEligible?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  reviewerName: string;
  isVerified: boolean;
  date: string;
  rating: number;
  body: string;
  helpful: number;
  notHelpful: number;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  shade: string | null;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

/* ── Loyalty & Rewards ── */

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface LoyaltyTierInfo {
  name: LoyaltyTier;
  emoji: string;
  minPoints: number;
  maxPoints?: number; // undefined for top tier
}

export const LOYALTY_TIERS: LoyaltyTierInfo[] = [
  { name: 'Bronze', emoji: '🥉', minPoints: 0, maxPoints: 499 },
  { name: 'Silver', emoji: '🥈', minPoints: 500, maxPoints: 1499 },
  { name: 'Gold', emoji: '🥇', minPoints: 1500 },
  { name: 'Diamond', emoji: '💎', minPoints: 0 }, // invite only
];

export function getTier(points: number): LoyaltyTierInfo {
  if (points >= 1500) return LOYALTY_TIERS[2]; // Gold
  if (points >= 500) return LOYALTY_TIERS[1]; // Silver
  return LOYALTY_TIERS[0]; // Bronze
}

export function getNextTier(points: number): LoyaltyTierInfo | null {
  if (points >= 1500) return null;
  if (points >= 500) return LOYALTY_TIERS[2]; // Gold
  return LOYALTY_TIERS[1]; // Silver
}

export const POINTS_PER_DOLLAR = 1;
export const REDEMPTION_RATE = 100; // 100 pts = $1

/* ── Beauty Advisor ── */

export interface ChatMessage {
  id: string;
  role: 'user' | 'advisor' | 'ai';
  text: string;
  productId?: string;
  timestamp: number;
}

/* ── Subscription ── */

export type SubscriptionFrequency = 2 | 4 | 6 | 8;

export interface SubscriptionPlan {
  productId: string;
  productName: string;
  productEmoji: string;
  shade: string | null;
  frequency: SubscriptionFrequency;
  price: number;
}

export const SUBSCRIPTION_DISCOUNT = 0.15; // 15% off

/* ── Orders / Account ── */

export interface OrderSummary {
  id: number;
  subtotal: string;
  shippingCost: string;
  couponDiscount: string;
  total: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: string | null;
  createdAt: Date;
  itemCount: number;
}

export interface OrderItemLine {
  id: number;
  productId: number;
  productName: string;
  emoji: string;
  shade: string | null;
  quantity: number;
  unitPrice: string;
}

export interface OrderInvoice {
  id: number;
  userId: number | null;
  subtotal: string;
  shippingCost: string;
  couponDiscount: string;
  total: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  createdAt: Date;
  items: OrderItemLine[];
}
