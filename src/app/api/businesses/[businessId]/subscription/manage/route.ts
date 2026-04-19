import { SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import {
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  getSubscriptionStatus,
} from "@/lib/services/subscription-service";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

const createSubscriptionSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "GROWTH", "SCALE"]),
  seats: z.number().int().positive().max(500).default(1),
});

const upgradeSubscriptionSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "SCALE"]),
  seats: z.number().int().positive().max(500),
});

const cancelSubscriptionSchema = z.object({
  reason: z.string().min(10).max(500).optional(),
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BILLING_READ);

    const status = await getSubscriptionStatus(businessId);

    return json({
      success: true,
      data: {
        subscription: status,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BILLING_WRITE);

    const body = await parseJsonBody(request, createSubscriptionSchema);

    // Check if business already has active subscription
    const currentStatus = await getSubscriptionStatus(businessId);
    if (currentStatus.hasSubscription && currentStatus.isActive) {
      throw new ApiError(
        400,
        "subscription_exists",
        "Business already has an active subscription. Use upgrade endpoint to change plans."
      );
    }

    // Create new subscription
    const result = await createSubscription({
      businessId,
      plan: body.plan as SubscriptionPlan,
      seats: body.seats,
    });

    return json(
      {
        success: true,
        data: {
          subscription: result.subscription,
          shortUrl: result.shortUrl,
          message: "Subscription created successfully. Complete payment to activate.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BILLING_WRITE);

    const body = await parseJsonBody(request, upgradeSubscriptionSchema);

    // Check if business has active subscription
    const currentStatus = await getSubscriptionStatus(businessId);
    if (!currentStatus.hasSubscription || !currentStatus.isActive) {
      throw new ApiError(
        400,
        "no_active_subscription",
        "No active subscription found. Use POST endpoint to create a new subscription."
      );
    }

    // Upgrade subscription
    const result = await upgradeSubscription({
      businessId,
      plan: body.plan as SubscriptionPlan,
      seats: body.seats,
    });

    return json({
      success: true,
      data: {
        subscription: result.subscription,
        shortUrl: result.shortUrl,
        message: "Subscription upgrade initiated. Complete payment to activate new plan.",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BILLING_WRITE);

    const url = new URL(request.url);
    const reason = url.searchParams.get("reason");

    // Check if business has active subscription
    const currentStatus = await getSubscriptionStatus(businessId);
    if (!currentStatus.hasSubscription || !currentStatus.isActive) {
      throw new ApiError(
        400,
        "no_active_subscription",
        "No active subscription found."
      );
    }

    // Cancel subscription
    const result = await cancelSubscription({
      businessId,
      reason: reason || "No reason provided",
    });

    return json({
      success: true,
      data: {
        subscription: result.subscription,
        canceledAt: result.canceledAt,
        message: "Subscription canceled successfully. Access continues until end of billing period.",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
