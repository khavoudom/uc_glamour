'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when chat opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t-[0.5px] border-[var(--color-border)] px-3 py-3">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="min-w-0 flex-1 rounded-[10px] border-[0.5px] border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-pink)] transition-colors disabled:opacity-50"
        aria-label="Chat message"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--color-pink)] text-white disabled:opacity-40 hover:bg-[var(--color-pink-dk)] transition-colors shrink-0"
        aria-label="Send message"
      >
        <Send size={15} />
      </button>
    </div>
  );
}
