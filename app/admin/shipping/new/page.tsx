'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createShippingServiceAction,
  type ShippingServiceFormState,
} from '@/app/actions/admin/shipping';

export default function NewShippingServicePage() {
  const [state, action, pending] = useActionState<ShippingServiceFormState | undefined, FormData>(
    createShippingServiceAction,
    undefined,
  );
  const router = useRouter();

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">New Shipping Service</h1>

      {state?.message && !state?.errors && (
        <p className="mb-4 rounded-sm bg-[#fef2f2] px-3 py-2 text-xs text-danger">
          {state.message}
        </p>
      )}

      <form
        action={action}
        className="flex max-w-[400px] flex-col gap-4 rounded-lg border border-border bg-white p-6"
      >
        <Field label="Name" name="name" placeholder="e.g. Standard Shipping" error={state?.errors?.name?.[0]} />
        <Field
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={state?.errors?.price?.[0]}
        />
        <Field
          label="Estimated Delivery"
          name="estimatedDelivery"
          placeholder="e.g. 5-7 business days"
          error={state?.errors?.estimatedDelivery?.[0]}
        />
        <Checkbox label="Active" name="isActive" defaultChecked />

        <div className="mt-2 flex gap-2.5">
          <button
            type="submit"
            disabled={pending}
            className={`rounded-full px-6 py-[10px] text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Creating...' : 'Create Service'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-full border border-border bg-white px-6 py-[10px] text-[13px] text-text"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  step,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  placeholder?: string;
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
        className={`w-full rounded-sm border px-3.5 py-[10px] text-[13px] text-text outline-none box-border ${
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
