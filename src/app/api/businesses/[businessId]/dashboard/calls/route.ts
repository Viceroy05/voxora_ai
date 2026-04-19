import { CallStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";
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

    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    if (isNaN(days) || days < 1 || days > 365) {
      throw new ApiError(
        400,
        "invalid_days",
        "Days must be between 1 and 365."
      );
    }

    const prisma = getPrisma();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get calls today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [callsToday, totalCalls, recentCalls, callsByStatus] = await Promise.all([
      // Calls today
      prisma.callLog.count({
        where: {
          businessId,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      // Total calls in period
      prisma.callLog.count({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Recent calls
      prisma.callLog.findMany({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          bookings: {
            select: {
              id: true,
              customerName: true,
              serviceName: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),

      // Calls by status
      prisma.callLog.groupBy({
        by: ['status'],
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),
    ]);

    // Calculate metrics
    const statusCounts = callsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<CallStatus, number>);

    const completedCalls = statusCounts[CallStatus.COMPLETED] || 0;
    const noAnswerCalls = statusCounts[CallStatus.NO_ANSWER] || 0;
    const missedCallsRecovered = await prisma.callLog.count({
      where: {
        businessId,
        status: CallStatus.NO_ANSWER,
        createdAt: {
          gte: startDate,
        },
        bookings: {
          some: {},
        },
      },
    });

    // Format recent calls for dashboard
    const formattedCalls = recentCalls.map(call => ({
      id: call.id,
      callSid: call.callSid,
      caller: call.callerPhone,
      customerName: call.customerName,
      channel: 'Voice',
      intent: call.aiAnalysis?.callerIntent || 'Unknown',
      duration: call.durationSeconds ? formatDuration(call.durationSeconds) : 'N/A',
      result: call.bookings && call.bookings.length > 0 
        ? 'Booked' 
        : call.aiAnalysis?.disposition || 'Unknown',
      sentiment: call.aiAnalysis?.sentiment || 'Unknown',
      status: call.status,
      createdAt: call.createdAt,
      summary: call.summaryText,
    }));

    return json({
      success: true,
      data: {
        metrics: {
          callsToday,
          totalCalls,
          completedCalls,
          missedCalls: noAnswerCalls,
          missedCallsRecovered,
          avgDuration: calculateAvgDuration(recentCalls),
        },
        calls: formattedCalls,
        breakdown: {
          byStatus: statusCounts,
          total: totalCalls,
        },
        period: {
          days,
          startDate,
          endDate: new Date(),
        },
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function calculateAvgDuration(calls: Array<{ durationSeconds: number | null }>): string {
  const callsWithDuration = calls.filter(c => c.durationSeconds);
  if (callsWithDuration.length === 0) return 'N/A';

  const totalSeconds = callsWithDuration.reduce((sum, c) => sum + c.durationSeconds, 0);
  const avgSeconds = totalSeconds / callsWithDuration.length;

  return formatDuration(Math.round(avgSeconds));
}
