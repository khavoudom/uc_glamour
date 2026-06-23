'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Maximize2, Minimize2, Fullscreen } from 'lucide-react';
import { useChatStore } from '@/store/chat-store';
import ChatMessageBubble from './chat-message';
import ChatInput from './chat-input';
import ProductCard from './product-card';

const quickPrompts = [
  { label: 'Track my order', text: 'Show my order history' },
  { label: 'My wishlist', text: 'Show my wishlist' },
  { label: 'Find a gift', text: 'Help me find a gift under $50' },
  { label: 'Skin quiz', text: 'Start a skin analysis quiz' },
  { label: 'Build a routine', text: 'Build me a skincare routine for dry skin' },
  { label: 'Recommendations', text: 'Recommend some products for me' },
];

export default function ChatWidget() {
  const router = useRouter();
  const {
    isOpen,
    setIsOpen,
    width,
    height,
    isMinimized,
    isFullscreen,
    position,
    messages,
    isAiLoading,
    toolStatus,
    displayProducts,
    pendingNavigation,
    setPendingNavigation,
    sendMessage,
    setIsMinimized,
    setIsFullscreen,
    setWidth,
    setHeight,
    conversationId,
    switchConversation,
  } = useChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router, setPendingNavigation]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: width,
        startH: height,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dy = ev.clientY - resizeRef.current.startY;
        const newW = Math.max(280, Math.min(800, resizeRef.current.startW + dx));
        const newH = Math.max(300, Math.min(900, resizeRef.current.startH + dy));
        setWidth(newW);
        setHeight(newH);
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, height, setWidth, setHeight],
  );

  const posStyles =
    position === 'bottom-right'
      ? { bottom: 16, right: 16 }
      : position === 'bottom-left'
        ? { bottom: 16, left: 16 }
        : position === 'top-right'
          ? { top: 16, right: 16 }
          : { top: 16, left: 16 };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed z-150 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4537E] to-[#BA7517] px-5 py-3 text-[13px] font-medium text-white shadow-lg hover:shadow-xl transition-shadow"
        style={posStyles}
        aria-label="Open chat"
      >
        <MessageCircle size={18} />
        <span>Chat with us</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: isFullscreen ? '100vw' : width,
          height: isMinimized ? 56 : isFullscreen ? '100vh' : height,
        }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 28,
          mass: 0.8,
        }}
        className="fixed flex flex-col rounded-lg border-[0.5px] border-(--color-border) bg-(--color-white) shadow-2xl overflow-hidden"
        style={
          isFullscreen
            ? { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0, zIndex: 9999 }
            : {
                ...(position === 'bottom-right'
                  ? { bottom: 16, right: 16 }
                  : position === 'bottom-left'
                    ? { bottom: 16, left: 16 }
                    : position === 'top-right'
                      ? { top: 16, right: 16 }
                      : { top: 16, left: 16 }),
                borderRadius: 14,
                zIndex: 1000,
              }
        }
      >
        <div className="relative flex items-center justify-between bg-gradient-to-r from-[#D4537E] to-[#BA7517] px-4 py-3 text-white shrink-0 cursor-grab">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <MessageCircle size={14} />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-tight">AI Assistant</p>
              <p className="text-[9px] opacity-70 leading-tight">
                {conversationId ? 'Persistent chat' : 'Powered by AI Agent'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Fullscreen size={13} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D4537E]/10 to-[#BA7517]/10"
                >
                  <MessageCircle size={28} className="text-[#D4537E]" />
                </motion.div>
                <p className="text-[13px] font-medium text-(--color-text)">
                  Hi! How can I help you today?
                </p>
                <p className="text-[11px] text-(--color-muted) max-w-[240px]">
                  I can track orders, manage your wishlist, find gifts, build routines, and more.
                </p>

                <div className="mt-1 flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((prompt, i) => (
                    <motion.button
                      key={prompt.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                      onClick={() => sendMessage(prompt.text)}
                      disabled={isAiLoading}
                      className="rounded-[10px] bg-(--color-bg) px-3 py-2 text-[11px] text-(--color-text) hover:bg-(--color-pink-lt) transition-colors disabled:opacity-50"
                    >
                      {prompt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
            )}

            {isAiLoading && messages[messages.length - 1]?.content !== '' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start"
              >
                <div className="rounded-lg bg-(--color-bg) px-3.5 py-2.5 text-[13px] rounded-tl-[4px]">
                  <span className="inline-flex gap-1">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-(--color-muted)"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-(--color-muted)"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-(--color-muted)"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    />
                  </span>
                </div>
              </motion.div>
            )}

            {displayProducts.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium text-(--color-muted) px-1">
                  Products found ({displayProducts.length})
                </p>
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {toolStatus && (
              <motion.div
                key={toolStatus}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start px-1"
              >
                <div className="rounded-sm bg-(--color-bg) px-3 py-1.5 text-[11px] text-(--color-muted)">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--color-pink) animate-pulse" />
                    {toolStatus}
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </motion.div>
        )}

        {!isMinimized && <ChatInput />}

        {!isFullscreen && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 z-10 w-5 h-5 cursor-se-resize"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, var(--color-border) 50%)',
            }}
            title="Drag to resize"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
