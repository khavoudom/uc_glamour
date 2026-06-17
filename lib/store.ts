import { create } from 'zustand';
import type {
  CartItem,
  Coupon,
  Product,
  Shade,
  LoyaltyTier,
  ChatMessage,
  SubscriptionFrequency,
  SubscriptionPlan,
} from './types';
import type { UserRole } from '@/types/next-auth';
import { getTier, REDEMPTION_RATE } from './types';
import { coupons as allCoupons } from './data';

interface ToastState {
  message: string;
  visible: boolean;
}

interface StoreState {
  _hydrated: boolean;
  hydrate: () => void;

  isAuthenticated: boolean;
  userRole: UserRole | null;
  setIsAuthenticated: (val: boolean, role?: UserRole | null) => void;

  cart: CartItem[];
  addToCart: (product: Product, shade: Shade | null, quantity: number) => void;
  removeFromCart: (productId: string, shade: string | null) => void;
  updateQuantity: (productId: string, shade: string | null, delta: number) => void;
  clearCart: () => void;
  cartCount: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  couponDiscount: number;

  subtotal: number;
  shippingCost: number;
  selectedShippingServiceId: number | null;
  selectedShippingServicePrice: number;
  setSelectedShippingService: (id: number | null, price: number) => void;

  toast: ToastState;
  showToast: (message: string) => void;

  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  earnedThisSession: number;
  redeemingPoints: number;
  setRedeemingPoints: (pts: number) => void;
  addLoyaltyPoints: (amount: number) => void;
  deductLoyaltyPoints: (pts: number) => void;
  loyaltyDiscount: number;
  hasSeenTierUpgrade: boolean;
  pendingTierUpgrade: string | null;
  dismissTierUpgrade: () => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateChatMessage: (id: string, text: string) => void;
  fetchAiResponse: () => Promise<void>;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatOperatingHours: boolean;
  isAiLoading: boolean;

  subscriptions: SubscriptionPlan[];
  addSubscription: (plan: SubscriptionPlan) => void;
  removeSubscription: (productId: string, shade: string | null) => void;
  updateSubscriptionFrequency: (
    productId: string,
    shade: string | null,
    freq: SubscriptionFrequency,
  ) => void;
}

