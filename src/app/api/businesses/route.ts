import { SubscriptionPlan } from "@prisma/client";

import { requireAuthContext } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { createBusinessSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAuthContext();
    const prisma = getPrisma();
    const memberships = await prisma.businessMembership.findMany({
      where: {
        userId: auth.appUser.id,
      },
      include: {
        business: {
          include: {
            subscriptions: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return json({
      businesses: memberships,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthContext();
    const body = await parseJsonBody(request, createBusinessSchema);
    const prisma = getPrisma();

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
          },
        },
      },
      include: {
        memberships: true,
        subscriptions: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return json({ business }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
