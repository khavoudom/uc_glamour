import 'dotenv/config';
import { db } from '../lib/db';
import {
  chatMessages,
  loyaltyTransactions,
  subscriptions,
  wishlistItems,
  cartItems,
  orderItems,
  orders,
  reviews,
  shades,
  coupons,
  products,
  users,
} from '../lib/db/schema';

async function clearDb() {
  await db.delete(chatMessages);
  await db.delete(loyaltyTransactions);
  await db.delete(subscriptions);
  await db.delete(wishlistItems);
  await db.delete(cartItems);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(shades);
  await db.delete(coupons);
  await db.delete(reviews);
  await db.delete(products);
  await db.delete(users);
}

clearDb()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .then(() => process.exit(0));
