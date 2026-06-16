import { NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email-queue';

export async function GET() {
  const result = await processEmailQueue();
  return NextResponse.json(result);
}
