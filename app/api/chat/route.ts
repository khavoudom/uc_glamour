import { NextRequest } from 'next/server';
import { agentLoop } from '@/lib/ai/agent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as {
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agentLoop(messages)) {
          controller.enqueue(
            encoder.encode(`data: ${chunk}\n\n`),
          );
        }
      } catch (err) {
        console.error('Agent stream error:', err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'text', text: 'Sorry, I encountered an error. Please try again.' })}\n\n`,
          ),
        );
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
