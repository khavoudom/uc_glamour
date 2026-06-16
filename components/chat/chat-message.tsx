'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/store/chat-store';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic text-[var(--color-muted)]">{children}</em>,
        code: ({ children }) => (
          <code className="bg-black/5 rounded px-1 text-[11px]">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? 'bg-[var(--color-pink)] text-white rounded-tr-[4px]'
            : 'bg-[var(--color-bg)] text-[var(--color-text)] rounded-tl-[4px]'
        }`}
      >
        {message.content ? (
          isUser ? (
            <p>{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )
        ) : (
          <span className="inline-flex gap-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </span>
        )}
      </div>
      <span className="mt-0.5 px-1 text-[9px] text-[var(--color-muted)]">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
  );
}
