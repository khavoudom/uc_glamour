import 'server-only';
import { getOrderById } from '@/lib/data-access/orders';
import { sendTelegramMessage } from '@/lib/telegram';

export async function sendTelegramNotification(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order) return;

  const payMethod = order.paymentMethod === 'paypal' ? 'PayPal' : 'Bakong KHQR';

  const lines: string[] = [];
  lines.push(`<b>New Paid Order #${order.id}</b>`);
  lines.push('');
  lines.push(`<b>Customer:</b> ${order.userName || order.shippingName || 'N/A'}`);
  lines.push(`<b>Email:</b> ${order.userEmail || order.shippingEmail || 'N/A'}`);
  lines.push(`<b>Payment:</b> ${payMethod}`);
  lines.push(`<b>Total:</b> $${Number(order.total).toFixed(2)}`);

  if (Number(order.couponDiscount) > 0) {
    lines.push(`<b>Discount:</b> -$${Number(order.couponDiscount).toFixed(2)}`);
  }

  lines.push('');

  if (order.items.length > 0) {
    lines.push('<b>Items:</b>');
    for (const item of order.items) {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      const name = item.shade ? `${item.productName} (${item.shade})` : item.productName;
      lines.push(`  ${item.emoji} ${name} x${item.quantity} — $${lineTotal.toFixed(2)}`);
    }
    lines.push('');
  }

  if (order.shippingName) {
    lines.push('<b>Shipping:</b>');
    lines.push(order.shippingName);
    if (order.shippingAddress) lines.push(order.shippingAddress);
    const cityLine = [order.shippingCity, order.shippingState, order.shippingZip]
      .filter(Boolean)
      .join(', ');
    if (cityLine) lines.push(cityLine);
    if (order.shippingCountry) lines.push(order.shippingCountry);
  }

  const message = lines.join('\n');

  await sendTelegramMessage(message);
}
