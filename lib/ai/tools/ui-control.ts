import { tool, zodSchema } from 'ai';
import { z } from 'zod';

export const changeChatWidth = tool({
  description: 'Change the chat widget width in pixels. Use to make the chat wider or narrower.',
  inputSchema: zodSchema(
    z.object({
      width: z.number().min(280).max(800).describe('New width in pixels (280-800)'),
    }),
  ),
  execute: async ({ width }: { width: number }) => {
    return { width };
  },
});

export const changeChatHeight = tool({
  description: 'Change the chat widget height in pixels. Use to make the chat taller or shorter.',
  inputSchema: zodSchema(
    z.object({
      height: z.number().min(300).max(900).describe('New height in pixels (300-900)'),
    }),
  ),
  execute: async ({ height }: { height: number }) => {
    return { height };
  },
});

export const maximizeChat = tool({
  description: 'Open the chat widget in a larger window for more space.',
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    return { maximized: true, width: 600, height: 700 };
  },
});

export const minimizeChat = tool({
  description: 'Collapse the chat widget to just show the header bar.',
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    return { minimized: true, height: 56 };
  },
});

export const fullscreenChat = tool({
  description:
    'Make the chat widget fill the viewport for a full-screen experience. Use when the user needs maximum space.',
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    return { fullscreen: true };
  },
});

export const moveChat = tool({
  description:
    'Move the chat widget to a different corner of the screen. Positions: bottom-right, bottom-left, top-right, top-left.',
  inputSchema: zodSchema(
    z.object({
      position: z
        .enum(['bottom-right', 'bottom-left', 'top-right', 'top-left'])
        .describe('Target corner position'),
    }),
  ),
  execute: async ({ position }: { position: string }) => {
    return { position };
  },
});

export const navigateToPage = tool({
  description:
    'Navigate the user to a specific page on the Glamour website. Use this when the user asks to go to a page, view their account, start checkout, see products, or any other page navigation request.',
  inputSchema: zodSchema(
    z.object({
      page: z
        .enum([
          '/',
          '/products',
          '/bundles',
          '/about',
          '/our-story',
          '/contact',
          '/help',
          '/track-order',
          '/wishlist',
          '/login',
          '/signup',
          '/account',
          '/checkout',
        ])
        .describe('The page path to navigate to'),
    }),
  ),
  execute: async ({ page }: { page: string }) => {
    return { page, navigated: true };
  },
});
