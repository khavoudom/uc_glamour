import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import {
  getProductById,
  searchProducts,
} from '@/lib/data-access/products';
import { addToCart } from '@/app/actions/cart';

export const searchProductsTool = tool({
  description:
    'Search for products by name or brand. Returns matching products with their details, prices, and available shades.',
  inputSchema: zodSchema(
    z.object({
      query: z.string().describe('Search query for product name or brand'),
    }),
  ),
  execute: async ({ query }: { query: string }) => {
    const results = await searchProducts(query);
    return results.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: Number(p.price),
      emoji: p.emoji,
      description: p.description,
      rating: Number(p.rating),
      shades: p.shades.map((s) => ({ name: s.name, hex: s.hex, stock: s.stock })),
    }));
  },
});

export const getProductDetailsTool = tool({
  description:
    'Get detailed information about a specific product by its ID, including all available shades and stock levels.',
  inputSchema: zodSchema(
    z.object({
      productId: z.number().describe('The product ID'),
    }),
  ),
  execute: async ({ productId }: { productId: number }) => {
    const product = await getProductById(productId);
    if (!product) return { error: 'Product not found' };
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      emoji: product.emoji,
      description: product.description,
      rating: Number(product.rating),
      reviewCount: product.reviewCount,
      badge: product.badge,
      shades: product.shades.map((s) => ({
        name: s.name,
        hex: s.hex,
        stock: s.stock,
        sku: s.sku,
      })),
    };
  },
});

export const compareProductsTool = tool({
  description:
    'Compare multiple products side by side by their IDs. Shows price, ratings, description, and shade options.',
  inputSchema: zodSchema(
    z.object({
      productIds: z
        .array(z.number())
        .min(2)
        .max(5)
        .describe('Array of product IDs to compare (2-5)'),
    }),
  ),
  execute: async ({ productIds }: { productIds: number[] }) => {
    const results = [];
    for (const id of productIds) {
      const product = await getProductById(id);
      if (product) {
        results.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          emoji: product.emoji,
          description: product.description,
          rating: Number(product.rating),
          reviewCount: product.reviewCount,
          shades: product.shades.map((s) => s.name),
        });
      }
    }
    return results;
  },
});

export const addToCartTool = tool({
  description:
    'Add a product to the user shopping cart. Requires product ID and quantity. Optionally specify a shade name.',
  inputSchema: zodSchema(
    z.object({
      productId: z.number().describe('The product ID to add'),
      quantity: z.number().min(1).max(99).describe('Quantity to add (1-99)'),
      shade: z.string().optional().describe('Shade name (if the product has shades)'),
    }),
  ),
  execute: async ({
    productId,
    quantity,
    shade,
  }: {
    productId: number;
    quantity: number;
    shade?: string;
  }) => {
    try {
      // The server action handles auth
      await addToCart(productId, shade ?? null, quantity);
      return { success: true, productId, quantity, shade: shade ?? null };
    } catch (error) {
      return { success: false, error: 'Failed to add to cart. You may need to be logged in.' };
    }
  },
});

export const applyCouponTool = tool({
  description: 'Apply a coupon or discount code. Available coupons: GLAM20 (20% off), BEAUTY10 (10% off).',
  inputSchema: zodSchema(
    z.object({
      code: z.string().describe('Coupon code to apply'),
    }),
  ),
  execute: async ({ code }: { code: string }) => {
    return {
      code,
      message: `Coupon "${code}" will be applied at checkout. Available coupons: GLAM20 (20% off), BEAUTY10 (10% off).`,
    };
  },
});
