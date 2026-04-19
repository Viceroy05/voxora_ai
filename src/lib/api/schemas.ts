import { z } from "zod";

const businessSlugSchema = z
  .string()
  .min(3)
  .max(48)
  .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens.");

export const createBusinessSchema = z.object({
  name: z.string().min(2).max(120),
  slug: businessSlugSchema,
  industry: z.string().min(2).max(120).optional(),
  timezone: z.string().min(2).max(64).optional(),
  websiteUrl: z.string().url().optional(),
  twilioPhoneNumber: z.string().min(7).max(24).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided.",
);

export const createCallLogSchema = z.object({
  callSid: z.string().min(8),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  callerPhone: z.string().min(7).max(24),
  recipientPhone: z.string().min(7).max(24),
  customerName: z.string().min(1).max(120).optional(),
  status: z
    .enum(["QUEUED", "RINGING", "IN_PROGRESS", "COMPLETED", "FAILED", "NO_ANSWER", "CANCELED"])
    .optional(),
  transcriptText: z.string().optional(),
  summaryText: z.string().optional(),
});

export const createBookingSchema = z.object({
  callLogId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(7).max(24),
  customerEmail: z.string().email().optional(),
  serviceName: z.string().min(1).max(160),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULED", "CANCELED", "COMPLETED"]).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
});

export const upsertMembershipSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "AGENT", "VIEWER"]),
});

export const createRazorpayOrderSchema = z.object({
  businessId: z.string().uuid(),
  plan: z.enum(["FREE", "STARTER", "GROWTH", "SCALE"]),
  seats: z.number().int().positive().max(500).default(1),
});

export const processCallSchema = z.object({
  businessId: z.string().uuid(),
  callLogId: z.string().uuid(),
  transcriptText: z.string().optional(),
});

export const supabaseClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email().optional(),
  user_metadata: z
    .object({
      full_name: z.string().optional(),
      avatar_url: z.string().url().optional(),
      name: z.string().optional(),
    })
    .partial()
    .optional(),
});

export const openAICallAnalysisSchema = z.object({
  summary: z.string().min(1),
  disposition: z.enum(["BOOKED", "QUALIFIED", "FOLLOW_UP", "ESCALATE", "INFO_ONLY"]),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"]),
  callerIntent: z.string().min(1),
  nextAction: z.string().min(1),
  bookingLikely: z.boolean(),
  extractedContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  structuredNotes: z.array(z.string()).max(8),
});
