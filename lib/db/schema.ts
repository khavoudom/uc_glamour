import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password'),
  image: text('image'),
  role: text('role').notNull().default('customer'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiresAt: text('verification_token_expires_at'),
  loyaltyPoints: integer('loyalty_points', { mode: 'number' }).notNull().default(0),
  loyaltyTier: text('loyalty_tier').notNull().default('Bronze'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  price: text('price').notNull(),
  originalPrice: text('original_price'),
  emoji: text('emoji').notNull(),
  imageUrls: text('image_urls'),
  description: text('description').notNull(),
  rating: text('rating').notNull().default('0'),
  reviewCount: integer('review_count', { mode: 'number' }).notNull().default(0),
  badge: text('badge'),
  isNew: integer('is_new', { mode: 'boolean' }).notNull().default(false),
  isSubscriptionEligible: integer('is_subscription_eligible', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const shades = sqliteTable('shades', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('product_id', { mode: 'number' })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hex: text('hex').notNull(),
  stock: integer('stock', { mode: 'number' }).notNull().default(0),
  sku: text('sku'),
});

export const reviews = sqliteTable('reviews', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('product_id', { mode: 'number' })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  userId: integer('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  reviewerName: text('reviewer_name').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  date: text('date').notNull(),
  rating: integer('rating', { mode: 'number' }).notNull(),
  body: text('body').notNull(),
  helpful: integer('helpful', { mode: 'number' }).notNull().default(0),
  notHelpful: integer('not_helpful', { mode: 'number' }).notNull().default(0),
});

export const coupons = sqliteTable('coupons', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent', { mode: 'number' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    shade: text('shade'),
    quantity: integer('quantity', { mode: 'number' }).notNull().default(1),
  },
  (table) => ({
    userProductShadeIdx: uniqueIndex('cart_user_product_shade_idx').on(
      table.userId,
      table.productId,
      table.shade,
    ),
  }),
);

export const wishlistItems = sqliteTable(
  'wishlist_items',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userProductIdx: uniqueIndex('wishlist_user_product_idx').on(table.userId, table.productId),
  }),
);

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id', { mode: 'number' }).notNull(),
  productName: text('product_name').notNull(),
  productEmoji: text('product_emoji').notNull(),
  shade: text('shade'),
  frequency: integer('frequency', { mode: 'number' }).notNull(),
  price: text('price').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

export const loyaltyTransactions = sqliteTable('loyalty_transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points', { mode: 'number' }).notNull(),
  type: text('type').notNull(),
  reference: text('reference'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const conversations = sqliteTable('conversations', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull().default('New Conversation'),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  summary: text('summary'),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const toolExecutions = sqliteTable('tool_executions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id', { mode: 'number' })
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  toolName: text('tool_name').notNull(),
  input: text('input').notNull(),
  output: text('output').notNull(),
  status: text('status').notNull().default('success'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const chatMessages = sqliteTable(
  'chat_messages',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    conversationId: integer('conversation_id', { mode: 'number' }).references(() => conversations.id, {
      onDelete: 'set null',
    }),
    role: text('role').notNull(),
    text: text('text').notNull(),
    productId: integer('product_id', { mode: 'number' }),
    timestamp: text('timestamp').notNull().default('CURRENT_TIMESTAMP'),
  },
  (table) => ({
    userIdIdx: index('chat_user_id_idx').on(table.userId),
    conversationIdIdx: index('chat_conversation_id_idx').on(table.conversationId),
  }),
);

export const shippingServices = sqliteTable('shipping_services', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: text('price').notNull(),
  estimatedDelivery: text('estimated_delivery').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  subtotal: text('subtotal').notNull(),
  shippingCost: text('shipping_cost').notNull().default('0'),
  couponDiscount: text('coupon_discount').notNull().default('0'),
  total: text('total').notNull(),
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
  shippingServiceId: integer('shipping_service_id', { mode: 'number' }).references(() => shippingServices.id, {
    onDelete: 'set null',
  }),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export const emailQueue = sqliteTable('email_queue', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  html: text('html').notNull(),
  status: text('status').notNull().default('pending'),
  error: text('error'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  sentAt: text('sent_at'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer('order_id', { mode: 'number' })
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id', { mode: 'number' }).notNull(),
  productName: text('product_name').notNull(),
  emoji: text('emoji').notNull(),
  shade: text('shade'),
  quantity: integer('quantity', { mode: 'number' }).notNull(),
  unitPrice: text('unit_price').notNull(),
});

export const productAlerts = sqliteTable('product_alerts', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id', { mode: 'number' })
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  targetPrice: text('target_price'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});
