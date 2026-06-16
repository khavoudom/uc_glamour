'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentPageLayout from '@/components/content-page-layout';

export default function ContactPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  return (
    <ContentPageLayout title="Contact Us">
      <p className="mb-6">
        We&apos;d love to hear from you. Reach out with questions, feedback, or just to say hello.
      </p>

      {submitted ? (
        <div className="bg-white border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-text font-medium">Thanks for reaching out!</p>
          <p className="text-xs text-muted mt-2">We&apos;ll get back to you within 24 hours.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-xs text-pink cursor-pointer border-none bg-none"
          >
            Back to Store →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="mb-4">
            <label className="text-[11px] font-medium text-text block mb-1">Your Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-[12px] outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="text-[11px] font-medium text-text block mb-1">Message</label>
            <textarea
              rows={4}
              placeholder="How can we help?"
              className="w-full border border-border rounded-lg px-3 py-2 text-[12px] outline-none resize-none"
            />
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="bg-pink text-white border-none rounded-lg px-5 py-2 text-[11px] font-medium cursor-pointer"
          >
            Send Message
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-muted space-y-1">
        <p>Email: hello@glamourbeauty.com</p>
        <p>Phone: +1 (555) 123-4567</p>
        <p>Mon – Fri, 9 AM – 6 PM EST</p>
      </div>
    </ContentPageLayout>
  );
}
