'use client';

import { useState, useCallback } from 'react';
import CouponToggleButton from './coupon-toggle-button';
import CouponDeleteButton from './coupon-delete-button';
import CouponFormModal from './coupon-form-modal';

interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export default function CouponsContent({ coupons }: { coupons: Coupon[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const openNew = useCallback(() => {
    setEditingCoupon(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCoupon(null);
  }, []);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Coupons</h1>
        <button
          onClick={openNew}
          className="cursor-pointer rounded-full bg-pink px-4.5 py-2 text-xs font-medium text-white no-underline"
        >
          + New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No coupons yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Code</Th>
                <Th align="left">Discount</Th>
                <Th align="left">Active</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 font-semibold text-text font-mono">{c.code}</td>
                  <td className="px-3.5 py-2.5 text-text">{c.discountPercent}%</td>
                  <td className="px-3.5 py-2.5">
                    <CouponToggleButton id={c.id} isActive={c.isActive} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="cursor-pointer rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] text-text no-underline"
                      >
                        Edit
                      </button>
                      <CouponDeleteButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CouponFormModal key={modalKey} open={modalOpen} onClose={closeModal} coupon={editingCoupon} />
    </>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3.5 py-2.5 font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
