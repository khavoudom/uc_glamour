'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updatePaymentStatusAction,
  updateFulfillmentStatusAction,
} from '@/app/actions/admin/orders';

interface Props {
  orderId: number;
  type: 'payment' | 'fulfillment';
  currentStatus: string;
  options: string[];
}

export default function OrderStatusForm({ orderId, type, currentStatus, options }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selected === currentStatus) return;
    setUpdating(true);
    try {
      if (type === 'payment') {
        await updatePaymentStatusAction(orderId, selected);
      } else {
        await updateFulfillmentStatusAction(orderId, selected);
      }
      router.refresh();
    } catch {
      setSelected(currentStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="flex-1 border border-border-md rounded-lg px-[10px] py-2 text-[12px] font-sans outline-none bg-white text-text"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={selected === currentStatus || updating}
        className="px-4 py-2 rounded-lg border-none text-[12px] font-medium cursor-pointer font-sans disabled:cursor-not-allowed"
        style={{
          background:
            selected === currentStatus || updating ? 'var(--color-bg)' : 'var(--color-pink)',
          color: selected === currentStatus || updating ? 'var(--color-muted)' : '#fff',
        }}
      >
        {updating ? 'Updating...' : 'Update'}
      </button>
    </div>
  );
}
