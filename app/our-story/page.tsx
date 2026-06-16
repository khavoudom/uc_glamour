'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function OurStoryPage() {
  return (
    <ContentPageLayout title="Our Story">
      <p>
        Glamour was born from a simple idea: beauty shouldn&apos;t be complicated. In 2020, our
        founder set out to create a line of essentials that stripped away the noise — no misleading
        claims, no excessive packaging, no ingredients you can&apos;t pronounce.
      </p>
      <p>
        What started as a small batch of lipsticks made in collaboration with local chemists quickly
        grew into a full collection spanning skincare, makeup, and fragrance. Every product was
        developed with the same principle: if it isn&apos;t good enough for your skin, it
        shouldn&apos;t be in your routine.
      </p>
      <p>
        Today, Glamour serves thousands of customers worldwide. We&apos;ve stayed true to our roots
        — small-batch quality, honest ingredients, and a deep respect for the people and planet that
        make it all possible.
      </p>
      <p className="italic text-muted">&mdash; The Glamour Team</p>
    </ContentPageLayout>
  );
}
