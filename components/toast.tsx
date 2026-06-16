'use client';

import { useStore } from '@/lib/store';

export default function Toast() {
  const { toast } = useStore();

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 ${
        toast.visible ? 'animate-in fade-in duration-300' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block rounded-[20px] bg-[var(--color-text)] px-5 py-2.5 text-[13px] text-white">
        {toast.message}
      </span>
    </div>
  );
}
