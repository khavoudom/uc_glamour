'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function TermsPage() {
  return (
    <ContentPageLayout title="Terms of Service">
      <p className="text-xs text-muted">Last updated: June 1, 2026</p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Use of Our Service</h2>
      <p>
        By using Glamour&apos;s website and services, you agree to these terms. You must be at least
        18 years old to make a purchase. Accounts must be used responsibly, and you are responsible
        for maintaining the confidentiality of your login credentials.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">
        Pricing &amp; Availability
      </h2>
      <p>
        All prices are listed in USD and exclude applicable taxes and shipping. We reserve the right
        to modify prices and correct pricing errors at any time. Product availability is subject to
        change without notice.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Orders &amp; Payments</h2>
      <p>
        We reserve the right to refuse or cancel any order. In the event of a cancellation, you will
        receive a full refund. Payment is due at the time of purchase and is processed through our
        secure payment partners.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Intellectual Property</h2>
      <p>
        All content on this website — including product names, descriptions, images, logos, and
        designs — is the property of Glamour and may not be reproduced without written permission.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">
        Limitation of Liability
      </h2>
      <p>
        Glamour shall not be liable for any indirect, incidental, or consequential damages arising
        from the use of our products or website. Our total liability is limited to the purchase
        price of the product giving rise to the claim.
      </p>
    </ContentPageLayout>
  );
}
