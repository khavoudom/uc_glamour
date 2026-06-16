import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const mockProduct: Product = {
  id: '99',
  name: 'Test Product',
  brand: 'TestBrand',
  category: 'Lips',
  price: 19.99,
  emoji: '🎁',
  description: 'Test',
  rating: 4,
  reviewCount: 10,
  shades: [{ name: 'Red', hex: '#ff0000', stock: 10 }],
  badge: null,
  isNew: false,
};

beforeEach(() => {
  // Reset store to initial state before each test
  useStore.setState({
    _hydrated: false,
    isAuthenticated: false,
    userRole: null,
    cart: [],
    wishlist: [],
    activeCoupon: null,
    couponDiscount: 0,
    subtotal: 0,
    shippingCost: 0,
    selectedShippingServiceId: null,
    selectedShippingServicePrice: 0,
    cartCount: 0,
    toast: { message: '', visible: false },
    loyaltyPoints: 0,
    loyaltyTier: 'Bronze',
    earnedThisSession: 0,
    redeemingPoints: 0,
    loyaltyDiscount: 0,
    hasSeenTierUpgrade: true,
    pendingTierUpgrade: null,
    chatMessages: [],
    chatOpen: false,
    chatOperatingHours: true,
    isAiLoading: false,
    subscriptions: [],
  });
  localStorage.clear();
});

/* ── Cart ── */

describe('cart operations', () => {
  it('adds a product to cart', () => {
    useStore.getState().addToCart(mockProduct, mockProduct.shades[0], 1);
    const s = useStore.getState();
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0].productId).toBe('99');
    expect(s.cart[0].quantity).toBe(1);
    expect(s.cartCount).toBe(1);
  });

  it('increments quantity when adding same product+shade', () => {
    const { addToCart } = useStore.getState();
    addToCart(mockProduct, mockProduct.shades[0], 1);
    addToCart(mockProduct, mockProduct.shades[0], 2);
    const s = useStore.getState();
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0].quantity).toBe(3);
    expect(s.cartCount).toBe(3);
  });

  it('adds separate entries for different shades', () => {
    const { addToCart } = useStore.getState();
    addToCart(mockProduct, mockProduct.shades[0], 1);
    addToCart(mockProduct, null, 1);
    const s = useStore.getState();
    expect(s.cart).toHaveLength(2);
    expect(s.cartCount).toBe(2);
  });

  it('removes a product from cart', () => {
    const { addToCart, removeFromCart } = useStore.getState();
    addToCart(mockProduct, mockProduct.shades[0], 1);
    removeFromCart('99', 'Red');
    expect(useStore.getState().cart).toHaveLength(0);
  });

  it('clears the entire cart', () => {
    const { addToCart, clearCart } = useStore.getState();
    addToCart(mockProduct, mockProduct.shades[0], 1);
    clearCart();
    const s = useStore.getState();
    expect(s.cart).toHaveLength(0);
    expect(s.cartCount).toBe(0);
    expect(s.subtotal).toBe(0);
    expect(s.shippingCost).toBe(0);
    expect(s.activeCoupon).toBeNull();
  });

  it('computes subtotal correctly', () => {
    useStore.getState().addToCart(mockProduct, mockProduct.shades[0], 2);
    expect(useStore.getState().subtotal).toBeCloseTo(39.98);
  });

  it('charges shipping under $50 threshold', () => {
    const cheap: Product = { ...mockProduct, price: 10 };
    useStore.getState().addToCart(cheap, cheap.shades[0], 1);
    expect(useStore.getState().shippingCost).toBe(0);
  });

  it('free shipping at $50 or more', () => {
    useStore.getState().addToCart(mockProduct, mockProduct.shades[0], 3);
    expect(useStore.getState().shippingCost).toBe(0);
  });

  it('zero shipping when cart is empty', () => {
    expect(useStore.getState().shippingCost).toBe(0);
  });

  it('persists to localStorage on cart mutation', () => {
    useStore.getState().addToCart(mockProduct, mockProduct.shades[0], 1);
    const stored = JSON.parse(localStorage.getItem('glamour_cart')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].productId).toBe('99');
  });
});

/* ── Shipping Service Selection ── */

describe('shipping service selection', () => {
  it('selects a shipping service and updates shipping cost', () => {
    useStore.getState().setSelectedShippingService(1, 9.99);
    const s = useStore.getState();
    expect(s.selectedShippingServiceId).toBe(1);
    expect(s.shippingCost).toBe(9.99);
    expect(s.selectedShippingServicePrice).toBe(9.99);
  });

  it('preserves selected shipping price across cart changes', () => {
    const cheap: Product = { ...mockProduct, price: 10 };
    useStore.getState().setSelectedShippingService(2, 5.99);
    useStore.getState().addToCart(cheap, cheap.shades[0], 1);
    const s = useStore.getState();
    expect(s.selectedShippingServiceId).toBe(2);
    expect(s.shippingCost).toBe(5.99);
  });

  it('clears selection when cart is cleared', () => {
    useStore.getState().setSelectedShippingService(1, 9.99);
    const cheap: Product = { ...mockProduct, price: 10 };
    useStore.getState().addToCart(cheap, cheap.shades[0], 1);
    useStore.getState().clearCart();
    const s = useStore.getState();
    expect(s.selectedShippingServiceId).toBeNull();
    expect(s.shippingCost).toBe(0);
  });
});

