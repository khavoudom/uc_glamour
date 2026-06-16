# Build an AI Agent Chat System for a Next.js SaaS Application

You are a senior full-stack engineer and AI architect.

Build a production-ready AI Agent system using:

- Next.js 15 (App Router)
- TypeScript
- PostgreSQL
- Drizzle ORM
- OpenAI SDK (tool calling)
- Tailwind CSS
- shadcn/ui
- Server Actions
- Streaming responses
- Vercel AI SDK

The goal is to transform a simple chatbot into a real AI Agent capable of controlling the application through tools.

---

## Core Requirements

Create a floating chat widget similar to customer support chat.

Features:

- Minimize / maximize
- Resize dynamically
- Fullscreen mode
- Smooth animations
- Mobile responsive
- Streaming AI responses
- Tool execution support
- Persistent conversation history

---

## Database Design

Use Drizzle ORM and PostgreSQL.

Create tables:

### conversations

```ts
id;
title;
userId;
createdAt;
updatedAt;
```

### messages

```ts
id;
conversationId;
role;
content;
toolCalls;
createdAt;
```

### tools

```ts
id;
name;
description;
schema;
enabled;
createdAt;
```

### tool_executions

```ts
id;
conversationId;
toolName;
input;
output;
status;
createdAt;
```

---

## AI Agent Architecture

Implement:

```txt
User
 ↓
AI
 ↓
Tool Selection
 ↓
Tool Execution
 ↓
Observation
 ↓
Response
```

The agent should support multiple tool calls during a single request.

Example:

User:
"Compare these products"

Agent:

1. changeChatWidth
2. searchProducts
3. compareProducts
4. renderResult

Return final response.

---

## Tool System

Create a tool registry architecture.

Example:

```ts
export const tools = {
  changeChatWidth,
  changeChatHeight,
  maximizeChat,
  minimizeChat,
  fullscreenChat,
  searchProducts,
  getProductDetails,
  compareProducts,
  addToCart,
  applyCoupon,
  createResource,
  updateResource,
  deleteResource,
  searchResource,
  getSalesAnalytics,
  getInventoryReport,
};
```

Each tool must contain:

```ts
{
  name: string;
  description: string;
  parameters: zodSchema;
  execute: async () => {};
}
```

---

## UI Control Tools

Implement:

### changeChatWidth

```ts
{
  width: number;
}
```

Updates chat width with smooth animation.

### changeChatHeight

```ts
{
  height: number;
}
```

Updates chat height with smooth animation.

### maximizeChat

Opens larger chat window.

### minimizeChat

Collapses chat window.

### fullscreenChat

Uses viewport size.

### moveChat

```ts
{
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

---

## Product Tools

Create examples:

### searchProducts

```ts
{
  query: string;
}
```

### getProductDetails

```ts
{
  productId: string;
}
```

### compareProducts

```ts
{
  productIds: string[]
}
```

### addToCart

```ts
{
  productId: string;
  quantity: number;
}
```

### applyCoupon

```ts
{
  code: string;
}
```

---

## CMS Resource Tools

Agent can manage content.

Implement:

### createResource

```ts
{
  resourceType: string;
  data: object;
}
```

### updateResource

```ts
{
  resourceType: string;
  id: string;
  data: object;
}
```

### deleteResource

```ts
{
  resourceType: string;
  id: string;
}
```

### searchResource

```ts
{
  resourceType: string;
  filters: object;
}
```

---

## Agent Memory

Implement:

### Conversation Memory

Store messages in PostgreSQL.

### Tool Memory

Store executed tools.

### Context Builder

Build prompt context from:

- Recent messages
- Previous tool results
- Current page
- Current UI state

---

## UI State Management

Use Zustand.

Store:

```ts
{
  width: number;
  height: number;
  isMinimized: boolean;
  isFullscreen: boolean;
  position: string;
}
```

Agent tools must update Zustand state.

---

## Smooth Animation

Use Tailwind and Framer Motion.

Animate:

- Width changes
- Height changes
- Fullscreen transitions
- Open / close
- Message appearance

Duration:

```ts
300ms
```

with:

```css
ease-in-out
```

---

## Security

Implement:

- Tool whitelist
- Tool validation using Zod
- Permission checks
- Rate limiting
- SQL injection protection
- Server-side tool execution only

Never execute arbitrary code from AI.

---

## API Structure

Create:

```txt
/app/api/chat/route.ts

/lib/ai/agent.ts
/lib/ai/tools.ts
/lib/ai/tool-registry.ts

/lib/db/schema.ts
/lib/db/index.ts

/store/chat-store.ts

/components/chat/
```

---

## Deliverables

Generate:

1. Complete project structure
2. Drizzle schema
3. Tool registry implementation
4. OpenAI tool calling integration
5. Chat widget UI
6. Zustand store
7. API routes
8. Server Actions
9. Framer Motion animations
10. Example tools
11. Security layer
12. Full TypeScript code

Use best practices, strong typing, modular architecture, and production-ready code.
