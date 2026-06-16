'use client';

import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  return (
    <div className="bg-white overflow-hidden grid grid-cols-[1fr_380px]" style={{ minHeight: 480 }}>
      <div className="px-12 py-14 flex flex-col justify-center">
        <div className="text-[10px] tracking-[2.5px] uppercase text-pink font-medium mb-[14px] flex items-center gap-2">
          <span className="block w-6 h-px bg-pink" />
          Summer 2026 Collection
        </div>

        <h1 className="font-heading text-[52px] font-light leading-[1.08] text-text mb-4">
          Feel <em style={{ fontStyle: 'italic', color: 'var(--color-pink)' }}>radiant,</em>
          <br />
          <strong style={{ fontWeight: 600 }}>look stunning</strong>
        </h1>

        <p className="text-[14px] text-muted leading-[1.7] max-w-[380px] mb-7 font-light">
          Curated beauty essentials crafted for every complexion. Clean formulas, luxurious
          textures, results you can see.
        </p>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => {
              const el = document.querySelector('.section-wrap');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="bg-pink text-white border-none rounded-[24px] px-7 py-3 text-[13px] font-medium font-sans cursor-pointer inline-flex items-center gap-2"
          >
            Shop the Collection{' '}
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
          <button
            onClick={() => router.push('/products')}
            className="bg-none border border-border-md text-text rounded-[24px] px-6 py-3 text-[13px] font-normal font-sans cursor-pointer"
          >
            View All Products
          </button>
        </div>

        <div className="flex gap-7 mt-8 pt-6 border-t border-border">
          <div>
            <div className="font-heading text-[26px] font-medium text-text leading-none">200+</div>
            <div className="text-[10px] text-muted mt-[2px] tracking-[0.3px]">Products</div>
          </div>
          <div>
            <div className="font-heading text-[26px] font-medium text-text leading-none">48k</div>
            <div className="text-[10px] text-muted mt-[2px] tracking-[0.3px]">Happy Customers</div>
          </div>
          <div>
            <div className="font-heading text-[26px] font-medium text-text leading-none">4.9★</div>
            <div className="text-[10px] text-muted mt-[2px] tracking-[0.3px]">Average Rating</div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #fff0f4 0%, #fff6e6 100%)',
        }}
      >
        <div
          className="w-[260px] h-[260px] rounded-full flex items-center justify-center relative"
          style={{
            background: 'rgba(232, 51, 106, 0.06)',
            border: '0.5px solid rgba(232, 51, 106, 0.12)',
          }}
        >
          <div
            className="w-[180px] h-[180px] rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(232, 51, 106, 0.08)',
              border: '0.5px solid rgba(232, 51, 106, 0.15)',
            }}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(232,51,106,0.3)"
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

        {/* Floating badge 1 */}
        <div
          className="absolute top-[60px] left-5 bg-white border border-border rounded-[10px] px-3 py-2 flex items-center gap-2 text-[11px]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="var(--color-pink)"
            stroke="var(--color-pink)"
            strokeWidth="1"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div>
            <div className="font-medium text-[13px] text-text">4.9/5</div>
            <div className="text-[10px] text-muted">2,341 reviews</div>
          </div>
        </div>

        {/* Floating badge 2 */}
        <div
          className="absolute bottom-20 right-4 bg-white border border-border rounded-[10px] px-3 py-2 flex items-center gap-2 text-[11px]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-pink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
            <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
          <div>
            <div className="font-medium text-[13px] text-text">Free shipping</div>
            <div className="text-[10px] text-muted">Orders over $100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
