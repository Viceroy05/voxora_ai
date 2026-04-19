import { CallStatus } from "@prisma/client";

import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { createCallLogSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.CALLS_READ);
    const prisma = getPrisma();
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const limitParam = Number(url.searchParams.get("limit") ?? "25");
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 25;
    const status =
      statusParam && Object.values(CallStatus).includes(statusParam as CallStatus)
        ? (statusParam as CallStatus)
        : undefined;

    if (statusParam && !status) {
      throw new ApiError(400, "invalid_status", "Unsupported call status filter.");
    }

    const calls = await prisma.callLog.findMany({
      where: {
        businessId,
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return json({ calls });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.CALLS_WRITE);
    const body = await parseJsonBody(request, createCallLogSchema);
    const prisma = getPrisma();

    const callLog = await prisma.callLog.create({
      data: {
        businessId,
        callSid: body.callSid,
        direction: body.direction,
        callerPhone: body.callerPhone,
        recipientPhone: body.recipientPhone,
        customerName: body.customerName,
        status: body.status ?? "QUEUED",
        transcriptText: body.transcriptText,
        summaryText: body.summaryText,
      },
    });

    return json({ callLog }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
