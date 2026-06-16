import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addToCart, removeFromCart } from '@/app/actions/cart';
import { auth } from '@/auth';
import { db } from '@/lib/db';

const mockAuth = vi.mocked(auth);
const mockDbSelect = vi.mocked(db.select);
const mockDbInsert = vi.mocked(db.insert);
const mockDbUpdate = vi.mocked(db.update);
const mockDbDelete = vi.mocked(db.delete);

beforeEach(() => {
  vi.clearAllMocks();

  mockAuth.mockResolvedValue({
    user: { id: '42', name: 'Test', email: 'test@example.com', role: 'customer' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  } as never);
});

function makeChain(resolvedValue: unknown = []) {
  const chain: any = vi.fn(() => chain);
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.orderBy = vi.fn(() => chain);
  chain.groupBy = vi.fn(() => chain);
  chain.then = vi.fn((resolve: any) => resolve(resolvedValue));
  chain.catch = vi.fn();
  return chain;
}

describe('addToCart()', () => {
  it('inserts a new cart item when none exists', async () => {
    mockDbSelect.mockReturnValue(makeChain([]));

    const insertValues = vi.fn().mockResolvedValue(undefined);
    mockDbInsert.mockReturnValue({ values: insertValues } as any);

    await addToCart(1, 'Ruby Red', 2);

    expect(mockAuth).toHaveBeenCalled();
    expect(mockDbSelect).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42, productId: 1, shade: 'Ruby Red', quantity: 2 }),
    );
  });

  it('updates quantity when item already exists', async () => {
    mockDbSelect.mockReturnValue(
      makeChain([{ id: 10, userId: 42, productId: 1, shade: 'Ruby Red', quantity: 1 }]),
    );

    const updateSet = vi.fn().mockReturnThis();
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    mockDbUpdate.mockReturnValue({ set: updateSet, where: updateWhere } as any);

    await addToCart(1, 'Ruby Red', 3);

    expect(updateSet).toHaveBeenCalledWith({ quantity: 4 });
    expect(updateWhere).toHaveBeenCalled();
  });
});

describe('removeFromCart()', () => {
  it('deletes the matching cart item', async () => {
    const deleteWhere = vi.fn().mockResolvedValue(undefined);
    mockDbDelete.mockReturnValue({ where: deleteWhere } as any);

    await removeFromCart(1, 'Ruby Red');

    expect(mockAuth).toHaveBeenCalled();
    expect(deleteWhere).toHaveBeenCalled();
  });
});
