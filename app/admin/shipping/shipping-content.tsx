'use client';

import { useState, useCallback } from 'react';
import ShippingToggleButton from './shipping-toggle-button';
import ShippingDeleteButton from './shipping-delete-button';
import ShippingFormModal from './shipping-form-modal';

interface ShippingService {
  id: number;
  name: string;
  price: string;
  estimatedDelivery: string;
  isActive: boolean;
}

export default function ShippingContent({ services }: { services: ShippingService[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ShippingService | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const openNew = useCallback(() => {
    setEditingService(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((service: ShippingService) => {
    setEditingService(service);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingService(null);
  }, []);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Shipping Services</h1>
        <button
          onClick={openNew}
          className="cursor-pointer rounded-full bg-pink px-4.5 py-2 text-xs font-medium text-white no-underline"
        >
          + New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No shipping services yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Name</Th>
                <Th align="left">Price</Th>
                <Th align="left">Est. Delivery</Th>
                <Th align="left">Active</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 font-medium text-text">{s.name}</td>
                  <td className="px-3.5 py-2.5 text-text">
                    {Number(s.price) === 0 ? 'Free' : `$${Number(s.price).toFixed(2)}`}
                  </td>
                  <td className="px-3.5 py-2.5 text-muted">{s.estimatedDelivery}</td>
                  <td className="px-3.5 py-2.5">
                    <ShippingToggleButton id={s.id} isActive={s.isActive} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => openEdit(s)}
                        className="cursor-pointer rounded-sm border border-border bg-white px-2.5 py-1 text-[11px] text-text no-underline"
                      >
                        Edit
                      </button>
                      <ShippingDeleteButton id={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ShippingFormModal key={modalKey} open={modalOpen} onClose={closeModal} service={editingService} />
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
