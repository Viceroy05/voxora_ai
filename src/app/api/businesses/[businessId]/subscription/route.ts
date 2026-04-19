import { z } from "zod";

import { requireBusinessPermission } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

const updateSubscriptionSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "GROWTH", "SCALE"]).optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED", "PENDING"]).optional(),
  seats: z.number().int().positive().max(500).optional(),
  providerCustomerId: z.string().optional(),
  providerOrderId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  providerSubscriptionId: z.string().optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  currentPeriodStart: z.coerce.date().optional(),
  currentPeriodEnd: z.coerce.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const { business } = await requireBusinessPermission(businessId, "VIEW_BUSINESS");
    const prisma = getPrisma();

    const subscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      throw new ApiError(
        404,
        "subscription_not_found",
        "No subscription found for this business."
      );
    }

    return json({
      subscription: {
        id: subscription.id,
        businessId: subscription.businessId,
        provider: subscription.provider,
        plan: subscription.plan,
        status: subscription.status,
        providerCustomerId: subscription.providerCustomerId,
        providerOrderId: subscription.providerOrderId,
        providerPaymentId: subscription.providerPaymentId,
        providerSubscriptionId: subscription.providerSubscriptionId,
        amountCents: subscription.amountCents,
        currency: subscription.currency,
        seats: subscription.seats,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        metadata: subscription.metadata,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const { business } = await requireBusinessPermission(businessId, "MANAGE_BUSINESS");
    const prisma = getPrisma();

    const body = await parseJsonBody(request, updateSubscriptionSchema);

    // Check if at least one field is being updated
    if (Object.keys(body).length === 0) {
      throw new ApiError(
        400,
        "no_fields_provided",
        "At least one subscription field must be provided."
      );
    }

    // Get current subscription
    const currentSubscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!currentSubscription) {
      throw new ApiError(
        404,
        "subscription_not_found",
        "No subscription found for this business."
      );
    }

    // If changing plan, create a new subscription record
    if (body.plan && body.plan !== currentSubscription.plan) {
      const newSubscription = await prisma.businessSubscription.create({
        data: {
          businessId,
          provider: currentSubscription.provider,
          plan: body.plan,
          status: "PENDING",
          amountCents: body.amountCents ?? currentSubscription.amountCents,
          currency: body.currency ?? currentSubscription.currency,
          seats: body.seats ?? currentSubscription.seats,
          providerCustomerId: body.providerCustomerId ?? currentSubscription.providerCustomerId,
          providerOrderId: body.providerOrderId,
          providerPaymentId: body.providerPaymentId,
          providerSubscriptionId: body.providerSubscriptionId,
          currentPeriodStart: body.currentPeriodStart,
          currentPeriodEnd: body.currentPeriodEnd,
          metadata: body.metadata,
        },
      });

      return json(
        {
          subscription: {
            id: newSubscription.id,
            businessId: newSubscription.businessId,
            provider: newSubscription.provider,
            plan: newSubscription.plan,
            status: newSubscription.status,
            providerCustomerId: newSubscription.providerCustomerId,
            providerOrderId: newSubscription.providerOrderId,
            providerPaymentId: newSubscription.providerPaymentId,
            providerSubscriptionId: newSubscription.providerSubscriptionId,
            amountCents: newSubscription.amountCents,
            currency: newSubscription.currency,
            seats: newSubscription.seats,
            currentPeriodStart: newSubscription.currentPeriodStart,
            currentPeriodEnd: newSubscription.currentPeriodEnd,
            metadata: newSubscription.metadata,
            createdAt: newSubscription.createdAt,
            updatedAt: newSubscription.updatedAt,
          },
        },
        { status: 201 }
      );
    }

    // Update existing subscription
    const updatedSubscription = await prisma.businessSubscription.update({
      where: {
        id: currentSubscription.id,
      },
      data: body,
    });

    return json({
      subscription: {
        id: updatedSubscription.id,
        businessId: updatedSubscription.businessId,
        provider: updatedSubscription.provider,
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        providerCustomerId: updatedSubscription.providerCustomerId,
        providerOrderId: updatedSubscription.providerOrderId,
        providerPaymentId: updatedSubscription.providerPaymentId,
        providerSubscriptionId: updatedSubscription.providerSubscriptionId,
        amountCents: updatedSubscription.amountCents,
        currency: updatedSubscription.currency,
        seats: updatedSubscription.seats,
        currentPeriodStart: updatedSubscription.currentPeriodStart,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        metadata: updatedSubscription.metadata,
        createdAt: updatedSubscription.createdAt,
        updatedAt: updatedSubscription.updatedAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
