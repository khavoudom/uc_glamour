import { NextRequest } from 'next/server';
import axios from 'axios';
import { buildSystemPrompt } from '@/lib/chat/catalog';

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const { messages } = (await req.json()) as {
    messages: { role: string; text: string }[];
  };

  const systemPrompt = await buildSystemPrompt();
  const deepseekMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.text,
    })),
  ];

  const res = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model: 'deepseek-chat',
      messages: deepseekMessages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: 'stream',
    },
  );

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.data as import('stream').Readable;
      let buffer = '';

      try {
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
              const content = parsed.choices?.[0]?.delta?.content ?? '';
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`),
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error('Stream reading error:', err);
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
