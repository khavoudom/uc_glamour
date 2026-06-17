'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function AboutPage() {
  return (
    <ContentPageLayout title="About Us">
      <h2 className="font-heading text-lg text-text font-normal mt-6">Our Mission</h2>
      <p>
        At Glamour, we believe beauty should feel good — for you and for the planet. We create
        clean, effective beauty essentials that celebrate every complexion. Every product is
        thoughtfully formulated without parabens, sulfates, or synthetic fragrances.
      </p>
      <p>
        We&apos;re on a mission to make radiant skin accessible to all, with transparent pricing,
        inclusive shade ranges, and a commitment to sustainability at every step.
      </p>

      <h2 className="font-heading text-lg text-text font-normal mt-6">What We Stand For</h2>
      <p>
        <strong>Clean Beauty.</strong> Rigorously tested, dermatologist-approved formulas that
        deliver results without compromise.
      </p>
      <p>
        <strong>Inclusivity.</strong> Shade ranges designed for every skin tone, and products for
        every skin type — because beauty has no boundaries.
      </p>
      <p>
        <strong>Sustainability.</strong> From recyclable packaging to carbon-neutral shipping,
        we&apos;re constantly working to reduce our footprint.
      </p>
      <p>
        <strong>Community.</strong> We listen, learn, and evolve with the people who make Glamour
        what it is — our customers.
      </p>
    </ContentPageLayout>
  );
}
