import 'server-only';
import { getOrderById } from '@/lib/data-access/orders';
import { enqueueEmail } from '@/lib/email-queue';

export async function sendReceiptEmail(orderId: number) {
  const order = await getOrderById(orderId);
  if (!order) return;

  const emailTo = order.userEmail || order.shippingEmail;
  if (!emailTo) return;

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;">
            ${item.emoji} ${item.productName}${item.shade ? ` — ${item.shade}` : ''} &times; ${item.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;text-align:right;">
            $${(Number(item.unitPrice) * item.quantity).toFixed(2)}
          </td>
        </tr>`,
    )
    .join('');

  const payMethod = order.paymentMethod === 'paypal' ? 'PayPal' : 'Bakong KHQR';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 10px;">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 30px 10px;text-align:center;">
        <h1 style="margin:0 0 4px;font-size:22px;color:#111;">Order Confirmed!</h1>
        <p style="margin:0;font-size:13px;color:#888;">Thanks for your purchase — here's your receipt.</p>
      </td></tr>
      <tr><td style="padding:0 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          <tr>
            <td style="font-size:12px;color:#888;">Order #${order.id}</td>
            <td style="font-size:12px;color:#888;text-align:right;">${payMethod}</td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr><td style="padding:6px 0;font-size:13px;color:#555;">Subtotal</td>
              <td style="padding:6px 0;font-size:13px;text-align:right;">$${Number(order.subtotal).toFixed(2)}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#555;">Shipping</td>
              <td style="padding:6px 0;font-size:13px;text-align:right;">$${Number(order.shippingCost).toFixed(2)}</td></tr>
          ${
            Number(order.couponDiscount) > 0
              ? `<tr><td style="padding:6px 0;font-size:13px;color:#555;">Discount</td>
              <td style="padding:6px 0;font-size:13px;text-align:right;color:#e91e63;">-$${Number(order.couponDiscount).toFixed(2)}</td></tr>`
              : ''
          }
          <tr><td style="padding:10px 0 6px;border-top:2px solid #111;font-size:15px;font-weight:600;">Total</td>
              <td style="padding:10px 0 6px;border-top:2px solid #111;font-size:15px;font-weight:600;text-align:right;">$${Number(order.total).toFixed(2)}</td></tr>
        </table>
      </td></tr>
      ${
        order.shippingName
          ? `<tr><td style="padding:20px 30px 30px;border-top:1px solid #eee;">
        <p style="margin:0 0 4px;font-size:12px;color:#888;">Shipping to</p>
        <p style="margin:0;font-size:13px;color:#333;">${order.shippingName}<br>
        ${order.shippingAddress}<br>
        ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}<br>
        ${order.shippingCountry}</p>
      </td></tr>`
          : ''
      }
      <tr><td style="padding:20px 30px;background:#fafafa;text-align:center;font-size:11px;color:#aaa;">
        Glamour Beauty &bull; Thank you for your order!
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  await enqueueEmail({
    to: emailTo,
    subject: `Order Confirmed — #${order.id}`,
    html,
  });
}
