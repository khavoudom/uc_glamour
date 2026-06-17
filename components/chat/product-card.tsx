'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ChatProduct } from '@/store/chat-store';

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
      className="flex gap-3 rounded-md border-[0.5px] border-(--color-border) bg-(--color-white) p-3"
    >
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
