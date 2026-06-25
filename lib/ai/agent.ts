import 'server-only';
import axios from 'axios';
import { buildSystemPrompt } from '@/lib/chat/catalog';
import { executeTool } from './tool-executor';
import { saveChatMessage, saveToolExecution } from '@/lib/data-access/conversations';

type MessageContent = string | any[];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
}

export interface AgentContext {
  userId?: number;
  conversationId?: number;
}

function requireAuth(context?: AgentContext): void {
  if (!context?.userId) {
    throw new Error('Authentication required. Please log in first.');
  }
}

function buildToolDefinitions() {
  return [
    {
      type: 'function',
      function: {
        name: 'changeChatWidth',
        description: 'Change chat width (280-800).',
        parameters: {
          type: 'object',
          properties: { width: { type: 'number' } },
          required: ['width'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'changeChatHeight',
        description: 'Change chat height (300-900).',
        parameters: {
          type: 'object',
          properties: { height: { type: 'number' } },
          required: ['height'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'maximizeChat',
        description: 'Open chat in larger window.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'minimizeChat',
        description: 'Collapse chat.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'fullscreenChat',
        description: 'Fill viewport.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'moveChat',
        description: 'Move chat corner.',
        parameters: {
          type: 'object',
          properties: {
            position: {
              type: 'string',
              enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
            },
          },
          required: ['position'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'navigateToPage',
        description:
          'Navigate the user to a specific page on the website (home, products, bundles, about, contact, help, track-order, wishlist, login, signup, account, checkout).',
        parameters: {
          type: 'object',
          properties: {
            page: {
              type: 'string',
              enum: [
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
              ],
            },
          },
          required: ['page'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'searchProducts',
        description: 'Search products by name or brand.',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getProductDetails',
        description: 'Get product details by ID.',
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'compareProducts',
        description: 'Compare products by IDs.',
        parameters: {
          type: 'object',
          properties: {
            productIds: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 5 },
          },
          required: ['productIds'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'addToCart',
        description: 'Add product to cart.',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'number' },
            quantity: { type: 'number' },
            shade: { type: 'string' },
          },
          required: ['productId', 'quantity'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'applyCoupon',
        description: 'Check coupon codes.',
        parameters: {
          type: 'object',
          properties: { code: { type: 'string' } },
          required: ['code'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'createResource',
        description: 'Create CMS resource. Admin only.',
        parameters: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] },
            data: { type: 'object' },
          },
          required: ['resourceType', 'data'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'updateResource',
        description: 'Update CMS resource. Admin only.',
        parameters: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] },
            id: { type: 'number' },
            data: { type: 'object' },
          },
          required: ['resourceType', 'id', 'data'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'deleteResource',
        description: 'Delete CMS resource. Admin only.',
        parameters: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] },
            id: { type: 'number' },
          },
          required: ['resourceType', 'id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'searchResource',
        description: 'Search CMS resources.',
        parameters: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] },
          },
          required: ['resourceType'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getOrderHistory',
        description: "Get the user's order history. Requires login.",
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getOrderStatus',
        description: 'Get status of a specific order by ID. Requires login.',
        parameters: {
          type: 'object',
          properties: { orderId: { type: 'number' } },
          required: ['orderId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'trackOrder',
        description: 'Get shipping/fulfillment status of an order. Requires login.',
        parameters: {
          type: 'object',
          properties: { orderId: { type: 'number' } },
          required: ['orderId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getWishlist',
        description: "Show the user's wishlist. Requires login.",
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'addToWishlist',
        description: 'Add a product to wishlist by productId. Requires login.',
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'removeFromWishlist',
        description: 'Remove a product from wishlist by productId. Requires login.',
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'checkWishlist',
        description: "Check if a product is in the user's wishlist. Requires login.",
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'showCart',
        description: "Show items in the user's shopping cart. Requires login.",
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'checkAbandonedCart',
        description: 'Check if user has items in their cart. Requires login.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getRecommendations',
        description:
          "Get personalized product recommendations based on user's purchase history and preferences.",
        parameters: {
          type: 'object',
          properties: { category: { type: 'string' } },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getProductReviews',
        description: 'Get reviews for a product by product ID.',
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'summarizeReviews',
        description: 'Get review stats (average rating, total count, distribution) for a product.',
        parameters: {
          type: 'object',
          properties: { productId: { type: 'number' } },
          required: ['productId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'buildRoutine',
        description:
          'Build a multi-product routine or look based on user goals (skincare, makeup, complete look).',
        parameters: {
          type: 'object',
          properties: {
            routineType: { type: 'string', enum: ['skincare', 'makeup', 'complete_look'] },
            goal: { type: 'string', description: 'e.g., anti-aging, dry skin, bridal, everyday' },
          },
          required: ['routineType', 'goal'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'startSkinQuiz',
        description:
          'Start a skin analysis quiz. The agent will ask about skin type, concerns, and preferences.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'saveSkinProfile',
        description: "Save the user's skin profile from quiz answers. Requires login.",
        parameters: {
          type: 'object',
          properties: {
            skinType: {
              type: 'string',
              enum: ['dry', 'oily', 'combination', 'normal', 'sensitive'],
            },
            concerns: { type: 'array', items: { type: 'string' } },
            allergies: { type: 'array', items: { type: 'string' } },
          },
          required: ['skinType', 'concerns'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getSkinProfile',
        description: "Get the user's saved skin profile. Requires login.",
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'createAlert',
        description:
          'Set up an alert for price drop or back-in-stock on a product. Requires login.',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'number' },
            alertType: { type: 'string', enum: ['back_in_stock', 'price_drop'] },
            targetPrice: { type: 'number', description: 'Only for price_drop alerts' },
          },
          required: ['productId', 'alertType'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'getAlerts',
        description: "List user's active alerts. Requires login.",
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'removeAlert',
        description: 'Remove an alert by its ID. Requires login.',
        parameters: {
          type: 'object',
          properties: { alertId: { type: 'number' } },
          required: ['alertId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'findGifts',
        description: 'Find gift ideas based on occasion, budget, and recipient preferences.',
        parameters: {
          type: 'object',
          properties: {
            occasion: {
              type: 'string',
              enum: ['birthday', 'anniversary', 'holiday', 'wedding', 'just_because'],
            },
            budget: { type: 'number' },
            recipient: {
              type: 'string',
              enum: ['friend', 'partner', 'parent', 'coworker', 'other'],
            },
            preferences: {
              type: 'string',
              description: 'e.g., floral scents, natural makeup, luxury',
            },
          },
          required: ['occasion', 'budget'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'setLanguage',
        description: "Set the user's preferred language for future conversations. Requires login.",
        parameters: {
          type: 'object',
          properties: {
            language: { type: 'string', description: 'Language code (en, km, zh, etc.)' },
          },
          required: ['language'],
        },
      },
    },
  ];
}

const AGENT_INSTRUCTIONS = [
  'You are now an AI Agent with tool capabilities.',
  'When the user asks something a tool can help with: silently call the tool. Do not announce it.',
  'Wait for the tool results, then give a direct natural answer.',
  'Never explain your process or mention tools to the user.',
  'Keep responses concise and helpful.',
  '',
  'IMPORTANT CAPABILITIES (use these tools freely):',
  '- Orders: getOrderHistory, getOrderStatus, trackOrder',
  '- Wishlist: getWishlist, addToWishlist, removeFromWishlist, checkWishlist',
  '- Cart: showCart, checkAbandonedCart (check at conversation start if you suspect items)',
  '- Recommendations: getRecommendations (based on purchase history)',
  '- Reviews: getProductReviews, summarizeReviews',
  '- Routine: buildRoutine (skincare/makeup/complete_look)',
  '- Skin Quiz: startSkinQuiz, saveSkinProfile, getSkinProfile',
  '- Alerts: createAlert (back_in_stock/price_drop), getAlerts, removeAlert',
  '- Gift Finder: findGifts (by occasion, budget, recipient)',
  "- Language: setLanguage (respond in user's detected language)",
  '',
  'AUTHENTICATION RULES:',
  '- If a tool requires login and the user is not authenticated, politely ask them to log in first.',
  '- Never fabricate order or wishlist data for unauthenticated users.',
  '',
  'LANGUAGE RULES:',
  "- Detect the user's language from their message and respond in the same language.",
  '- Maintain all product info and tools in any language.',
].join('\n');

function buildAgentSystemPrompt(basePrompt: string): string {
  return basePrompt + '\n\n' + AGENT_INSTRUCTIONS;
}

function friendlyToolName(name: string): string {
  const map: Record<string, string> = {
    searchProducts: 'Searching products',
    getProductDetails: 'Getting product details',
    compareProducts: 'Comparing products',
    addToCart: 'Adding to cart',
    applyCoupon: 'Applying coupon',
    searchResource: 'Searching catalog',
    changeChatWidth: 'Adjusting width',
    changeChatHeight: 'Adjusting height',
    maximizeChat: 'Expanding chat',
    minimizeChat: 'Collapsing chat',
    fullscreenChat: 'Going fullscreen',
    moveChat: 'Moving chat',
    navigateToPage: 'Navigating to page',
    createResource: 'Creating resource',
    updateResource: 'Updating resource',
    deleteResource: 'Deleting resource',
    getOrderHistory: 'Looking up orders',
    getOrderStatus: 'Checking order status',
    trackOrder: 'Tracking order',
    getWishlist: 'Loading wishlist',
    addToWishlist: 'Adding to wishlist',
    removeFromWishlist: 'Removing from wishlist',
    checkWishlist: 'Checking wishlist',
    showCart: 'Loading cart',
    checkAbandonedCart: 'Checking cart',
    getRecommendations: 'Finding recommendations',
    getProductReviews: 'Loading reviews',
    summarizeReviews: 'Summarizing reviews',
    buildRoutine: 'Building routine',
    startSkinQuiz: 'Starting skin quiz',
    saveSkinProfile: 'Saving skin profile',
    getSkinProfile: 'Loading skin profile',
    createAlert: 'Setting up alert',
    getAlerts: 'Loading alerts',
    removeAlert: 'Removing alert',
    findGifts: 'Finding gifts',
    setLanguage: 'Setting language',
  };
  return map[name] ?? 'Running ' + name;
}

function extractProducts(result: any): any[] | null {
  if (result?.products && Array.isArray(result.products) && result.products.length > 0)
    return result.products;
  if (result?.resources && Array.isArray(result.resources) && result.resources.length > 0)
    return result.resources;
  if (result?.id && result?.name) return [result];
  return null;
}

async function detectTools(
  messages: any[],
  apiKey: string,
): Promise<{ toolCalls: any[] | null; content: string }> {
  const res = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model: 'deepseek-chat',
      messages,
      tools: buildToolDefinitions(),
      tool_choice: 'auto',
      max_tokens: 200,
      temperature: 0.7,
    },
    {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    },
  );
  const msg = res.data.choices?.[0]?.message;
  return {
    toolCalls: msg?.tool_calls?.length ? msg.tool_calls : null,
    content: msg?.content || '',
  };
}

async function* streamFinal(messages: any[], apiKey: string): AsyncGenerator<string> {
  const res = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model: 'deepseek-chat',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    },
    {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      responseType: 'stream',
    },
  );

  const decoder = new TextDecoder();
  const reader = res.data as import('stream').Readable;
  let buffer = '';

  for await (const chunk of reader) {
    buffer += decoder.decode(chunk as Buffer, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield JSON.stringify({ type: 'text', text: content });
      } catch {}
    }
  }
}

export async function* agentLoop(
  messages: ChatMessage[],
  context?: AgentContext,
): AsyncGenerator<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    yield JSON.stringify({ type: 'text', text: 'AI is not configured.' });
    return;
  }

  const systemPrompt = await buildSystemPrompt();
  const agentSystemPrompt = buildAgentSystemPrompt(systemPrompt);

  const authStatus = context?.userId
    ? 'CURRENT AUTH STATUS: The user IS logged in. You can use their account tools (orders, wishlist, cart, recommendations, etc.) immediately — do NOT ask them to log in.'
    : 'CURRENT AUTH STATUS: The user is NOT logged in. You must ask them to log in before using account tools (orders, wishlist, cart, etc.).';

  const currentMessages: any[] = [
    { role: 'system', content: agentSystemPrompt + '\n\n' + authStatus },
    ...messages,
  ];

  if (context?.conversationId && messages.length <= 1) {
    yield JSON.stringify({ type: 'conversation-created', conversationId: context.conversationId });
  }

  if (context?.conversationId && context?.userId && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'user') {
      const text = typeof lastMsg.content === 'string' ? lastMsg.content : '';
      if (text) {
        saveChatMessage({
          conversationId: context.conversationId,
          userId: context.userId,
          role: 'user',
          text,
        }).catch(() => {});
      }
    }
  }

  for (let round = 0; round < 5; round++) {
    const toolsDetected = await detectTools(currentMessages, apiKey);

    if (!toolsDetected.toolCalls) {
      const finalText = [];
      for await (const chunk of streamFinal(currentMessages, apiKey)) {
        finalText.push(chunk);
        yield chunk;
      }

      const fullText = finalText
        .map((c) => {
          try {
            return JSON.parse(c).text ?? '';
          } catch {
            return '';
          }
        })
        .join('');
      if (context?.conversationId && context?.userId && fullText) {
        saveChatMessage({
          conversationId: context.conversationId,
          userId: context.userId,
          role: 'ai',
          text: fullText,
        }).catch(() => {});
      }

      return;
    }

    for (const tc of toolsDetected.toolCalls) {
      yield JSON.stringify({ type: 'tool-status', label: friendlyToolName(tc.function.name) });
    }

    currentMessages.push({
      role: 'assistant',
      content: toolsDetected.content || '',
      tool_calls: toolsDetected.toolCalls.map((tc: any) => ({
        id: tc.id,
        type: 'function',
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
    });

    for (const tc of toolsDetected.toolCalls) {
      let result: any;
      try {
        const args = JSON.parse(tc.function.arguments);
        result = await executeTool(tc.function.name, args, context);
        yield JSON.stringify({ type: 'tool-result', toolName: tc.function.name, result });

        if (context?.conversationId) {
          saveToolExecution({
            conversationId: context.conversationId,
            toolName: tc.function.name,
            input: JSON.stringify(args),
            output: JSON.stringify(result),
          }).catch(() => {});
        }

        const products = extractProducts(result);
        if (products && products.length > 0) {
          yield JSON.stringify({ type: 'show-products', products });
        }
      } catch (error: any) {
        result = { error: error.message ?? 'Tool execution failed' };
      }

      currentMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
    }
  }

  const finalText = [];
  for await (const chunk of streamFinal(currentMessages, apiKey)) {
    finalText.push(chunk);
    yield chunk;
  }

  const fullText = finalText
    .map((c) => {
      try {
        return JSON.parse(c).text ?? '';
      } catch {
        return '';
      }
    })
    .join('');
  if (context?.conversationId && context?.userId && fullText) {
    saveChatMessage({
      conversationId: context.conversationId,
      userId: context.userId,
      role: 'ai',
      text: fullText,
    }).catch(() => {});
  }
}
