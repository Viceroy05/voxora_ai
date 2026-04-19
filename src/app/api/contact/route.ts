import { z } from "zod";

import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { sendAdminDemoBookingNotification } from "@/lib/email/notifications";

const contactSchema = z.object({
  fullName: z.string().min(2).max(120),
  businessName: z.string().min(2).max(120),
  workEmail: z.string().email(),
  phoneNumber: z.string().min(7).max(24),
  industry: z.string().min(2).max(120),
  workflow: z.string().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, contactSchema);

    await sendAdminDemoBookingNotification({
      customerName: body.fullName,
      customerEmail: body.workEmail,
      customerPhone: body.phoneNumber,
      serviceName: `${body.businessName} (${body.industry})`,
      message: body.workflow,
      createdAt: new Date(),
    });

    return json(
      {
        success: true,
        message: "Thanks. We will reach out within one business day.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
