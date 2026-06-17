'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import CartDrawer from '@/components/cart-drawer';
import Toast from '@/components/toast';
import type { Product } from '@/lib/types';

interface WishlistContentProps {
  products: Product[];
}

export default function WishlistContent({ products }: WishlistContentProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { wishlist, toggleWishlist, userRole } = useStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || userRole === 'admin') {
      router.replace('/login?callbackUrl=/wishlist');
    }
  }, [status, router, userRole]);

  useEffect(() => {
    setWishlistProducts(products.filter((p) => wishlist.includes(p.id)));
  }, [wishlist, products]);

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-bg p-5" />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="mx-auto max-w-[900px] px-7 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-5 cursor-pointer border-none bg-none text-xs text-muted"
        >
          ← Back to Store
        </button>

        <h1 className="font-heading mb-6 text-[28px] font-normal text-text">
          Your Wishlist ({wishlist.length})
        </h1>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-lg border border-border bg-white px-[60px] py-15 text-center">
            <span className="text-5xl" aria-hidden="true">
              🤍
            </span>
            <p className="mt-3 text-sm font-medium text-text">Your wishlist is empty</p>
            <p className="mt-1 text-xs text-muted">Save your favorite products here</p>
            <button
              onClick={() => router.push('/')}
              className="mt-5 cursor-pointer rounded-full max-w-max bg-pink px-6 py-[10px] text-[13px] font-medium text-white"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5">
            {wishlistProducts.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-white">
                <div className="relative flex aspect-square items-center justify-center bg-pink-lt">
                  <span className="text-5xl" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <button
                    onClick={() => {
                      if (userRole === 'admin') return;
                      toggleWishlist(p.id);
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-white"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="var(--color-pink)"
                      stroke="var(--color-pink)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-medium text-text">{p.name}</div>
                  <div className="mt-1 text-sm font-medium text-pink">${p.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CartDrawer />
      <Toast />
    </div>
  );
}
