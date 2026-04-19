import { getPrisma } from "@/lib/prisma";
import { verifyTwilioRequest } from "@/lib/vendors/twilio";
import {
  processCallStatusWebhook,
  createWebhookEvent,
  isWebhookProcessed,
} from "@/lib/services/call-handling";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries());
  const signature = request.headers.get("x-twilio-signature");

  // Verify Twilio signature
  if (!verifyTwilioRequest(request.url, signature, params)) {
    return new Response("Invalid Twilio signature", { status: 403 });
  }

  // Check if webhook was already processed (retry-safe)
  const externalEventId = `status:${params.CallSid}:${params.CallStatus ?? "unknown"}`;
  if (await isWebhookProcessed("TWILIO", externalEventId)) {
    return new Response("OK", { status: 200 });
  }

  try {
    // Process call status webhook
    const { business, callLog } = await processCallStatusWebhook(params);

    // Create webhook event record
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "voice.status",
      externalEventId,
      signature,
      params,
      "PROCESSED"
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Status Webhook Error]", error);

    // Try to get business ID for error logging
    const prisma = getPrisma();
    const business = await prisma.business.findFirst({
      where: {
        twilioPhoneNumber: params.To,
      },
    });

    if (business) {
      // Create failed webhook event record
      await createWebhookEvent(
        business.id,
        "TWILIO",
        "voice.status",
        externalEventId,
        signature,
        params,
        "FAILED"
      );
    }

    return new Response("Error processing webhook", { status: 500 });
  }
}
