import { create } from 'zustand';
import { useStore } from '@/lib/store';

export type ChatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type MessageRole = 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: { name: string; args: unknown }[];
  timestamp: number;
}

export interface ChatProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  emoji: string;
  description?: string;
  rating?: number;
  imageUrls?: string[];
  shades?: { name: string; hex: string; stock: number }[];
}

export interface ChatState {
  width: number;
  height: number;
  isMinimized: boolean;
  isFullscreen: boolean;
  position: ChatPosition;
  isOpen: boolean;
  isAiLoading: boolean;

  messages: ChatMessage[];

  conversationId: number | null;
  conversations: { id: number; title: string; updatedAt: Date }[];

  toolStatus: string | null;

  displayProducts: ChatProduct[];

  pendingNavigation: string | null;

  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setIsMinimized: (val: boolean) => void;
  setIsFullscreen: (val: boolean) => void;
  setPosition: (pos: ChatPosition) => void;
  setIsOpen: (val: boolean) => void;
  setToolStatus: (label: string | null) => void;
  setDisplayProducts: (products: ChatProduct[]) => void;
  clearDisplayProducts: () => void;
  setPendingNavigation: (page: string | null) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
  setAiLoading: (val: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
  setConversationId: (id: number | null) => void;
  loadConversations: () => Promise<void>;
  switchConversation: (id: number) => Promise<void>;
}

const defaultWidth = 380;
const defaultHeight = 520;

export const useChatStore = create<ChatState>()((set, get) => ({
  width: defaultWidth,
  height: defaultHeight,
  isMinimized: false,
  isFullscreen: false,
  position: 'bottom-right',
  isOpen: false,
  isAiLoading: false,
  messages: [],
  toolStatus: null,
  displayProducts: [],
  pendingNavigation: null,
  conversationId: null,
  conversations: [],
  setWidth: (width) => set({ width, isFullscreen: false, isMinimized: false }),
  setHeight: (height) => set({ height, isMinimized: false }),
  setIsMinimized: (val) => set({ isMinimized: val, isFullscreen: false }),
  setIsFullscreen: (val) => set({ isFullscreen: val, isMinimized: false }),
  setPosition: (pos) => set({ position: pos }),
  setIsOpen: (val) => set({ isOpen: val }),
  setToolStatus: (label) => set({ toolStatus: label }),
  setDisplayProducts: (products) => set({ displayProducts: products }),
  clearDisplayProducts: () => set({ displayProducts: [] }),
  setPendingNavigation: (page) => set({ pendingNavigation: page }),
  setConversationId: (id) => set({ conversationId: id }),
  loadConversations: async () => {
    try {
      const res = await fetch('/api/chat/history');
      const data = await res.json();
    } catch {}
  },

  switchConversation: async (id: number) => {
    try {
      const res = await fetch(`/api/chat/history?conversationId=${id}`);
      const data = await res.json();
      if (data.messages) {
        set({
          conversationId: id,
          messages: data.messages.map((m: any) => ({
            id: `db-${m.id}`,
            role: m.role === 'ai' ? 'assistant' : m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
            timestamp: new Date(m.timestamp).getTime(),
          })),
          displayProducts: [],
          toolStatus: null,
        });
      }
    } catch {}
  },

  addMessage: (msg) => {
    const full: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, full] }));
    return full;
  },

  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    }));
  },

  setAiLoading: (val) => set({ isAiLoading: val }),

  sendMessage: async (content) => {
    const {
      addMessage,
      setAiLoading,
      messages,
      updateMessage,
      setWidth,
      setHeight,
      setIsMinimized,
      setIsFullscreen,
      setPosition,
      setToolStatus,
      setDisplayProducts,
      clearDisplayProducts,
      setPendingNavigation,
      conversationId,
      setConversationId,
    } = get();

    addMessage({ role: 'user', content });
    setAiLoading(true);
    setToolStatus(null);
    clearDisplayProducts();

    const aiMsg = addMessage({ role: 'assistant', content: '' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
          conversationId,
        }),
      });

      if (!res.ok) {
        updateMessage(aiMsg.id, 'Sorry, I encountered an error. Please try again.');
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'conversation-created' && parsed.conversationId) {
              setConversationId(parsed.conversationId);
              continue;
            }

            if (parsed.type === 'tool-status' && parsed.label) {
              setToolStatus(parsed.label);
              continue;
            }

            if (parsed.type === 'text' && parsed.text) {
              setToolStatus(null);
              accumulated += parsed.text;
              updateMessage(aiMsg.id, accumulated);
              continue;
            }

            if (parsed.type === 'tool-result') {
              const { toolName, result } = parsed;
              if (toolName === 'changeChatWidth' && result.width) {
                setWidth(result.width);
              }
              if (toolName === 'changeChatHeight' && result.height) {
                setHeight(result.height);
              }
              if (toolName === 'maximizeChat') {
                setIsFullscreen(false);
                setWidth(600);
                setHeight(700);
              }
              if (toolName === 'minimizeChat') {
                setIsMinimized(true);
              }
              if (toolName === 'fullscreenChat') {
                setIsFullscreen(true);
              }
              if (toolName === 'moveChat' && result.position) {
                setPosition(result.position);
              }
              if (toolName === 'navigateToPage' && result?.navigated && result?.page) {
                setPendingNavigation(result.page);
              }
              if (toolName === 'addToCart' && result?.success && result?.product) {
                const { addToCart } = useStore.getState();
                addToCart(result.product, result.shade ?? null, result.quantity ?? 1);
              }
              continue;
            }

            if (parsed.type === 'show-products' && parsed.products?.length > 0) {
              setDisplayProducts(parsed.products);
              setWidth(520);
              setHeight(Math.max(get().height, 620));
              continue;
            }
          } catch {}
        }
      }
    } catch (error) {
      updateMessage(aiMsg.id, 'Sorry, I encountered an error. Please try again.');
    } finally {
      setAiLoading(false);
      setToolStatus(null);
    }
  },

  reset: () =>
    set({
      messages: [],
      width: defaultWidth,
      height: defaultHeight,
      isMinimized: false,
      isFullscreen: false,
      position: 'bottom-right',
      conversationId: null,
    }),
}));
