import 'server-only';
import axios from 'axios';
import { buildSystemPrompt } from '@/lib/chat/catalog';
import { executeTool } from './tool-executor';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildToolDefinitions() {
  return [
    { type: 'function', function: { name: 'changeChatWidth', description: 'Change chat width (280-800).', parameters: { type: 'object', properties: { width: { type: 'number' } }, required: ['width'] } } },
    { type: 'function', function: { name: 'changeChatHeight', description: 'Change chat height (300-900).', parameters: { type: 'object', properties: { height: { type: 'number' } }, required: ['height'] } } },
    { type: 'function', function: { name: 'maximizeChat', description: 'Open chat in larger window.', parameters: { type: 'object', properties: {} } } },
    { type: 'function', function: { name: 'minimizeChat', description: 'Collapse chat.', parameters: { type: 'object', properties: {} } } },
    { type: 'function', function: { name: 'fullscreenChat', description: 'Fill viewport.', parameters: { type: 'object', properties: {} } } },
    { type: 'function', function: { name: 'moveChat', description: 'Move chat corner.', parameters: { type: 'object', properties: { position: { type: 'string', enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] } }, required: ['position'] } } },
    { type: 'function', function: { name: 'navigateToPage', description: 'Navigate the user to a specific page on the website (home, products, bundles, about, contact, help, track-order, wishlist, login, signup, account, checkout).', parameters: { type: 'object', properties: { page: { type: 'string', enum: ['/', '/products', '/bundles', '/about', '/our-story', '/contact', '/help', '/track-order', '/wishlist', '/login', '/signup', '/account', '/checkout'] } }, required: ['page'] } } },
    { type: 'function', function: { name: 'searchProducts', description: 'Search products by name or brand.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
    { type: 'function', function: { name: 'getProductDetails', description: 'Get product details by ID.', parameters: { type: 'object', properties: { productId: { type: 'number' } }, required: ['productId'] } } },
    { type: 'function', function: { name: 'compareProducts', description: 'Compare products by IDs.', parameters: { type: 'object', properties: { productIds: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 5 } }, required: ['productIds'] } } },
    { type: 'function', function: { name: 'addToCart', description: 'Add product to cart.', parameters: { type: 'object', properties: { productId: { type: 'number' }, quantity: { type: 'number' }, shade: { type: 'string' } }, required: ['productId', 'quantity'] } } },
    { type: 'function', function: { name: 'applyCoupon', description: 'Check coupon codes.', parameters: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] } } },
    { type: 'function', function: { name: 'createResource', description: 'Create CMS resource.', parameters: { type: 'object', properties: { resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] }, data: { type: 'object' } }, required: ['resourceType', 'data'] } } },
    { type: 'function', function: { name: 'updateResource', description: 'Update CMS resource.', parameters: { type: 'object', properties: { resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] }, id: { type: 'number' }, data: { type: 'object' } }, required: ['resourceType', 'id', 'data'] } } },
    { type: 'function', function: { name: 'deleteResource', description: 'Delete CMS resource.', parameters: { type: 'object', properties: { resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] }, id: { type: 'number' } }, required: ['resourceType', 'id'] } } },
    { type: 'function', function: { name: 'searchResource', description: 'Search CMS resources.', parameters: { type: 'object', properties: { resourceType: { type: 'string', enum: ['products', 'categories', 'reviews'] } }, required: ['resourceType'] } } },
  ];
}

const AGENT_INSTRUCTIONS = [
  'You are now an AI Agent with tool capabilities.',
  'When the user asks something a tool can help with: silently call the tool. Do not announce it.',
  'Wait for the tool results, then give a direct natural answer.',
  'Never explain your process or mention tools to the user.',
  'Keep responses concise and helpful.',
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
  };
  return map[name] ?? 'Running ' + name;
}

function extractProducts(result: any): any[] | null {
  if (result?.products && Array.isArray(result.products) && result.products.length > 0) return result.products;
  if (result?.resources && Array.isArray(result.resources) && result.resources.length > 0) return result.resources;
  if (result?.id && result?.name) return [result];
  return null;
}

// Non-streaming call to detect if tools are needed (avoids leaking thinking text)
async function detectTools(messages: any[], apiKey: string): Promise<{ toolCalls: any[] | null; content: string }> {
  const res = await axios.post('https://api.deepseek.com/chat/completions', {
    model: 'deepseek-chat',
    messages,
    tools: buildToolDefinitions(),
    tool_choice: 'auto',
    max_tokens: 200,
    temperature: 0.7,
  }, {
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
  });
  const msg = res.data.choices?.[0]?.message;
  return {
    toolCalls: msg?.tool_calls?.length ? msg.tool_calls : null,
    content: msg?.content || '',
  };
}

async function* streamFinal(messages: any[], apiKey: string): AsyncGenerator<string> {
  const res = await axios.post('https://api.deepseek.com/chat/completions', {
    model: 'deepseek-chat',
    messages,
    max_tokens: 500,
    temperature: 0.7,
    stream: true,
  }, {
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    responseType: 'stream',
  });

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

export async function* agentLoop(messages: ChatMessage[]): AsyncGenerator<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    yield JSON.stringify({ type: 'text', text: 'AI is not configured.' });
    return;
  }

  const systemPrompt = await buildSystemPrompt();
  const agentSystemPrompt = buildAgentSystemPrompt(systemPrompt);

  const currentMessages: any[] = [
    { role: 'system', content: agentSystemPrompt },
    ...messages,
  ];

  for (let round = 0; round < 5; round++) {
    // Detect if tools are needed (non-streaming, avoids leaking thinking text)
    const toolsDetected = await detectTools(currentMessages, apiKey);

    // No tools: make a proper streaming call for the full response
    if (!toolsDetected.toolCalls) {
      yield* streamFinal(currentMessages, apiKey);
      return;
    }

    // Tools detected: emit status and execute tools silently
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
        result = await executeTool(tc.function.name, args);
        yield JSON.stringify({ type: 'tool-result', toolName: tc.function.name, result });

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

  // Max rounds reached — stream a final summary
  yield* streamFinal(currentMessages, apiKey);
}
