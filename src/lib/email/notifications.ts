import { sendAdminNotification } from './resend';
import { generateNewUserSignupEmail, generateDemoBookingEmail, UserSignupData, DemoBookingData } from './templates';

/**
 * Send email notification to admin about new user signup
 */
export async function sendAdminSignupNotification(data: UserSignupData) {
  try {
    const html = generateNewUserSignupEmail(data);

    const result = await sendAdminNotification({
      subject: 'New User Signup - Voxora AI',
      html,
    });

    if (result.skipped) {
      console.log('Admin signup notification skipped (ADMIN_EMAIL not configured)');
      return { success: true, skipped: true };
    }

    console.log('Admin signup notification sent successfully:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send admin signup notification:', error);
    // Don't throw error to prevent blocking user signup flow
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send email notification to admin about new demo booking
 */
export async function sendAdminDemoBookingNotification(data: DemoBookingData) {
  try {
    const html = generateDemoBookingEmail(data);

    const result = await sendAdminNotification({
      subject: 'New Demo Booking - Voxora AI',
      html,
    });

    if (result.skipped) {
      console.log('Admin demo booking notification skipped (ADMIN_EMAIL not configured)');
      return { success: true, skipped: true };
    }

    console.log('Admin demo booking notification sent successfully:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send admin demo booking notification:', error);
    // Don't throw error to prevent blocking booking flow
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
