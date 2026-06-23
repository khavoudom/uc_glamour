'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { ChatProduct } from '@/store/chat-store';
import { useChatStore } from '@/store/chat-store';
import { useStore } from '@/lib/store';
import { toggleWishlist } from '@/app/actions/wishlist';

interface ProductCardProps {
  product: ChatProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrls?.[0];
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative flex gap-3 rounded-md border-[0.5px] border-(--color-border) bg-(--color-white) p-3"
    >
      <button
        onClick={async () => {
          await toggleWishlist(product.id);
          useStore.getState().toggleWishlist(String(product.id));
          useChatStore.getState().removeFromDisplayProducts(product.id);
        }}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-(--color-muted) hover:bg-red-50 hover:text-red-500 transition-colors"
        aria-label="Remove from wishlist"
        title="Remove from wishlist"
      >
        <Trash2 size={11} />
      </button>
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-sm bg-(--color-bg)">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[28px]">
            {product.emoji || '📦'}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="truncate text-[13px] font-medium text-(--color-text)">{product.name}</p>
        <p className="truncate text-[11px] text-(--color-muted)">{product.brand}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-(--color-text)">
            ${product.price.toFixed(2)}
          </span>
          {product.rating && product.rating > 0 && (
            <span className="text-[11px] text-(--color-muted)">★ {product.rating.toFixed(1)}</span>
          )}
        </div>
        {product.shades && product.shades.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.shades.slice(0, 4).map((s: any) => (
              <span
                key={s.name}
                className="inline-block h-3.5 w-3.5 rounded-full border-[0.5px] border-(--color-border)"
                style={{ backgroundColor: s.hex || '#ccc' }}
                title={s.name}
              />
            ))}
            {product.shades.length > 4 && (
              <span className="text-[9px] text-(--color-muted)">+{product.shades.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
