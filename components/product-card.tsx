'use client';

import type { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { openCart } from './cart-drawer';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

function Badge({ badge }: { badge: Product['badge'] }) {
  if (!badge) return null;
  const cls =
    badge === 'SALE'
      ? 'bg-[#fde8e8] text-danger text-[10px] font-medium px-2 py-0.5 rounded'
      : badge === 'NEW'
        ? 'bg-success-lt text-success text-[10px] font-medium px-2 py-0.5 rounded'
        : badge === 'HOT'
          ? 'bg-pink-lt text-pink-dk text-[10px] font-medium px-2 py-0.5 rounded'
          : '';
  return <span className={cls}>{badge}</span>;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { isWishlisted, toggleWishlist, addToCart, isAuthenticated } = useStore();
  const router = useRouter();
  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }
    toggleWishlist(product.id);
  };
  return (
    <article
      onClick={() => onSelect(product)}
      className="p-card bg-white border border-border rounded-[14px] overflow-hidden cursor-pointer"
      style={{ transition: 'all 0.15s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--color-hint)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div className="p-card-img aspect-square flex items-center justify-center relative border-b border-border bg-pink-lt">
        <div className="absolute top-2 left-2">
          <Badge badge={product.badge} />
        </div>
        <div
          className="p-card-wish absolute top-2 right-2 w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: wishlisted ? 'var(--color-pink)' : 'var(--color-white)',
            border: '0.5px solid var(--color-border)',
          }}
          onClick={handleToggleWishlist}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={wishlisted ? '#fff' : 'none'}
            stroke={wishlisted ? '#fff' : 'var(--color-muted)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
        {product.imageUrls?.[0] ? (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="p-card-ico text-[48px]" aria-hidden="true">
            {product.emoji}
          </span>
        )}
      </div>

      <div className="p-card-body p-3">
        <div className="p-brand text-[9px] text-muted tracking-[1px] uppercase mb-[3px]">
          {product.brand}
        </div>
        <div className="p-name text-[13px] font-medium text-text leading-[1.3] mb-[6px]">
          {product.name}
        </div>
        {product.shades.length > 0 && (
          <div className="p-shades flex gap-1 items-center mb-[6px]">
            {product.shades.slice(0, 3).map((s) => (
              <span
                key={s.name}
                className="w-[10px] h-[10px] rounded-full inline-block"
                style={{ background: s.hex, border: '0.5px solid rgba(0,0,0,0.1)' }}
                title={s.name}
              />
            ))}
            {product.shades.length > 3 && (
              <span className="text-[10px] text-muted">+{product.shades.length - 3}</span>
            )}
          </div>
        )}
        <div className="p-stars flex items-center gap-[3px] mb-2">
          <span className="text-gold text-[11px]">
            {'★'.repeat(Math.floor(product.rating))}
            {product.rating % 1 >= 0.5 ? '½' : ''}
          </span>
          <span className="text-[10px] text-muted">({product.reviewCount})</span>
        </div>
        <div className="p-footer flex items-center justify-between">
          <div>
            <span className="p-price text-[14px] font-medium text-text">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="p-price-old text-[10px] text-hint line-through ml-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            className="p-add w-7 h-7 bg-text border-none rounded-full flex items-center justify-center cursor-pointer shrink-0 text-white"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, product.shades[0] || null, 1);
              openCart();
            }}
            aria-label="Add to cart"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-pink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-text)';
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
