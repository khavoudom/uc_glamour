'use client';

import { useState } from 'react';

export default function DeliveryReturns() {
  const [express, setExpress] = useState(false);

  return (
    <section className="px-4">
      <h2 className="font-heading mb-2 text-lg font-normal text-(--charcoal)">
        Delivery & Returns
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-md border-[0.5px] border-border bg-(--white) p-3.5">
          <span className="text-[22px]" aria-hidden="true">
            🚚
          </span>
          <p className="mt-1 text-[13px] font-medium text-(--charcoal)">Free Shipping</p>
          <p className="text-[11px] text-muted">On orders over $50. Flat $5.99 below.</p>
        </div>
        <div className="rounded-md border-[0.5px] border-border bg-(--white) p-3.5">
          <span className="text-[22px]" aria-hidden="true">
            ↩️
          </span>
          <p className="mt-1 text-[13px] font-medium text-(--charcoal)">30-Day Returns</p>
          <p className="text-[11px] text-muted">Unopened items only. Pre-paid label provided.</p>
        </div>
        <div className="rounded-md border-[0.5px] border-border bg-(--white) p-3.5">
          <span className="text-[22px]" aria-hidden="true">
            ⚡
          </span>
          <p className="mt-1 text-[13px] font-medium text-(--charcoal)">Express 2-Day</p>
          <p className="text-[11px] text-muted">Available at checkout for an additional fee.</p>
          <button
            onClick={() => setExpress(!express)}
            className={`mt-1.5 rounded-sm px-2.5 py-1 text-[10px] font-medium transition-colors ${
              express ? 'bg-(--rose) text-white' : 'border-[0.5px] border-border text-muted'
            }`}
            aria-pressed={express}
          >
            {express ? '✓ Express selected (+$12.99)' : 'Select Express +$12.99'}
          </button>
        </div>
        <div className="rounded-md border-[0.5px] border-border bg-(--white) p-3.5">
          <span className="text-[22px]" aria-hidden="true">
            💳
          </span>
          <p className="mt-1 text-[13px] font-medium text-(--charcoal)">Refund</p>
          <p className="text-[11px] text-muted">Processed within 5-7 business days of receipt.</p>
        </div>
      </div>
      <div className="mt-2 rounded-sm bg-(--cream) px-3 py-2">
        <p className="text-[10px] text-muted">
          📦 Returns are accepted within <strong>30 days</strong> of delivery. Items must be
          unopened and in original packaging. Refunds are processed within 5-7 business days after
          we receive your return.{' '}
          <span className="text-(--rose)">Initiate a return from your account dashboard.</span>
        </p>
      </div>
    </section>
  );
}
