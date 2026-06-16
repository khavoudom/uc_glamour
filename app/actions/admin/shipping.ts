'use server';

import { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-dal';
import {
  createShippingService,
  updateShippingService,
  deleteShippingService,
  toggleShippingServiceActive,
} from '@/lib/data-access/shipping-services';

const shippingServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.preprocess(
    (v) => Number(v),
    z.number().min(0, 'Price must be 0 or more'),
  ),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required'),
  isActive: z.preprocess((v) => v === 'on' || v === true, z.boolean()).optional(),
});

export interface ShippingServiceFormState {
  errors?: Record<string, string[]>;
  message?: string;
}

export async function createShippingServiceAction(
  prevState: ShippingServiceFormState | undefined,
  formData: FormData,
): Promise<ShippingServiceFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const validated = shippingServiceSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  try {
    await createShippingService({
      name: validated.data.name,
      price: validated.data.price.toFixed(2),
      estimatedDelivery: validated.data.estimatedDelivery,
      isActive: validated.data.isActive,
    });
    redirect('/admin/shipping');
  } catch {
    return { message: 'Failed to create shipping service.' };
  }
}

export async function updateShippingServiceAction(
  prevState: ShippingServiceFormState | undefined,
  formData: FormData,
): Promise<ShippingServiceFormState> {
  await requireAdmin();

  const id = Number(formData.get('id'));
  if (!id) return { message: 'Missing shipping service ID.' };

  const raw = Object.fromEntries(formData);
  const validated = shippingServiceSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  try {
    await updateShippingService(id, {
      name: validated.data.name,
      price: validated.data.price.toFixed(2),
      estimatedDelivery: validated.data.estimatedDelivery,
      isActive: validated.data.isActive,
    });
    return { message: 'Shipping service updated!' };
  } catch {
    return { message: 'Failed to update shipping service.' };
  }
}

export async function deleteShippingServiceAction(id: number) {
  await requireAdmin();
  await deleteShippingService(id);
}

export async function toggleShippingServiceAction(id: number) {
  await requireAdmin();
  await toggleShippingServiceActive(id);
}
