import nodemailer from 'nodemailer';
import { getOrderReceiptTemplate } from './email-templates/order-receipt';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (order: any) => {
  try {
    const htmlContent = getOrderReceiptTemplate(order);
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: order.customer.email,
      subject: `Order Confirmation #${order.id}`,
      html: htmlContent,
    });

    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw the error to prevent disrupting the order process
  }
};
