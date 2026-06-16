'use server';

import { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-dal';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addShade,
  deleteShade,
} from '@/lib/data-access/products-admin';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.enum(['Lips', 'Skincare', 'Perfume', 'Eyes', 'Face']),
  price: z.preprocess((v) => Number(v), z.number().positive('Price must be positive')),
  originalPrice: z.preprocess((v) => (v ? Number(v) : undefined), z.number().positive().optional()),
  emoji: z.preprocess((v) => (v && String(v).trim()) || '', z.string().default('')),
  imageUrls: z.preprocess((v) => (v && String(v).trim()) || undefined, z.string().optional()),
  description: z.string().min(1, 'Description is required'),
  badge: z.preprocess(
    (v) => (v && String(v).trim()) || null,
    z.enum(['NEW', 'SALE', 'HOT']).nullable(),
  ),
  isNew: z.preprocess((v) => v === 'on' || v === true, z.boolean()),
  isSubscriptionEligible: z.preprocess((v) => v === 'on' || v === true, z.boolean()),
});

export interface ProductFormState {
  errors?: Record<string, string[]>;
  message?: string;
}

export async function createProductAction(
  prevState: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const validated = productSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  let productId: number | undefined;
  try {
    const { originalPrice, imageUrls, ...fields } = validated.data;
    const product = await createProduct({
      ...fields,
      price: String(fields.price),
      originalPrice: originalPrice ? String(originalPrice) : null,
      imageUrls: imageUrls || null,
      badge: fields.badge ?? null,
    });
    productId = product.id;
  } catch (e) {
    console.error('Failed to create product:', e);
    return { message: 'Failed to create product.' };
  }
  if (productId) redirect(`/admin/products/${productId}/edit`);
  return { message: 'Failed to create product.' };
}

export async function updateProductAction(
  prevState: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = Number(formData.get('id'));
  if (!id) return { message: 'Missing product ID.' };

  const raw = Object.fromEntries(formData);
  const validated = productSchema.safeParse(raw);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  try {
    const { originalPrice, imageUrls, ...fields } = validated.data;
    await updateProduct(id, {
      ...fields,
      price: String(fields.price),
      originalPrice: originalPrice ? String(originalPrice) : null,
      imageUrls: imageUrls || null,
      badge: fields.badge ?? null,
    });
    return { message: 'Product updated!' };
  } catch (e) {
    console.error('Failed to update product:', e);
    return { message: 'Failed to update product.' };
  }
}

export async function deleteProductAction(productId: number) {
  await requireAdmin();
  await deleteProduct(productId);
}

export async function addShadeAction(
  prevState: { message?: string } | undefined,
  formData: FormData,
): Promise<{ message?: string }> {
  await requireAdmin();

  const productId = Number(formData.get('productId'));
  const name = formData.get('name') as string;
  const hex = formData.get('hex') as string;
  const stock = Number(formData.get('stock')) || 0;
  const sku = (formData.get('sku') as string) || null;

  if (!name || !hex) return { message: 'Name and hex are required.' };

  try {
    await addShade(productId, { name, hex, stock, sku });
    return { message: 'Shade added!' };
  } catch {
    return { message: 'Failed to add shade.' };
  }
}

export async function deleteShadeAction(productId: number, shadeId: number) {
  await requireAdmin();
  await deleteShade(shadeId);
}
