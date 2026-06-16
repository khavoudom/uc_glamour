'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CartDrawer from '@/components/cart-drawer';
import Toast from '@/components/toast';

interface ContentPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function ContentPageLayout({ title, children }: ContentPageLayoutProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="store min-h-screen bg-bg">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="px-7 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-6 cursor-pointer border-none bg-none text-xs text-muted"
        >
          ← Back to Store
        </button>
        <div className="mx-auto max-w-[700px]">
          <h1 className="font-heading text-[28px] font-normal text-text mb-6">{title}</h1>
          <div className="text-sm text-text/80 leading-relaxed space-y-5">{children}</div>
        </div>
      </div>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}
