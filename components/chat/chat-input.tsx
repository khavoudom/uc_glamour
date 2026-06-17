'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAiLoading, sendMessage } = useChatStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isAiLoading) return;
    await sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t-[0.5px] border-(--color-border) px-3 py-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isAiLoading}
          className="min-w-0 flex-1 rounded-[10px] border-[0.5px] border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-[13px] text-(--color-text) placeholder:text-(--color-muted) outline-none focus:border-(--color-pink) transition-colors disabled:opacity-50"
          aria-label="Chat message"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isAiLoading}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-(--color-pink) text-white disabled:opacity-40 hover:bg-(--color-pink-dk) transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
