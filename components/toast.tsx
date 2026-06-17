'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function Toast() {
  const { toast } = useStore();
  const [visible, setVisible] = useState(false);
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (toast.visible && !prevVisibleRef.current) {
      const raf = requestAnimationFrame(() => setVisible(true));
      prevVisibleRef.current = true;
      return () => cancelAnimationFrame(raf);
    } else if (!toast.visible) {
      setVisible(false);
      prevVisibleRef.current = false;
    }
  }, [toast.visible]);

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-300 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block rounded-xl bg-(--color-text) px-5 py-2.5 text-[13px] text-white">
        {toast.message}
      </span>
    </div>
  );
}
