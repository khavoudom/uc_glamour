import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/* ── Users ── */

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  role: text('role').notNull().default('customer'),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  loyaltyTier: text('loyalty_tier').notNull().default('Bronze'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* ── Products ── */

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(), // "Lips" | "Skincare" | "Perfume" | "Eyes" | "Face"
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  emoji: text('emoji').notNull(),
  imageUrls: text('image_urls'),
  description: text('description').notNull(),
  rating: decimal('rating', { precision: 3, scale: 1 }).notNull().default('0'),
  reviewCount: integer('review_count').notNull().default(0),
  badge: text('badge'), // "NEW" | "SALE" | "HOT" | null
  isNew: boolean('is_new').notNull().default(false),
  isSubscriptionEligible: boolean('is_subscription_eligible').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/* ── Shades ── */

export const shades = pgTable('shades', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hex: text('hex').notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
});

/* ── Reviews ── */

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  reviewerName: text('reviewer_name').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  date: text('date').notNull(),
  rating: integer('rating').notNull(),
  body: text('body').notNull(),
  helpful: integer('helpful').notNull().default(0),
  notHelpful: integer('not_helpful').notNull().default(0),
});

/* ── Coupons ── */

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

/* ── Cart Items ── */

export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    shade: text('shade'),
    quantity: integer('quantity').notNull().default(1),
  },
  (table) => ({
    userProductShadeIdx: uniqueIndex('cart_user_product_shade_idx').on(
      table.userId,
      table.productId,
      table.shade,
    ),
  }),
);

/* ── Wishlist Items ── */

export const wishlistItems = pgTable(
  'wishlist_items',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userProductIdx: uniqueIndex('wishlist_user_product_idx').on(table.userId, table.productId),
  }),
);

/* ── Subscriptions ── */

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull(),
  productName: text('product_name').notNull(),
  productEmoji: text('product_emoji').notNull(),
  shade: text('shade'),
  frequency: integer('frequency').notNull(), // 2, 4, 6, 8 weeks
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  active: boolean('active').notNull().default(true),
});

/* ── Loyalty Transactions ── */

export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').notNull(),
  type: text('type').notNull(), // "earned" | "redeemed"
  reference: text('reference'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* ── Agent Conversations ── */

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default('New Conversation'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/* ── Tool Executions ── */

export const toolExecutions = pgTable('tool_executions', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  toolName: text('tool_name').notNull(),
  input: text('input').notNull(),
  output: text('output').notNull(),
  status: text('status').notNull().default('success'), // "success" | "error"
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* ── Chat Messages ── */

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // "user" | "advisor" | "ai"
    text: text('text').notNull(),
    productId: integer('product_id'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('chat_user_id_idx').on(table.userId),
  }),
);

/* ── Shipping Services ── */

export const shippingServices = pgTable('shipping_services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDelivery: text('estimated_delivery').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

/* ── Orders ── */

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  couponDiscount: decimal('coupon_discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').notNull().default('Pending'),
  fulfillmentStatus: text('fulfillment_status').notNull().default('Pending'),
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'),
  shippingName: text('shipping_name'),
  shippingEmail: text('shipping_email'),
  shippingPhone: text('shipping_phone'),
  shippingAddress: text('shipping_address'),
  shippingCity: text('shipping_city'),
  shippingState: text('shipping_state'),
  shippingZip: text('shipping_zip'),
  shippingCountry: text('shipping_country'),
  shippingServiceId: integer('shipping_service_id')
    .references(() => shippingServices.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* ── Email Queue ── */

export const emailQueue = pgTable('email_queue', {
  id: serial('id').primaryKey(),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  html: text('html').notNull(),
  status: text('status').notNull().default('pending'), // pending | sent | failed
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
});

/* ── Order Items ── */

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull(),
  productName: text('product_name').notNull(),
  emoji: text('emoji').notNull(),
  shade: text('shade'),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
});
