import { z } from "zod";

import { requireBusinessPermission } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

const updateOnboardingSchema = z.object({
  profileComplete: z.boolean().optional(),
  billingComplete: z.boolean().optional(),
  teamComplete: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const { business } = await requireBusinessPermission(businessId, "VIEW_BUSINESS");
    const prisma = getPrisma();

    let onboarding = await prisma.businessOnboarding.findUnique({
      where: {
        businessId,
      },
    });

    // Create onboarding record if it doesn't exist
    if (!onboarding) {
      onboarding = await prisma.businessOnboarding.create({
        data: {
          businessId,
          profileComplete: false,
          billingComplete: false,
          teamComplete: false,
        },
      });
    }

    return json({
      onboarding: {
        id: onboarding.id,
        businessId: onboarding.businessId,
        profileComplete: onboarding.profileComplete,
        billingComplete: onboarding.billingComplete,
        teamComplete: onboarding.teamComplete,
        completedAt: onboarding.completedAt,
        createdAt: onboarding.createdAt,
        updatedAt: onboarding.updatedAt,
        isComplete:
          onboarding.profileComplete &&
          onboarding.billingComplete &&
          onboarding.teamComplete,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const { business } = await requireBusinessPermission(businessId, "MANAGE_BUSINESS");
    const prisma = getPrisma();

    const body = await parseJsonBody(request, updateOnboardingSchema);

    // Check if at least one field is being updated
    if (Object.keys(body).length === 0) {
      throw new ApiError(
        400,
        "no_fields_provided",
        "At least one onboarding field must be provided."
      );
    }

    // Get current onboarding status
    const currentOnboarding = await prisma.businessOnboarding.findUnique({
      where: {
        businessId,
      },
    });

    if (!currentOnboarding) {
      throw new ApiError(
        404,
        "onboarding_not_found",
        "Onboarding record not found for this business."
      );
    }

    // Update onboarding status
    const updatedOnboarding = await prisma.businessOnboarding.update({
      where: {
        businessId,
      },
      data: {
        ...body,
        // Set completedAt if all steps are complete
        completedAt:
          (body.profileComplete ?? currentOnboarding.profileComplete) &&
          (body.billingComplete ?? currentOnboarding.billingComplete) &&
          (body.teamComplete ?? currentOnboarding.teamComplete)
            ? currentOnboarding.completedAt || new Date()
            : currentOnboarding.completedAt,
      },
    });

    return json({
      onboarding: {
        id: updatedOnboarding.id,
        businessId: updatedOnboarding.businessId,
        profileComplete: updatedOnboarding.profileComplete,
        billingComplete: updatedOnboarding.billingComplete,
        teamComplete: updatedOnboarding.teamComplete,
        completedAt: updatedOnboarding.completedAt,
        createdAt: updatedOnboarding.createdAt,
        updatedAt: updatedOnboarding.updatedAt,
        isComplete:
          updatedOnboarding.profileComplete &&
          updatedOnboarding.billingComplete &&
          updatedOnboarding.teamComplete,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
