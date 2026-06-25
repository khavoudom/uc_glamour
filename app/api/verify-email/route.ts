import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?status=error', request.url));
  }

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(eq(users.verificationToken, token), gt(users.verificationTokenExpiresAt, new Date().toISOString())),
    )
    .limit(1);

  if (!user) {
    return NextResponse.redirect(new URL('/verify-email?status=error', request.url));
  }

  await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    })
    .where(eq(users.id, user.id));

  return NextResponse.redirect(new URL('/verify-email?status=success', request.url));
}
