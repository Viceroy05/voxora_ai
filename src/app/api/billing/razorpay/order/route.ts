import { ApiError } from "@/lib/api/errors";
import { BILLING_PLANS } from "@/lib/billing-plans";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { createRazorpayOrderSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/vendors/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, createRazorpayOrderSchema);
    const { business } = await requireBusinessPermission(
      body.businessId,
      PERMISSIONS.BILLING_WRITE,
    );
    const plan = BILLING_PLANS[body.plan];

    if (!plan) {
      throw new ApiError(400, "invalid_plan", "Unsupported billing plan.");
    }

    const razorpay = getRazorpayClient();
    const prisma = getPrisma();
    const order = await razorpay.orders.create({
      amount: plan.amountMinor * body.seats,
      currency: plan.currency,
      receipt: `biz_${business.id}_${Date.now()}`,
      notes: {
        businessId: business.id,
        plan: plan.plan,
        seats: String(body.seats),
      },
    });

    await prisma.businessSubscription.create({
      data: {
        businessId: business.id,
        provider: "RAZORPAY",
        plan: plan.plan,
        status: "PENDING",
        amountCents: Number(order.amount),
        currency: order.currency,
        seats: body.seats,
        providerOrderId: order.id,
        metadata: order as unknown as object,
      },
    });

    return json({
      order,
      plan,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
