'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function CareersPage() {
  return (
    <ContentPageLayout title="Careers">
      <p>
        Join us in redefining beauty. At Glamour, you&apos;ll work with a passionate team that
        values creativity, transparency, and impact.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Why Work With Us</h2>
      <p>
        We offer competitive compensation, flexible remote-first work, and a culture that
        prioritizes growth and well-being. Whether you&apos;re in formulation, engineering,
        marketing, or operations, you&apos;ll have the autonomy to make a real difference.
      </p>

      <h2 className="font-heading text-[18px] text-text font-normal mt-6">Open Positions</h2>
      <p className="text-muted text-xs">
        We don&apos;t have any open positions right now, but we&apos;re always looking for talented
        people. Follow us on social media to hear when new roles open up.
      </p>
    </ContentPageLayout>
  );
}
