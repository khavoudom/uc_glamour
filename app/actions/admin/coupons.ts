'use server';

import { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-dal';
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
} from '@/lib/data-access/coupons-admin';

const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .transform((v) => v.toUpperCase()),
  discountPercent: z.preprocess((v) => Number(v), z.number().int().min(1).max(100)),
  isActive: z.preprocess((v) => v === 'on' || v === true, z.boolean()).optional(),
});

export interface CouponFormState {
  errors?: Record<string, string[]>;
  message?: string;
}

export async function createCouponAction(
  prevState: CouponFormState | undefined,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const validated = couponSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  try {
    await createCoupon(validated.data);
    redirect('/admin/coupons');
  } catch {
    return { message: 'Failed to create coupon. Code may already exist.' };
  }
}

export async function updateCouponAction(
  prevState: CouponFormState | undefined,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();

  const id = Number(formData.get('id'));
  if (!id) return { message: 'Missing coupon ID.' };

  const raw = Object.fromEntries(formData);
  const validated = couponSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  try {
    await updateCoupon(id, validated.data);
    return { message: 'Coupon updated!' };
  } catch {
    return { message: 'Failed to update coupon.' };
  }
}

export async function deleteCouponAction(id: number) {
  await requireAdmin();
  await deleteCoupon(id);
}

export async function toggleCouponAction(id: number) {
  await requireAdmin();
  await toggleCouponActive(id);
}
