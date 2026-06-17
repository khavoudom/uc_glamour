import { NextRequest } from 'next/server';
import { agentLoop } from '@/lib/ai/agent';
import { getOptionalCustomerSession } from '@/lib/dal';
import { createConversation } from '@/lib/data-access/conversations';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { messages, conversationId: passedConversationId } = (await req.json()) as {
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    conversationId?: number | null;
  };

  const session = await getOptionalCustomerSession();
  let conversationId = passedConversationId ?? undefined;

  if (session && !conversationId) {
    const conv = await createConversation(session.userId);
    conversationId = conv.id;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const context = {
          userId: session?.userId ?? undefined,
          conversationId,
        };

        for await (const chunk of agentLoop(messages, context)) {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
      } catch (err) {
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
