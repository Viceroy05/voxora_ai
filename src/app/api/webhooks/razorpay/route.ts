import crypto from "crypto";

import { getPrisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/vendors/razorpay";

export const runtime = "nodejs";

function extractPaymentEntity(payload: Record<string, unknown>) {
  return (payload as { payload?: { payment?: { entity?: Record<string, unknown> } } }).payload
    ?.payment?.entity;
}

function extractSubscriptionEntity(payload: Record<string, unknown>) {
  return (
    payload as { payload?: { subscription?: { entity?: Record<string, unknown> } } }
  ).payload?.subscription?.entity;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id") ?? crypto.randomUUID();

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return new Response("Invalid Razorpay signature", { status: 403 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const eventType = typeof payload.event === "string" ? payload.event : "unknown";
  const payment = extractPaymentEntity(payload);
  const subscription = extractSubscriptionEntity(payload);
  const businessId =
    (payment?.notes as Record<string, string> | undefined)?.businessId ??
    (subscription?.notes as Record<string, string> | undefined)?.businessId ??
    null;
  const prisma = getPrisma();

  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider: "RAZORPAY",
        externalEventId: eventId,
      },
    },
  });

  if (existing?.status === "PROCESSED") {
    return new Response("OK", { status: 200 });
  }

  await prisma.webhookEvent.upsert({
    where: {
      provider_externalEventId: {
        provider: "RAZORPAY",
        externalEventId: eventId,
      },
    },
    update: {
      payload,
      status: "RECEIVED",
      signature,
      businessId,
    },
    create: {
      provider: "RAZORPAY",
      eventType,
      externalEventId: eventId,
      signature,
      payload,
      businessId,
      status: "RECEIVED",
    },
  });

  const orderId =
    typeof payment?.order_id === "string"
      ? payment.order_id
      : typeof subscription?.id === "string"
        ? subscription.id
        : null;

  if (orderId) {
    await prisma.businessSubscription.updateMany({
      where: {
        OR: [
          { providerOrderId: orderId },
          { providerSubscriptionId: orderId },
        ],
      },
      data: {
        status:
          eventType === "payment.captured" || eventType === "subscription.charged"
            ? "ACTIVE"
            : eventType === "subscription.cancelled"
              ? "CANCELED"
              : "PENDING",
        providerPaymentId:
          typeof payment?.id === "string" ? payment.id : undefined,
        providerSubscriptionId:
          typeof subscription?.id === "string" ? subscription.id : undefined,
        metadata: payload,
      },
    });
  }

  await prisma.webhookEvent.update({
    where: {
      provider_externalEventId: {
        provider: "RAZORPAY",
        externalEventId: eventId,
      },
    },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
    },
  });

  return new Response("OK", { status: 200 });
}
