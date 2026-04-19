import { CallDirection, CallStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

interface TwilioVoiceParams {
  CallSid: string;
  From: string;
  To: string;
  Direction?: string;
  CallerName?: string;
  CallStatus?: string;
  CallDuration?: string;
  RecordingUrl?: string;
  RecordingStatus?: string;
  TranscriptionText?: string;
}

interface CallLogData {
  businessId: string;
  callSid: string;
  direction: CallDirection;
  status: CallStatus;
  callerPhone: string;
  recipientPhone: string;
  customerName?: string;
  durationSeconds?: number;
  recordingUrl?: string;
  transcriptText?: string;
  startedAt?: Date;
  answeredAt?: Date;
  completedAt?: Date;
  rawPayload?: Record<string, unknown>;
}

/**
 * Map Twilio call direction to our enum
 */
export function mapTwilioDirection(direction?: string | null): CallDirection {
  return direction?.toLowerCase() === "outbound-api" ? "OUTBOUND" : "INBOUND";
}

/**
 * Map Twilio call status to our enum
 */
export function mapTwilioStatus(status?: string | null): CallStatus {
  switch (status?.toLowerCase()) {
    case "queued":
      return "QUEUED";
    case "ringing":
      return "RINGING";
    case "in-progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "no-answer":
      return "NO_ANSWER";
    case "canceled":
      return "CANCELED";
    default:
      return "FAILED";
  }
}

/**
 * Find business by Twilio phone number
 */
export async function findBusinessByPhoneNumber(phoneNumber: string) {
  const prisma = getPrisma();
  return await prisma.business.findFirst({
    where: {
      twilioPhoneNumber: phoneNumber,
    },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

/**
 * Create or update call log with retry-safe logic
 */
export async function upsertCallLog(
  callSid: string,
  data: Partial<CallLogData>,
  businessId: string
) {
  const prisma = getPrisma();

  return await prisma.callLog.upsert({
    where: {
      callSid,
    },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      businessId,
      callSid,
      direction: data.direction || "INBOUND",
      status: data.status || "QUEUED",
      callerPhone: data.callerPhone || "unknown",
      recipientPhone: data.recipientPhone || "unknown",
      customerName: data.customerName,
      durationSeconds: data.durationSeconds,
      recordingUrl: data.recordingUrl,
      transcriptText: data.transcriptText,
      startedAt: data.startedAt || new Date(),
      answeredAt: data.answeredAt,
      completedAt: data.completedAt,
      rawPayload: data.rawPayload,
    },
  });
}

/**
 * Process incoming voice webhook
 */
export async function processIncomingVoiceWebhook(params: TwilioVoiceParams) {
  const business = await findBusinessByPhoneNumber(params.To);

  if (!business) {
    throw new Error(`No business found for phone number: ${params.To}`);
  }

  const callLog = await upsertCallLog(params.CallSid, {
    businessId: business.id,
    direction: mapTwilioDirection(params.Direction),
    status: "RINGING",
    callerPhone: params.From || "unknown",
    recipientPhone: params.To || business.twilioPhoneNumber || "unknown",
    customerName: params.CallerName,
    rawPayload: params,
    startedAt: new Date(),
  });

  return {
    business,
    callLog,
  };
}

/**
 * Process call status webhook
 */
export async function processCallStatusWebhook(params: TwilioVoiceParams) {
  const business = await findBusinessByPhoneNumber(params.To);

  if (!business) {
    throw new Error(`No business found for phone number: ${params.To}`);
  }

  const status = mapTwilioStatus(params.CallStatus);
  const durationSeconds = params.CallDuration ? parseInt(params.CallDuration, 10) : undefined;

  const updateData: Partial<CallLogData> = {
    status,
    durationSeconds,
    rawPayload: params,
  };

  // Set timestamps based on status
  if (status === "IN_PROGRESS") {
    updateData.answeredAt = new Date();
  } else if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  const callLog = await upsertCallLog(params.CallSid, updateData, business.id);

  return {
    business,
    callLog,
  };
}

/**
 * Process recording webhook
 */
export async function processRecordingWebhook(params: TwilioVoiceParams) {
  const business = await findBusinessByPhoneNumber(params.To);

  if (!business) {
    throw new Error(`No business found for phone number: ${params.To}`);
  }

  const recordingStatus = params.RecordingStatus?.toLowerCase();
  const isCompleted = recordingStatus === "completed";

  const callLog = await upsertCallLog(params.CallSid, {
    businessId: business.id,
    recordingUrl: params.RecordingUrl,
    transcriptText: params.TranscriptionText,
    status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
    rawPayload: params,
  }, business.id);

  return {
    business,
    callLog,
    hasTranscript: !!params.TranscriptionText,
  };
}

/**
 * Trigger AI processing for a call
 */
export async function triggerAIProcessing(businessId: string, callLogId: string, transcriptText?: string) {
  const prisma = getPrisma();

  // Check if there's already a processing job for this call
  const existingJob = await prisma.aiProcessingJob.findFirst({
    where: {
      callLogId,
      status: {
        in: ["PENDING", "RUNNING"],
      },
    },
  });

  if (existingJob) {
    return { job: existingJob, created: false };
  }

  // Get the call log to retrieve transcript if not provided
  const callLog = await prisma.callLog.findUnique({
    where: { id: callLogId },
  });

  if (!callLog) {
    throw new Error(`Call log not found: ${callLogId}`);
  }

  const transcript = transcriptText || callLog.transcriptText;

  if (!transcript) {
    throw new Error("No transcript available for AI processing");
  }

  // Create AI processing job
  const job = await prisma.aiProcessingJob.create({
    data: {
      businessId,
      callLogId,
      jobType: "CALL_ANALYSIS",
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      status: "PENDING",
      inputPayload: {
        transcriptText: transcript,
        recordingUrl: callLog.recordingUrl,
      },
    },
  });

  return { job, created: true };
}

/**
 * Create webhook event record with retry-safe logic
 */
export async function createWebhookEvent(
  businessId: string,
  provider: "TWILIO" | "RAZORPAY",
  eventType: string,
  externalEventId: string,
  signature: string | null,
  payload: Record<string, unknown>,
  status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED" = "RECEIVED"
) {
  const prisma = getPrisma();

  return await prisma.webhookEvent.upsert({
    where: {
      provider_externalEventId: {
        provider,
        externalEventId,
      },
    },
    update: {
      payload,
      status,
      processedAt: status === "PROCESSED" ? new Date() : undefined,
      errorMessage: status === "FAILED" ? "Webhook processing failed" : undefined,
    },
    create: {
      businessId,
      provider,
      eventType,
      externalEventId,
      signature,
      payload,
      status,
      processedAt: status === "PROCESSED" ? new Date() : undefined,
    },
  });
}

/**
 * Check if webhook event was already processed
 */
export async function isWebhookProcessed(
  provider: "TWILIO" | "RAZORPAY",
  externalEventId: string
): Promise<boolean> {
  const prisma = getPrisma();

  const event = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider,
        externalEventId,
      },
    },
  });

  return event?.status === "PROCESSED";
}
