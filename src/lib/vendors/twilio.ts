import twilio from "twilio";

import { getTwilioConfig } from "@/lib/env";

let cachedTwilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!cachedTwilioClient) {
    const { accountSid, authToken } = getTwilioConfig();
    cachedTwilioClient = twilio(accountSid, authToken);
  }

  return cachedTwilioClient;
}

export function verifyTwilioRequest(
  url: string,
  signature: string | null,
  params: Record<string, string>,
) {
  if (!signature) {
    return false;
  }

  const { authToken } = getTwilioConfig();

  return twilio.validateRequest(authToken, signature, url, params);
}

export function buildTwilioWebhookUrl(path: string) {
  const { webhookBaseUrl } = getTwilioConfig();
  return new URL(path, webhookBaseUrl).toString();
}

export function buildIncomingVoiceResponse({
  businessName,
}: {
  businessName: string;
}) {
  const response = new twilio.twiml.VoiceResponse();

  response.say(
    `Hello, you have reached ${businessName}. Please tell us how we can help after the beep.`,
  );

  response.record({
    method: "POST",
    action: buildTwilioWebhookUrl("/api/webhooks/twilio/recording"),
    recordingStatusCallback: buildTwilioWebhookUrl("/api/webhooks/twilio/recording"),
    recordingStatusCallbackMethod: "POST",
    maxLength: 120,
    playBeep: true,
  });

  response.say("We did not receive a recording. Goodbye.");

  return response.toString();
}
