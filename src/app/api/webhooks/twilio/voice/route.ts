import { getPrisma } from "@/lib/prisma";
import { buildIncomingVoiceResponse, verifyTwilioRequest } from "@/lib/vendors/twilio";
import {
  processIncomingVoiceWebhook,
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
  const externalEventId = `voice:${params.CallSid}`;
  if (await isWebhookProcessed("TWILIO", externalEventId)) {
    const twiml = buildIncomingVoiceResponse({
      businessName: "Voxora AI",
    });
    return new Response(twiml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }

  try {
    // Process incoming voice webhook
    const { business, callLog } = await processIncomingVoiceWebhook(params);

    // Create webhook event record
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "voice.incoming",
      externalEventId,
      signature,
      params,
      "PROCESSED"
    );

    // Build TwiML response
    const twiml = buildIncomingVoiceResponse({
      businessName: business.name,
    });

    return new Response(twiml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("[Voice Webhook Error]", error);

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
        "voice.incoming",
        externalEventId,
        signature,
        params,
        "FAILED"
      );
    }

    // Return error TwiML
    const response = new (await import("twilio")).twiml.VoiceResponse();
    response.say("We're experiencing technical difficulties. Please try again later.");
    response.hangup();

    return new Response(response.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
