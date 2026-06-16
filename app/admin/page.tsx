import { verifyAdminSession } from '@/lib/admin-dal';
import { db } from '@/lib/db';
import { products, orders, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function getStats() {
  const [productCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
  const [orderCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [revenue] = await db
    .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
    .from(orders)
    .where(eq(orders.paymentStatus, 'Paid'));

  return {
    products: Number(productCount?.count ?? 0),
    orders: Number(orderCount?.count ?? 0),
    users: Number(userCount?.count ?? 0),
    revenue: Number(revenue?.total ?? 0),
  };
}

const icons = {
  products: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  orders: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  users: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  revenue: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
};

export default async function AdminDashboard() {
  await verifyAdminSession();
  const stats = await getStats();

  const cards = [
    { label: 'Total Products', value: stats.products, icon: icons.products },
    { label: 'Total Orders', value: stats.orders, icon: icons.orders },
    { label: 'Total Users', value: stats.users, icon: icons.users },
    { label: 'Revenue (Paid)', value: `$${stats.revenue.toFixed(2)}`, icon: icons.revenue },
  ];

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl font-medium text-text">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-white px-6 py-5">
            <span className="text-[28px]" aria-hidden="true">
              {card.icon}
            </span>
            <p className="font-heading mt-3 text-[28px] font-medium text-text">{card.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.05em] text-muted">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
