import 'server-only';
import { db } from '@/lib/db';
import { shippingServices } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllShippingServices() {
  return db.select().from(shippingServices).orderBy(desc(shippingServices.id));
}

export async function getActiveShippingServices() {
  return db
    .select()
    .from(shippingServices)
    .where(eq(shippingServices.isActive, true))
    .orderBy(shippingServices.id);
}

export async function getShippingServiceById(id: number) {
  const [service] = await db
    .select()
    .from(shippingServices)
    .where(eq(shippingServices.id, id))
    .limit(1);
  return service ?? null;
}

export async function createShippingService(data: {
  name: string;
  price: string;
  estimatedDelivery: string;
  isActive?: boolean;
}) {
  const [service] = await db
    .insert(shippingServices)
    .values({
      name: data.name,
      price: data.price,
      estimatedDelivery: data.estimatedDelivery,
      isActive: data.isActive ?? true,
    })
    .returning();
  return service;
}

export async function updateShippingService(
  id: number,
  data: Partial<{
    name: string;
    price: string;
    estimatedDelivery: string;
    isActive: boolean;
  }>,
) {
  const [service] = await db
    .update(shippingServices)
    .set(data)
    .where(eq(shippingServices.id, id))
    .returning();
  return service;
}

export async function deleteShippingService(id: number) {
  await db.delete(shippingServices).where(eq(shippingServices.id, id));
}

export async function toggleShippingServiceActive(id: number) {
  const [service] = await db
    .select({ isActive: shippingServices.isActive })
    .from(shippingServices)
    .where(eq(shippingServices.id, id))
    .limit(1);
  if (!service) return null;

  const [updated] = await db
    .update(shippingServices)
    .set({ isActive: !service.isActive })
    .where(eq(shippingServices.id, id))
    .returning();
  return updated;
}
