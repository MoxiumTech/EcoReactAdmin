import nodemailer from 'nodemailer';
import { getOrderReceiptTemplate } from './email-templates/order-receipt';

interface SendInviteEmailParams {
  to: string;
  inviteUrl: string;
  storeName: string;
}

// Create a single reusable transporter instance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // True if using port 465
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

// Verify SMTP connection once at startup
(async () => {
  try {
    await transporter.verify();
    console.log('[MAIL] SMTP connection verified');
  } catch (error) {
    console.error('[MAIL] SMTP connection error:', error);
  }
})();

/**
 * Send an invitation email to a staff member.
 */
export async function sendInviteEmail({ to, inviteUrl, storeName }: SendInviteEmailParams) {
  try {
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
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // Must use authenticated email as FROM address
      to,
      subject: `Invitation to join ${storeName}`,
      html,
    });

    console.log('[MAIL] Invitation email sent successfully');
  } catch (error) {
    console.error('[MAIL] Error sending invite email:', error);
    throw error; // Prevents silent failures
  }
}

/**
 * Send an order confirmation email to the customer.
 */
export const sendOrderConfirmationEmail = async (order: any) => {
  try {
    const htmlContent = getOrderReceiptTemplate(order);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customer.email,
      subject: `Order Confirmation #${order.id}`,
      html: htmlContent,
    });

    console.log('[MAIL] Order confirmation email sent successfully');
  } catch (error) {
    console.error('[MAIL] Error sending order confirmation email:', error);
    throw error; // Log error but prevent disruption in order process
  }
};