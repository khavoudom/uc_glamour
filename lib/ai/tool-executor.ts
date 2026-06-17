import 'server-only';
import { searchProducts, getProductById } from '@/lib/data-access/products';
import { addToCart } from '@/app/actions/cart';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type ToolResult = Record<string, unknown>;

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  switch (name) {
    // UI Control tools
    case 'changeChatWidth': {
      return { width: args.width };
    }
    case 'changeChatHeight': {
      return { height: args.height };
    }
    case 'maximizeChat': {
      return { maximized: true, width: 600, height: 700 };
    }
    case 'minimizeChat': {
      return { minimized: true, height: 56 };
    }
    case 'fullscreenChat': {
      return { fullscreen: true };
    }
    case 'moveChat': {
      return { position: args.position };
    }
    case 'navigateToPage': {
      const page = String(args.page ?? '');
      const validPages = [
        '/',
        '/products',
        '/bundles',
        '/about',
        '/our-story',
        '/contact',
        '/help',
        '/track-order',
        '/wishlist',
        '/login',
        '/signup',
        '/account',
        '/checkout',
      ];
      if (!validPages.includes(page)) {
        return { error: `Invalid page: ${page}`, navigated: false };
      }
      return { page, navigated: true };
    }

    // Product tools
    case 'searchProducts': {
      const query = String(args.query ?? '');
      const results = await searchProducts(query);
      return {
        products: results.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          emoji: p.emoji,
          description: p.description,
          rating: Number(p.rating),
          imageUrls: parseImageUrls(p.imageUrls),
          shades: p.shades.map((s) => ({ name: s.name, hex: s.hex, stock: s.stock })),
        })),
        count: results.length,
      };
    }
    case 'getProductDetails': {
      const productId = Number(args.productId);
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
        imageUrls: parseImageUrls(product.imageUrls),
        shades: product.shades.map((s) => ({
          name: s.name,
          hex: s.hex,
          stock: s.stock,
        })),
      };
    }
    case 'compareProducts': {
      const ids = (args.productIds as number[]) ?? [];
      const results = [];
      for (const id of ids) {
        const product = await getProductById(id);
        if (product) {
          results.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: Number(product.price),
            emoji: product.emoji,
            description: product.description,
            rating: Number(product.rating),
            imageUrls: parseImageUrls(product.imageUrls),
            shades: product.shades.map((s) => s.name),
          });
        }
      }
      return { products: results };
    }
    case 'addToCart': {
      try {
        await addToCart(
          Number(args.productId),
          (args.shade as string) ?? null,
          Number(args.quantity),
        );
        // Look up product details so the client can sync its local cart
        const product = await getProductById(Number(args.productId));
        if (product) {
          const shadeName = (args.shade as string) ?? null;
          const matchedShade = shadeName
            ? (product.shades.find((s) => s.name === shadeName) ?? null)
            : null;
          return {
            success: true,
            product: {
              id: String(product.id),
              name: product.name,
              brand: product.brand,
              category: product.category,
              price: Number(product.price),
              originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
              emoji: product.emoji,
              description: product.description ?? '',
              rating: Number(product.rating),
              reviewCount: product.reviewCount,
              imageUrls: parseImageUrls(product.imageUrls),
              shades: product.shades.map((s) => ({
                name: s.name,
                hex: s.hex,
                stock: s.stock,
              })),
              badge: null,
              isNew: product.isNew ?? false,
            },
            shade: matchedShade
              ? { name: matchedShade.name, hex: matchedShade.hex, stock: matchedShade.stock }
              : null,
            quantity: Number(args.quantity),
          };
        }
        return { success: true };
      } catch {
        return { success: false, error: 'Login required to add to cart.' };
      }
    }
    case 'applyCoupon': {
      const code = String(args.code ?? '');
      return {
        code,
        message: `Coupon "${code}" is available. Active codes: GLAM20 (20% off), BEAUTY10 (10% off).`,
      };
    }

    // CMS tools
    case 'createResource': {
      const resourceType = String(args.resourceType ?? '');
      const data = args.data as Record<string, unknown>;

      if (resourceType !== 'products') {
        return { message: `${resourceType} creation requires admin panel.` };
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
    }
    case 'updateResource': {
      const updateType = String(args.resourceType ?? '');
      const updateId = Number(args.id);
      const updateData = args.data as Record<string, unknown>;

      if (updateType !== 'products') {
        return { error: `Update not supported for ${updateType}` };
      }
      const [updated] = await db
        .update(products)
        .set({
          ...(updateData.name ? { name: String(updateData.name) } : {}),
          ...(updateData.brand ? { brand: String(updateData.brand) } : {}),
          ...(updateData.price ? { price: String(updateData.price) } : {}),
          ...(updateData.description ? { description: String(updateData.description) } : {}),
        })
        .where(eq(products.id, updateId))
        .returning();
      return updated
        ? { id: updated.id, name: updated.name, updated: true }
        : { error: 'Not found' };
    }
    case 'deleteResource': {
      const deleteType = String(args.resourceType ?? '');
      const deleteId = Number(args.id);

      if (deleteType !== 'products') {
        return { error: `Delete not supported for ${deleteType}` };
      }
      await db.delete(products).where(eq(products.id, deleteId));
      return { id: deleteId, deleted: true };
    }
    case 'searchResource': {
      const searchType = String(args.resourceType ?? '');
      if (searchType !== 'products') {
        return { message: `${searchType} search is available in admin panel.` };
      }
      const all = await db.select().from(products).limit(20);
      return {
        resources: all.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          emoji: p.emoji,
          imageUrls: parseImageUrls(p.imageUrls),
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
