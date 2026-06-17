'use client';

import { useState } from 'react';

interface PromoBannerProps {
  couponCode?: string;
  discountPercent?: number;
}

export default function PromoBanner({ couponCode, discountPercent }: PromoBannerProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      id="promo-band"
      className={`bg-[var(--color-pink)] text-white text-center px-5 py-[9px] text-[11px] tracking-[0.7px] font-light relative transition-all duration-300 ${
        leaving
          ? 'opacity-0 -translate-y-full max-h-0 py-0 overflow-hidden'
          : 'opacity-100 translate-y-0'
      }`}
    >
      Free next day shipping on orders over $100 &nbsp;·&nbsp;
      <strong className="font-medium tracking-[1px]">{couponCode}</strong> — {discountPercent}% off
      your first order
      <button
        onClick={handleDismiss}
        aria-label="Close"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-0 text-white/70 cursor-pointer text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}
