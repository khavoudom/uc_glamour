'use client';

import { useEffect, useState, useCallback } from 'react';
import { useActionState } from 'react';
import {
  createShippingServiceAction,
  updateShippingServiceAction,
  type ShippingServiceFormState,
} from '@/app/actions/admin/shipping';

interface ShippingService {
  id: number;
  name: string;
  price: string;
  estimatedDelivery: string;
  isActive: boolean;
}

interface ShippingFormModalProps {
  open: boolean;
  onClose: () => void;
  service?: ShippingService | null;
}

export default function ShippingFormModal({ open, onClose, service }: ShippingFormModalProps) {
  const action = service ? updateShippingServiceAction : createShippingServiceAction;
  const [state, formAction, pending] = useActionState<
    ShippingServiceFormState | undefined,
    FormData
  >(action, undefined);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => onClose(), 200);
      return () => clearTimeout(timer);
    }
  }, [state?.success, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const heading = service ? 'Edit Shipping Service' : 'New Shipping Service';

  return (
    <div
      className={`fixed inset-0 z-600 flex items-center justify-center transition-all duration-200 ${
        visible ? 'bg-black/35' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div
        className={`bg-white p-6 shadow-lg transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ borderRadius: 14, width: 400 }}
      >
        <h3 className="font-heading text-base font-medium text-text mb-4">{heading}</h3>

        {state?.message && (
          <p
            className={`mb-4 rounded-sm px-3 py-2 text-xs ${
              state.success ? 'bg-(--color-success-lt) text-success' : 'bg-[#fef2f2] text-danger'
            }`}
          >
            {state.message}
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          {service && <input type="hidden" name="id" value={service.id} />}

          <Field
            label="Name"
            name="name"
            placeholder="e.g. Standard Shipping"
            defaultValue={service?.name}
            error={state?.errors?.name?.[0]}
          />
          <Field
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            defaultValue={service?.price}
            error={state?.errors?.price?.[0]}
          />
          <Field
            label="Estimated Delivery"
            name="estimatedDelivery"
            placeholder="e.g. 5-7 business days"
            defaultValue={service?.estimatedDelivery}
            error={state?.errors?.estimatedDelivery?.[0]}
          />
          <Checkbox label="Active" name="isActive" defaultChecked={service?.isActive ?? true} />

          <div className="mt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-sm border border-border bg-white px-4 py-2 text-xs font-medium text-text cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm border-none bg-pink px-4 py-2 text-xs font-medium text-white cursor-pointer font-sans disabled:bg-hint disabled:cursor-not-allowed"
            >
              {pending
                ? service
                  ? 'Saving...'
                  : 'Creating...'
                : service
                  ? 'Save Changes'
                  : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  step,
  placeholder,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-medium text-text">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`w-full rounded-sm border px-3.5 py-2.5 text-[13px] text-text outline-none box-border ${
          error ? 'border-danger' : 'border-border-md'
        }`}
      />
      {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
    </div>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-text">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-pink" />
      {label}
    </label>
  );
}
