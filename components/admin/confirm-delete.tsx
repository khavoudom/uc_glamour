'use client';

import { useState } from 'react';

interface ConfirmDeleteProps {
  onConfirm: () => void;
  label?: string;
}

export default function ConfirmDelete({ onConfirm, label = 'Delete' }: ConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex gap-1.5">
        <button
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          className="px-2.5 py-1 rounded-sm border-none bg-danger text-white text-[11px] font-medium cursor-pointer font-sans"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-sm border border-border bg-white text-text text-[11px] cursor-pointer font-sans"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-2.5 py-1 rounded-sm border border-border bg-white text-danger text-[11px] cursor-pointer font-sans"
    >
      {label}
    </button>
  );
}
