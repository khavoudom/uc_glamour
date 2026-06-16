import 'server-only';

const resendApiKey = process.env.RESEND_API_KEY;
const senderEmail = process.env.EMAIL_SENDER ?? 'Glamour Beauty <noreply@glamourbeauty.com>';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resendApiKey) return;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: senderEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
