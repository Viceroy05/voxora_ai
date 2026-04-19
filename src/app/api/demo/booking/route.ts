import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { sendAdminDemoBookingNotification } from "@/lib/email/notifications";
import { z } from "zod";

// Schema for demo booking form
const demoBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  serviceName: z.string().optional(),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await parseJsonBody(request, demoBookingSchema);

    // Send admin notification about new demo booking (non-blocking)
    const notificationPromise = sendAdminDemoBookingNotification({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      serviceName: body.serviceName,
      message: body.message,
      createdAt: new Date(),
    }).catch(error => {
      console.error('Failed to send admin demo booking notification:', error);
    });

    // Wait for notification to complete (with timeout)
    await Promise.race([
      notificationPromise,
      new Promise(resolve => setTimeout(resolve, 5000)), // 5 second timeout
    ]);

    return json(
      {
        success: true,
        message: "Thank you for your interest! We'll be in touch soon.",
        data: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
