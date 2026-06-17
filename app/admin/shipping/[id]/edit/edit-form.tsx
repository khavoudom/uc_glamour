'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
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

export default function EditShippingServiceForm({ service }: { service: ShippingService }) {
  const [state, action, pending] = useActionState<ShippingServiceFormState | undefined, FormData>(
    updateShippingServiceAction,
    undefined,
  );
  const router = useRouter();

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">Edit Shipping Service</h1>

      {state?.message && (
        <p
          className={`mb-4 rounded-sm px-3 py-2 text-xs ${
            state.errors ? 'bg-[#fef2f2] text-danger' : 'bg-[var(--color-success-lt)] text-success'
          }`}
        >
          {state.message}
        </p>
      )}

      <form
        action={action}
        className="flex max-w-[400px] flex-col gap-4 rounded-lg border border-border bg-white p-6"
      >
        <input type="hidden" name="id" value={service.id} />
        <Field
          label="Name"
          name="name"
          defaultValue={service.name}
          error={state?.errors?.name?.[0]}
        />
        <Field
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          defaultValue={service.price}
          error={state?.errors?.price?.[0]}
        />
        <Field
          label="Estimated Delivery"
          name="estimatedDelivery"
          defaultValue={service.estimatedDelivery}
          error={state?.errors?.estimatedDelivery?.[0]}
        />
        <Checkbox label="Active" name="isActive" defaultChecked={service.isActive} />

        <div className="mt-2 flex gap-2.5">
          <button
            type="submit"
            disabled={pending}
            className={`rounded-full px-6 py-[10px] text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/shipping')}
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
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
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
        defaultValue={defaultValue}
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
