import 'server-only';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { emailQueue } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function enqueueEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await db.insert(emailQueue).values({ to, subject, html, status: 'pending' });
}

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function processEmailQueue(batchSize = 10) {
  if (!smtpUser || !smtpPass) {
    console.warn('SMTP not configured — skipping email queue processing');
    return { processed: 0, skipped: true };
  }

  const pending = await db
    .select()
    .from(emailQueue)
    .where(and(eq(emailQueue.status, 'pending'), isNull(emailQueue.sentAt)))
    .limit(batchSize);

  if (pending.length === 0) return { processed: 0 };

  const transporter = getTransporter();
  let processed = 0;

  for (const email of pending) {
    try {
      await transporter.sendMail({
        from: smtpUser,
        to: email.to,
        subject: email.subject,
        html: email.html,
      });
      await db
        .update(emailQueue)
        .set({ status: 'sent', sentAt: new Date().toISOString() })
        .where(eq(emailQueue.id, email.id));
      processed++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await db
        .update(emailQueue)
        .set({ status: 'failed', error: message })
        .where(eq(emailQueue.id, email.id));
    }
  }

  return { processed };
}
