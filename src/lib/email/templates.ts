export interface UserSignupData {
  email: string;
  fullName?: string;
  createdAt?: Date;
}

export interface DemoBookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName?: string;
  message?: string;
  createdAt?: Date;
}

export function generateNewUserSignupEmail(data: UserSignupData): string {
  const timestamp = data.createdAt || new Date();
  const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Signup - Voxora AI</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #06b6d4;">
            <div style="font-size: 28px; font-weight: bold; color: #06b6d4; margin-bottom: 10px;">Voxora AI</div>
            <div style="font-size: 24px; color: #1e293b; margin-bottom: 10px;">New User Signup</div>
            <div style="color: #64748b; font-size: 14px;">A new user has registered on your platform</div>
          </div>

          <div style="margin: 30px 0;">
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">User Information</div>
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Email:</strong> ${data.email}
              </div>
              ${data.fullName ? `
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Full Name:</strong> ${data.fullName}
              </div>
              ` : ''}
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 0;">
                <strong>Signup Time:</strong> ${formattedDate}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This is an automated notification from Voxora AI.</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} Voxora AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateDemoBookingEmail(data: DemoBookingData): string {
  const timestamp = data.createdAt || new Date();
  const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Demo Booking - Voxora AI</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #06b6d4;">
            <div style="font-size: 28px; font-weight: bold; color: #06b6d4; margin-bottom: 10px;">Voxora AI</div>
            <div style="font-size: 24px; color: #1e293b; margin-bottom: 10px;">New Demo Booking</div>
            <div style="color: #64748b; font-size: 14px;">A new demo booking has been submitted</div>
          </div>

          <div style="margin: 30px 0;">
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Information</div>
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Name:</strong> ${data.customerName}
              </div>
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Email:</strong> ${data.customerEmail}
              </div>
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Phone:</strong> ${data.customerPhone}
              </div>
              ${data.serviceName ? `
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">
                <strong>Service:</strong> ${data.serviceName}
              </div>
              ` : ''}
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 0;">
                <strong>Submitted At:</strong> ${formattedDate}
              </div>
            </div>

            ${data.message ? `
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</div>
              <div style="color: #1e293b; font-size: 16px; margin-bottom: 0; white-space: pre-wrap;">${data.message}</div>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This is an automated notification from Voxora AI.</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} Voxora AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
