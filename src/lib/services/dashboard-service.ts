import { CallStatus, BookingStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

interface DashboardMetrics {
  callsToday: number;
  totalCalls: number;
  missedCallsRecovered: number;
  bookingsToday: number;
  revenueEstimate: number;
  conversionRate: number;
}

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Get today's date range (start of day to end of day)
 */
function getTodayRange(): TimeRange {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return {
    startDate: startOfDay,
    endDate: endOfDay,
  };
}

/**
 * Get date range for specified number of days
 */
function getDateRange(days: number): TimeRange {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate,
    endDate: now,
  };
}

/**
 * Get dashboard metrics for a business
 */
export async function getDashboardMetrics(businessId: string, days: number = 30): Promise<DashboardMetrics> {
  const prisma = getPrisma();
  const todayRange = getTodayRange();
  const periodRange = getDateRange(days);

  // Get calls today
  const callsToday = await prisma.callLog.count({
    where: {
      businessId,
      createdAt: {
        gte: todayRange.startDate,
        lt: todayRange.endDate,
      },
    },
  });

  // Get total calls in period
  const totalCalls = await prisma.callLog.count({
    where: {
      businessId,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
    },
  });

  // Get missed calls recovered (calls with NO_ANSWER status that have bookings)
  const missedCallsRecovered = await prisma.callLog.count({
    where: {
      businessId,
      status: CallStatus.NO_ANSWER,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
      bookings: {
        some: {},
      },
    },
  });

  // Get bookings today
  const bookingsToday = await prisma.bookingRecord.count({
    where: {
      businessId,
      createdAt: {
        gte: todayRange.startDate,
        lt: todayRange.endDate,
      },
    },
  });

  // Get revenue estimate from bookings in period
  const bookings = await prisma.bookingRecord.findMany({
    where: {
      businessId,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
      amountCents: {
        not: null,
      },
    },
    select: {
      amountCents: true,
    },
  });

  const revenueEstimate = bookings.reduce((sum, booking) => sum + (booking.amountCents || 0), 0);

  // Calculate conversion rate (bookings / completed calls)
  const completedCalls = await prisma.callLog.count({
    where: {
      businessId,
      status: CallStatus.COMPLETED,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
    },
  });

  const conversionRate = completedCalls > 0 
    ? (bookingsToday / completedCalls) * 100 
    : 0;

  return {
    callsToday,
    totalCalls,
    missedCallsRecovered,
    bookingsToday,
    revenueEstimate,
    conversionRate,
  };
}

/**
 * Get call trend data for dashboard
 */
export async function getCallTrend(businessId: string, days: number = 7) {
  const prisma = getPrisma();
  const periodRange = getDateRange(days);

  const calls = await prisma.callLog.findMany({
    where: {
      businessId,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group calls by day
  const trendData = calls.reduce((acc, call) => {
    const date = call.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, completed: 0 };
    }
    acc[date].total++;
    if (call.status === CallStatus.COMPLETED) {
      acc[date].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // Convert to array format for charts
  return Object.entries(trendData).map(([date, data]) => ({
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: data.total,
    secondary: data.completed,
  }));
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(businessId: string, limit: number = 10) {
  const prisma = getPrisma();

  const [recentCalls, recentBookings] = await Promise.all([
    prisma.callLog.findMany({
      where: {
        businessId,
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
    prisma.bookingRecord.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }),
  ]);

  // Combine and format activities
  const activities = [
    ...recentCalls.map(call => ({
      id: `call-${call.id}`,
      type: 'call',
      title: `Call from ${call.callerPhone}`,
      description: call.summaryText || 'No summary available',
      time: formatRelativeTime(call.createdAt),
      status: getActivityStatus(call.status),
      metadata: {
        callSid: call.callSid,
        duration: call.durationSeconds,
        sentiment: call.aiAnalysis?.sentiment,
      },
    })),
    ...recentBookings.map(booking => ({
      id: `booking-${booking.id}`,
      type: 'booking',
      title: `New booking: ${booking.customerName}`,
      description: `${booking.serviceName} - ${booking.status}`,
      time: formatRelativeTime(booking.createdAt),
      status: 'success',
      metadata: {
        serviceName: booking.serviceName,
        customerPhone: booking.customerPhone,
      },
    })),
  ];

  // Sort by time and limit
  return activities
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, limit);
}

/**
 * Get call outcome breakdown
 */
export async function getCallOutcomeBreakdown(businessId: string, days: number = 30) {
  const prisma = getPrisma();
  const periodRange = getDateRange(days);

  const calls = await prisma.callLog.findMany({
    where: {
      businessId,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
    },
    include: {
      bookings: true,
    },
  });

  const breakdown = {
    booked: 0,
    qualified: 0,
    resolved: 0,
    followUp: 0,
    total: calls.length,
  };

  calls.forEach(call => {
    if (call.bookings && call.bookings.length > 0) {
      breakdown.booked++;
    } else if (call.aiAnalysis?.disposition === 'QUALIFIED') {
      breakdown.qualified++;
    } else if (call.aiAnalysis?.disposition === 'INFO_ONLY') {
      breakdown.resolved++;
    } else {
      breakdown.followUp++;
    }
  });

  return breakdown;
}

/**
 * Get booking statistics
 */
export async function getBookingStatistics(businessId: string, days: number = 30) {
  const prisma = getPrisma();
  const periodRange = getDateRange(days);

  const [total, byStatus, recent] = await Promise.all([
    // Total bookings
    prisma.bookingRecord.count({
      where: {
        businessId,
        createdAt: {
          gte: periodRange.startDate,
          lt: periodRange.endDate,
        },
      },
    }),

    // Bookings by status
    prisma.bookingRecord.groupBy({
      by: ['status'],
      where: {
        businessId,
        createdAt: {
          gte: periodRange.startDate,
          lt: periodRange.endDate,
        },
      },
      _count: true,
    }),

    // Recent bookings
    prisma.bookingRecord.findMany({
      where: {
        businessId,
        createdAt: {
          gte: periodRange.startDate,
          lt: periodRange.endDate,
        },
      },
      include: {
        callLog: {
          select: {
            id: true,
            callSid: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ]);

  // Format status counts
  const statusCounts = byStatus.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    byStatus: statusCounts,
    recent,
    period: periodRange,
  };
}

/**
 * Get revenue statistics
 */
export async function getRevenueStatistics(businessId: string, days: number = 30) {
  const prisma = getPrisma();
  const periodRange = getDateRange(days);

  const bookings = await prisma.bookingRecord.findMany({
    where: {
      businessId,
      createdAt: {
        gte: periodRange.startDate,
        lt: periodRange.endDate,
      },
      amountCents: {
        not: null,
      },
    },
    select: {
      amountCents: true,
      currency: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amountCents || 0), 0);
  const avgRevenue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // Group by day for trend
  const revenueByDay = bookings.reduce((acc, booking) => {
    const date = booking.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += booking.amountCents || 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: totalRevenue,
    average: avgRevenue,
    count: bookings.length,
    byDay: revenueByDay,
    period: periodRange,
  };
}

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Get activity status from call status
 */
function getActivityStatus(status: CallStatus): 'success' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case CallStatus.COMPLETED:
      return 'success';
    case CallStatus.RINGING:
    case CallStatus.IN_PROGRESS:
      return 'secondary';
    case CallStatus.NO_ANSWER:
      return 'warning';
    case CallStatus.FAILED:
    case CallStatus.CANCELED:
      return 'danger';
    default:
      return 'secondary';
  }
}
