import 'server-only';
import { searchProducts, getProductById } from '@/lib/data-access/products';
import { addToCart } from '@/app/actions/cart';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { eq, lte, gt, and, inArray } from 'drizzle-orm';
import type { AgentContext } from './agent';
import { getOrdersByUserId, getOrderInvoiceById } from '@/lib/data-access/orders';
import {
  getWishlistByUserId,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
} from '@/lib/data-access/wishlist';
import { getCartByUserId } from '@/lib/data-access/cart';
import { getRecommendations } from '@/lib/data-access/recommendations';
import { getReviewsByProduct, getReviewStatsByProduct } from '@/lib/data-access/reviews';
import {
  createAlert,
  getAlertsByUserId,
  removeAlert,
  getAlertByProductAndUser,
} from '@/lib/data-access/alerts';
import { getConversationById, updateConversation } from '@/lib/data-access/conversations';

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

function requireAuth(context?: AgentContext): void {
  if (!context?.userId) {
    throw new Error('Login required. Please log in to your account first.');
  }
}

async function requireAdmin(context?: AgentContext): Promise<void> {
  requireAuth(context);
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, context!.userId!))
    .limit(1);
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required. This action is only available to administrators.');
  }
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context?: AgentContext,
): Promise<ToolResult> {
  switch (name) {
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

    case 'createResource': {
      await requireAdmin(context);
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
      await requireAdmin(context);
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
      await requireAdmin(context);
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

    case 'getOrderHistory': {
      requireAuth(context);
      const orders = await getOrdersByUserId(context!.userId!);
      return {
        orders: orders.map((o) => ({
          id: o.id,
          total: Number(o.total).toFixed(2),
          paymentStatus: o.paymentStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          itemCount: o.itemCount,
          createdAt: o.createdAt,
        })),
        count: orders.length,
      };
    }
    case 'getOrderStatus': {
      requireAuth(context);
      const orderId = Number(args.orderId);
      const order = await getOrderInvoiceById(orderId, context!.userId!);
      if (!order) return { error: 'Order not found.' };
      return {
        id: order.id,
        total: Number(order.total).toFixed(2),
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items.map((i) => ({
          productName: i.productName,
          emoji: i.emoji,
          shade: i.shade,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice).toFixed(2),
        })),
        createdAt: order.createdAt,
      };
    }
    case 'trackOrder': {
      requireAuth(context);
      const orderId = Number(args.orderId);
      const order = await getOrderInvoiceById(orderId, context!.userId!);
      if (!order) return { error: 'Order not found.' };
      return {
        id: order.id,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentStatus: order.paymentStatus,
        shippingName: order.shippingName,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingCountry: order.shippingCountry,
        createdAt: order.createdAt,
      };
    }

    case 'getWishlist': {
      requireAuth(context);
      const productIds = await getWishlistByUserId(context!.userId!);
      if (productIds.length === 0) return { products: [], count: 0 };
      const productResults = [];
      for (const pid of productIds) {
        const p = await getProductById(pid);
        if (p) {
          productResults.push({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: Number(p.price),
            emoji: p.emoji,
            rating: Number(p.rating),
            imageUrls: parseImageUrls(p.imageUrls),
          });
        }
      }
      return { products: productResults, count: productResults.length };
    }
    case 'addToWishlist': {
      requireAuth(context);
      const productId = Number(args.productId);
      await addWishlistItem(context!.userId!, productId);
      return { success: true, productId };
    }
    case 'removeFromWishlist': {
      requireAuth(context);
      const productId = Number(args.productId);
      await removeWishlistItem(context!.userId!, productId);
      return { success: true, productId };
    }
    case 'checkWishlist': {
      requireAuth(context);
      const productId = Number(args.productId);
      const inList = await isInWishlist(context!.userId!, productId);
      return { inWishlist: inList, productId };
    }

    case 'showCart': {
      requireAuth(context);
      const items = await getCartByUserId(context!.userId!);
      return { products: items, count: items.length };
    }
    case 'checkAbandonedCart': {
      requireAuth(context);
      const items = await getCartByUserId(context!.userId!);
      return {
        products: items,
        count: items.length,
        hasItems: items.length > 0,
      };
    }

    case 'getRecommendations': {
      requireAuth(context);
      const category = args.category ? String(args.category) : undefined;
      const recs = await getRecommendations(context!.userId!, category);
      return {
        products: recs.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          emoji: p.emoji,
          description: p.description,
          rating: Number(p.rating),
          imageUrls: parseImageUrls(p.imageUrls),
          shades: [],
        })),
        count: recs.length,
      };
    }

    case 'getProductReviews': {
      const productId = Number(args.productId);
      const reviews = await getReviewsByProduct(productId);
      return {
        reviews: reviews.slice(0, 10).map((r) => ({
          id: r.id,
          reviewerName: r.reviewerName,
          rating: r.rating,
          body: r.body,
          date: r.date,
          isVerified: r.isVerified,
          helpful: r.helpful,
        })),
        count: Math.min(reviews.length, 10),
      };
    }
    case 'summarizeReviews': {
      const summaryProdId = Number(args.productId);
      const stats = await getReviewStatsByProduct(summaryProdId);
      return {
        averageRating: stats.average,
        totalReviews: stats.total,
        distribution: stats.distribution,
      };
    }

    case 'buildRoutine': {
      const routineType = String(args.routineType ?? '');
      const goal = String(args.goal ?? '');
      let categoryFilter: string[];
      if (routineType === 'skincare') {
        categoryFilter = ['Skincare'];
      } else if (routineType === 'makeup') {
        categoryFilter = ['Face', 'Eyes', 'Lips'];
      } else {
        categoryFilter = ['Lips', 'Face', 'Eyes', 'Skincare'];
      }
      const allProducts = await db
        .select()
        .from(products)
        .where(inArray(products.category, categoryFilter))
        .limit(10);

      return {
        routineType,
        goal,
        products: allProducts.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          emoji: p.emoji,
          description: p.description,
          rating: Number(p.rating),
          imageUrls: parseImageUrls(p.imageUrls),
          shades: [],
        })),
        categories: categoryFilter,
      };
    }

    case 'startSkinQuiz': {
      return {
        quizStarted: true,
        message: 'Begin asking questions about skin type, concerns, allergies, and environment.',
      };
    }
    case 'saveSkinProfile': {
      requireAuth(context);
      const profile = {
        skinType: args.skinType,
        concerns: args.concerns,
        allergies: args.allergies ?? [],
      };
      if (context?.conversationId) {
        const conv = await getConversationById(context.conversationId);
        const existingMeta = conv?.metadata ? JSON.parse(conv.metadata) : {};
        await updateConversation(context.conversationId, {
          metadata: JSON.stringify({ ...existingMeta, skinProfile: profile }),
        });
      }
      return { saved: true, profile };
    }
    case 'getSkinProfile': {
      requireAuth(context);
      if (context?.conversationId) {
        const conv = await getConversationById(context.conversationId);
        if (conv?.metadata) {
          try {
            const meta = JSON.parse(conv.metadata);
            if (meta.skinProfile) return { profile: meta.skinProfile };
          } catch {}
        }
      }
      return { profile: null, message: 'No skin profile found.' };
    }

    case 'createAlert': {
      requireAuth(context);
      const alertProdId = Number(args.productId);
      const alertType = String(args.alertType) as 'back_in_stock' | 'price_drop';
      const alert = await createAlert({
        userId: context!.userId!,
        productId: alertProdId,
        type: alertType,
        targetPrice: args.targetPrice ? Number(args.targetPrice) : null,
      });
      return { success: true, alertId: alert.id, type: alert.type };
    }
    case 'getAlerts': {
      requireAuth(context);
      const alerts = await getAlertsByUserId(context!.userId!);
      return {
        alerts: alerts.map((a) => ({
          id: a.id,
          productId: a.productId,
          type: a.type,
          targetPrice: a.targetPrice ? Number(a.targetPrice) : null,
          isActive: a.isActive,
          createdAt: a.createdAt,
        })),
        count: alerts.length,
      };
    }
    case 'removeAlert': {
      requireAuth(context);
      const alertId = Number(args.alertId);
      await removeAlert(alertId);
      return { success: true, alertId };
    }

    case 'findGifts': {
      const budget = Number(args.budget ?? 100);
      const occasion = String(args.occasion ?? '');
      const preferences = args.preferences ? String(args.preferences) : '';

      const giftProducts = await db
        .select()
        .from(products)
        .where(lte(products.price, String(budget)))
        .limit(8);

      return {
        occasion,
        budget,
        preferences,
        products: giftProducts.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: Number(p.price),
          emoji: p.emoji,
          description: p.description,
          rating: Number(p.rating),
          imageUrls: parseImageUrls(p.imageUrls),
        })),
        count: giftProducts.length,
      };
    }

    case 'setLanguage': {
      const language = String(args.language ?? 'en');
      if (context?.conversationId) {
        const conv = await getConversationById(context.conversationId);
        const existingMeta = conv?.metadata ? JSON.parse(conv.metadata) : {};
        await updateConversation(context.conversationId, {
          metadata: JSON.stringify({ ...existingMeta, language }),
        });
      }
      return { language, set: true };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
