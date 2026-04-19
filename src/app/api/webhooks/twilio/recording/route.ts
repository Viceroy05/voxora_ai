import { getPrisma } from "@/lib/prisma";
import { verifyTwilioRequest } from "@/lib/vendors/twilio";
import {
  processRecordingWebhook,
  createWebhookEvent,
  isWebhookProcessed,
  triggerAIProcessing,
} from "@/lib/services/call-handling";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries());
  const signature = request.headers.get("x-twilio-signature");
  const externalEventId = `recording:${params.RecordingSid ?? params.CallSid}`;

  // Verify Twilio signature
  if (!verifyTwilioRequest(request.url, signature, params)) {
    return new Response("Invalid Twilio signature", { status: 403 });
  }

  // Check if webhook was already processed (retry-safe)
  if (await isWebhookProcessed("TWILIO", externalEventId)) {
    return new Response("OK", { status: 200 });
  }

  try {
    // Process recording webhook
    const { business, callLog, hasTranscript } = await processRecordingWebhook(params);

    // Create webhook event record
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "voice.recording",
      externalEventId,
      signature,
      params,
      "PROCESSED"
    );

    // Trigger AI processing if transcript is available
    if (hasTranscript) {
      try {
        const { job, created } = await triggerAIProcessing(
          business.id,
          callLog.id,
          params.TranscriptionText
        );

        if (created) {
          console.log(`[Recording Webhook] AI processing job created: ${job.id}`);
        } else {
          console.log(`[Recording Webhook] AI processing job already exists: ${job.id}`);
        }
      } catch (aiError) {
        console.error("[Recording Webhook] Failed to trigger AI processing:", aiError);
        // Don't fail the webhook if AI processing fails
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Recording Webhook Error]", error);

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
        "voice.recording",
        externalEventId,
        signature,
        params,
        "FAILED"
      );
    }

    return new Response("Error processing webhook", { status: 500 });
  }
}
