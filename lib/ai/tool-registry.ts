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
} as const;

export type ToolName = keyof typeof toolRegistry;
