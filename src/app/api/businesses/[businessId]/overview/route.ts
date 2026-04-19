import { BookingStatus, CallStatus } from "@prisma/client";

import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { handleRouteError, json } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function activityStatusForCall(status: CallStatus) {
  switch (status) {
    case CallStatus.COMPLETED:
    case CallStatus.IN_PROGRESS:
      return "success";
    case CallStatus.NO_ANSWER:
    case CallStatus.QUEUED:
    case CallStatus.RINGING:
      return "warning";
    default:
      return "danger";
  }
}

function activityStatusForBooking(status: BookingStatus) {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.COMPLETED:
      return "success";
    case BookingStatus.PENDING:
    case BookingStatus.RESCHEDULED:
      return "warning";
    default:
      return "danger";
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.ANALYTICS_READ);
    const prisma = getPrisma();

    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const previousStart = new Date(startDate);
    previousStart.setDate(startDate.getDate() - 7);
    previousStart.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [
      callsLast7,
      callsPrevious7,
      bookingsLast7,
      bookingsPrevious7,
      latestBookings,
      latestCalls,
      answeredCallsTodayCount,
      missedCallsTodayCount,
      bookingsTodayCount,
      bookingsTodayRevenue,
      recoveredLeadsTodayCount,
    ] = await prisma.$transaction([
      prisma.callLog.findMany({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.callLog.findMany({
        where: {
          businessId,
          createdAt: {
            gte: previousStart,
            lt: startDate,
          },
        },
      }),
      prisma.bookingRecord.findMany({
        where: {
          businessId,
          startsAt: {
            gte: startDate,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      }),
      prisma.bookingRecord.findMany({
        where: {
          businessId,
          startsAt: {
            gte: previousStart,
            lt: startDate,
          },
        },
      }),
      prisma.bookingRecord.findMany({
        where: { businessId },
        include: { callLog: true },
        orderBy: { startsAt: "desc" },
        take: 5,
      }),
      prisma.callLog.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.callLog.count({
        where: {
          businessId,
          status: {
            in: [CallStatus.COMPLETED, CallStatus.IN_PROGRESS],
          },
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.callLog.count({
        where: {
          businessId,
          status: CallStatus.NO_ANSWER,
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.bookingRecord.count({
        where: {
          businessId,
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.bookingRecord.aggregate({
        where: {
          businessId,
          createdAt: {
            gte: startOfToday,
          },
        },
        _sum: {
          amountCents: true,
        },
      }),
      prisma.bookingRecord.count({
        where: {
          businessId,
          createdAt: {
            gte: startOfToday,
          },
          callLog: {
            status: CallStatus.NO_ANSWER,
          },
        },
      }),
    ]);

    const callsCount = callsLast7.length;
    const bookingsCount = bookingsLast7.length;
    const revenueCents = bookingsLast7.reduce((sum, booking) => sum + (booking.amountCents ?? 0), 0);
    const previousCallsCount = callsPrevious7.length;
    const previousBookingsCount = bookingsPrevious7.length;
    const bookingRevenueToday = bookingsTodayRevenue._sum.amountCents ?? 0;
    const conversionRate = answeredCallsTodayCount ? Math.round((bookingsTodayCount / answeredCallsTodayCount) * 100) : 0;

    const callOutcomeCounts = callsLast7.reduce<Record<string, number>>((acc, call) => {
      const label = call.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    const trendMap = new Map<string, { calls: number; bookings: number }>();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      trendMap.set(formatDateLabel(date), { calls: 0, bookings: 0 });
    }

    callsLast7.forEach((call) => {
      const label = formatDateLabel(new Date(call.createdAt));
      const bucket = trendMap.get(label);
      if (bucket) {
        bucket.calls += 1;
      }
    });

    bookingsLast7.forEach((booking) => {
      const label = formatDateLabel(new Date(booking.startsAt));
      const bucket = trendMap.get(label);
      if (bucket) {
        bucket.bookings += 1;
      }
    });

    const trend = Array.from(trendMap.entries()).map(([label, values]) => ({
      label,
      value: values.calls,
      secondary: values.bookings,
    }));

    const latestBookingsActivity = latestBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      title: `${booking.customerName} booked ${booking.serviceName}`,
      description: `Starts ${new Date(booking.startsAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
      time: new Date(booking.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: activityStatusForBooking(booking.status),
      sortKey: booking.createdAt.toISOString(),
    }));

    const latestCallsActivity = latestCalls.map((call) => ({
      id: `call-${call.id}`,
      title: `${call.callerPhone} ${call.status.toLowerCase()}`,
      description: call.summaryText
        ? call.summaryText
        : `Call ${call.status.toLowerCase()} by Voxora AI`,
      time: new Date(call.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: activityStatusForCall(call.status),
      sortKey: call.createdAt.toISOString(),
    }));

    const activities = [...latestBookingsActivity, ...latestCallsActivity]
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .slice(0, 6)
      .map(({ sortKey, ...item }) => item);

    const bookingsTable = latestBookings.map((booking) => ({
      id: booking.id,
      customer: booking.customerName,
      owner: "Voxora AI",
      service: booking.serviceName,
      time: new Date(booking.startsAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      status: booking.status,
      value: booking.amountCents ? `₹${(booking.amountCents / 100).toLocaleString("en-IN")}` : "—",
    }));

    const metrics = [
      {
        label: "Answered calls today",
        value: `${answeredCallsTodayCount}`,
        delta: callsCount ? `+${Math.round(((answeredCallsTodayCount - (callsCount / 7)) / (callsCount / 7 || 1)) * 100)}%` : "—",
        helper: "Salon calls answered by Voxora AI",
      },
      {
        label: "Bookings today",
        value: `${bookingsTodayCount}`,
        delta: bookingsCount ? `+${Math.round(((bookingsTodayCount - (bookingsCount / 7)) / (bookingsCount / 7 || 1)) * 100)}%` : "—",
        helper: "Confirmed salon appointments",
      },
      {
        label: "Missed leads recovered",
        value: `${recoveredLeadsTodayCount}`,
        delta: missedCallsTodayCount ? `+${Math.round((recoveredLeadsTodayCount / missedCallsTodayCount) * 100)}%` : "—",
        helper: "Missed calls recovered into bookings",
      },
      {
        label: "Revenue impact",
        value: `₹${Math.round(bookingRevenueToday / 100).toLocaleString("en-IN")}`,
        delta: "—",
        helper: "Estimated daily revenue from bookings",
      },
    ];

    const outcomeBreakdown = Object.entries(callOutcomeCounts).map(([label, value]) => ({
      label,
      value,
    }));

    return json({ metrics, trend, outcomeBreakdown, activities, bookingsTable });
  } catch (error) {
    return handleRouteError(error);
  }
}
