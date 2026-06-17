'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function CookiePolicyPage() {
  return (
    <ContentPageLayout title="Cookie Policy">
      <p className="text-xs text-muted">Last updated: June 1, 2026</p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        site remember your preferences and improve your browsing experience.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">How We Use Cookies</h2>
      <p>
        We use cookies for essential site functionality (keeping items in your cart, maintaining
        your session), analytics (understanding how visitors use our site), and personalization
        (remembering your preferences and recommending products).
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Types of Cookies We Use</h2>
      <ul className="text-sm text-text/80 space-y-1 list-disc pl-5">
        <li>
          <strong>Essential:</strong> Required for the site to function (cart, checkout, account
          login).
        </li>
        <li>
          <strong>Analytics:</strong> Help us understand how visitors interact with our site.
        </li>
        <li>
          <strong>Functional:</strong> Remember your preferences for a better experience.
        </li>
        <li>
          <strong>Marketing:</strong> Used to show relevant ads (only with your consent).
        </li>
      </ul>

      <h2 className="font-heading text-lg text-text font-normal mt-6">Managing Cookies</h2>
      <p>
        You can control cookies through your browser settings. Disabling certain cookies may affect
        site functionality, such as the ability to check out or keep items in your cart.
      </p>
    </ContentPageLayout>
  );
}
