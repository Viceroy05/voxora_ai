import { BookingStatus } from "@prisma/client";
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
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_READ);

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

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [bookingsToday, totalBookings, recentBookings, bookingsByStatus, revenueData] = await Promise.all([
      // Bookings today
      prisma.bookingRecord.count({
        where: {
          businessId,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      // Total bookings in period
      prisma.bookingRecord.count({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Recent bookings
      prisma.bookingRecord.findMany({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          callLog: {
            select: {
              id: true,
              callSid: true,
              status: true,
              durationSeconds: true,
            },
          },
        },
        orderBy: {
          startsAt: 'asc',
        },
        take: limit,
      }),

      // Bookings by status
      prisma.bookingRecord.groupBy({
        by: ['status'],
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),

      // Revenue data
      prisma.bookingRecord.findMany({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
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
      }),
    ]);

    // Calculate metrics
    const statusCounts = bookingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<BookingStatus, number>);

    // Calculate revenue
    const totalRevenue = revenueData.reduce((sum, booking) => sum + (booking.amountCents || 0), 0);
    const avgRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

    // Calculate conversion rate (bookings / completed calls)
    const completedCalls = await prisma.callLog.count({
      where: {
        businessId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
    });

    const conversionRate = completedCalls > 0 
      ? (totalBookings / completedCalls) * 100 
      : 0;

    // Format recent bookings for dashboard
    const formattedBookings = recentBookings.map(booking => ({
      id: booking.id,
      customer: booking.customerName,
      phone: booking.customerPhone,
      email: booking.customerEmail,
      service: booking.serviceName,
      time: booking.startsAt,
      status: booking.status,
      amount: booking.amountCents ? {
        cents: booking.amountCents,
        formatted: formatCurrency(booking.amountCents, booking.currency),
      } : null,
      notes: booking.notes,
      metadata: booking.metadata,
      callLog: booking.callLog ? {
        id: booking.callLog.id,
        callSid: booking.callLog.callSid,
        status: booking.callLog.status,
        duration: booking.callLog.durationSeconds,
      } : null,
    }));

    return json({
      success: true,
      data: {
        metrics: {
          bookingsToday,
          totalBookings,
          totalRevenue: {
            cents: totalRevenue,
            formatted: formatCurrency(totalRevenue),
          },
          avgRevenue: {
            cents: avgRevenue,
            formatted: formatCurrency(avgRevenue),
          },
          conversionRate: {
            value: conversionRate,
            formatted: `${conversionRate.toFixed(1)}%`,
          },
        },
        bookings: formattedBookings,
        breakdown: {
          byStatus: statusCounts,
          total: totalBookings,
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

function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
}
