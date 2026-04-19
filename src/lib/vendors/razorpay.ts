import crypto from "crypto";
import Razorpay from "razorpay";

import { getRazorpayConfig } from "@/lib/env";

let cachedRazorpay: Razorpay | null = null;

export function getRazorpayClient() {
  if (!cachedRazorpay) {
    const { keyId, keySecret } = getRazorpayConfig();
    cachedRazorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return cachedRazorpay;
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const { webhookSecret } = getRazorpayConfig();
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
