'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCouponAction, type CouponFormState } from '@/app/actions/admin/coupons';

interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export default function EditCouponForm({ coupon }: { coupon: Coupon }) {
  const [state, action, pending] = useActionState<CouponFormState | undefined, FormData>(
    updateCouponAction,
    undefined,
  );
  const router = useRouter();

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">Edit Coupon</h1>

      {state?.message && (
        <p
          className={`mb-4 rounded-sm px-3 py-2 text-xs ${
            state.errors ? 'bg-[#fef2f2] text-danger' : 'bg-(--color-success-lt) text-success'
          }`}
        >
          {state.message}
        </p>
      )}

      <form
        action={action}
        className="flex max-w-100 flex-col gap-4 rounded-lg border border-border bg-white p-6"
      >
        <input type="hidden" name="id" value={coupon.id} />
        <Field
          label="Code"
          name="code"
          defaultValue={coupon.code}
          error={state?.errors?.code?.[0]}
        />
        <Field
          label="Discount Percent"
          name="discountPercent"
          type="number"
          defaultValue={String(coupon.discountPercent)}
          error={state?.errors?.discountPercent?.[0]}
        />
        <Checkbox label="Active" name="isActive" defaultChecked={coupon.isActive} />

        <div className="mt-2 flex gap-2.5">
          <button
            type="submit"
            disabled={pending}
            className={`rounded-full px-6 py-2.5 text-[13px] font-medium text-white ${
              pending ? 'cursor-not-allowed bg-hint' : 'cursor-pointer bg-pink'
            }`}
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/coupons')}
            className="cursor-pointer rounded-full border border-border bg-white px-6 py-2.5 text-[13px] text-text"
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
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
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
