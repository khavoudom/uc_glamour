import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock server-only — throws in client components, but harmless in tests
vi.mock('server-only', () => ({}));

// Mock next/navigation
const mockRedirectError = new Error('NEXT_REDIRECT');
(mockRedirectError as any).digest = 'NEXT_REDIRECT';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(() => {
    throw mockRedirectError;
  }),
}));

// Mock next-auth
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

// Mock Drizzle DB connection
const mockQueryChain = () => {
  const chain: any = vi.fn(() => chain);
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.orderBy = vi.fn(() => chain);
  chain.groupBy = vi.fn(() => chain);
  chain.having = vi.fn(() => chain);
  chain.offset = vi.fn(() => chain);
  chain.then = vi.fn((resolve: any) => resolve([]));
  chain.catch = vi.fn();
  chain.returning = vi.fn(() => chain);
  return chain;
};

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => mockQueryChain()),
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      then: vi.fn((resolve: any) => resolve(undefined)),
    })),
    update: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));
