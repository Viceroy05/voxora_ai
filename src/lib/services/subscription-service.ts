import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/vendors/razorpay";
import { BILLING_PLANS } from "@/lib/billing-plans";

interface CreateSubscriptionParams {
  businessId: string;
  plan: SubscriptionPlan;
  seats: number;
}

interface UpgradeSubscriptionParams {
  businessId: string;
  plan: SubscriptionPlan;
  seats: number;
}

interface CancelSubscriptionParams {
  businessId: string;
  reason?: string;
}

/**
 * Create a new Razorpay subscription
 */
export async function createSubscription(params: CreateSubscriptionParams) {
  const prisma = getPrisma();
  const razorpay = getRazorpayClient();
  const planDefinition = BILLING_PLANS[params.plan];

  // Get business for customer details
  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    include: {
      memberships: {
        where: { role: "OWNER" },
        take: 1,
      },
    },
  });

  if (!business) {
    throw new Error("Business not found");
  }

  // Create Razorpay customer if not exists
  let customerId = business.metadata?.razorpayCustomerId as string;
  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: business.name,
      email: business.memberships[0]?.user.email,
      notes: {
        businessId: business.id,
        businessName: business.name,
        industry: business.industry,
      },
    });

    customerId = customer.id;

    // Store customer ID in business metadata
    await prisma.business.update({
      where: { id: params.businessId },
      data: {
        metadata: {
          ...business.metadata,
          razorpayCustomerId: customerId,
        },
      },
    });
  }

  // Create Razorpay subscription
  const subscription = await razorpay.subscriptions.create({
    customer_id: customerId,
    plan_id: getRazorpayPlanId(params.plan),
    total_count: 12, // 12 months
    quantity: params.seats,
    notes: {
      businessId: params.businessId,
      plan: params.plan,
      seats: params.seats,
    },
    options: {
      authorize_capture: "automatic",
    },
  });

  // Create subscription record
  const dbSubscription = await prisma.businessSubscription.create({
    data: {
      businessId: params.businessId,
      provider: "RAZORPAY",
      plan: params.plan,
      status: "PENDING",
      providerCustomerId: customerId,
      providerSubscriptionId: subscription.id,
      providerOrderId: subscription.order_id,
      amountCents: planDefinition.amountMinor * params.seats,
      currency: planDefinition.currency,
      seats: params.seats,
      currentPeriodStart: subscription.start_at ? new Date(subscription.start_at * 1000) : null,
      currentPeriodEnd: subscription.end_at ? new Date(subscription.end_at * 1000) : null,
      metadata: {
        razorpaySubscriptionId: subscription.id,
        razorpayOrderId: subscription.order_id,
      },
    },
  });

  return {
    subscription: dbSubscription,
    razorpaySubscription: subscription,
    shortUrl: subscription.short_url,
  };
}

/**
 * Upgrade subscription to a higher plan
 */
