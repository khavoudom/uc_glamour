import 'server-only';

/**
 * Build the HTML for a verification email.
 * Takes the pre-built full URL (so the caller controls the base).
 */
export function buildVerificationHtml(name: string, verificationUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 10px;">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 30px 20px;text-align:center;">
        <h1 style="margin:0 0 4px;font-size:22px;color:#111;">Welcome to Glamour!</h1>
      </td></tr>
      <tr><td style="padding:0 30px 20px;text-align:center;">
        <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.5;">Hi ${name},<br>Thanks for creating an account. Please verify your email address to get started.</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 32px;border-radius:999px;background:#e91e63;color:#fff;text-decoration:none;font-size:14px;font-weight:500;">Verify Email</a>
        <p style="margin:24px 0 0;font-size:12px;color:#999;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </td></tr>
      <tr><td style="padding:20px 30px;background:#fafafa;text-align:center;font-size:11px;color:#aaa;">Glamour Beauty &bull; Glam our</td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}
