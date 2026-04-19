import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || 'Voxora AI <notifications@voxora.ai>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function sendAdminNotification(options: {
  subject: string;
  html: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL environment variable not set. Skipping admin notification.');
    return { success: false, skipped: true };
  }

  return sendEmail({
    to: adminEmail,
    subject: options.subject,
    html: options.html,
  });
}