export async function upgradeSubscription(params: UpgradeSubscriptionParams) {
  const prisma = getPrisma();
  const razorpay = getRazorpayClient();
  const planDefinition = BILLING_PLANS[params.plan];

  // Get current subscription
  const currentSubscription = await prisma.businessSubscription.findFirst({
    where: {
      businessId: params.businessId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!currentSubscription) {
    throw new Error("No active subscription found");
  }

  if (!currentSubscription.providerSubscriptionId) {
    throw new Error("No Razorpay subscription ID found");
  }

  // Cancel current subscription
  await razorpay.subscriptions.cancel(currentSubscription.providerSubscriptionId);

  // Create new subscription
  const newSubscription = await razorpay.subscriptions.create({
    customer_id: currentSubscription.providerCustomerId,
    plan_id: getRazorpayPlanId(params.plan),
    total_count: 12,
    quantity: params.seats,
    notes: {
      businessId: params.businessId,
      plan: params.plan,
      seats: params.seats,
    },
    options: {
      authorize_capture: "automatic",
    },
  });

  // Update subscription record
  const dbSubscription = await prisma.businessSubscription.create({
    data: {
      businessId: params.businessId,
      provider: "RAZORPAY",
      plan: params.plan,
      status: "PENDING",
      providerCustomerId: currentSubscription.providerCustomerId,
      providerSubscriptionId: newSubscription.id,
      providerOrderId: newSubscription.order_id,
      amountCents: planDefinition.amountMinor * params.seats,
      currency: planDefinition.currency,
      seats: params.seats,
      currentPeriodStart: newSubscription.start_at ? new Date(newSubscription.start_at * 1000) : null,
      currentPeriodEnd: newSubscription.end_at ? new Date(newSubscription.end_at * 1000) : null,
      metadata: {
        razorpaySubscriptionId: newSubscription.id,
        razorpayOrderId: newSubscription.order_id,
        previousSubscriptionId: currentSubscription.id,
      },
    },
  });

  // Mark old subscription as replaced
  await prisma.businessSubscription.update({
    where: { id: currentSubscription.id },
    data: {
      status: "CANCELED",
      metadata: {
        ...currentSubscription.metadata,
        replacedBy: dbSubscription.id,
        replacedAt: new Date().toISOString(),
      },
    },
  });

  return {
    subscription: dbSubscription,
    razorpaySubscription: newSubscription,
    shortUrl: newSubscription.short_url,
  };
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(params: CancelSubscriptionParams) {
  const prisma = getPrisma();
  const razorpay = getRazorpayClient();

  // Get current subscription
  const currentSubscription = await prisma.businessSubscription.findFirst({
    where: {
      businessId: params.businessId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!currentSubscription) {
    throw new Error("No active subscription found");
  }

  if (!currentSubscription.providerSubscriptionId) {
    throw new Error("No Razorpay subscription ID found");
  }

  // Cancel Razorpay subscription
  await razorpay.subscriptions.cancel(currentSubscription.providerSubscriptionId, {
    cancel_at_cycle_end: 1, // Cancel at end of billing cycle
  });

  // Update subscription record
  const updatedSubscription = await prisma.businessSubscription.update({
    where: { id: currentSubscription.id },
    data: {
      status: "CANCELED",
      metadata: {
        ...currentSubscription.metadata,
        canceledAt: new Date().toISOString(),
        cancelReason: params.reason,
      },
    },
  });

  return {
    subscription: updatedSubscription,
    canceledAt: new Date(),
  };
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(businessId: string) {
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
    return {
      hasSubscription: false,
      status: null,
      plan: null,
      features: [],
    };
  }

  const planDefinition = BILLING_PLANS[subscription.plan];

  return {
    hasSubscription: true,
    status: subscription.status,
    plan: subscription.plan,
    planName: planDefinition.name,
    amountCents: subscription.amountCents,
    currency: subscription.currency,
    seats: subscription.seats,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    features: planDefinition.features,
    isActive: subscription.status === "ACTIVE",
    isTrialing: subscription.status === "TRIALING",
    isPastDue: subscription.status === "PAST_DUE",
    isCanceled: subscription.status === "CANCELED",
    isExpired: subscription.status === "EXPIRED",
  };
}

/**
 * Check if business has premium features
 */
export async function hasPremiumFeatures(businessId: string) {
  const status = await getSubscriptionStatus(businessId);

  return {
    hasPremium: status.hasSubscription && status.isActive,
    canUseAI: status.hasSubscription && status.isActive,
    canUseAdvancedAnalytics: status.hasSubscription && status.isActive,
    maxSeats: status.seats || 1,
    callLimit: status.plan ? BILLING_PLANS[status.plan].callLimit : 100,
  };
}

/**
 * Get Razorpay plan ID from subscription plan
 */
function getRazorpayPlanId(plan: SubscriptionPlan): string {
  const planIds: Record<SubscriptionPlan, string> = {
    FREE: "plan_FREE_001",
    STARTER: "plan_STARTER_001",
    GROWTH: "plan_GROWTH_001",
    SCALE: "plan_SCALE_001",
  };

  return planIds[plan];
}

/**
 * Process payment success webhook
 */
export async function processPaymentSuccess(payload: any) {
  const prisma = getPrisma();

  const businessId = payload.notes?.businessId;
  if (!businessId) {
    throw new Error("Business ID not found in payment notes");
  }

  // Update subscription status to ACTIVE
  const subscription = await prisma.businessSubscription.updateMany({
    where: {
      businessId,
      providerOrderId: payload.order_id,
    },
    data: {
      status: "ACTIVE",
      providerPaymentId: payload.id,
      metadata: {
        ...payload,
        paymentProcessedAt: new Date().toISOString(),
      },
    },
  });

  return subscription;
}

/**
 * Process payment failure webhook
 */
export async function processPaymentFailure(payload: any) {
  const prisma = getPrisma();

  const businessId = payload.notes?.businessId;
  if (!businessId) {
    throw new Error("Business ID not found in payment notes");
  }

  // Update subscription status to FAILED/PENDING
  const subscription = await prisma.businessSubscription.updateMany({
    where: {
      businessId,
      providerOrderId: payload.order_id,
    },
    data: {
      status: "PENDING",
      metadata: {
        ...payload,
        paymentFailedAt: new Date().toISOString(),
        failureReason: payload.error?.description || "Unknown error",
      },
    },
  });

  return subscription;
}

/**
 * Process subscription cancellation webhook
 */
export async function processSubscriptionCancellation(payload: any) {
  const prisma = getPrisma();

  const subscriptionId = payload.subscription?.id;
  if (!subscriptionId) {
    throw new Error("Subscription ID not found in payload");
  }

  // Update subscription status to CANCELED
  const subscription = await prisma.businessSubscription.updateMany({
    where: {
      providerSubscriptionId: subscriptionId,
    },
    data: {
      status: "CANCELED",
      metadata: {
        ...payload,
        canceledAt: new Date().toISOString(),
        cancelReason: payload.cancellation_reason || "Requested by customer",
      },
    },
  });

  return subscription;
}
