import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";
import {
  getDashboardMetrics,
  getCallTrend,
  getRecentActivity,
  getCallOutcomeBreakdown,
} from "@/lib/services/dashboard-service";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.ANALYTICS_READ);

    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;
    const trendDays = url.searchParams.get("trendDays") 
      ? parseInt(url.searchParams.get("trendDays")!, 10) 
      : 7;

    if (isNaN(days) || days < 1 || days > 365) {
      throw new ApiError(
        400,
        "invalid_days",
        "Days must be between 1 and 365."
      );
    }

    // Get all dashboard data in parallel
    const [metrics, trend, activity, breakdown] = await Promise.all([
      getDashboardMetrics(businessId, days),
      getCallTrend(businessId, trendDays),
      getRecentActivity(businessId, 10),
      getCallOutcomeBreakdown(businessId, days),
    ]);

    return json({
      success: true,
      data: {
        metrics: {
          callsToday: metrics.callsToday,
          totalCalls: metrics.totalCalls,
          missedCallsRecovered: metrics.missedCallsRecovered,
          bookingsToday: metrics.bookingsToday,
          revenueEstimate: {
            cents: metrics.revenueEstimate,
            formatted: formatCurrency(metrics.revenueEstimate),
          },
          conversionRate: {
            value: metrics.conversionRate,
            formatted: `${metrics.conversionRate.toFixed(1)}%`,
          },
        },
        trend,
        activity,
        breakdown: {
          booked: breakdown.booked,
          qualified: breakdown.qualified,
          resolved: breakdown.resolved,
          followUp: breakdown.followUp,
          total: breakdown.total,
        },
        period: {
          days,
          trendDays,
        },
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}
