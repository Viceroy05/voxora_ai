import { SubscriptionPlan } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json } from "@/lib/api/http";
import { BILLING_PLANS } from "@/lib/billing-plans";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeFeatures = url.searchParams.get("includeFeatures") === "true";
    const planParam = url.searchParams.get("plan");

    let plans = Object.entries(BILLING_PLANS).map(([plan, definition]) => ({
      plan: plan as SubscriptionPlan,
      name: definition.name,
      amountMinor: definition.amountMinor,
      currency: definition.currency,
      amountMajor: definition.amountMinor / 100,
      seatsIncluded: definition.seatsIncluded,
      callLimit: definition.callLimit,
      features: includeFeatures ? definition.features : undefined,
    }));

    // Filter by plan if specified
    if (planParam) {
      const upperPlan = planParam.toUpperCase() as SubscriptionPlan;
      if (!BILLING_PLANS[upperPlan]) {
        throw new ApiError(
          400,
          "invalid_plan",
          `Invalid plan: ${planParam}`
        );
      }
      plans = plans.filter(p => p.plan === upperPlan);
    }

    return json({
      success: true,
      data: {
        plans,
        currency: "INR",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
