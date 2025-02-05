import nodemailer from 'nodemailer';

interface SendInviteEmailParams {
  to: string;
  inviteUrl: string;
  storeName: string;
}

export async function sendInviteEmail({ to, inviteUrl, storeName }: SendInviteEmailParams) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('[MAIL] SMTP connection verified');
  } catch (error) {
    console.error('[MAIL] SMTP connection error:', error);
    throw error;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>You've been invited!</h2>
      <p>You've been invited to join ${storeName} as a staff member.</p>
      <p>Click the button below to accept the invitation and create your account:</p>
      <a href="${inviteUrl}" style="
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">
        Accept Invitation
      </a>
      <p>This invitation will expire in 7 days.</p>
      <p>If you don't want to accept this invitation, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER, // Must use authenticated email as FROM address for Gmail
    to,
    subject: `Invitation to join ${storeName}`,
    html,
  });
}
