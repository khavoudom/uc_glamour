'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function PrivacyPage() {
  return (
    <ContentPageLayout title="Privacy Policy">
      <p className="text-xs text-muted">Last updated: June 1, 2026</p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Information We Collect</h2>
      <p>
        We collect information you provide when you create an account, place an order, subscribe to
        our newsletter, or contact our support team. This includes your name, email address,
        shipping address, and payment information (processed securely by our payment partners).
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">
        How We Use Your Information
      </h2>
      <p>
        We use your information to fulfill orders, send order updates, improve our products and
        services, and (with your consent) send marketing communications about new arrivals and
        exclusive offers.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Data Protection</h2>
      <p>
        We implement industry-standard security measures to protect your personal information. Your
        payment data is encrypted and processed through PCI-compliant partners. We never store full
        credit card numbers on our servers.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Your Rights</h2>
      <p>
        You may access, update, or delete your personal information at any time through your account
        settings. You can unsubscribe from marketing emails using the link in any email we send.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Contact</h2>
      <p>For privacy-related inquiries, contact us at privacy@glamourbeauty.com.</p>
    </ContentPageLayout>
  );
}
