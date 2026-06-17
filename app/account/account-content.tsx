'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut, Package } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CartDrawer from '@/components/cart-drawer';
import Toast from '@/components/toast';
import { signOut } from 'next-auth/react';
import { updateAccountName } from '@/app/actions/auth';
import ConfirmModal from '@/components/confirm-modal';
import type { OrderSummary } from '@/lib/types';

type Section = 'orders' | 'profile';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  createdAt: Date;
}

export default function AccountContent({
  orders,
  user,
}: {
  orders: OrderSummary[];
  user: UserProfile | null;
}) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('orders');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sidebarItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'My Orders', icon: <Package size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === user?.name) {
      setEditingName(false);
      setNameInput(user?.name ?? '');
      return;
    }
    const result = await updateAccountName(nameInput.trim());
    if (result?.error) return;
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header onSearchToggle={() => setSearchOpen((prev) => !prev)} />
      <div className="mx-auto flex max-w-250 gap-10 px-7 py-10 mb-12">
        {/* Sidebar */}
        <aside className="w-45 shrink-0">
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-pink/10 text-pink'
                    : 'text-muted hover:bg-pink/5 hover:text-text'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <hr className="my-2 border-border" />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium text-muted transition-colors hover:bg-red/5 hover:text-red"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {activeSection === 'orders' && (
            <>
              <h1 className="font-heading mb-6 text-2xl font-medium text-text">My Orders</h1>

              {orders.length === 0 ? (
                <div className="rounded-lg border border-border bg-white p-16 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10">
                      <ShoppingBag size={28} className="text-pink" />
                    </div>
                  </div>
                  <h2 className="mb-2 text-base font-medium text-text">No orders yet</h2>
                  <p className="mb-6 text-xs text-muted">
                    When you place an order, you&apos;ll see it here.
                  </p>
                  <button
                    onClick={() => router.push('/products')}
                    className="cursor-pointer rounded-full bg-pink min-w-max px-8 py-3 text-[13px] font-medium text-white font-sans border-none"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-white">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <Th align="left">Order #</Th>
                        <Th align="left">Date</Th>
                        <Th align="left">Items</Th>
                        <Th align="left">Total</Th>
                        <Th align="left">Payment</Th>
                        <Th align="left">Fulfillment</Th>
                        <Th align="right" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border">
                          <td className="px-3.5 py-2.5 font-semibold text-text font-mono">
                            #{o.id}
                          </td>
                          <td className="px-3.5 py-2.5 text-[11px] text-muted">
                            {new Date(o.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-3.5 py-2.5 text-muted">
                            {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-text">
                            ${Number(o.total).toFixed(2)}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <StatusBadge status={o.paymentStatus} type="payment" />
                          </td>
                          <td className="px-3.5 py-2.5">
                            <StatusBadge status={o.fulfillmentStatus} type="fulfillment" />
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <button
                              onClick={() => router.push(`/account/orders/${o.id}`)}
                              className="cursor-pointer rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] text-text"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeSection === 'profile' && user && (
            <>
              <h1 className="font-heading mb-6 text-2xl font-medium text-text">Profile</h1>

              <div className="space-y-5">
                {/* Account Info */}
                <div className="rounded-lg border border-border bg-white p-6">
                  <h2 className="mb-4 text-sm font-semibold text-text">Account Details</h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted">
                        Full Name
                      </label>
                      {editingName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="flex-1 rounded-md border border-border px-3 py-2 text-[13px] text-text outline-none focus:border-pink"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') {
                                setEditingName(false);
                                setNameInput(user.name);
                              }
                            }}
                          />
                          <button
                            onClick={handleSaveName}
                            className="cursor-pointer rounded-md bg-pink px-4 py-2 text-xs font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingName(false);
                              setNameInput(user.name);
                            }}
                            className="cursor-pointer rounded-md border border-border px-4 py-2 text-xs font-medium text-text"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-text">{user.name}</span>
                          <button
                            onClick={() => setEditingName(true)}
                            className="cursor-pointer text-[11px] text-pink hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted">Email</label>
                      <span className="text-[13px] text-text">{user.email}</span>
                    </div>

                    {/* Member since */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted">
                        Member Since
                      </label>
                      <span className="text-[13px] text-text">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loyalty Card */}
                <div className="rounded-lg border border-border bg-white p-6">
                  <h2 className="mb-4 text-sm font-semibold text-text">Loyalty & Rewards</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink/10 text-xl">
                      {getTierEmoji(user.loyaltyTier)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text">{user.loyaltyTier}</div>
                      <div className="text-[11px] text-muted">{user.loyaltyPoints} points</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <CartDrawer />
      <Toast />
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
    </div>
  );
}

function Th({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3.5 py-2.5 font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}

function getTierEmoji(tier: string): string {
  switch (tier) {
    case 'Bronze':
      return '🥉';
    case 'Silver':
      return '🥈';
    case 'Gold':
      return '🥇';
    case 'Diamond':
      return '💎';
    default:
      return '🥉';
  }
}
