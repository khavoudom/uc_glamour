'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function HelpPage() {
  return (
    <ContentPageLayout title="Help Center">
      <p className="mb-6">
        Find answers to common questions. If you can&apos;t find what you&apos;re looking for, feel
        free to{' '}
        <span
          className="text-pink cursor-pointer"
          onClick={() => (window.location.href = '/contact')}
        >
          contact us
        </span>
        .
      </p>

      {[
        {
          q: 'How do I place an order?',
          a: "Browse our products, select your preferred shade and quantity, and add them to your cart. When you're ready, proceed to checkout and choose your payment method.",
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, PayPal, and Bakong KHQR (for Cambodia-based customers).',
        },
        {
          q: 'How long does shipping take?',
          a: 'Domestic orders arrive within 3–5 business days. International orders typically take 7–14 business days depending on customs.',
        },
        {
          q: 'Can I change or cancel my order?',
          a: 'You can modify or cancel your order within 1 hour of placing it. Contact our support team with your order number.',
        },
        {
          q: 'Do you offer samples?',
          a: 'Yes! We include free samples with every order over $30. You can select your preference at checkout.',
        },
      ].map((faq) => (
        <div
          key={faq.q}
          className="border-b border-border/40 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
        >
          <p className="text-[13px] font-medium text-text mb-1">{faq.q}</p>
          <p className="text-[12px] text-muted">{faq.a}</p>
        </div>
      ))}
    </ContentPageLayout>
  );
}
