import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";
import { getBookingStats } from "@/lib/services/booking-service";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_READ);

    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (isNaN(days) || days < 1 || days > 365) {
      throw new ApiError(
        400,
        "invalid_days",
        "Days must be between 1 and 365."
      );
    }

    const stats = await getBookingStats(businessId, days);

    return json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