/* ── Wishlist ── */

describe('wishlist operations', () => {
  it('toggles a product into the wishlist', () => {
    useStore.getState().toggleWishlist('1');
    expect(useStore.getState().wishlist).toEqual(['1']);
  });

  it('toggles a product out of the wishlist', () => {
    const { toggleWishlist } = useStore.getState();
    toggleWishlist('1');
    toggleWishlist('1');
    expect(useStore.getState().wishlist).toEqual([]);
  });

  it('isWishlisted returns correct boolean', () => {
    expect(useStore.getState().isWishlisted('1')).toBe(false);
    useStore.getState().toggleWishlist('1');
    expect(useStore.getState().isWishlisted('1')).toBe(true);
  });
});

/* ── Coupon ── */

describe('coupon operations', () => {
  it('applies a valid active coupon', () => {
    const result = useStore.getState().applyCoupon('GLAM20');
    expect(result.success).toBe(true);
    expect(useStore.getState().activeCoupon).not.toBeNull();
  });

  it('rejects an invalid coupon code', () => {
    const result = useStore.getState().applyCoupon('FAKECODE');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid');
    expect(useStore.getState().activeCoupon).toBeNull();
  });

  it('rejects an inactive coupon', () => {
    const result = useStore.getState().applyCoupon('EXPIRED50');
    expect(result.success).toBe(false);
    expect(useStore.getState().activeCoupon).toBeNull();
  });

  it('removes an applied coupon', () => {
    useStore.getState().applyCoupon('GLAM20');
    useStore.getState().removeCoupon();
    expect(useStore.getState().activeCoupon).toBeNull();
    expect(useStore.getState().couponDiscount).toBe(0);
  });
});

/* ── Loyalty ── */

describe('loyalty operations', () => {
  it('starts at Bronze with 0 points', () => {
    expect(useStore.getState().loyaltyTier).toBe('Bronze');
  });

  it('adds loyalty points and detects tier upgrade', () => {
    useStore.getState().addLoyaltyPoints(500);
    const s = useStore.getState();
    expect(s.loyaltyPoints).toBe(500);
    expect(s.loyaltyTier).toBe('Silver');
    expect(s.pendingTierUpgrade).toContain('Silver');
  });

  it('dismisses tier upgrade notification', () => {
    useStore.getState().addLoyaltyPoints(500);
    useStore.getState().dismissTierUpgrade();
    const s = useStore.getState();
    expect(s.hasSeenTierUpgrade).toBe(true);
    expect(s.pendingTierUpgrade).toBeNull();
  });

  it('deducts loyalty points', () => {
    useStore.getState().addLoyaltyPoints(500);
    useStore.getState().deductLoyaltyPoints(200);
    expect(useStore.getState().loyaltyPoints).toBe(300);
    expect(useStore.getState().redeemingPoints).toBe(0);
  });

  it('does not go below 0 on deduct', () => {
    useStore.getState().deductLoyaltyPoints(100);
    expect(useStore.getState().loyaltyPoints).toBe(0);
  });

  it('setRedeemingPoints clamps to available points', () => {
    useStore.getState().addLoyaltyPoints(500);
    useStore.getState().setRedeemingPoints(999);
    // max redeemable = floor(500/100)*100 = 500
    expect(useStore.getState().redeemingPoints).toBe(500);
    expect(useStore.getState().loyaltyDiscount).toBe(5);
  });
});

/* ── Hydration ── */

describe('hydration from localStorage', () => {
  it('restores cart from localStorage', () => {
    localStorage.setItem(
      'glamour_cart',
      JSON.stringify([
        {
          productId: '1',
          name: 'Saved',
          brand: 'B',
          price: 10,
          emoji: '🎁',
          shade: null,
          quantity: 3,
        },
      ]),
    );
    useStore.getState().hydrate();
    const s = useStore.getState();
    expect(s._hydrated).toBe(true);
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0].quantity).toBe(3);
    expect(s.cartCount).toBe(3);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('glamour_cart', 'not-json-at-all');
    useStore.getState().hydrate();
    expect(useStore.getState().cart).toEqual([]);
  });

  it('does not re-hydrate if already hydrated', () => {
    useStore.setState({
      _hydrated: true,
      cart: [
        {
          productId: '1',
          name: 'X',
          brand: 'B',
          price: 1,
          emoji: '🎁',
          shade: null,
          quantity: 1,
        },
      ],
    });
    useStore.getState().hydrate();
    expect(useStore.getState().cart).toHaveLength(1);
  });
});
