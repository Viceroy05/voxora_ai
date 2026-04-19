import { CallStatus, BookingStatus } from "@prisma/client";
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
    await requireBusinessPermission(businessId, PERMISSIONS.ANALYTICS_READ);

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

    const prisma = getPrisma();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all analytics data in parallel
    const [
      callsData,
      bookingsData,
      aiJobsData,
      revenueData,
    ] = await Promise.all([
      // Calls analytics
      getCallsAnalytics(prisma, businessId, startDate),

      // Bookings analytics
      getBookingsAnalytics(prisma, businessId, startDate),

      // AI jobs analytics
      getAIJobsAnalytics(prisma, businessId, startDate),

      // Revenue analytics
      getRevenueAnalytics(prisma, businessId, startDate),
    ]);

    // Calculate overall metrics
    const conversionRate = callsData.completed > 0 
      ? (bookingsData.total / callsData.completed) * 100 
      : 0;

    return json({
      success: true,
      data: {
        overview: {
          totalCalls: callsData.total,
          completedCalls: callsData.completed,
          missedCalls: callsData.missed,
          totalBookings: bookingsData.total,
          conversionRate: {
            value: conversionRate,
            formatted: `${conversionRate.toFixed(1)}%`,
          },
          totalRevenue: {
            cents: revenueData.total,
            formatted: formatCurrency(revenueData.total),
          },
          avgRevenuePerBooking: {
            cents: revenueData.average,
            formatted: formatCurrency(revenueData.average),
          },
        },
        calls: callsData,
        bookings: bookingsData,
        ai: aiJobsData,
        revenue: revenueData,
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

async function getCallsAnalytics(prisma: any, businessId: string, startDate: Date) {
  const [total, completed, missed, byStatus, byDay] = await Promise.all([
    prisma.callLog.count({
      where: { businessId, createdAt: { gte: startDate } },
    }),
    prisma.callLog.count({
      where: { 
        businessId, 
        status: CallStatus.COMPLETED,
        createdAt: { gte: startDate } 
      },
    }),
    prisma.callLog.count({
      where: { 
        businessId, 
        status: CallStatus.NO_ANSWER,
        createdAt: { gte: startDate } 
      },
    }),
    prisma.callLog.groupBy({
      by: ['status'],
      where: { businessId, createdAt: { gte: startDate } },
      _count: true,
    }),
    prisma.callLog.findMany({
      where: { businessId, createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Group by day
  const dayGroups = groupByDay(byDay, 'createdAt');

  return {
    total,
    completed,
    missed,
    byStatus: byStatus.reduce((acc: any, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byDay: dayGroups,
  };
}

async function getBookingsAnalytics(prisma: any, businessId: string, startDate: Date) {
  const [total, byStatus, byDay, withRevenue] = await Promise.all([
    prisma.bookingRecord.count({
      where: { businessId, createdAt: { gte: startDate } },
    }),
    prisma.bookingRecord.groupBy({
      by: ['status'],
      where: { businessId, createdAt: { gte: startDate } },
      _count: true,
    }),
    prisma.bookingRecord.findMany({
      where: { businessId, createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.bookingRecord.findMany({
      where: { 
        businessId, 
        createdAt: { gte: startDate },
        amountCents: { not: null }
      },
      select: {
        amountCents: true,
      },
    }),
  ]);

  // Group by day
  const dayGroups = groupByDay(byDay, 'createdAt');

  // Calculate revenue
  const revenue = withRevenue.reduce((sum: number, b: any) => sum + (b.amountCents || 0), 0);

  return {
    total,
    byStatus: byStatus.reduce((acc: any, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byDay: dayGroups,
    totalRevenue: revenue,
  };
}

async function getAIJobsAnalytics(prisma: any, businessId: string, startDate: Date) {
  const [total, completed, failed, byStatus, avgProcessingTime] = await Promise.all([
    prisma.aiProcessingJob.count({
      where: { businessId, createdAt: { gte: startDate } },
    }),
    prisma.aiProcessingJob.count({
      where: { 
        businessId, 
        status: 'COMPLETED',
        createdAt: { gte: startDate } 
      },
    }),
    prisma.aiProcessingJob.count({
      where: { 
        businessId, 
        status: 'FAILED',
        createdAt: { gte: startDate } 
      },
    }),
    prisma.aiProcessingJob.groupBy({
      by: ['status'],
      where: { businessId, createdAt: { gte: startDate } },
      _count: true,
    }),
    prisma.aiProcessingJob.findMany({
      where: { 
        businessId, 
        status: 'COMPLETED',
        createdAt: { gte: startDate } 
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    }),
  ]);

  // Calculate average processing time
  const processingTimes = avgProcessingTime
    .filter((job: any) => job.startedAt && job.completedAt)
    .map((job: any) => {
      const started = new Date(job.startedAt).getTime();
      const completed = new Date(job.completedAt).getTime();
      return completed - started;
    });

  const avgTime = processingTimes.length > 0
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
    : 0;

  return {
    total,
    completed,
    failed,
    byStatus: byStatus.reduce((acc: any, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    avgProcessingTime: {
      ms: avgTime,
      seconds: avgTime / 1000,
      formatted: formatDuration(Math.round(avgTime / 1000)),
    },
    successRate: total > 0 ? (completed / total) * 100 : 0,
  };
}

async function getRevenueAnalytics(prisma: any, businessId: string, startDate: Date) {
  const bookings = await prisma.bookingRecord.findMany({
    where: { 
      businessId, 
      createdAt: { gte: startDate },
      amountCents: { not: null }
    },
    select: {
      amountCents: true,
      currency: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const total = bookings.reduce((sum: number, b: any) => sum + (b.amountCents || 0), 0);
  const average = bookings.length > 0 ? total / bookings.length : 0;

  // Group by day
  const byDay = bookings.reduce((acc: any, booking: any) => {
    const date = booking.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += booking.amountCents || 0;
    return acc;
  }, {});

  return {
    total,
    average,
    count: bookings.length,
    byDay,
  };
}

function groupByDay(items: any[], dateField: string) {
  return items.reduce((acc: any, item: any) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, completed: 0 };
    }
    acc[date].total++;
    if (item.status === 'COMPLETED' || item.status === 'CONFIRMED') {
      acc[date].completed++;
    }
    return acc;
  }, {});
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}
