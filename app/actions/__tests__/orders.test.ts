import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, type CreateOrderInput } from '@/app/actions/orders';
import { auth } from '@/auth';
import { db } from '@/lib/db';

const mockAuth = vi.mocked(auth);
const mockDbInsert = vi.mocked(db.insert);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({
    user: { id: '42', name: 'Test', email: 'test@example.com', role: 'customer' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  } as never);
});

vi.mock('@/lib/receipt-email', () => ({ sendReceiptEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/telegram-notify', () => ({
  sendTelegramNotification: vi.fn().mockResolvedValue(undefined),
}));

const validInput: CreateOrderInput = {
  items: [
    {
      productId: 1,
      productName: 'Test Product',
      emoji: '🎁',
      shade: null,
      quantity: 2,
      unitPrice: 19.99,
    },
  ],
  subtotal: 39.98,
  shippingCost: 5.99,
  couponDiscount: 0,
  total: 45.97,
  paymentMethod: 'paypal',
  shippingInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Phnom Penh',
    state: 'PP',
    zip: '12000',
    country: 'Cambodia',
  },
  paymentId: 'PAYID123',
  shippingServiceId: null,
};

describe('createOrder()', () => {
  it('inserts an order and order items', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 1 }]);
    const insertValues = vi.fn().mockReturnThis();
    mockDbInsert.mockReturnValue({ values: insertValues, returning } as any);

    const result = await createOrder(validInput);

    expect(result.orderId).toBe(1);
    expect(mockAuth).toHaveBeenCalled();
  });

  it('creates order without paymentId', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 2 }]);
    mockDbInsert.mockReturnValue({ values: vi.fn().mockReturnThis(), returning } as any);

    const input = { ...validInput, paymentId: undefined };
    const result = await createOrder(input);
    expect(result.orderId).toBe(2);
  });
});
