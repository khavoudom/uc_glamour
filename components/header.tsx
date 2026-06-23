'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import type { CategoryFilter } from '@/lib/types';
import { openCart } from './cart-drawer';
import { signOut } from 'next-auth/react';
import ConfirmModal from '@/components/confirm-modal';

interface HeaderProps {
  onSearchToggle: () => void;
  onCategoryChange?: (category: CategoryFilter) => void;
}

const NAV_CATEGORIES: { label: string; filter: CategoryFilter }[] = [
  { label: 'New In', filter: 'All' },
  { label: 'Makeup', filter: 'All' },
  { label: 'Skincare', filter: 'Skincare' },
  { label: 'Bundles & Sets', filter: 'All' },
  { label: 'Flash Deals', filter: 'All' },
];

export default function Header({ onSearchToggle, onCategoryChange }: HeaderProps) {
  const router = useRouter();
  const { cartCount, isAuthenticated, userRole } = useStore();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setLogoutPending(true);
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleNavClick = (filter: CategoryFilter) => {
    onCategoryChange?.(filter);
    const el = document.querySelector('.section-wrap');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      id="navbar"
      className="bg-white border-b border-border h-(--nav-h) flex items-center px-7 gap-0 sticky top-0 z-200"
    >
      <div className="flex gap-0 mr-auto">
        {NAV_CATEGORIES.map((link) => (
          <span
            key={link.label}
            onClick={() => handleNavClick(link.filter)}
            className="px-3.5 h-(--nav-h) flex items-center text-[12.5px] text-muted cursor-pointer border-b-2 border-transparent font-normal whitespace-nowrap"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
          >
            {link.label}
          </span>
        ))}
        {userRole === 'admin' && (
          <span
            onClick={() => router.push('/admin')}
            className="px-3.5 h-(--nav-h) flex items-center text-[12.5px] text-pink cursor-pointer border-b-2 border-transparent font-semibold whitespace-nowrap"
          >
            Admin
          </span>
        )}
      </div>

      <span
        onClick={() => router.push('/')}
        className="font-heading text-[22px] font-normal text-text cursor-pointer px-5 tracking-[0.3px] shrink-0"
      >
        Glam<em style={{ color: 'var(--color-pink)', fontStyle: 'italic' }}>our</em>
      </span>

      <div className="flex items-center gap-1.5 ml-auto">
        <span
          onClick={() => {
            if (!isAuthenticated) router.push('/login');
            else if (userRole === 'admin') router.push('/admin');
            else router.push('/account');
          }}
          className="text-[11px] font-medium text-pink tracking-[0.3px] px-1.5 cursor-pointer"
        >
          Rewards
        </span>

        <button onClick={onSearchToggle} aria-label="Search" className={navBtnCls}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        {userRole !== 'admin' && (
          <button
            onClick={() => router.push('/wishlist')}
            aria-label="Wishlist"
            className={navBtnCls}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              if (!isAuthenticated) router.push('/login');
              else setMenuOpen((prev) => !prev);
            }}
            aria-label="Account"
            className={navBtnCls}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>

          {menuOpen && isAuthenticated && (
            <div className="absolute right-0 top-full mt-2 w-50 rounded-lg border border-border bg-white shadow-lg z-50">
              <div className="border-b border-border px-4 py-3">
                <p className="text-[13px] font-medium text-text truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-[11px] text-muted truncate">{session?.user?.email || ''}</p>
              </div>
              <div className="py-1">
                {userRole !== 'admin' && (
                  <button
                    onClick={() => {
                      router.push('/account');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-text hover:bg-bg cursor-pointer border-none"
                  >
                    My Account
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      router.push('/admin');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-text hover:bg-bg cursor-pointer border-none"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogoutClick}
                  disabled={logoutPending}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-danger hover:bg-bg cursor-pointer border-none disabled:opacity-50"
                >
                  {logoutPending ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmModal
          open={showLogoutConfirm}
          title="Sign out?"
          message="Are you sure you want to sign out of your account?"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />

        {userRole !== 'admin' && (
          <button
            onClick={openCart}
            aria-label={`Shopping cart with ${cartCount} items`}
            className={`${navBtnCls} relative`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-pink rounded-full text-white text-[8px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}

const navBtnCls =
  'w-9 h-9 border-none bg-none cursor-pointer flex items-center justify-center rounded-full text-muted relative';