const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING = 0;

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function ls(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lss(key: string, val: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function computeDiscount(cart: CartItem[], coupon: Coupon | null): number {
  if (!coupon) return 0;
  return Math.round(calcSubtotal(cart) * (coupon.discountPercent / 100) * 100) / 100;
}

function computeCartDerived(
  cart: CartItem[],
  activeCoupon: Coupon | null,
  selectedServicePrice?: number,
) {
  const subtotal = calcSubtotal(cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost =
    selectedServicePrice !== undefined && subtotal > 0
      ? selectedServicePrice
      : subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
        ? 0
        : FLAT_SHIPPING;
  const couponDiscount = computeDiscount(cart, activeCoupon);
  return { cart, subtotal, cartCount, shippingCost, couponDiscount };
}

function checkOperatingHours(): boolean {
  const h = new Date().getHours();
  return h >= 9 && h < 21;
}

export const useStore = create<StoreState>()((set, get) => ({
  _hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined' || get()._hydrated) return;
    const rawCart = ls('glamour_cart');
    let cart = [];
    try {
      cart = rawCart ? JSON.parse(rawCart) : [];
    } catch {
      cart = [];
    }
    const wishlistRaw = ls('glamour_wishlist');
    let wishlist = [];
    try {
      wishlist = wishlistRaw ? JSON.parse(wishlistRaw) : [];
    } catch {
      wishlist = [];
    }
    const loyaltyRaw = ls('glamour_loyalty');
    let loyaltyPoints = 0;
    try {
      loyaltyPoints = loyaltyRaw ? JSON.parse(loyaltyRaw) : 0;
    } catch {
      loyaltyPoints = 0;
    }
    const subRaw = ls('glamour_subscriptions');
    let subscriptions = [];
    try {
      subscriptions = subRaw ? JSON.parse(subRaw) : [];
    } catch {
      subscriptions = [];
    }
    const couponCodeRaw = ls('glamour_coupon');
    let activeCoupon: Coupon | null = null;
    if (couponCodeRaw) {
      try {
        const code = JSON.parse(couponCodeRaw);
        activeCoupon = allCoupons.find((c) => c.code === code && c.isActive) ?? null;
      } catch {
        activeCoupon = null;
      }
    }
    const derived = computeCartDerived(cart, activeCoupon);
    set({
      _hydrated: true,
      cart: derived.cart,
      cartCount: derived.cartCount,
      subtotal: derived.subtotal,
      shippingCost: derived.shippingCost,
      wishlist,
      loyaltyPoints,
      loyaltyTier: getTier(loyaltyPoints).name as LoyaltyTier,
      subscriptions,
      activeCoupon,
      couponDiscount: derived.couponDiscount,
    });
  },

  isAuthenticated: false,
  userRole: null,
  setIsAuthenticated: (val, role = null) => set({ isAuthenticated: val, userRole: role }),

  setSelectedShippingService: (id, price) => {
    set({
      selectedShippingServiceId: id,
      selectedShippingServicePrice: price,
      shippingCost: price,
    });
  },

  cart: [],
  cartCount: 0,
  subtotal: 0,
  shippingCost: 0,
  selectedShippingServiceId: null,
  selectedShippingServicePrice: 0,

  addToCart: (product, shade, quantity) => {
    const shadeName = shade?.name ?? null;
    set((state) => {
      const existing = state.cart.find((i) => i.productId === product.id && i.shade === shadeName);
      const newCart = existing
        ? state.cart.map((i) =>
            i.productId === product.id && i.shade === shadeName
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        : [
            ...state.cart,
            {
              productId: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              originalPrice: product.originalPrice,
              emoji: product.emoji,
              imageUrls: product.imageUrls,
              shade: shadeName,
              quantity,
            },
          ];
      lss('glamour_cart', newCart);
      return computeCartDerived(newCart, state.activeCoupon, state.selectedShippingServicePrice);
    });
  },

  removeFromCart: (productId, shade) => {
    set((state) => {
      const newCart = state.cart.filter((i) => !(i.productId === productId && i.shade === shade));
      lss('glamour_cart', newCart);
      return computeCartDerived(newCart, state.activeCoupon, state.selectedShippingServicePrice);
    });
  },

  updateQuantity: (productId, shade, delta) => {
    set((state) => {
      const newCart = state.cart
        .map((i) =>
          i.productId === productId && i.shade === shade
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0);
      lss('glamour_cart', newCart);
      return computeCartDerived(newCart, state.activeCoupon, state.selectedShippingServicePrice);
    });
  },

  clearCart: () => {
    set({
      cart: [],
      cartCount: 0,
      subtotal: 0,
      shippingCost: 0,
      couponDiscount: 0,
      activeCoupon: null,
      selectedShippingServiceId: null,
      selectedShippingServicePrice: 0,
    });
    lss('glamour_cart', []);
    lss('glamour_coupon', null);
  },

  wishlist: [],

  toggleWishlist: (productId) => {
    set((state) => {
      const exists = state.wishlist.includes(productId);
      const newWishlist = exists
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId];
      lss('glamour_wishlist', newWishlist);
      return { wishlist: newWishlist };
    });
  },

  isWishlisted: (productId) => get().wishlist.includes(productId),

  activeCoupon: null,

  applyCoupon: (code) => {
    const coupon = allCoupons.find((c) => c.code === code.trim().toUpperCase() && c.isActive);
    if (!coupon) return { success: false, message: 'Invalid or expired coupon code' };
    lss('glamour_coupon', coupon.code);
    set((state) => ({
      activeCoupon: coupon,
      couponDiscount: computeDiscount(state.cart, coupon),
    }));
    return { success: true, message: `Coupon applied! ${coupon.discountPercent}% off` };
  },

  removeCoupon: () => {
    lss('glamour_coupon', null);
    set({ activeCoupon: null, couponDiscount: 0 });
  },
  couponDiscount: 0,

  toast: { message: '', visible: false },
  showToast: (message) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => set({ toast: { message: '', visible: false } }), 2200);
  },

  loyaltyPoints: 0,
  loyaltyTier: 'Bronze',
  earnedThisSession: 0,
  redeemingPoints: 0,
  loyaltyDiscount: 0,
  hasSeenTierUpgrade: true,
  pendingTierUpgrade: null,

  setRedeemingPoints: (pts) => {
    const { loyaltyPoints } = get();
    const maxRedeemable = Math.floor(loyaltyPoints / REDEMPTION_RATE) * REDEMPTION_RATE;
    const clamped = Math.min(Math.max(0, pts), maxRedeemable);
    set({ redeemingPoints: clamped, loyaltyDiscount: clamped / REDEMPTION_RATE });
  },

  addLoyaltyPoints: (amount) => {
    set((state) => {
      const newPoints = state.loyaltyPoints + amount;
      const newTier = getTier(newPoints).name;
      lss('glamour_loyalty', newPoints);
      const upgrade = newTier !== state.loyaltyTier ? `Welcome to ${newTier} tier!` : null;
      return {
        loyaltyPoints: newPoints,
        earnedThisSession: state.earnedThisSession + amount,
        loyaltyTier: newTier as LoyaltyTier,
        hasSeenTierUpgrade: !upgrade,
        pendingTierUpgrade: upgrade,
      };
    });
  },

  deductLoyaltyPoints: (pts) => {
    set((state) => {
      const newPoints = Math.max(0, state.loyaltyPoints - pts);
      lss('glamour_loyalty', newPoints);
      return {
        loyaltyPoints: newPoints,
        loyaltyTier: getTier(newPoints).name as LoyaltyTier,
        redeemingPoints: 0,
        loyaltyDiscount: 0,
      };
    });
  },

  dismissTierUpgrade: () => set({ hasSeenTierUpgrade: true, pendingTierUpgrade: null }),

  chatMessages: [],
  chatOpen: false,
  chatOperatingHours: checkOperatingHours(),
  isAiLoading: false,

  addChatMessage: (msg) => {
    const full: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, full] }));
    return full;
  },
  updateChatMessage: (id, text) => {
    set((state) => ({
      chatMessages: state.chatMessages.map((m) => (m.id === id ? { ...m, text } : m)),
    }));
  },
  fetchAiResponse: async () => {
    set({ isAiLoading: true });
    const s = get();
    const history = s.chatMessages
      .filter((m) => m.role !== 'ai' || m.text !== '')
      .map((m) => ({ role: m.role, text: m.text }));

    const aiMsg = s.addChatMessage({ role: 'ai', text: '' });
    let accumulated = '';

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        s.updateChatMessage(
          aiMsg.id,
          'Thank you for your question! One of our beauty advisors will be with you shortly. In the meantime, feel free to browse our product catalog.',
        );
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              accumulated += parsed.token;
              s.updateChatMessage(aiMsg.id, accumulated);
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Stream fetch error:', error);
      s.updateChatMessage(
        aiMsg.id,
        'Thank you for your question! One of our beauty advisors will be with you shortly. In the meantime, feel free to browse our product catalog.',
      );
    } finally {
      set({ isAiLoading: false });
    }
  },

  setChatOpen: (open) => set({ chatOpen: open }),

  subscriptions: [],

  addSubscription: (plan) => {
    set((state) => {
      const newSubs = [
        ...state.subscriptions.filter(
          (s) => !(s.productId === plan.productId && s.shade === plan.shade),
        ),
        plan,
      ];
      lss('glamour_subscriptions', newSubs);
      return { subscriptions: newSubs };
    });
    get().showToast('Subscription added!');
  },

  removeSubscription: (productId, shade) => {
    set((state) => {
      const newSubs = state.subscriptions.filter(
        (s) => !(s.productId === productId && s.shade === shade),
      );
      lss('glamour_subscriptions', newSubs);
      return { subscriptions: newSubs };
    });
  },

  updateSubscriptionFrequency: (productId, shade, freq) => {
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.productId === productId && s.shade === shade ? { ...s, frequency: freq } : s,
      ),
    }));
  },
}));
