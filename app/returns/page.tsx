'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function ReturnsPage() {
  return (
    <ContentPageLayout title="Returns">
      <p>
        We want you to love every Glamour purchase. If something isn&apos;t right, we&apos;re here
        to make it right.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Return Policy</h2>
      <p>
        You may return any unused, unopened product within 30 days of delivery for a full refund.
        Opened products that are defective or caused an allergic reaction may also be eligible —
        please reach out to our support team.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">How to Return</h2>
      <ol className="text-sm text-text/80 space-y-2 list-decimal pl-5">
        <li>Contact us at returns@glamourbeauty.com with your order number.</li>
        <li>Pack the items securely in their original packaging.</li>
        <li>Attach the prepaid return label we provide via email.</li>
        <li>Drop off at any authorized shipping location.</li>
      </ol>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Refund Timeline</h2>
      <p>
        Refunds are processed within 5–7 business days after we receive your return. The refund will
        be issued to your original payment method. You&apos;ll receive a confirmation email once
        it&apos;s complete.
      </p>
    </ContentPageLayout>
  );
}
