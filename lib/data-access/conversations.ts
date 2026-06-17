import 'server-only';
import { db } from '@/lib/db';
import { conversations, chatMessages, toolExecutions } from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function createConversation(userId: number, title?: string) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      title: title ?? 'New Conversation',
    })
    .returning();
  return conversation;
}

export async function getConversationsByUserId(userId: number) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationById(id: number) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return conversation ?? null;
}

export async function updateConversation(
  id: number,
  data: { title?: string; summary?: string; metadata?: string },
) {
  const [conversation] = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return conversation;
}

export async function saveChatMessage(data: {
  conversationId: number;
  userId: number;
  role: string;
  text: string;
  productId?: number | null;
}) {
  const [msg] = await db
    .insert(chatMessages)
    .values({
      conversationId: data.conversationId,
      userId: data.userId,
      role: data.role,
      text: data.text,
      productId: data.productId ?? null,
    })
    .returning();
  return msg;
}

export async function getChatMessagesByConversation(conversationId: number) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.timestamp));
}

export async function saveToolExecution(data: {
  conversationId: number;
  toolName: string;
  input: string;
  output: string;
  status?: string;
}) {
  const [exec] = await db
    .insert(toolExecutions)
    .values({
      conversationId: data.conversationId,
      toolName: data.toolName,
      input: data.input,
      output: data.output,
      status: data.status ?? 'success',
    })
    .returning();
  return exec;
}
