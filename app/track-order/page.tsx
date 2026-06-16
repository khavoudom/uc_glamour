'use client';

import { useState } from 'react';
import ContentPageLayout from '@/components/content-page-layout';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [lookedUp, setLookedUp] = useState(false);

  const handleTrack = () => {
    setLookedUp(true);
  };

  return (
    <ContentPageLayout title="Track Order">
      <p className="mb-6">
        Enter your order number to check the status of your shipment. You can find your order number
        in your confirmation email.
      </p>

      <div className="bg-white border border-border rounded-xl p-5">
        <label className="text-[11px] font-medium text-text block mb-1">Order Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="e.g. ORD-12345"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-[12px] outline-none"
          />
          <button
            onClick={handleTrack}
            className="bg-pink text-white border-none rounded-lg px-4 py-2 text-[11px] font-medium cursor-pointer"
          >
            Track
          </button>
        </div>
      </div>

      {lookedUp && (
        <div className="bg-white border border-border rounded-xl p-5 mt-4 text-center">
          <p className="text-[13px] text-text font-medium">
            {orderId.trim() ? `Order ${orderId}` : 'Order not found'}
          </p>
          <p className="text-xs text-muted mt-1">
            {orderId.trim()
              ? 'Please check your email for the latest updates. Detailed tracking will appear here soon.'
              : 'Please enter a valid order number.'}
          </p>
        </div>
      )}

      <div className="mt-6 text-xs text-muted">
        <p>
          Need help?{' '}
          <span
            className="text-pink cursor-pointer"
            onClick={() => (window.location.href = '/contact')}
          >
            Contact us
          </span>
        </p>
      </div>
    </ContentPageLayout>
  );
}
