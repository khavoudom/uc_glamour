import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { createAlert, getAlertsByUserId, removeAlert } from '@/lib/data-access/alerts';

async function getUserId(): Promise<number | null> {
  const { getOptionalCustomerSession } = await import('@/lib/dal');
  const session = await getOptionalCustomerSession();
  return session?.userId ?? null;
}

export const createAlertTool = tool({
  description: 'Set up an alert for price drop or back-in-stock on a product.',
  inputSchema: zodSchema(
    z.object({
      productId: z.number(),
      alertType: z.enum(['back_in_stock', 'price_drop']),
      targetPrice: z.number().optional(),
    }),
  ),
  execute: async ({
    productId,
    alertType,
    targetPrice,
  }: {
    productId: number;
    alertType: 'back_in_stock' | 'price_drop';
    targetPrice?: number;
  }) => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    const alert = await createAlert({ userId, productId, type: alertType, targetPrice });
    return { success: true, alertId: alert.id, type: alert.type };
  },
});

export const getAlertsTool = tool({
  description: "List the user's active alerts.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    const alerts = await getAlertsByUserId(userId);
    return { alerts };
  },
});

export const removeAlertTool = tool({
  description: 'Remove an alert by its ID.',
  inputSchema: zodSchema(z.object({ alertId: z.number() })),
  execute: async ({ alertId }: { alertId: number }) => {
    const userId = await getUserId();
    if (!userId) return { error: 'Login required.' };
    await removeAlert(alertId);
    return { success: true };
  },
});
