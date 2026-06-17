'use server';

import axios from 'axios';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema';
import { getOptionalSession } from '@/lib/dal';
import { eq, desc } from 'drizzle-orm';
import { buildSystemPrompt } from '@/lib/chat/catalog';

export async function addChatMessage(data: {
  role: 'user' | 'advisor' | 'ai';
  text: string;
  productId?: number;
}) {
  const session = await getOptionalSession();
  if (!session) return null;

  const [msg] = await db
    .insert(chatMessages)
    .values({
      userId: session.userId,
      role: data.role,
      text: data.text,
      productId: data.productId ?? null,
    })
    .returning();

  return msg;
}

export async function getChatMessages() {
  const session = await getOptionalSession();
  if (!session) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, session.userId))
    .orderBy(desc(chatMessages.timestamp))
    .limit(50);
}

export async function getDeepSeekResponse(
  messages: { role: string; text: string }[],
): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    const res = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: await buildSystemPrompt() },
          ...messages.map((m) => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text,
          })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return res.data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error('DeepSeek fetch error:', error);
    return null;
  }
}
