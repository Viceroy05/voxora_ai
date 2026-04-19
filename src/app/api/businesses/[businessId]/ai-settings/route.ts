import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import {
  getAISettings,
  updateAISettings,
  validateAISettings,
  getDefaultAISettings,
} from "@/lib/services/ai-settings-service";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

const updateAISettingsSchema = z.object({
  businessName: z.string().min(2).max(120).optional(),
  industry: z.string().min(2).max(120).optional(),
  voiceTone: z.enum(["professional", "friendly", "casual", "formal", "warm"]).optional(),
  greetingScript: z.string().min(10).max(500).optional(),
  bookingQuestions: z.array(
    z.object({
      text: z.string().min(5).max(200),
      type: z.enum(["text", "multiple_choice", "yes_no"]),
      options: z.array(z.string()).optional(),
    })
  ).optional(),
  languages: z.array(z.string()).optional(),
  workingHours: z.array(
    z.object({
      day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      enabled: z.boolean().optional(),
    })
  ).optional(),
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BUSINESS_WRITE);

    const settings = await getAISettings(businessId);

    return json({
      success: true,
      data: {
        settings: {
          id: settings.id,
          businessId: settings.businessId,
          businessName: settings.businessName,
          industry: settings.industry,
          voiceTone: settings.voiceTone,
          greetingScript: settings.greetingScript,
          bookingQuestions: settings.bookingQuestions as any[],
          languages: settings.languages as string[],
          workingHours: settings.workingHours as any[],
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt,
        },
        defaults: getDefaultAISettings(),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BUSINESS_WRITE);

    const body = await parseJsonBody(request, updateAISettingsSchema);

    // Validate settings
    const validation = validateAISettings(body);
    if (!validation.valid) {
      throw new ApiError(
        400,
        "validation_error",
        "AI settings validation failed.",
        { errors: validation.errors }
      );
    }

    // Update settings
    const result = await updateAISettings(businessId, body);

    return json(
      {
        success: true,
        data: {
          settings: {
            id: result.settings.id,
            businessId: result.settings.businessId,
            businessName: result.settings.businessName,
            industry: result.settings.industry,
            voiceTone: result.settings.voiceTone,
            greetingScript: result.settings.greetingScript,
            bookingQuestions: result.settings.bookingQuestions as any[],
            languages: result.settings.languages as string[],
            workingHours: result.settings.workingHours as any[],
            createdAt: result.settings.createdAt,
            updatedAt: result.settings.updatedAt,
          },
          created: result.created,
        },
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
