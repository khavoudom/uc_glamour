'use client';

import { useState, useEffect, useRef } from 'react';
import type { Product } from '@/lib/types';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
  products: Product[];
}

export default function SearchOverlay({
  open,
  onClose,
  onProductSelect,
  products,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const filtered = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      id="search-overlay"
      className={`sticky z-190 bg-white border-b border-border px-7 py-3 flex gap-2.5 items-center transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ top: 'var(--nav-h)' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products, brands, categories…"
        aria-label="Search products"
        className="flex-1 border border-border-md rounded-xl px-4 py-2.25 text-[13px] font-sans outline-none bg-bg text-text"
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-pink)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '';
        }}
      />
      <button
        onClick={() => {
          setQuery('');
          onClose();
        }}
        aria-label="Close search"
        className="bg-none border-none cursor-pointer text-lg text-muted"
      >
        ✕
      </button>

      {filtered.length > 0 && (
        <div
          className="absolute left-7 right-15 top-full bg-white border border-border rounded-md p-2 mt-1 z-50"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="flex items-center gap-2.5 w-full p-2 border-none bg-none cursor-pointer rounded-lg text-[13px] text-left text-text"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span aria-hidden="true" className="text-xl">
                {p.emoji}
              </span>
              <span className="font-medium">{p.name}</span>
              <span className="ml-auto text-[11px] text-muted">${p.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
