import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { upsertMembershipSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.MEMBERS_READ);
    const prisma = getPrisma();

    const members = await prisma.businessMembership.findMany({
      where: {
        businessId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return json({ members });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.MEMBERS_WRITE);
    const body = await parseJsonBody(request, upsertMembershipSchema);
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: {
        id: body.userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "user_not_found", "User must exist before assigning a membership.");
    }

    const membership = await prisma.businessMembership.upsert({
      where: {
        businessId_userId: {
          businessId,
          userId: body.userId,
        },
      },
      update: {
        role: body.role,
      },
      create: {
        businessId,
        userId: body.userId,
        role: body.role,
      },
      include: {
        user: true,
      },
    });

    return json({ membership });
  } catch (error) {
    return handleRouteError(error);
  }
}
