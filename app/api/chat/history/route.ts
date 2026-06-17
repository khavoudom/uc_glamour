import { NextRequest, NextResponse } from 'next/server';
import { getOptionalCustomerSession } from '@/lib/dal';
import { getChatMessagesByConversation } from '@/lib/data-access/conversations';

export async function GET(req: NextRequest) {
  const session = await getOptionalCustomerSession();
  if (!session) {
    return NextResponse.json({ messages: [] });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = Number(searchParams.get('conversationId'));
  if (!conversationId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await getChatMessagesByConversation(conversationId);
  return NextResponse.json({ messages });
}
