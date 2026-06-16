import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/chat/stream', async ({ request }) => {
    const body = (await request.json()) as { messages?: unknown[] };
    if (!body.messages?.length) {
      return HttpResponse.json({ error: 'No messages' }, { status: 400 });
    }
    return new Response(
      `data: {"token":"Hello"}\ndata: {"token":" world"}\ndata: [DONE]\n\n`,
      { headers: { 'Content-Type': 'text/event-stream' } },
    );
  }),

  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: { id: '42', name: 'Test User', email: 'test@example.com', role: 'customer' },
      expires: new Date(Date.now() + 3600000).toISOString(),
    });
  }),

  http.get('/api/store/hydrate', () => {
    return HttpResponse.json({
      cart: [],
      wishlist: [],
      loyaltyPoints: 0,
      subscriptions: [],
    });
  }),
];
