import type { SubscriptionPlan } from "@prisma/client";

export type PlanDefinition = {
  plan: SubscriptionPlan;
  name: string;
  amountMinor: number;
  currency: string;
  seatsIncluded: number;
  callLimit: number | null;
  features: string[];
};

export const BILLING_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  FREE: {
    plan: "FREE",
    name: "Free",
    amountMinor: 0,
    currency: "INR",
    seatsIncluded: 1,
    callLimit: 100,
    features: ["Basic dashboards", "Single location", "Email support"],
  },
  STARTER: {
    plan: "STARTER",
    name: "Starter",
    amountMinor: 14900,
    currency: "INR",
    seatsIncluded: 3,
    callLimit: 500,
    features: ["AI call answering", "Booking capture", "Missed call recovery"],
  },
  GROWTH: {
    plan: "GROWTH",
    name: "Growth",
    amountMinor: 34900,
    currency: "INR",
    seatsIncluded: 10,
    callLimit: 2000,
    features: ["CRM sync", "Advanced analytics", "Role permissions"],
  },
  SCALE: {
    plan: "SCALE",
    name: "Scale",
    amountMinor: 99900,
    currency: "INR",
    seatsIncluded: 50,
    callLimit: null,
    features: ["Unlimited locations", "Priority support", "Custom integrations"],
  },
};
