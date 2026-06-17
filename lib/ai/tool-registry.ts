import {
  changeChatWidth,
  changeChatHeight,
  maximizeChat,
  minimizeChat,
  fullscreenChat,
  moveChat,
  navigateToPage,
} from '@/lib/ai/tools/ui-control';
import {
  searchProductsTool,
  getProductDetailsTool,
  compareProductsTool,
  addToCartTool,
  applyCouponTool,
} from '@/lib/ai/tools/products';
import { createResource, updateResource, deleteResource, searchResource } from '@/lib/ai/tools/cms';
import { getOrderHistoryTool, getOrderStatusTool, trackOrderTool } from '@/lib/ai/tools/orders';
import {
  getWishlistTool,
  addToWishlistTool,
  removeFromWishlistTool,
  checkWishlistTool,
} from '@/lib/ai/tools/wishlist';
import { getProductReviewsTool, summarizeReviewsTool } from '@/lib/ai/tools/reviews';
import { getRecommendationsTool } from '@/lib/ai/tools/recommendations';
import { findGiftsTool } from '@/lib/ai/tools/gifts';
import { createAlertTool, getAlertsTool, removeAlertTool } from '@/lib/ai/tools/alerts';
import { startSkinQuizTool, saveSkinProfileTool, getSkinProfileTool } from '@/lib/ai/tools/quiz';
import { showCartTool, checkAbandonedCartTool } from '@/lib/ai/tools/cart';
import { setLanguageTool, buildRoutineTool } from '@/lib/ai/tools/general';

export const toolRegistry = {
  changeChatWidth,
  changeChatHeight,
  maximizeChat,
  minimizeChat,
  fullscreenChat,
  moveChat,
  navigateToPage,
  searchProducts: searchProductsTool,
  getProductDetails: getProductDetailsTool,
  compareProducts: compareProductsTool,
  addToCart: addToCartTool,
  applyCoupon: applyCouponTool,
  createResource,
  updateResource,
  deleteResource,
  searchResource,
  getOrderHistory: getOrderHistoryTool,
  getOrderStatus: getOrderStatusTool,
  trackOrder: trackOrderTool,
  getWishlist: getWishlistTool,
  addToWishlist: addToWishlistTool,
  removeFromWishlist: removeFromWishlistTool,
  checkWishlist: checkWishlistTool,
  getProductReviews: getProductReviewsTool,
  summarizeReviews: summarizeReviewsTool,
  getRecommendations: getRecommendationsTool,
  findGifts: findGiftsTool,
  createAlert: createAlertTool,
  getAlerts: getAlertsTool,
  removeAlert: removeAlertTool,
  startSkinQuiz: startSkinQuizTool,
  saveSkinProfile: saveSkinProfileTool,
  getSkinProfile: getSkinProfileTool,
  showCart: showCartTool,
  checkAbandonedCart: checkAbandonedCartTool,
  setLanguage: setLanguageTool,
  buildRoutine: buildRoutineTool,
} as const;

export type ToolName = keyof typeof toolRegistry;
