import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { updateBusinessSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    const { business } = await requireBusinessPermission(
      businessId,
      PERMISSIONS.BUSINESS_READ,
    );
    const prisma = getPrisma();

    const detailedBusiness = await prisma.business.findUnique({
      where: {
        id: business.id,
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return json({ business: detailedBusiness });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BUSINESS_WRITE);
    const body = await parseJsonBody(request, updateBusinessSchema);
    const prisma = getPrisma();

    const business = await prisma.business.update({
      where: {
        id: businessId,
      },
      data: {
        name: body.name,
        slug: body.slug,
        industry: body.industry,
        timezone: body.timezone,
        websiteUrl: body.websiteUrl,
        twilioPhoneNumber: body.twilioPhoneNumber,
      },
    });

    return json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
