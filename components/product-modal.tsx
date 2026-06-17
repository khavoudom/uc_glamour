'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Shade, SubscriptionFrequency, Review, ReviewStats } from '@/lib/types';
import { useStore } from '@/lib/store';
import { SUBSCRIPTION_DISCOUNT } from '@/lib/types';
import ReviewSummary from '@/components/review-summary';
import ReviewCard from '@/components/review-card';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: 2, label: 'Every 2 weeks' },
  { value: 4, label: 'Every 4 weeks' },
  { value: 6, label: 'Every 6 weeks' },
  { value: 8, label: 'Every 8 weeks' },
];

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const {
    addToCart,
    addSubscription,
    showToast,
    toggleWishlist,
    isWishlisted,
    isAuthenticated,
    userRole,
  } = useStore();
  const router = useRouter();
  const isAdmin = userRole === 'admin';
  const [visible, setVisible] = useState(false);
  const [selectedShade, setSelectedShade] = useState<Shade | null>(
    product.shades.length > 0 ? product.shades[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(4);
  const [activeTab, setActiveTab] = useState<'info' | 'ship' | 'reviews'>('info');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const reviewsFetchedRef = useRef(false);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(false);
    try {
      const res = await fetch(`/api/reviews/${product.id}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviewStats(data.stats);
      setReviews(
        (data.reviews ?? []).map((r: Record<string, unknown>) => ({
          ...r,
          id: String(r.id),
          productId: String(r.productId),
        })),
      );
    } catch {
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (activeTab === 'reviews' && !reviewsFetchedRef.current) {
      reviewsFetchedRef.current = true;
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  const subscriptionPrice = Math.round(product.price * (1 - SUBSCRIPTION_DISCOUNT) * 100) / 100;
  const displayPrice = isSubscribe ? subscriptionPrice : product.price;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const handleAddToCart = () => {
    if (isAdmin) return;
    if (quantity < 1) return;
    if (isSubscribe && product.isSubscriptionEligible) {
      addSubscription({
        productId: product.id,
        productName: product.name,
        productEmoji: product.emoji,
        shade: selectedShade?.name ?? null,
        frequency,
        price: subscriptionPrice,
      });
      addToCart(product, selectedShade, quantity);
      showToast(`Subscribed! ${product.name} every ${frequency} weeks`);
    } else {
      addToCart(product, selectedShade, quantity);
    }
    close();
  };

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className={`fixed inset-0 z-[500] flex items-center justify-center p-5 transition-all duration-200 ${
        visible ? 'bg-black/35' : 'bg-black/0'
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white max-w-[900px] w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ borderRadius: 14 }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-[6px] px-7 py-3 text-[11px] text-muted border-b border-border shrink-0">
          <span onClick={close} className="cursor-pointer">
            Home
          </span>
          <span aria-hidden="true"> › </span>
          <span className="cursor-pointer">{product.category}</span>
          <span aria-hidden="true"> › </span>
          <span className="text-text font-medium">{product.name}</span>
          <button
            onClick={close}
            aria-label="Close"
            className="ml-auto bg-none border-none text-[18px] cursor-pointer text-muted"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 px-7 py-6 overflow-auto">
          {/* Left - Image */}
          <div>
            <div
              className="bg-bg aspect-square flex items-center justify-center relative mb-[10px]"
              style={{ borderRadius: 14 }}
            >
              {product.imageUrls?.[0] ? (
                <img
                  src={product.imageUrls[0]}
                  alt=""
                  className="block h-full w-full rounded-[14px] object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="text-[96px]"
                  style={{ color: 'rgba(232,51,106,0.18)' }}
                  aria-hidden="true"
                >
                  {product.emoji}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => {
                const url = product.imageUrls?.[i + 1];
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg bg-bg flex items-center justify-center cursor-pointer ${
                      i === 0 ? 'border-[1.5px] border-pink' : 'border border-border'
                    }`}
                  >
                    {url ? (
                      <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <span
                        className="text-[22px]"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        aria-hidden="true"
                      >
                        {product.emoji}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Details */}
          <div className="pt-1">
            {/* Rating row */}
            <div className="flex items-center gap-2 mb-[10px]">
              <span className="text-gold text-[13px]">
                {'★'.repeat(Math.floor(product.rating))}
                {product.rating % 1 >= 0.5 ? '½' : ''}
              </span>
              <span className="text-[11px] text-muted">{product.reviewCount} Reviews</span>
              <span className="text-hint text-[11px]" aria-hidden="true">
                ·
              </span>
              <span className="text-[11px] text-muted">{product.brand}</span>
            </div>

            <h1 className="font-heading text-[28px] font-normal text-text leading-[1.2] mb-[6px]">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-[22px] font-medium text-text">${displayPrice.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-[14px] text-hint line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-medium bg-[#fde8e8] text-danger rounded px-[6px] py-[2px]">
                    Save {discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Shade selector */}
            {product.shades.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-medium text-text">Select shade</span>
                  <span className="text-[11px] text-pink cursor-pointer">Find my shade</span>
                </div>
                <div className="text-[11px] text-muted mb-[10px]">{selectedShade?.name}</div>
                <div className="flex gap-[6px] mb-4 flex-wrap">
                  {product.shades.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedShade(s)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-150 ${
                        selectedShade?.name === s.name
                          ? 'border-2 border-text'
                          : 'border-2 border-transparent'
                      }`}
                      style={{ background: s.hex }}
                      title={s.name}
                      aria-label={`Select shade ${s.name}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mb-3">
              <button className="px-[14px] py-[7px] rounded-[20px] border border-border-md bg-white text-[11px] font-medium text-text cursor-pointer font-sans">
                Find my shade
              </button>
              <button className="px-[14px] py-[7px] rounded-[20px] border border-border-md bg-white text-[11px] font-medium text-text cursor-pointer font-sans">
                Virtual try on
              </button>
            </div>

            {/* Quantity + Add to Cart */}
            {!isAdmin && (
              <div className="flex gap-[10px] items-center mb-[10px]">
                <div className="flex items-center border border-border-md rounded-[20px] overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-[38px] bg-white border-none text-[16px] cursor-pointer text-text flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-[13px] font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-[38px] bg-white border-none text-[16px] cursor-pointer text-text flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className={`flex-1 text-white border-none rounded-[24px] py-[11px] text-[12px] font-medium tracking-[0.5px] uppercase font-sans ${
                    isAdmin ? 'bg-hint cursor-not-allowed' : 'bg-pink cursor-pointer'
                  }`}
                  onClick={handleAddToCart}
                >
                  {isAdmin ? 'Admin' : `Add to Cart — $${(displayPrice * quantity).toFixed(2)}`}
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) return;
                    if (!isAuthenticated) {
                      router.push(
                        '/login?callbackUrl=' + encodeURIComponent(window.location.pathname),
                      );
                      return;
                    }
                    toggleWishlist(product.id);
                  }}
                  className="w-[38px] h-[38px] bg-white border border-border-md rounded-full flex items-center justify-center cursor-pointer shrink-0"
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={isWishlisted(product.id) ? 'var(--color-pink)' : 'none'}
                    stroke="var(--color-pink)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
            )}

            {!isAdmin && (
              <div className="text-[11px] text-muted mb-4">
                Collect{' '}
                <span className="text-pink font-medium">{Math.round(displayPrice)} points</span>{' '}
                with this purchase
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
              {[
                'Finely milled',
                'Blurs pores',
                'Airbrushed finish',
                'Talc-free',
                'Sensitive skin safe',
                'Vegan formula',
              ].map((feat, i) => (
                <div key={feat} className="flex items-center gap-2">
                  <span
                    className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                      i % 2 === 0 ? 'bg-pink' : 'bg-gold'
                    }`}
                  />
                  <span className="text-[12px] text-text">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-7 pb-5">
          <div className="flex border-b border-border mb-5">
            {(['info', 'ship', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-[18px] py-[9px] text-[12px] cursor-pointer bg-none border-none font-sans ${
                  activeTab === tab
                    ? 'text-text font-medium border-b-2 border-text'
                    : 'text-muted border-b-2 border-transparent'
                }`}
                style={{ marginBottom: -0.5 }}
              >
                {tab === 'info'
                  ? 'Product Info'
                  : tab === 'ship'
                    ? 'Shipment Details'
                    : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div>
              <p className="text-[13px] text-muted leading-[1.75] max-w-[600px]">
                {product.description ||
                  'Lock in your look with this product. Infused with skin-loving ingredients, it blurs imperfections, controls shine, and leaves you with a soft, natural finish all day long. Suitable for all skin tones and types including sensitive skin.'}
              </p>
            </div>
          )}

          {activeTab === 'ship' && (
            <div>
              <div className="grid grid-cols-2 gap-[10px] mb-4">
                {[
                  { label: 'Standard shipping', value: '6–12 working days' },
                  { label: 'Express shipping', value: '2–3 working days' },
                  { label: 'Free returns', value: 'Within 30 days' },
                  { label: 'Ships to', value: '180+ countries' },
                ].map((item) => (
                  <div key={item.label} className="bg-pink-lt rounded-[10px] px-[14px] py-3">
                    <div className="text-[10px] text-muted mb-[1px]">{item.label}</div>
                    <div className="text-[12px] font-medium text-text">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-muted leading-[1.75] max-w-[600px]">
                Orders placed before 2pm (GMT) on weekdays are dispatched the same day. Free
                standard shipping on orders over $100.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-h-[300px] overflow-auto">
              <ReviewSummary stats={reviewStats} loading={reviewsLoading} error={reviewsError} />
              <div>
                {reviews.length > 0
                  ? reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                  : !reviewsLoading &&
                    !reviewsError && (
                      <p className="text-[13px] text-muted">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
