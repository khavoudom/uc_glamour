'use client';

import ContentPageLayout from '@/components/content-page-layout';

export default function PressPage() {
  return (
    <ContentPageLayout title="Press">
      <p className="mb-6">
        Discover what the beauty world is saying about Glamour. For press inquiries, please reach
        out to us at <span className="text-pink">press@glamourbeauty.com</span>.
      </p>

      <div className="space-y-5">
        <div className="border border-border rounded-xl p-4 bg-white">
          <p className="text-[10px] text-muted uppercase tracking-wider">
            Beauty Daily &mdash; May 2026
          </p>
          <p className="text-[13px] text-text mt-1">
            &ldquo;Glamour&apos;s Hydrating Serum is a game-changer for dry skin. Lightweight,
            effective, and surprisingly affordable.&rdquo;
          </p>
        </div>
        <div className="border border-border rounded-xl p-4 bg-white">
          <p className="text-[10px] text-muted uppercase tracking-wider">
            Vogue &mdash; April 2026
          </p>
          <p className="text-[13px] text-text mt-1">
            &ldquo;The clean beauty brand you need to know about. Their Velvet Matte Lipstick has
            earned a permanent spot in our editors&apos; bags.&rdquo;
          </p>
        </div>
        <div className="border border-border rounded-xl p-4 bg-white">
          <p className="text-[10px] text-muted uppercase tracking-wider">
            Allure &mdash; March 2026
          </p>
          <p className="text-[13px] text-text mt-1">
            &ldquo;Inclusive, sustainable, and genuinely effective &mdash; Glamour is setting a new
            standard for what a modern beauty brand should be.&rdquo;
          </p>
        </div>
      </div>
    </ContentPageLayout>
  );
}
