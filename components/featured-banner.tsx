'use client';

import { useRouter } from 'next/navigation';

export default function FeaturedBanner() {
  const router = useRouter();
  return (
    <div
      className="mx-7 mb-5 bg-text rounded-2xl overflow-hidden grid grid-cols-2"
      style={{ minHeight: 200 }}
    >
      <div className="px-9 py-9 flex flex-col justify-center">
        <div className="text-[10px] tracking-[2px] uppercase text-white/50 mb-2.5">
          Limited Time Offer
        </div>
        <h2 className="font-heading text-[32px] font-light text-white leading-[1.15] mb-4">
          Glow up with our
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--color-pink-mid)' }}>Summer Edit</em>
        </h2>
        <button
          onClick={() => router.push('/products')}
          className="bg-pink text-white border-none rounded-xl px-5.5 py-2.5 text-xs font-medium font-sans cursor-pointer inline-flex items-center gap-1.5 w-fit"
        >
          Explore the Edit{' '}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
      <div
        className="flex items-center justify-center relative"
        style={{
          background:
            'linear-gradient(135deg, rgba(232,51,106,0.15) 0%, rgba(200,134,10,0.1) 100%)',
        }}
      >
        <div
          className="w-30 h-30 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(232,51,106,0.1)',
            border: '0.5px solid rgba(232,51,106,0.2)',
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(232,51,106,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" />
            <path d="m9 15 3-3 3 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
