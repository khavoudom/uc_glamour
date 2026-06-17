'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    subtotal,
    shippingCost,
    showToast,
    userRole,
  } = useStore();
  const isAdmin = userRole === 'admin';

  const [open, setOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('toggle-cart', handler);
    return () => window.removeEventListener('toggle-cart', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const handleApplyCoupon = () => {
    if (isAdmin) return;
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    if (!result.success) {
      showToast(result.message);
    } else {
      showToast(result.message);
      setCouponInput('');
    }
  };

  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingCost);

  return (
    <>
      <div
        id="cart-overlay"
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-500 bg-black/35 transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          id="cart-drawer"
          ref={panelRef}
          className={`fixed top-0 right-0 bottom-0 w-90 bg-white flex flex-col z-501 transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="px-5 py-4.5 flex items-center justify-between border-b border-border">
            <span className="font-heading text-xl font-normal">Your Bag ({cart.length})</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close cart"
              className="bg-none border-none cursor-pointer text-xl text-muted"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-5 text-center">
              <span className="text-[40px]" aria-hidden="true">
                🛒
              </span>
              <p className="text-sm font-medium text-text">Your bag is empty</p>
              <p className="text-xs text-muted">Add some products to get started!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 drawer-scroll px-5 py-4 flex flex-col gap-3.5">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.shade}`} className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {item.imageUrls?.[0] ? (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-[26px]"
                          style={{ color: 'rgba(232,51,106,0.25)' }}
                          aria-hidden="true"
                        >
                          {item.emoji}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium mb-0.5">{item.name}</div>
                      <div className="text-[11px] text-muted mb-1.5">
                        {item.shade || 'Standard'}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => {
                              if (isAdmin) return;
                              updateQuantity(item.productId, item.shade, -1);
                            }}
                            className="w-6.5 h-6.5 bg-none border-none text-sm cursor-pointer flex items-center justify-center text-text"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-xs font-medium w-5.5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (isAdmin) return;
                              updateQuantity(item.productId, item.shade, 1);
                            }}
                            className="w-6.5 h-6.5 bg-none border-none text-sm cursor-pointer flex items-center justify-center text-text"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[13px] font-medium ml-auto">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            if (isAdmin) return;
                            removeFromCart(item.productId, item.shade);
                          }}
                          aria-label="Remove item"
                          className="bg-none border-none cursor-pointer text-hint text-sm ml-1"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-border">
                <div className="flex gap-2 mb-3.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    aria-label="Enter coupon code"
                    disabled={isAdmin}
                    className="flex-1 border border-border-md rounded-lg px-3 py-2 text-xs font-sans outline-none text-text bg-white disabled:bg-bg disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isAdmin}
                    className="border-none rounded-lg px-3.5 py-2 text-xs font-medium font-sans text-white disabled:cursor-not-allowed"
                    style={{
                      background: isAdmin
                        ? 'var(--color-hint)'
                        : activeCoupon
                          ? 'var(--color-pink)'
                          : 'var(--color-text)',
                    }}
                  >
                    {activeCoupon ? 'Applied' : 'Apply'}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 mb-3.5">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Discount ({activeCoupon?.code})</span>
                      <span>−${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-medium text-text border-t border-border pt-2 mt-1">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isAdmin) return;
                    setOpen(false);
                    window.location.href = '/checkout';
                  }}
                  className={`w-full rounded-2xl py-3.25 text-[13px] font-medium font-sans tracking-[0.4px] flex items-center justify-center gap-2 ${
                    isAdmin
                      ? 'bg-hint cursor-not-allowed text-white border-none'
                      : 'bg-pink text-white border-none cursor-pointer'
                  }`}
                >
                  Checkout Securely{' '}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function openCart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('toggle-cart'));
  }
}
