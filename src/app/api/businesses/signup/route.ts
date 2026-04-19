import { SubscriptionPlan } from "@prisma/client";

import { requireAuthContext } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { createBusinessSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";
import { sendAdminSignupNotification } from "@/lib/email/notifications";

export async function POST(request: Request) {
  try {
    // Authenticate user
    const auth = await requireAuthContext();
    const prisma = getPrisma();

    // Parse and validate request body
    const body = await parseJsonBody(request, createBusinessSchema);

    // Check if user already has a business (optional - remove if users can have multiple)
    const existingMembership = await prisma.businessMembership.findFirst({
      where: {
        userId: auth.appUser.id,
      },
    });

    if (existingMembership) {
      throw new ApiError(
        400,
        "business_already_exists",
        "You already have a business. Contact support to create additional businesses."
      );
    }

    // Check if slug is already taken
    const existingBusiness = await prisma.business.findUnique({
      where: {
        slug: body.slug,
      },
    });

    if (existingBusiness) {
      throw new ApiError(
        409,
        "slug_taken",
        "This business slug is already taken. Please choose another one."
      );
    }

    // Create business with membership, subscription, and onboarding
    const business = await prisma.business.create({
      data: {
        name: body.name,
        slug: body.slug,
        industry: body.industry,
        timezone: body.timezone ?? "UTC",
        websiteUrl: body.websiteUrl,
        twilioPhoneNumber: body.twilioPhoneNumber,
        createdById: auth.appUser.id,
        memberships: {
          create: {
            userId: auth.appUser.id,
            role: "OWNER",
          },
        },
        subscriptions: {
          create: {
            provider: "RAZORPAY",
            plan: SubscriptionPlan.FREE,
            status: "ACTIVE",
            amountCents: 0,
            currency: "INR",
            seats: 1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        },
        onboarding: {
          create: {
            profileComplete: false,
            billingComplete: false,
            teamComplete: false,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
        subscriptions: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        onboarding: true,
      },
    });

    // Send admin notification about new signup (non-blocking)
    sendAdminSignupNotification({
      email: auth.appUser.email,
      fullName: auth.appUser.fullName || undefined,
      createdAt: business.createdAt,
    }).catch(error => {
      console.error('Failed to send admin signup notification:', error);
    });

    return json(
      {
        business: {
          id: business.id,
          slug: business.slug,
          name: business.name,
          industry: business.industry,
          timezone: business.timezone,
          websiteUrl: business.websiteUrl,
          createdAt: business.createdAt,
          membership: business.memberships[0],
          subscription: business.subscriptions[0],
          onboarding: business.onboarding,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
