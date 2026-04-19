# Email Notification System - Voxora AI

## Overview

Production-ready email notification system using Resend API for sending admin notifications about important events.

## Features

- **New User Signup Notifications**: Automatically notify admins when new users sign up
- **Demo Booking Notifications**: Send alerts when demo booking forms are submitted
- **Beautiful HTML Email Templates**: Professional, responsive email designs
- **Error Handling**: Non-blocking notifications with comprehensive error logging
- **Type-Safe**: Full TypeScript support with strict typing
- **Environment Configuration**: Secure API key and email configuration

## Setup

### 1. Install Dependencies

```bash
npm install resend
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin Email Address (receives notifications)
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Resend Account Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Verify your sender domain or use the default Resend domain
4. Copy the API key to your environment variables

## API Endpoints

### Demo Booking Form

**Endpoint**: `POST /api/demo/booking`

**Request Body**:
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91 98765 43210",
  "serviceName": "Haircut & Styling",
  "message": "I'm interested in booking a demo."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for your interest! We'll be in touch soon.",
  "data": {
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Usage Examples

### Sending Admin Notifications Programmatically

```typescript
import { sendAdminSignupNotification } from '@/lib/email/notifications';
import { sendAdminDemoBookingNotification } from '@/lib/email/notifications';

// Notify about new user signup
await sendAdminSignupNotification({
  email: 'user@example.com',
  fullName: 'John Doe',
  createdAt: new Date(),
});

// Notify about demo booking
await sendAdminDemoBookingNotification({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+91 98765 43210',
  serviceName: 'Haircut & Styling',
  message: 'Interested in booking a demo.',
  createdAt: new Date(),
});
```

## Email Templates

### New User Signup Email

**Subject**: New User Signup - Voxora AI

**Includes**:
- User email address
- Full name (if provided)
- Signup timestamp (IST)

### Demo Booking Email

**Subject**: New Demo Booking - Voxora AI

**Includes**:
- Customer name
- Email address
- Phone number
- Service name (if provided)
- Message (if provided)
- Submission timestamp (IST)

## Error Handling

The notification system is designed to be non-blocking:

- Email failures are logged but don't interrupt the main flow
- If `ADMIN_EMAIL` is not configured, notifications are skipped gracefully
- All errors are logged with detailed messages for debugging
- Notifications have a 5-second timeout to prevent hanging

## File Structure

```
src/lib/email/
├── resend.ts          # Resend API client and utilities
├── templates.ts       # HTML email templates
└── notifications.ts   # Notification functions

src/app/api/
├── businesses/signup/route.ts      # Signup with notifications
└── demo/booking/route.ts           # Demo booking endpoint
```

## Testing

### Local Development

For local testing without sending real emails:

```env
RESEND_API_KEY=
ADMIN_EMAIL=test@example.com
```

The system will skip notifications gracefully when `ADMIN_EMAIL` is not set.

### Production

Ensure both environment variables are properly configured:

```env
RESEND_API_KEY=re_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@yourdomain.com
```

## Best Practices

1. **Always use environment variables** for sensitive data
2. **Never hardcode API keys** in the code
3. **Test email templates** before deploying to production
4. **Monitor email delivery** using Resend dashboard
5. **Keep notification functions non-blocking** to avoid impacting user experience
6. **Log all email errors** for debugging and monitoring

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify `ADMIN_EMAIL` is configured
3. Check Resend dashboard for delivery status
4. Review server logs for error messages

### Template Issues

1. Verify HTML syntax in templates
2. Test email rendering in different email clients
3. Check for responsive design issues
4. Validate dynamic content insertion

### Rate Limiting

Resend has rate limits. If you encounter issues:

1. Implement retry logic with exponential backoff
2. Consider batching notifications
3. Monitor usage in Resend dashboard

## Security Considerations

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Validate all user input before including in emails
- Sanitize HTML content to prevent XSS attacks
- Implement rate limiting on public endpoints

## Support

For issues or questions:
- Check Resend documentation: https://resend.com/docs
- Review server logs for detailed error messages
- Contact support if issues persist

## License

Part of Voxora AI project.
