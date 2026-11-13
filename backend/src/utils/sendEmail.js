const nodemailer = require("nodemailer");

/**
 * Configure email transporter from environment variables.
 * Supports Gmail, Outlook, or custom SMTP servers.
 *
 * For Gmail:
 *   SMTP_SERVICE=gmail
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-gmail-app-password
 *
 * For generic SMTP:
 *   SMTP_HOST=smtp.example.com
 *   SMTP_PORT=587
 *   SMTP_USER=user@example.com
 *   SMTP_PASS=password
 */
const createTransporter = () => {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (service && user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback to Gmail default if user and pass are provided
  if (user && pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Send password reset email containing OTP code.
 */
const sendPasswordResetEmail = async ({ to, fullName, otp }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@verticallimit.edu";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fa; margin: 0; padding: 20px; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .title { color: #6630D7; font-size: 22px; font-weight: bold; margin: 0; }
        .subtitle { color: #64748B; font-size: 13px; margin-top: 4px; }
        .greeting { font-size: 15px; color: #1e293b; margin-bottom: 12px; }
        .text { font-size: 14px; color: #475569; line-height: 1.6; }
        .otp-box { background: #f4f0ff; border: 1.5px dashed #6630D7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #6630D7; display: inline-block; font-family: monospace; }
        .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 class="title">Vertical Limit ERP</h2>
          <div class="subtitle">Password Reset Verification</div>
        </div>
        <div class="greeting">Hello, <strong>${fullName || "User"}</strong></div>
        <p class="text">You recently requested to reset your password for your Vertical Limit account. Use the verification code below to proceed:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="text">This code will expire in <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
        <div class="warning">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Vertical Limit Coaching Classes. All rights reserved.
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Vertical Limit ERP" <${fromEmail}>`,
        to,
        subject: `${otp} is your Vertical Limit verification code`,
        text: `Your password reset verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`,
        html,
      });

      console.log(`[EMAIL DISPATCH] Password reset email successfully sent to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // If SMTP credentials are not yet configured in .env, log clearly for monitoring
    console.log(`\n======================================================`);
    console.log(`[EMAIL NOTICE] SMTP is not yet configured in backend/.env.`);
    console.log(`To send real outgoing emails, configure SMTP_USER & SMTP_PASS.`);
    console.log(`[RECIPIENT]: ${to}`);
    console.log(`======================================================\n`);
    return { success: false, notConfigured: true };
  }
};

module.exports = {
  sendPasswordResetEmail,
};
