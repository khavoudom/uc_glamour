'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function SustainabilityPage() {
  return (
    <ContentPageLayout title="Sustainability">
      <p>
        We believe beauty and responsibility go hand in hand. Every decision we make considers its
        impact on the planet and the people who call it home.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Our Commitments</h2>
      <p>
        <strong>Recyclable Packaging.</strong> By the end of 2026, 100% of our packaging will be
        recyclable or refillable. We&apos;ve already eliminated single-use plastics from our supply
        chain.
      </p>
      <p>
        <strong>Carbon-Neutral Shipping.</strong> Every order is shipped through carbon-neutral
        carriers. We offset remaining emissions through verified reforestation projects.
      </p>
      <p>
        <strong>Clean Formulations.</strong> We never use parabens, phthalates, sulfates, or
        synthetic fragrances. Our ingredients are ethically sourced and cruelty-free.
      </p>
      <p>
        <strong>Waste Reduction.</strong> We produce in small batches to minimize overstock, and
        partner with organizations that redistribute unsold inventory to communities in need.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Our Progress</h2>
      <div className="grid grid-cols-3 gap-3 mt-3">
        {[
          { value: '85%', label: 'recyclable packaging' },
          { value: '100%', label: 'carbon-neutral shipping' },
          { value: '12K', label: 'trees planted' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-xl p-4 text-center"
          >
            <p className="font-heading text-[20px] text-pink">{stat.value}</p>
            <p className="text-[10px] text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </ContentPageLayout>
  );
}
