import 'server-only';
import { getOrderById } from '@/lib/data-access/orders';
import { sendTelegramMessage } from '@/lib/telegram';

export async function sendTelegramNotification(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order) return;

  const payMethod = order.paymentMethod === 'paypal' ? 'PayPal' : 'Bakong KHQR';

  const lines: string[] = [];
  lines.push(`Paid Order #${order.id} — $${Number(order.total).toFixed(2)} (${payMethod})`);
  lines.push('');

  lines.push(`Customer: ${order.userName || order.shippingName || 'N/A'}`);
  lines.push(`Email: ${order.userEmail || order.shippingEmail || 'N/A'}`);
  lines.push('');

  if (order.items.length > 0) {
    lines.push('Items');
    for (const item of order.items) {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      const name = item.shade ? `${item.productName} (${item.shade})` : item.productName;
      lines.push(`• ${name} ×${item.quantity} — $${lineTotal.toFixed(2)}`);
    }
    lines.push('');
  }

  if (order.shippingName) {
    lines.push('Shipping');
    lines.push(order.shippingName);
    if (order.shippingAddress) lines.push(order.shippingAddress);
    const cityLine = [order.shippingCity, order.shippingState, order.shippingZip]
      .filter(Boolean)
      .join(', ');
    if (cityLine) lines.push(cityLine);
    if (order.shippingCountry) lines.push(order.shippingCountry);
  }

  const message = lines.join('\n');

  sendTelegramMessage(message);
}
