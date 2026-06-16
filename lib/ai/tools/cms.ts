import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const createResource = tool({
  description: 'Create a new resource in the CMS. Supported types: products, categories, reviews.',
  inputSchema: zodSchema(
    z.object({
      resourceType: z
        .enum(['products', 'categories', 'reviews'])
        .describe('Type of resource to create'),
      data: z.record(z.string(), z.unknown()).describe('Resource data as key-value pairs'),
    }),
  ),
  execute: async ({
    resourceType,
    data,
  }: {
    resourceType: string;
    data: Record<string, unknown>;
  }) => {
    if (resourceType !== 'products') {
      return { message: `${resourceType} creation requires additional setup via the admin panel.` };
    }
    const [product] = await db
      .insert(products)
      .values({
        name: String(data.name ?? ''),
        brand: String(data.brand ?? ''),
        category: String(data.category ?? ''),
        price: String(data.price ?? '0'),
        emoji: String(data.emoji ?? '📦'),
        description: String(data.description ?? ''),
        isNew: Boolean(data.isNew ?? false),
      })
      .returning();
    return { id: product.id, name: product.name };
  },
});

export const updateResource = tool({
  description: 'Update an existing resource in the CMS by its ID.',
  inputSchema: zodSchema(
    z.object({
      resourceType: z
        .enum(['products', 'categories', 'reviews'])
        .describe('Type of resource to update'),
      id: z.number().describe('Resource ID to update'),
      data: z.record(z.string(), z.unknown()).describe('Resource data fields to update'),
    }),
  ),
  execute: async ({
    resourceType,
    id,
    data,
  }: {
    resourceType: string;
    id: number;
    data: Record<string, unknown>;
  }) => {
    if (resourceType !== 'products') {
      return { error: `Update not supported for resource type: ${resourceType}` };
    }
    const [product] = await db
      .update(products)
      .set({
        ...(data.name ? { name: String(data.name) } : {}),
        ...(data.brand ? { brand: String(data.brand) } : {}),
        ...(data.price ? { price: String(data.price) } : {}),
        ...(data.description ? { description: String(data.description) } : {}),
      })
      .where(eq(products.id, id))
      .returning();
    return product
      ? { id: product.id, name: product.name, updated: true }
      : { error: 'Product not found' };
  },
});

export const deleteResource = tool({
  description: 'Delete a resource from the CMS by its ID.',
  inputSchema: zodSchema(
    z.object({
      resourceType: z
        .enum(['products', 'categories', 'reviews'])
        .describe('Type of resource to delete'),
      id: z.number().describe('Resource ID to delete'),
    }),
  ),
  execute: async ({ resourceType, id }: { resourceType: string; id: number }) => {
    if (resourceType !== 'products') {
      return { error: `Delete not supported for resource type: ${resourceType}` };
    }
    await db.delete(products).where(eq(products.id, id));
    return { id, deleted: true };
  },
});

export const searchResource = tool({
  description: 'Search for resources in the CMS by type and optional filters.',
  inputSchema: zodSchema(
    z.object({
      resourceType: z
        .enum(['products', 'categories', 'reviews'])
        .describe('Type of resource to search'),
      filters: z.record(z.string(), z.unknown()).optional().describe('Search filters'),
    }),
  ),
  execute: async ({ resourceType }: { resourceType: string }) => {
    if (resourceType !== 'products') {
      return { message: `${resourceType} search is available in the admin panel.` };
    }
    const all = await db.select().from(products).limit(20);
    return all.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: Number(p.price),
      emoji: p.emoji,
    }));
  },
});
