import { verifyAdminSession } from '@/lib/admin-dal';
import { auth } from '@/auth';
import Link from 'next/link';
import AdminLogout from './admin-logout';

function NavIcon({ type }: { type: string }) {
  switch (type) {
    case 'dashboard':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'products':
      return (
        <svg
          width="16"
          height="16"
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
      );
    case 'coupons':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="12" y2="14" />
        </svg>
      );
    case 'reviews':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'orders':
      return (
        <svg
          width="16"
          height="16"
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
      );
    case 'shipping':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    default:
      return null;
  }
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/products', label: 'Products', icon: 'products' },
  { href: '/admin/coupons', label: 'Coupons', icon: 'coupons' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
  { href: '/admin/shipping', label: 'Shipping', icon: 'shipping' },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
];

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  await verifyAdminSession();
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-bg font-sans">
      <aside className="w-55 min-w-55 bg-white border-r border-border flex flex-col p-0">
        <div className="px-5 py-6 border-b border-border">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span className="font-heading text-xl font-medium text-text">
              Glam<span style={{ fontStyle: 'italic', color: 'var(--color-pink)' }}>our</span>
            </span>
            <span className="block text-[10px] text-muted mt-0.5 uppercase tracking-wider">
              Admin Panel
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium text-text no-underline"
              style={{ transition: 'background 0.15s' }}
            >
              <span aria-hidden="true" className="inline-flex">
                <NavIcon type={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-border">
          <Link href="/" className="text-[11px] text-muted no-underline flex items-center gap-1.5">
            ← Back to store
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-7 py-3 bg-white border-b border-border">
          <span className="text-[13px] text-muted">
            Welcome back, <strong className="text-text">{session?.user?.name}</strong>
          </span>
          <AdminLogout />
        </header>
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
